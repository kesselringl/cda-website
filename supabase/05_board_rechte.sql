-- =====================================================================
-- CDA Competition – Teil 4: Boards dürfen nur ihr eigenes Spiel ändern
-- Im SQL Editor komplett einfügen und „Run“. Mehrfach ausführen ist ok.
--
-- Bisher konnte ein Board-Zugang technisch den ganzen Abend überschreiben.
-- Jetzt prüft die Datenbank bei jedem Speichern eines Boards, was sich geändert hat:
--   erlaubt:  alles am Spiel, das gerade auf diesem Board läuft
--             (Würfe, Rücknahme, Leg- und Matchende)
--   erlaubt:  was beim Matchende automatisch passiert (nächstes Spiel auf freie
--             Boards setzen, K.-o.-Runde anlegen, Abend als fertig markieren)
--   verboten: Spiele anderer Boards, fertige Ergebnisse, Teilnehmer, Startwerte,
--             Spielmodus, Spielort, Testabend-Kennzeichen, Abend abschließen
-- Die Turnierleitung darf weiterhin alles.
-- =====================================================================

create or replace function public.cda_check_board(o jsonb, n jsonb, bi integer)
returns text language plpgsql immutable set search_path = public as $$
declare
  free_keys text[] := array['matches','boards','last','tick','prevLoser','hl','mid','writes','groups2','phase','summary','cin','ask'];
  wait_keys text[] := array['status','board','legs','writer','a','b','started'];
  k text; j integer; i integer; olen integer; nlen integer; own text; om jsonb; nm jsonb;
begin
  -- Grunddaten (Teilnehmer, Startwerte, Modus, Gruppen …) bleiben unverändert
  if (o - free_keys) is distinct from (n - free_keys) then return 'Grunddaten des Abends'; end if;
  if (o->>'phase') is distinct from (n->>'phase') and not (o->>'phase' = 'running' and n->>'phase' = 'done') then return 'Phase des Abends'; end if;

  -- Einträge je Board: nur das eigene Board, freie Boards dürfen neu belegt werden
  foreach k in array array['boards','prevLoser','cin'] loop
    for j in 0 .. greatest(jsonb_array_length(coalesce(o->k,'[]')), jsonb_array_length(coalesce(n->k,'[]'))) - 1 loop
      continue when j = bi;
      continue when (o->k->j) is not distinct from (n->k->j);
      continue when k = 'boards' and coalesce(o->k->j, 'null'::jsonb) = 'null'::jsonb;
      return 'Board ' || (j + 1);
    end loop;
  end loop;
  if (coalesce(o->'ask','{}') - bi::text) is distinct from (coalesce(n->'ask','{}') - bi::text) then return 'Rückfrage eines anderen Boards'; end if;

  -- Spiele
  own := nullif(o->'boards'->>bi, '');
  olen := jsonb_array_length(coalesce(o->'matches','[]'));
  nlen := jsonb_array_length(coalesce(n->'matches','[]'));
  if nlen < olen then return 'Spiele entfernt'; end if;
  for i in 0 .. olen - 1 loop
    om := o->'matches'->i; nm := n->'matches'->i;
    if (om->>'id') is distinct from (nm->>'id') then return 'Reihenfolge der Spiele'; end if;
    continue when om = nm;
    continue when own is not null and om->>'id' = own;               -- eigenes laufendes Spiel
    if om->>'status' is distinct from 'wait' then return 'Spiel ' || (om->>'id') || ' (anderes Board oder schon beendet)'; end if;
    -- wartendes Spiel: darf nur aufgerufen bzw. mit Siegern aus der Vorrunde besetzt werden
    if (om - wait_keys) is distinct from (nm - wait_keys) then return 'Spiel ' || (om->>'id'); end if;
    if nm->>'status' not in ('wait','live') then return 'Spiel ' || (om->>'id'); end if;
    if exists (select 1 from jsonb_array_elements(coalesce(nm->'legs','[]')) l where jsonb_array_length(coalesce(l->'visits','[]')) > 0) then return 'Spiel ' || (om->>'id'); end if;
  end loop;
  for i in olen .. nlen - 1 loop                                       -- neu angelegte K.-o.-Spiele (ggf. gleich aufgerufen)
    nm := n->'matches'->i;
    if nm->>'status' not in ('wait','live') then return 'neues Spiel'; end if;
    if exists (select 1 from jsonb_array_elements(coalesce(nm->'legs','[]')) l where jsonb_array_length(coalesce(l->'visits','[]')) > 0) then return 'neues Spiel'; end if;
  end loop;
  return null;
end $$;

create or replace function public.cda_save_event(
  p_date date, p_rev integer, p_state jsonb, p_status text, p_mode text, p_venue text,
  p_test boolean, p_snapshot boolean)
returns integer language plpgsql security definer set search_path = public as $$
declare r text := public.cda_role(); nr integer; bn smallint; old jsonb; ost text; why text;
begin
  if r is null then raise exception 'Nicht angemeldet'; end if;
  if p_status not in ('checkin','running','done') then raise exception 'Ungültiger Status'; end if;
  if p_rev = 0 then
    if r <> 'lead' then raise exception 'Nur die Turnierleitung startet einen Abend'; end if;
    insert into public.events(date, mode, venue, status, state, rev, test, updated_at)
    values (p_date, p_mode, coalesce(p_venue,'bistro'), p_status, p_state, 1, coalesce(p_test,false), now())
    on conflict (date) do nothing
    returning rev into nr;
  elsif r = 'lead' then
    update public.events
       set state = p_state, status = p_status, mode = coalesce(p_mode, mode), venue = coalesce(p_venue, venue),
           test = coalesce(p_test, test), rev = rev + 1, updated_at = now()
     where date = p_date and rev = p_rev and status <> 'done'
    returning rev into nr;
  else
    -- Board: nur das eigene Spiel; Modus, Ort und Testkennzeichen bleiben, wie sie sind
    if p_status = 'done' then raise exception 'Nur die Turnierleitung schließt einen Abend ab'; end if;
    select board into bn from public.staff where user_id = auth.uid();
    select state, status into old, ost from public.events where date = p_date and rev = p_rev and status <> 'done' for update;
    if not found then return -1; end if;
    if ost <> 'running' then raise exception 'Nicht erlaubt: Der Abend läuft noch nicht'; end if;
    why := public.cda_check_board(old, p_state, bn - 1);
    if why is not null then raise exception 'Nicht erlaubt: Board % darf nur sein eigenes Spiel ändern (%)', bn, why; end if;
    update public.events set state = p_state, rev = rev + 1, updated_at = now()
     where date = p_date and rev = p_rev
    returning rev into nr;
  end if;
  if nr is null then return -1; end if;
  if p_snapshot then
    insert into public.events_log(date, rev, role, user_id, state) values (p_date, nr, r, auth.uid(), p_state);
  end if;
  return nr;
end $$;

revoke execute on function public.cda_check_board(jsonb, jsonb, integer) from public, anon;
revoke execute on function public.cda_save_event(date, integer, jsonb, text, text, text, boolean, boolean) from public, anon;
grant execute on function public.cda_save_event(date, integer, jsonb, text, text, text, boolean, boolean) to authenticated;

select 'Teil 4 eingerichtet: Boards dürfen nur ihr eigenes Spiel ändern' as ergebnis;
