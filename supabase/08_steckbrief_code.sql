-- =====================================================================
-- CDA – Teil 7: Vereinscode für das Steckbrief-Formular
-- Im SQL Editor komplett einfügen und „Run“. Mehrfach ausführen ist ok.
--
-- Ohne gültigen Vereinscode speichert das Formular nichts – weder Angaben noch Foto.
-- Der Code wird nur als Prüfsumme gespeichert und bei Supabase geprüft, nie im Browser.
-- Ändern: im Grafik-Studio, Reiter „Steckbriefe“ → „Vereinscode ändern“.
-- Der Code selbst steht absichtlich NICHT in dieser Datei (das Repo ist öffentlich).
-- =====================================================================
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.cda_secrets (k text primary key, v text not null);
alter table public.cda_secrets enable row level security;
revoke all on public.cda_secrets from anon, authenticated;

-- Einmal-Freigaben: Code richtig → Freigabe-Nummer (2 Stunden gültig, nur für eine Einsendung)
create table if not exists public.steckbrief_tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  used boolean not null default false
);
alter table public.steckbrief_tickets enable row level security;
revoke all on public.steckbrief_tickets from anon, authenticated;

create table if not exists public.steckbrief_fails (at timestamptz not null default now());
alter table public.steckbrief_fails enable row level security;
revoke all on public.steckbrief_fails from anon, authenticated;

create or replace function public.cda_code_hash(p text) returns text
language sql immutable set search_path = public, extensions as $$
  select encode(extensions.digest(upper(btrim(coalesce(p,''))), 'sha256'), 'hex');
$$;
revoke execute on function public.cda_code_hash(text) from public, anon, authenticated;

-- Vereinscode prüfen → Freigabe-Nummer, bei falschem Code null
create or replace function public.cda_steckbrief_ticket(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare h text; t uuid;
begin
  if (select count(*) from public.steckbrief_fails where at > now() - interval '1 hour') >= 30 then
    raise exception 'Zu viele falsche Versuche. Bitte in einer Stunde noch einmal probieren.';
  end if;
  select v into h from public.cda_secrets where k = 'steckbrief_code';
  if h is null then raise exception 'Das Formular ist noch nicht freigeschaltet.'; end if;
  if public.cda_code_hash(p_code) <> h then
    insert into public.steckbrief_fails default values;
    return null;
  end if;
  delete from public.steckbrief_tickets where created_at < now() - interval '1 day';
  delete from public.steckbrief_fails where at < now() - interval '1 day';
  insert into public.steckbrief_tickets default values returning id into t;
  return t;
end $$;

-- Für die Foto-Regel: darf unter diesem Dateinamen hochgeladen werden?
create or replace function public.cda_ticket_ok(p_name text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.steckbrief_tickets t
                  where t.id::text || '.jpg' = p_name and not t.used and t.created_at > now() - interval '2 hours');
$$;

-- Einsenden nur noch mit Freigabe-Nummer (die alte Version ohne Code wird entfernt)
drop function if exists public.cda_steckbrief_send(text, jsonb, text, boolean);
create or replace function public.cda_steckbrief_send(p_ticket uuid, p_name text, p_data jsonb, p_photo text, p_consent boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  allowed text[] := array['nick','since','hand','checkout','darts','walkon','typ','erfolg','highlight','profi','beruf','hobby','cda','motto'];
  k text; v jsonb; clean jsonb := '{}'::jsonb; nid uuid;
begin
  update public.steckbrief_tickets set used = true
   where id = p_ticket and not used and created_at > now() - interval '2 hours';
  if not found then raise exception 'Bitte den Vereinscode noch einmal eingeben'; end if;
  if p_consent is distinct from true then raise exception 'Ohne Einwilligung können wir nichts veröffentlichen'; end if;
  p_name := btrim(coalesce(p_name,''));
  if length(p_name) < 3 or length(p_name) > 60 or p_name !~ ' ' then raise exception 'Bitte Vor- und Nachnamen angeben'; end if;
  if p_photo is not null and p_photo <> p_ticket::text || '.jpg' then raise exception 'Ungültiges Foto'; end if;
  for k, v in select * from jsonb_each(coalesce(p_data,'{}'::jsonb)) loop
    continue when not (k = any(allowed)) or jsonb_typeof(v) <> 'string' or btrim(v #>> '{}') = '';
    clean := clean || jsonb_build_object(k, left(btrim(v #>> '{}'), case when k in ('cda','motto','erfolg') then 300 else 120 end));
  end loop;
  if clean = '{}'::jsonb and p_photo is null then raise exception 'Bitte mindestens ein Feld ausfüllen oder ein Foto hochladen'; end if;
  if (select count(*) from public.steckbriefe where created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Gerade kommen sehr viele Einsendungen. Bitte später noch einmal versuchen.';
  end if;
  insert into public.steckbriefe(name, data, photo) values (p_name, clean, p_photo) returning id into nid;
  return nid;
end $$;

-- Vereinscode ändern (nur Turnierleitung, aus dem Grafik-Studio)
create or replace function public.cda_steckbrief_code_set(p_code text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(public.cda_role(),'') <> 'lead' then raise exception 'Nur die Turnierleitung'; end if;
  if length(btrim(coalesce(p_code,''))) < 5 then raise exception 'Der Code braucht mindestens 5 Zeichen'; end if;
  insert into public.cda_secrets(k, v) values ('steckbrief_code', public.cda_code_hash(p_code))
  on conflict (k) do update set v = excluded.v;
end $$;

revoke execute on function public.cda_steckbrief_ticket(text) from public;
grant  execute on function public.cda_steckbrief_ticket(text) to anon, authenticated;
revoke execute on function public.cda_ticket_ok(text) from public;
grant  execute on function public.cda_ticket_ok(text) to anon, authenticated;
revoke execute on function public.cda_steckbrief_send(uuid, text, jsonb, text, boolean) from public;
grant  execute on function public.cda_steckbrief_send(uuid, text, jsonb, text, boolean) to anon, authenticated;
revoke execute on function public.cda_steckbrief_code_set(text) from public, anon;
grant  execute on function public.cda_steckbrief_code_set(text) to authenticated;

-- Foto hochladen nur noch mit gültiger Freigabe-Nummer als Dateiname
drop policy if exists "steckbrief hochladen" on storage.objects;
create policy "steckbrief hochladen" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'steckbrief' and name ~ '^[0-9a-f-]{36}\.jpg$' and public.cda_ticket_ok(name));

-- VEREINSCODE_HIER (wird nur in der Kopie für den SQL Editor eingesetzt, nicht im Repo)

select 'Teil 7 eingerichtet: Vereinscode für das Steckbrief-Formular' as ergebnis;
