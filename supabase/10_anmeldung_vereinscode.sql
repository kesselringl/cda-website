-- =====================================================================
-- CDA – Teil 10: Anmeldung zur Competition nur noch mit Vereinscode (Mitglieder)
-- Im SQL Editor komplett einfügen und „Run“. Mehrfach ausführen ist ok.
--
-- Mitglieder: Das Handy wird EINMAL mit dem Vereinscode freigeschaltet (derselbe Code wie
-- beim Steckbrief-Formular, steht in der WhatsApp-Gruppe). Danach geht „Ich bin dabei“ wie bisher.
-- Ohne Freischaltung kann niemand ein Mitglied anmelden.
-- Gäste: weiterhin ohne Code, aber mit Grenzen gegen Spam:
--   - kein Gast mit dem Namen eines Mitglieds
--   - höchstens 2 Gäste pro Handy und Abend, höchstens 12 Gäste pro Abend
--   - höchstens 20 Gast-Anmeldungen pro Stunde insgesamt
-- Falsche Codes: nach 50 Fehlversuchen pro Stunde Pause; schon freigeschaltete Handys sind davon nicht betroffen.
--
-- Voraussetzung: Teil 8 (Vereinscode) ist eingerichtet. Ältere Skripte danach nicht erneut ausführen.
-- =====================================================================

create table if not exists public.signup_devices (
  token_hash  text primary key,                 -- SHA-256 der Gerätekennung, nicht die Kennung selbst
  verified_at timestamptz not null default now()
);
alter table public.signup_devices enable row level security;
revoke all on public.signup_devices from anon, authenticated;

create table if not exists public.signup_fails (at timestamptz not null default now());
alter table public.signup_fails enable row level security;
revoke all on public.signup_fails from anon, authenticated;

create or replace function public.cda_device_hash(p text) returns text
language sql immutable set search_path = public, extensions as $$
  select encode(extensions.digest('cda-device:' || coalesce(p,''), 'sha256'), 'hex');
$$;
revoke execute on function public.cda_device_hash(text) from public, anon, authenticated;

-- Ist dieses Handy schon freigeschaltet?
create or replace function public.cda_device_ok(p_token text)
returns boolean language sql stable security definer set search_path = public as $$
  select char_length(coalesce(p_token,'')) >= 16
     and exists (select 1 from public.signup_devices where token_hash = public.cda_device_hash(p_token));
$$;

-- Handy mit dem Vereinscode freischalten
create or replace function public.cda_device_verify(p_token text, p_code text)
returns boolean language plpgsql security definer set search_path = public as $$
declare h text;
begin
  if char_length(coalesce(p_token,'')) < 16 then raise exception 'Ungültige Kennung'; end if;
  if public.cda_device_ok(p_token) then return true; end if;
  if (select count(*) from public.signup_fails where at > now() - interval '1 hour') >= 50 then
    raise exception 'Zu viele falsche Versuche. Bitte später noch einmal probieren.';
  end if;
  select v into h from public.cda_secrets where k = 'steckbrief_code';
  if h is null or public.cda_code_hash(p_code) <> h then
    insert into public.signup_fails default values;
    delete from public.signup_fails where at < now() - interval '1 day';
    return false;
  end if;
  insert into public.signup_devices(token_hash) values (public.cda_device_hash(p_token)) on conflict do nothing;
  return true;
end $$;

-- Anmelden: Mitglieder nur von freigeschalteten Handys, Gäste mit Grenzen
create or replace function public.cda_signup(p_date date, p_player bigint, p_guest text, p_token text)
returns void language plpgsql security definer set search_path = public as $$
declare g text; th text;
begin
  if p_date < (now() at time zone 'Europe/Berlin')::date then raise exception 'Termin liegt in der Vergangenheit'; end if;
  if p_date > (now() at time zone 'Europe/Berlin')::date + 120 then raise exception 'Termin zu weit in der Zukunft'; end if;
  if extract(isodow from p_date) not in (4, 6) then raise exception 'Kein Competition-Termin'; end if;
  if char_length(coalesce(p_token,'')) < 16 then raise exception 'Ungültige Kennung'; end if;
  th := md5(p_token);
  if p_player is not null then
    if not public.cda_device_ok(p_token) then raise exception 'Bitte zuerst den Vereinscode eingeben.'; end if;
    update public.signup_devices set verified_at = now() where token_hash = public.cda_device_hash(p_token);
    insert into public.signups(event_date, player_id, token_hash)
    values (p_date, p_player, th)
    on conflict (event_date, player_id) where player_id is not null do nothing;
  else
    g := initcap(regexp_replace(trim(coalesce(p_guest,'')), '\s+', ' ', 'g'));
    if char_length(g) < 4 or position(' ' in g) = 0 then raise exception 'Bitte Vor- und Nachnamen angeben'; end if;
    if exists (select 1 from public.players where lower(name) = lower(g)) then
      raise exception 'Dieser Name gehört zu einem Mitglied. Bitte als Mitglied mit dem Vereinscode anmelden.';
    end if;
    if (select count(*) from public.signups where event_date = p_date and guest_name is not null and token_hash = th) >= 2 then
      raise exception 'Von diesem Handy sind für den Abend schon 2 Gäste angemeldet.';
    end if;
    if (select count(*) from public.signups where event_date = p_date and guest_name is not null) >= 12 then
      raise exception 'Für diesen Abend sind schon 12 Gäste angemeldet. Bitte kurz beim Vorstand melden.';
    end if;
    if (select count(*) from public.signups where guest_name is not null and created_at > now() - interval '1 hour') >= 20 then
      raise exception 'Gerade sind sehr viele Anmeldungen eingegangen. Bitte später noch einmal probieren.';
    end if;
    insert into public.signups(event_date, guest_name, token_hash)
    values (p_date, g, th)
    on conflict (event_date, lower(guest_name)) where guest_name is not null do nothing;
  end if;
end $$;

revoke execute on function public.cda_device_ok(text), public.cda_device_verify(text, text) from public;
grant  execute on function public.cda_device_ok(text), public.cda_device_verify(text, text) to anon, authenticated;
grant  execute on function public.cda_signup(date, bigint, text, text) to anon, authenticated;

-- Aufräumen: freigeschaltete Handys, die über ein Jahr nicht genutzt wurden, verfallen (Teil 9 erweitert)
create or replace function public.cda_cleanup()
returns jsonb language plpgsql security definer set search_path = public as $$
declare a integer; b integer; c integer; d integer;
begin
  delete from public.signups where event_date < ((now() at time zone 'Europe/Berlin')::date - interval '3 months')::date;
  get diagnostics a = row_count;
  delete from public.page_views where day < ((now() at time zone 'Europe/Berlin')::date - interval '2 years')::date;
  get diagnostics b = row_count;
  delete from public.events_log where saved_at < now() - interval '13 months';
  get diagnostics c = row_count;
  delete from public.signup_devices where verified_at < now() - interval '13 months';
  get diagnostics d = row_count;
  delete from public.signup_fails where at < now() - interval '1 day';
  return jsonb_build_object('anmeldungen_geloescht', a, 'zaehler_geloescht', b, 'protokolle_geloescht', c, 'geraete_geloescht', d);
end $$;

select 'Teil 10 eingerichtet: Anmeldung mit Vereinscode' as ergebnis;
