-- =====================================================================
-- CDA Competition – Teil 2: Zugänge Turnierleitung und Boards freischalten
-- Vorher unter Authentication → Users die Benutzer anlegen:
--   leitung@cda-ev.de, board1@cda-ev.de … board6@cda-ev.de
-- Danach dieses Skript im SQL Editor ausführen. Mehrfach ausführen ist ok.
-- =====================================================================

-- Turnierleitung
insert into public.staff (user_id, role, board, label)
select id, 'lead', null, 'Turnierleitung'
from auth.users where lower(email) = 'leitung@cda-ev.de'
on conflict (user_id) do update set role = excluded.role, board = excluded.board, label = excluded.label;

-- Boards 1 bis 6
insert into public.staff (user_id, role, board, label)
select id, 'board', substring(lower(email) from '^board([1-6])@')::smallint,
       'Board ' || substring(lower(email) from '^board([1-6])@')
from auth.users where lower(email) ~ '^board[1-6]@cda-ev\.de$'
on conflict (user_id) do update set role = excluded.role, board = excluded.board, label = excluded.label;

-- Kontrolle: zeigt alle freigeschalteten Zugänge
select s.label, u.email from public.staff s join auth.users u on u.id = s.user_id order by s.role desc, s.board;
