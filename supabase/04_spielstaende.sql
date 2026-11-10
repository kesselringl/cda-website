-- =====================================================================
-- CDA Competition – Teil 3: Spielstände der Abende speichern
-- Im SQL Editor komplett einfügen und „Run“. Mehrfach ausführen ist ok.
-- =====================================================================

-- Zusatzspalten: Versionszähler (gegen gleichzeitiges Überschreiben) und Testabend-Kennzeichen
alter table public.events add column if not exists rev  integer not null default 0;
alter table public.events add column if not exists test boolean not null default false;

-- Sicherungspunkte (bei Abendstart, Matchende, Abschluss), nur für die Turnierleitung lesbar
create table if not exists public.events_log (
  id        bigint generated always as identity primary key,
  date      date not null,
  rev       integer not null,
  role      text,
  user_id   uuid,
  saved_at  timestamptz not null default now(),
  state     jsonb
);
alter table public.events_log enable row level security;
drop policy if exists "log leitung" on public.events_log;
create policy "log leitung" on public.events_log for select using (public.cda_role() = 'lead');
grant select on public.events_log to authenticated;

-- Speichern mit Versionsprüfung: gibt die neue Version zurück, oder -1 wenn inzwischen
-- ein anderes Gerät gespeichert hat (dann holt die Seite den neuesten Stand und speichert erneut)
create or replace function public.cda_save_event(
  p_date date, p_rev integer, p_state jsonb, p_status text, p_mode text, p_venue text,
  p_test boolean, p_snapshot boolean)
returns integer language plpgsql security definer set search_path = public as $$
declare r text := public.cda_role(); nr integer;
begin
  if r is null then raise exception 'Nicht angemeldet'; end if;
  if p_status not in ('checkin','running','done') then raise exception 'Ungültiger Status'; end if;
  if p_rev = 0 then
    if r <> 'lead' then raise exception 'Nur die Turnierleitung startet einen Abend'; end if;
    insert into public.events(date, mode, venue, status, state, rev, test, updated_at)
    values (p_date, p_mode, coalesce(p_venue,'bistro'), p_status, p_state, 1, coalesce(p_test,false), now())
    on conflict (date) do nothing
    returning rev into nr;
  else
    if p_status = 'done' and r <> 'lead' then raise exception 'Nur die Turnierleitung schließt einen Abend ab'; end if;
    update public.events
       set state = p_state, status = p_status, mode = coalesce(p_mode, mode), venue = coalesce(p_venue, venue),
           test = coalesce(p_test, test), rev = rev + 1, updated_at = now()
     where date = p_date and rev = p_rev and status <> 'done'
    returning rev into nr;
  end if;
  if nr is null then return -1; end if;
  if p_snapshot then
    insert into public.events_log(date, rev, role, user_id, state) values (p_date, nr, r, auth.uid(), p_state);
  end if;
  return nr;
end $$;

-- Testabend löschen (nur Turnierleitung, nur Abende mit Test-Kennzeichen)
create or replace function public.cda_delete_test_event(p_date date)
returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(public.cda_role(),'') <> 'lead' then raise exception 'Nur die Turnierleitung'; end if;
  delete from public.events where date = p_date and test = true;
end $$;

revoke execute on function public.cda_save_event(date, integer, jsonb, text, text, text, boolean, boolean) from public, anon;
revoke execute on function public.cda_delete_test_event(date) from public, anon;
grant execute on function public.cda_save_event(date, integer, jsonb, text, text, text, boolean, boolean) to authenticated;
grant execute on function public.cda_delete_test_event(date) to authenticated;

-- Abende nur noch über die Funktion schreiben (nicht direkt)
drop policy if exists "events schreiben" on public.events;
revoke insert, update, delete on public.events from authenticated;

select 'Teil 3 eingerichtet' as ergebnis;
