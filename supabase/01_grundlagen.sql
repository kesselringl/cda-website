-- =====================================================================
-- CDA Competition – Datenbank, Teil 1: Spieler, Anmeldungen, Zugänge
-- Im Supabase-Dashboard unter „SQL Editor“ komplett einfügen und „Run“.
-- Das Skript kann gefahrlos mehrmals ausgeführt werden.
-- =====================================================================

-- ---------- Spieler (Mitglieder) ----------
create table if not exists public.players (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  team        smallint check (team between 1 and 4),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Zugänge: wer darf Turnierleitung / Board sein ----------
-- Die Benutzer selbst legst du unter Authentication → Users an,
-- danach trägt dieses Skript (Teil 2) sie hier ein.
create table if not exists public.staff (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  role     text not null check (role in ('lead','board')),
  board    smallint check (board between 1 and 6),
  label    text
);

create or replace function public.cda_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.staff where user_id = auth.uid()
$$;

-- ---------- Abende ----------
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  date        date not null unique,
  mode        text not null,
  venue       text not null default 'bistro',
  status      text not null default 'planned' check (status in ('planned','checkin','running','done')),
  legs        jsonb,
  state       jsonb,            -- kompletter Spielstand des Abends (Gruppen, K.-o., Ergebnisse)
  updated_at  timestamptz not null default now()
);

-- ---------- Anmeldungen ----------
create table if not exists public.signups (
  id          bigint generated always as identity primary key,
  event_date  date not null,
  player_id   bigint references public.players(id) on delete cascade,
  guest_name  text check (guest_name is null or char_length(guest_name) between 2 and 30),
  token_hash  text not null,     -- Gerätekennung (gehasht), damit nur derjenige absagen kann
  created_at  timestamptz not null default now(),
  check (player_id is not null or guest_name is not null)
);
create unique index if not exists signups_player_once on public.signups(event_date, player_id) where player_id is not null;
create unique index if not exists signups_guest_once  on public.signups(event_date, lower(guest_name)) where guest_name is not null;

-- ---------- Zugriffsregeln (Row Level Security) ----------
alter table public.players enable row level security;
alter table public.staff   enable row level security;
alter table public.events  enable row level security;
alter table public.signups enable row level security;

drop policy if exists "players lesen"       on public.players;
drop policy if exists "players pflegen"     on public.players;
drop policy if exists "staff selbst lesen"  on public.staff;
drop policy if exists "events lesen"        on public.events;
drop policy if exists "events schreiben"    on public.events;
drop policy if exists "signups lesen"       on public.signups;
drop policy if exists "signups leitung"     on public.signups;

create policy "players lesen"      on public.players for select using (true);
create policy "players pflegen"    on public.players for all    using (public.cda_role() = 'lead') with check (public.cda_role() = 'lead');
create policy "staff selbst lesen" on public.staff   for select using (user_id = auth.uid());
create policy "events lesen"       on public.events  for select using (true);
create policy "events schreiben"   on public.events  for all    using (public.cda_role() in ('lead','board')) with check (public.cda_role() in ('lead','board'));
create policy "signups lesen"      on public.signups for select using (true);
create policy "signups leitung"    on public.signups for delete using (public.cda_role() = 'lead');

grant usage on schema public to anon, authenticated;
grant select on public.players, public.events to anon, authenticated;
grant insert, update, delete on public.players, public.events to authenticated;
grant select on public.staff to authenticated;

-- Die Gerätekennung bleibt geheim: öffentlich lesbar sind nur diese Spalten
revoke select on public.signups from anon, authenticated;
grant  select (id, event_date, player_id, guest_name, created_at) on public.signups to anon, authenticated;
grant  delete on public.signups to authenticated;

-- ---------- An- und Abmelden (ohne Login, mit Gerätekennung) ----------
create or replace function public.cda_signup(p_date date, p_player bigint, p_guest text, p_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_date < (now() at time zone 'Europe/Berlin')::date then raise exception 'Termin liegt in der Vergangenheit'; end if;
  if p_date > (now() at time zone 'Europe/Berlin')::date + 120 then raise exception 'Termin zu weit in der Zukunft'; end if;
  if extract(isodow from p_date) not in (4, 6) then raise exception 'Kein Competition-Termin'; end if;
  if char_length(coalesce(p_token,'')) < 16 then raise exception 'Ungültige Kennung'; end if;
  if p_player is not null then
    insert into public.signups(event_date, player_id, token_hash)
    values (p_date, p_player, md5(p_token))
    on conflict (event_date, player_id) where player_id is not null do nothing;
  else
    if char_length(trim(coalesce(p_guest,''))) < 2 then raise exception 'Bitte Vornamen angeben'; end if;
    insert into public.signups(event_date, guest_name, token_hash)
    values (p_date, initcap(trim(p_guest)), md5(p_token))
    on conflict (event_date, lower(guest_name)) where guest_name is not null do nothing;
  end if;
end $$;

create or replace function public.cda_cancel(p_date date, p_player bigint, p_guest text, p_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.signups
   where event_date = p_date
     and token_hash = md5(p_token)
     and ((p_player is not null and player_id = p_player)
       or (p_player is null and lower(guest_name) = lower(trim(p_guest))));
end $$;

grant execute on function public.cda_signup(date, bigint, text, text) to anon, authenticated;
grant execute on function public.cda_cancel(date, bigint, text, text) to anon, authenticated;
grant execute on function public.cda_role() to anon, authenticated;

-- ---------- Mitglieder aus den aktuellen Kadern (Team 1–4) ----------
insert into public.players(name, team) values
  ('Marco Geiger',1),('Bastian Rauh',1),('Leon Kesselring',1),('Florian Kaiser',1),('Franz Rötzsch',1),
  ('Ivo Schubert',1),('Leon Crump',1),('Marcus Kreiner',1),('Jürgen Pistl',1),('Simon Seifert',1),
  ('Tobias Jäckle',1),('Simon Schreier',1),('Florian Zitzler',1),('Markus Stiegeler',1),('Markus Görg',1),
  ('Andreas Mors',2),('Robert Strehl',2),('Michael Voigt',2),('Claus Mader',2),('Sancha Koal',2),
  ('Jonas Thoma',2),('Leo Hörmann',2),('Ewald Lautenschlager',2),('Dominik Thoma',2),('Martin Hungbaur',2),
  ('Manfred Tochtermann',3),('Carola Wüstner',3),('Markus Ziegler',3),('Simon Schmidbaur',3),('Dennis Mandl',3),
  ('Sebastian Röck',4),('Andreas Wengenmayr',4),('Adrian Pirner',4),('Adrian Seidl',4),('Clemens Fleischmann',4),
  ('Maximilian Urban',4),('Gerald Nitzer',4),('Dennis Meissner',4),('Fabian Schreyer',4)
on conflict (name) do nothing;

-- Kontrolle: sollte 39 (oder mehr) Spieler anzeigen
select count(*) as spieler from public.players;
