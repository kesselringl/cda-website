-- CDA Competition – Teil 1b: Lese- und Schreibrechte (Zugriff regeln weiterhin die Policies)
grant usage on schema public to anon, authenticated;
grant select on public.players, public.events to anon, authenticated;
grant insert, update, delete on public.players, public.events to authenticated;
grant select on public.staff to authenticated;
select 'Rechte gesetzt' as ergebnis;
