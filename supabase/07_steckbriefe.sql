-- =====================================================================
-- CDA – Teil 6: Steckbrief-Formular für Spielerinnen und Spieler
-- Im SQL Editor komplett einfügen und „Run“. Mehrfach ausführen ist ok.
--
-- Spieler füllen auf steckbrief.html ihre Angaben aus und laden optional ein Foto hoch.
-- Nur mit Einwilligung. Die Turnierleitung sieht alle Einsendungen im Grafik-Studio
-- (Reiter „Steckbriefe“), kann sie korrigieren und freigeben. Erst freigegebene
-- Steckbriefe erscheinen auf der Homepage. Fotos sind privat (nur Turnierleitung).
-- =====================================================================
create table if not exists public.steckbriefe (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  name        text not null,
  data        jsonb not null default '{}'::jsonb,
  photo       text,
  status      text not null default 'neu' check (status in ('neu','live','abgelehnt'))
);
alter table public.steckbriefe enable row level security;   -- kein direkter Zugriff, nur über die Funktionen
revoke all on public.steckbriefe from anon, authenticated;

-- Einsenden (für alle, ohne Anmeldung)
create or replace function public.cda_steckbrief_send(p_name text, p_data jsonb, p_photo text, p_consent boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  allowed text[] := array['nick','since','hand','checkout','darts','walkon','typ','erfolg','highlight','profi','beruf','hobby','cda','motto'];
  k text; v jsonb; clean jsonb := '{}'::jsonb; nid uuid;
begin
  if p_consent is distinct from true then raise exception 'Ohne Einwilligung können wir nichts veröffentlichen'; end if;
  p_name := btrim(coalesce(p_name,''));
  if length(p_name) < 3 or length(p_name) > 60 or p_name !~ ' ' then raise exception 'Bitte Vor- und Nachnamen angeben'; end if;
  if p_photo is not null and p_photo !~ '^[0-9a-f-]{36}\.jpg$' then raise exception 'Ungültiges Foto'; end if;
  for k, v in select * from jsonb_each(coalesce(p_data,'{}'::jsonb)) loop
    continue when not (k = any(allowed)) or jsonb_typeof(v) <> 'string' or btrim(v #>> '{}') = '';
    clean := clean || jsonb_build_object(k, left(btrim(v #>> '{}'), case when k in ('cda','motto','erfolg') then 300 else 120 end));
  end loop;
  if clean = '{}'::jsonb and p_photo is null then raise exception 'Bitte mindestens ein Feld ausfüllen oder ein Foto hochladen'; end if;
  -- Schutz gegen Massen-Einsendungen
  if (select count(*) from public.steckbriefe where created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Gerade kommen sehr viele Einsendungen. Bitte später noch einmal versuchen.';
  end if;
  insert into public.steckbriefe(name, data, photo) values (p_name, clean, p_photo) returning id into nid;
  return nid;
end $$;

-- Liste für die Turnierleitung
create or replace function public.cda_steckbrief_list()
returns setof public.steckbriefe language plpgsql stable security definer set search_path = public as $$
begin
  if coalesce(public.cda_role(),'') <> 'lead' then raise exception 'Nur die Turnierleitung'; end if;
  return query select * from public.steckbriefe order by created_at desc;
end $$;

-- Freigeben, ablehnen oder korrigieren (Turnierleitung)
create or replace function public.cda_steckbrief_set(p_id uuid, p_status text, p_data jsonb, p_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(public.cda_role(),'') <> 'lead' then raise exception 'Nur die Turnierleitung'; end if;
  if p_status not in ('neu','live','abgelehnt') then raise exception 'Ungültiger Status'; end if;
  update public.steckbriefe
     set status = p_status, data = coalesce(p_data, data), name = coalesce(nullif(btrim(p_name),''), name), updated_at = now()
   where id = p_id;
end $$;

-- Löschen (Turnierleitung), z. B. bei Widerruf der Einwilligung
create or replace function public.cda_steckbrief_delete(p_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare ph text;
begin
  if coalesce(public.cda_role(),'') <> 'lead' then raise exception 'Nur die Turnierleitung'; end if;
  delete from public.steckbriefe where id = p_id returning photo into ph;
  return ph;   -- das Foto löscht das Grafik-Studio danach aus dem Speicher
end $$;

-- Freigegebene Steckbriefe für die Homepage (je Name der neueste)
create or replace function public.cda_profiles()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(name, data), '{}'::jsonb) from (
    select distinct on (name) name, data from public.steckbriefe where status = 'live' order by name, updated_at desc
  ) s;
$$;

revoke execute on function public.cda_steckbrief_send(text, jsonb, text, boolean) from public;
grant  execute on function public.cda_steckbrief_send(text, jsonb, text, boolean) to anon, authenticated;
revoke execute on function public.cda_steckbrief_list() from public, anon;
grant  execute on function public.cda_steckbrief_list() to authenticated;
revoke execute on function public.cda_steckbrief_set(uuid, text, jsonb, text) from public, anon;
grant  execute on function public.cda_steckbrief_set(uuid, text, jsonb, text) to authenticated;
revoke execute on function public.cda_steckbrief_delete(uuid) from public, anon;
grant  execute on function public.cda_steckbrief_delete(uuid) to authenticated;
grant  execute on function public.cda_profiles() to anon, authenticated;

-- Foto-Speicher: privat, nur JPG bis 8 MB (das Formular verkleinert die Fotos vorher)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('steckbrief', 'steckbrief', false, 8388608, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 8388608, allowed_mime_types = array['image/jpeg'];

drop policy if exists "steckbrief hochladen" on storage.objects;
create policy "steckbrief hochladen" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'steckbrief' and name ~ '^[0-9a-f-]{36}\.jpg$');
drop policy if exists "steckbrief ansehen" on storage.objects;
create policy "steckbrief ansehen" on storage.objects for select to authenticated
  using (bucket_id = 'steckbrief' and public.cda_role() = 'lead');
drop policy if exists "steckbrief loeschen" on storage.objects;
create policy "steckbrief loeschen" on storage.objects for delete to authenticated
  using (bucket_id = 'steckbrief' and public.cda_role() = 'lead');

select 'Teil 6 eingerichtet: Steckbrief-Formular' as ergebnis;
