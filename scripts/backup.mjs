// Wöchentliche Sicherung der Competition-Daten aus Supabase (nur, was ohnehin öffentlich lesbar ist):
// Spieler, alle Abende mit komplettem Spielstand, aktuelle Anmeldungen, freigegebene Steckbriefe.
// Die Sicherung landet NICHT im Repo (dort wäre sie dauerhaft öffentlich), sondern als Workflow-Artefakt (90 Tage).
import { mkdirSync, writeFileSync } from 'node:fs';

const U = 'https://qeevsqrmltewbtrnfrfm.supabase.co', K = 'sb_publishable_pwnzx63cque5lKZEVCe4mA_5SvBP8Yd';
const OUT = process.argv[2] || 'backup';
mkdirSync(OUT, { recursive: true });
const H = { apikey: K, 'Content-Type': 'application/json' };

async function table(name, order, cols = '*') {
  const all = [];
  for (let from = 0; ; from += 500) {
    const r = await fetch(`${U}/rest/v1/${name}?select=${cols}&order=${order}`, { headers: { ...H, Range: `${from}-${from + 499}`, 'Range-Unit': 'items' } });
    if (!r.ok && r.status !== 206) throw new Error(`${name}: HTTP ${r.status} ${await r.text()}`);
    const rows = await r.json(); all.push(...rows);
    if (rows.length < 500) break;
  }
  return all;
}
async function rpc(fn) {
  const r = await fetch(`${U}/rest/v1/rpc/${fn}`, { method: 'POST', headers: H, body: '{}' });
  if (!r.ok) throw new Error(`${fn}: HTTP ${r.status}`);
  return r.json();
}

const manifest = { erstellt: new Date().toISOString(), quelle: U, inhalt: {} };
const jobs = [['spieler', () => table('players', 'id')], ['abende', () => table('events', 'date')], ['anmeldungen', () => table('signups', 'event_date', 'id,event_date,player_id,guest_name,created_at')], ['steckbriefe', () => rpc('cda_profiles')]];
let failed = 0;
for (const [name, fn] of jobs) {
  try {
    const data = await fn();
    writeFileSync(`${OUT}/${name}.json`, JSON.stringify(data, null, 1));
    manifest.inhalt[name] = Array.isArray(data) ? data.length : Object.keys(data).length;
    console.log(`✓ ${name}: ${manifest.inhalt[name]}`);
  } catch (e) { failed++; manifest.inhalt[name] = 'FEHLER: ' + e.message; console.error(`✗ ${name}: ${e.message}`); }
}
// Kurzüberblick der Abende (zum schnellen Nachschauen ohne Spielstand-Details)
try {
  const ev = JSON.parse((await import('node:fs')).readFileSync(`${OUT}/abende.json`, 'utf8'));
  manifest.abende = ev.map(e => ({ datum: e.date, modus: e.mode, ort: e.venue, status: e.status, test: e.test, version: e.rev,
    teilnehmer: e.state && e.state.parts ? Object.keys(e.state.parts).length : null }));
} catch { /* ohne Abende kein Überblick */ }
writeFileSync(`${OUT}/inhalt.json`, JSON.stringify(manifest, null, 1));
// Wiederherstellung: SQL zum Einfügen im Supabase SQL Editor (fügt nur fehlende Spieler/Abende ein, überschreibt nichts)
try {
  const fs = await import('node:fs'); const q = n => fs.readFileSync(`${OUT}/${n}.json`, 'utf8');
  writeFileSync(`${OUT}/wiederherstellen.sql`, `-- CDA – Wiederherstellung aus der Sicherung vom ${manifest.erstellt}
-- Im Supabase SQL Editor komplett einfügen und „Run“. Vorhandene Einträge bleiben unverändert,
-- es werden nur fehlende Spieler und Abende ergänzt.
insert into public.players overriding system value select * from jsonb_populate_recordset(null::public.players, $cda$${q('spieler')}$cda$::jsonb) on conflict do nothing;
insert into public.events overriding system value select * from jsonb_populate_recordset(null::public.events, $cda$${q('abende')}$cda$::jsonb) on conflict do nothing;
select setval(pg_get_serial_sequence('public.players','id'), greatest((select max(id) from public.players), 1)) where pg_get_serial_sequence('public.players','id') is not null;
select setval(pg_get_serial_sequence('public.events','id'), greatest((select max(id) from public.events), 1)) where pg_get_serial_sequence('public.events','id') is not null;
select 'Wiederherstellung fertig' as ergebnis;
`);
} catch (e) { console.error('Wiederherstellungs-SQL nicht erstellt: ' + e.message); }
if (failed === jobs.length) { console.error('Sicherung komplett fehlgeschlagen'); process.exit(1); }
if (manifest.inhalt.abende && typeof manifest.inhalt.abende === 'string') process.exit(1); // die Abende sind das Wichtigste
