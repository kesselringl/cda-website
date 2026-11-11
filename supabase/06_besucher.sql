-- =====================================================================
-- CDA – Teil 5: Besucherzahlen der Homepage (ohne Cookies, ohne IP-Adressen)
-- Im SQL Editor komplett einfügen und „Run“. Mehrfach ausführen ist ok.
--
-- Gezählt wird nur: welche Seite, an welchem Tag, wie oft. Keine Kennungen,
-- keine IP-Adressen, keine Cookies. Ansehen kann die Zahlen nur die Turnierleitung
-- (im internen Bereich der Homepage, Grafik-Studio → „Besucherzahlen“).
-- =====================================================================
create table if not exists public.page_views (
  day   date not null,
  page  text not null,
  views integer not null default 0,
  primary key (day, page)
);
alter table public.page_views enable row level security;   -- keine direkten Zugriffe, nur über die Funktionen

create or replace function public.cda_hit(p_page text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_page is null or p_page !~ '^[a-z0-9-]{2,30}$' then return; end if;
  insert into public.page_views(day, page, views) values ((now() at time zone 'Europe/Berlin')::date, p_page, 1)
  on conflict (day, page) do update set views = public.page_views.views + 1;
  -- nebenbei aufräumen (wie in der Datenschutzerklärung versprochen): Anmeldungen älter als 3 Monate löschen
  if random() < 0.02 then delete from public.signups where event_date < (now() at time zone 'Europe/Berlin')::date - 92; end if;
end $$;

create or replace function public.cda_stats(p_days integer)
returns table(day date, page text, views integer) language plpgsql stable security definer set search_path = public as $$
begin
  if coalesce(public.cda_role(),'') <> 'lead' then raise exception 'Nur die Turnierleitung'; end if;
  return query select v.day, v.page, v.views from public.page_views v
    where v.day >= (now() at time zone 'Europe/Berlin')::date - least(greatest(p_days,1),400) order by v.day;
end $$;

revoke all on public.page_views from anon, authenticated;
grant execute on function public.cda_hit(text) to anon, authenticated;
revoke execute on function public.cda_stats(integer) from public, anon;
grant execute on function public.cda_stats(integer) to authenticated;

select 'Teil 5 eingerichtet: Besucherzahlen' as ergebnis;
