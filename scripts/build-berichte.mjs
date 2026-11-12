// Automatische Spieltagsberichte für alle vier Mannschaften.
// data.json enthält nur Saison-Summen je Spieler. Aus der Git-Historie wird für jeden neuen Spieltag der Stand
// davor und danach verglichen: Daraus ergeben sich Ergebnis, Tabellenplatz und Matchwinner (meiste Einzelsiege).
// Schreibt site/berichte.json (wird im Workflow gebaut, nicht eingecheckt).
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';

const CLUB = 'Clochard Darter Augsburg';
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64e6 });
let log = [];
try { log = git('log', '--reverse', '--format=%H %cI', '--', 'site/data.json').trim().split('\n').filter(Boolean).map(l => { const [h, d] = l.split(' '); return { h, t: d }; }); }
catch (e) { console.warn('Git-Historie nicht lesbar:', e.message); }

const load = h => { try { return JSON.parse(h ? git('show', `${h}:site/data.json`) : readFileSync('site/data.json', 'utf8')); } catch { return null; } };
const snaps = log.map(x => ({ ...x, d: load(x.h) })).filter(x => x.d);
const cur = load(null); if (cur) snaps.push({ h: 'aktuell', t: new Date().toISOString(), d: cur });

function games(t) {
  if (t.matchdays) return t.matchdays.flatMap(m => (m.games || []).map(g => ({ date: m.date, home: g.home === CLUB, opp: g.home === CLUB ? g.away : g.home, score: g.score, legs: g.legs || null, venue: m.venue && m.venue.name, round: m.round })));
  return (t.matches || []).map(m => { const h = m.home.indexOf(CLUB) === 0; return { date: m.date, home: h, opp: h ? m.away : m.home, score: m.score, legs: null, venue: m.venue, round: m.round }; });
}
const key = g => g.date + '|' + g.opp + '|' + (g.home ? 'H' : 'A');
const wl = s => { if (!s) return [0, 0]; const [w, l] = String(s).split(':').map(Number); return [w || 0, l || 0]; };
function us(score, home) { const [x, y] = score.split(':').map(Number); return home ? [x, y] : [y, x]; }

// 1) Für jeden Spieltag (Team + Datum): in welchem Stand tauchten die Ergebnisse zuerst/zuletzt auf?
const days = new Map(); // id -> { tid, date, first, last }
for (let i = 0; i < snaps.length; i++) {
  const prev = i ? snaps[i - 1].d : null, now = snaps[i].d;
  for (const [tid, t] of Object.entries(now.teams || {})) {
    const pt = prev && prev.teams && prev.teams[tid];
    const before = new Set(pt ? games(pt).filter(g => g.score).map(key) : []);
    for (const g of games(t).filter(g => g.score && !before.has(key(g)))) {
      const id = tid + '-' + g.date, d = days.get(id) || { tid, date: g.date, first: i, last: i };
      d.last = i; days.set(id, d);
    }
  }
}
// 2) Bericht je Spieltag: Ergebnisse aus dem letzten Stand; Matchwinner aus dem Unterschied der Spielerbilanzen
//    zwischen dem Stand vor dem ersten und nach dem letzten Ergebnis – nur, wenn dazwischen kein anderer Spieltag lag.
const reports = new Map();
for (const [id, d] of days) {
  const t = snaps[d.last].d.teams[d.tid], pre = d.first ? snaps[d.first - 1].d.teams && snaps[d.first - 1].d.teams[d.tid] : null;
  const gs = games(t).filter(g => g.score && g.date === d.date).map(g => { const [a, b] = us(g.score, g.home); return { opp: g.opp, home: g.home, a, b, r: a > b ? 's' : a < b ? 'n' : 'u', legs: g.legs }; });
  const clean = pre && ![...days.values()].some(o => o !== d && o.tid === d.tid && o.last >= d.first && o.first <= d.last);
  let mw = [];
  if (clean) {
    const old = Object.fromEntries((pre.players || []).map(p => [p.name, p]));
    const delta = (t.players || []).map(p => {
      const o = old[p.name] || {}; const [sw, sl] = wl(p.single), [ow, ol] = wl(o.single), [dw, dl] = wl(p.double), [odw, odl] = wl(o.double);
      return { name: p.name, sw: sw - ow, sl: sl - ol, dw: dw - odw, dl: dl - odl };
    }).filter(x => x.sw + x.sl + x.dw + x.dl > 0);
    const best = Math.max(0, ...delta.map(x => x.sw));
    if (best >= 2) mw = delta.filter(x => x.sw === best).sort((a, b) => a.sl - b.sl || b.dw - a.dw).filter((x, i, arr) => x.sl === arr[0].sl).slice(0, 3)
      .map(x => ({ name: x.name, single: x.sw + ':' + x.sl, double: x.dw + x.dl ? x.dw + ':' + x.dl : null }));
  }
  const me = (t.table || []).find(r => r.us);
  reports.set(id, { id, team: d.tid, label: t.label || 'CDA ' + d.tid, league: t.league || '', date: d.date, games: gs,
    points: gs.reduce((s, g) => s + (g.r === 's' ? 2 : g.r === 'u' ? 1 : 0), 0), of: gs.length * 2,
    pos: me ? me.pos : null, teams: (t.table || []).length || null, mw });
}
// Tabellenplatz: aktuellen Stand nur beim jüngsten Bericht je Team sicher – ältere behalten den Stand von damals
const list = [...reports.values()].sort((a, b) => b.date.localeCompare(a.date) || a.team.localeCompare(b.team));
writeFileSync('site/berichte.json', JSON.stringify({ generated: new Date().toISOString(), reports: list.slice(0, 60) }));
console.log('Spieltagsberichte:', list.length, list.slice(0, 6).map(r => r.label + ' ' + r.date + (r.mw.length ? ' MW ' + r.mw.map(m => m.name).join('/') : '')).join(' · '));
