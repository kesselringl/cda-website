-- =====================================================================
-- CDA – Teil 9: Datenschutz-Feinschliff (24.11.2026, nach externer Prüfung)
-- Im SQL Editor komplett einfügen und „Run“. Mehrfach ausführen ist ok.
--
-- 1. Spielerliste: Besucher sehen nur Name, Mannschaft, aktiv (nicht mehr das Anlagedatum).
-- 2. Anmeldungen: Besucher sehen nur aktuelle Termine (ab gestern), keine alten Teilnahmen.
--    Turnierleitung und Boards sehen weiterhin alles.
-- 3. Verlässliches Aufräumen statt Zufall: cda_cleanup() löscht Anmeldungen älter als
--    3 Monate, Besucherzähler älter als 2 Jahre und Spielstand-Protokolle älter als 13 Monate. Wird jede Nacht vom Ergebnis-Bot aufgerufen.
--
-- WICHTIG: Ältere Skripte (01–08) danach NICHT erneut einzeln ausführen – sie würden
-- teilweise die Regeln von 05, 08 und 09 überschreiben. Neue Änderungen = neue Nummer.
-- =====================================================================

-- 1. Spielerliste
revoke select on public.players from anon;
grant  select (id, name, team, active) on public.players to anon;

-- 2. Anmeldungen
drop policy if exists "signups lesen"        on public.signups;
drop policy if exists "signups lesen intern" on public.signups;
create policy "signups lesen" on public.signups for select to anon
  using (event_date >= (now() at time zone 'Europe/Berlin')::date - 1);
create policy "signups lesen intern" on public.signups for select to authenticated
  using (true);

-- 3. Aufräumen
create or replace function public.cda_cleanup()
returns jsonb language plpgsql security definer set search_path = public as $$
declare a integer; b integer; c integer;
begin
  delete from public.signups where event_date < ((now() at time zone 'Europe/Berlin')::date - interval '3 months')::date;
  get diagnostics a = row_count;
  delete from public.page_views where day < ((now() at time zone 'Europe/Berlin')::date - interval '2 years')::date;
  get diagnostics b = row_count;
  delete from public.events_log where saved_at < now() - interval '13 months';
  get diagnostics c = row_count;
  return jsonb_build_object('anmeldungen_geloescht', a, 'zaehler_geloescht', b, 'protokolle_geloescht', c);
end $$;
revoke execute on function public.cda_cleanup() from public;
grant  execute on function public.cda_cleanup() to anon, authenticated;   -- löscht nur Veraltetes, darf jeder anstoßen

-- Besucherzähler ohne das bisherige zufällige Aufräumen
create or replace function public.cda_hit(p_page text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_page is null or p_page !~ '^[a-z0-9-]{2,30}$' then return; end if;
  insert into public.page_views(day, page, views) values ((now() at time zone 'Europe/Berlin')::date, p_page, 1)
  on conflict (day, page) do update set views = least(public.page_views.views + 1, 100000);
end $$;

select public.cda_cleanup() as erster_lauf, 'Teil 9 eingerichtet: Datenschutz-Feinschliff' as ergebnis;
