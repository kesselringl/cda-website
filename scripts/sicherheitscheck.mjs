// Sicherheitscheck der Datenbank aus Sicht eines fremden Besuchers (nur öffentlicher Schlüssel).
// Gibt nur Statuscodes, Spaltennamen und Zeilenzahlen aus – keine Inhalte. Ändert nichts (Schreibtests treffen absichtlich keine Zeile).
const U = 'https://qeevsqrmltewbtrnfrfm.supabase.co', K = 'sb_publishable_pwnzx63cque5lKZEVCe4mA_5SvBP8Yd';
const H = { apikey: K, 'Content-Type': 'application/json', Prefer: 'count=exact' };
const out = [];
const log = (ok, what, info) => { out.push({ ok, what, info }); console.log((ok ? '✅' : '❌') + ' ' + what + ' → ' + info); };
async function read(t, expectOpen, cols0) {
  const r = await fetch(`${U}/rest/v1/${t}?select=${cols0 || '*'}&limit=1`, { headers: H });
  const body = await r.text(); let rows = []; try { rows = JSON.parse(body); } catch {}
  const open = r.ok && Array.isArray(rows), cols = open && rows[0] ? Object.keys(rows[0]).join(', ') : '';
  const total = (r.headers.get('content-range') || '').split('/')[1] || '?';
  log(open === expectOpen, `Lesen ${t}${cols0 ? ' (' + cols0 + ')' : ''}`, open ? `lesbar (${total} Zeilen; Spalten: ${cols || '–'})` : `gesperrt (HTTP ${r.status})`);
}
const COL = { players: 'name', events: 'mode', signups: 'guest_name', staff: 'role', steckbriefe: 'status' };
async function write(t, method) {
  const r = await fetch(`${U}/rest/v1/${t}?id=eq.-999999`, { method, headers: H, body: method === 'PATCH' ? JSON.stringify({ [COL[t]]: 'x' }) : undefined });
  log(!r.ok, `${method === 'PATCH' ? 'Ändern' : 'Löschen'} ${t}`, r.ok ? `ERLAUBT (HTTP ${r.status})` : `gesperrt (HTTP ${r.status})`);
}
async function rpc(fn, body, expectOpen) {
  const r = await fetch(`${U}/rest/v1/rpc/${fn}`, { method: 'POST', headers: H, body: JSON.stringify(body || {}) });
  log(r.ok === expectOpen, `Funktion ${fn}`, r.ok ? 'aufrufbar' : `gesperrt (HTTP ${r.status})`);
}
for (const t of ['players', 'events']) await read(t, true);
await read('signups', true, 'id,event_date,player_id,guest_name,created_at');
await read('signups', false); // alle Spalten inkl. Geräte-Prüfsumme: muss gesperrt sein
for (const t of ['staff', 'events_log', 'page_views', 'steckbriefe', 'cda_secrets', 'steckbrief_tickets', 'steckbrief_fails']) await read(t, false);
for (const t of ['players', 'events', 'signups', 'staff', 'steckbriefe']) { await write(t, 'PATCH'); await write(t, 'DELETE'); }
await rpc('cda_stats', { p_days: 7 }, false);
await rpc('cda_steckbrief_list', {}, false);
await rpc('cda_steckbrief_code_set', { p_code: 'x' }, false);
await rpc('cda_profiles', {}, true);
// Foto-Speicher: Liste und Download ohne Anmeldung
let r = await fetch(`${U}/storage/v1/object/list/steckbrief`, { method: 'POST', headers: { ...H, Authorization: 'Bearer ' + K }, body: JSON.stringify({ prefix: '', limit: 5 }) });
let t = await r.text(); let n = -1; try { n = JSON.parse(t).length; } catch {}
log(!(r.ok && n > 0), 'Foto-Speicher auflisten', r.ok ? `${n} Einträge sichtbar` : `gesperrt (HTTP ${r.status})`);
r = await fetch(`${U}/storage/v1/object/public/steckbrief/test.jpg`);
log(!r.ok, 'Foto-Speicher öffentlich abrufbar', r.ok ? 'JA' : `nein (HTTP ${r.status})`);
// Selbstregistrierung
r = await fetch(`${U}/auth/v1/signup`, { method: 'POST', headers: H, body: JSON.stringify({ email: 'sicherheitscheck-' + Date.now() + '@example.invalid', password: 'Xx-' + Math.random().toString(36).slice(2) + '9!' }) });
log(!r.ok, 'Selbstregistrierung neuer Konten', r.ok ? `MÖGLICH (HTTP ${r.status})` : `abgeschaltet (HTTP ${r.status})`);
const bad = out.filter(x => !x.ok);
console.log(`\nErgebnis: ${out.length - bad.length} von ${out.length} Prüfungen wie erwartet.`);
if (bad.length) process.exitCode = 1;

// Live-Seite: lädt sie etwas von fremden Servern?
const SITE = process.env.SITE || 'https://kesselringl.github.io/cda-website/';
const hosts = new Set();
for (const f of ['', 'impressum.html', 'datenschutz.html', 'competition.html', 'steckbrief.html', 'grafik-studio.html', 'masters.js']) {
  const h = await (await fetch(SITE + f)).text();
  for (const m of h.matchAll(/<(?:script|link|img|iframe|source|video|audio)\b[^>]*?(?:src|href)=["'](https?:\/\/[^"'\/]+)/gi)) hosts.add(m[1]);
  for (const m of h.matchAll(/(?:fetch|FontFace|url)\(\s*["'](https?:\/\/[^"'\/]+)/gi)) hosts.add(m[1]);
  if (/fonts\.(googleapis|gstatic)\.com/.test(h)) hosts.add('GOOGLE FONTS in ' + (f || 'index'));
}
const ext = [...hosts].filter(h => !/qeevsqrmltewbtrnfrfm\.supabase\.co|kesselringl\.github\.io|cda-ev\.(eu|de)/.test(h));
console.log(ext.length ? '❌ Live-Seite lädt von fremden Servern: ' + ext.join(', ') : '✅ Live-Seite lädt nur von eigener Seite und Supabase (Frankfurt)');
if (ext.length) process.exitCode = 1;
