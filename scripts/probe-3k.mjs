// Einmalige Suche: 3K-Veranstaltung der Vorsaison (2025/26) für den Saisonvergleich finden.
import { writeFile, mkdir } from 'node:fs/promises';
const API = 'https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/';
const UA = 'CDA-Website/1.0 (+https://cda-ev.eu; Vereinsseite Clochard Darter Augsburg)';
const out = [];
async function get(u) { try { const r = await fetch(u, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) }); const t = await r.text(); return { s: r.status, t }; } catch (e) { return { s: 0, t: e.message }; } }
const log = (k, v) => { out.push(`## ${k}\n${typeof v === 'string' ? v : JSON.stringify(v)}`.slice(0, 6000)); };
for (const u of ['event?mandantKey=2120', 'event?mandantKey=2120&saisonId=41', 'event?mandantKey=2120&saison=41', 'event?mandantKey=2120&dbId=10']) { const r = await get(API + u); log(u + ' [' + r.s + ']', r.t.slice(0, 200)); try { const j = JSON.parse(r.t); const arr = Array.isArray(j) ? j : (j.content || j.events || j.items || []); log(u + ' bundesliga', arr.filter(e => /bundesliga/i.test(JSON.stringify(e))).map(e => [e.id, e.name, e.saison && e.saison.name].join(' | ')).join('\n')); } catch (e) { log(u + ' parse', e.message); } }
const hits = [];
log('hits', hits.join('\n'));
await mkdir('previews', { recursive: true }); await writeFile('previews/probe.txt', out.join('\n\n'));
