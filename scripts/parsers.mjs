// Parser für die beiden Ligaportale.
// Bewusst ohne Abhängigkeiten: Die Funktionen bekommen fertige JSON-Objekte (3K)
// bzw. ein DOM-Dokument (nuLiga) und laufen so in Node (minidom.mjs) und im Browser gleich.

const TZ = 'Europe/Berlin';

/** "Kesselring, Leon" -> "Leon Kesselring" */
export function firstLast(name) {
  const s = String(name || '').replace(/\s+/g, ' ').trim();
  const i = s.indexOf(',');
  return i < 0 ? s : (s.slice(i + 1).trim() + ' ' + s.slice(0, i).trim()).trim();
}

/** Zeitpunkt aus 3K (UTC) in Berliner Datum und Uhrzeit */
export function berlinDateTime(iso) {
  const d = new Date(String(iso).replace(/\+0000$/, 'Z'));
  if (isNaN(d)) return { date: null, time: null };
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('de-DE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).map(x => [x.type, x.value])
  );
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

const txt = el => (el ? el.textContent : '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const rec = s => { const m = String(s || '').match(/(\d+)\s*:\s*(\d+)/); return m ? `${m[1]}:${m[2]}` : null; };

/* ------------------------------------------------------------------ 3K */

/**
 * @param phase   Antwort von /frontend/event/{id}/phase/{phaseId}  (enthält rounds[])
 * @param rounds  Array der Antworten von /phase/{phaseId}/round/{roundId}  (je {matches:[]})
 * @param players Antwort von /frontend/event/{id}/player/results
 * @param cfg     Eintrag aus sources.json
 */
export function parse3K(phase, rounds, players, cfg) {
  const us = cfg.teamName;
  const allMatches = [];
  const roundInfo = (phase.rounds || []).map(r => ({ id: r.id, name: r.name, index: r.index, date: berlinDateTime(r.dateFrom).date }));

  rounds.forEach((rd, i) => {
    const info = roundInfo[i] || {};
    (rd.matches || []).forEach(m => {
      if (m.byeHome || m.byeAway) return;
      const home = m.participantHome && m.participantHome.displayName;
      const away = m.participantGuest && m.participantGuest.displayName;
      if (!home || !away) return;
      const dt = berlinDateTime(m.datePlanned || (m.round && m.round.dateFrom));
      const done = m.statusCd === 'FINISH';
      const v = m.playingVenue || (m.participantHome.teamSeason && m.participantHome.teamSeason.playingVenue) || null;
      allMatches.push({
        round: (info.index != null ? info.index : i) + 1,
        roundName: info.name || (m.round && m.round.name) || '',
        date: dt.date, time: dt.time,
        home, away,
        score: done ? `${m.setsHome}:${m.setsAway}` : null,
        legs: done ? `${m.legsHome}:${m.legsAway}` : null,
        venue: v ? { name: v.name, street: v.locationStreet || '', zip: v.locationPostalCode || '', city: v.locationCity || '' } : null
      });
    });
  });

  // Tabelle selbst berechnen (Sieg 2, Remis 1), Sortierung wie im Portal angegeben:
  // Punktedifferenz, Pluspunkte, Setdifferenz, Plussets, Legdifferenz, Pluslegs
  const t = {};
  const row = n => (t[n] = t[n] || { name: n, played: 0, w: 0, d: 0, l: 0, s1: 0, s2: 0, l1: 0, l2: 0, p1: 0, p2: 0 });
  allMatches.filter(m => m.score).forEach(m => {
    const [sh, sa] = m.score.split(':').map(Number), [lh, la] = m.legs.split(':').map(Number);
    const h = row(m.home), a = row(m.away);
    h.played++; a.played++;
    h.s1 += sh; h.s2 += sa; a.s1 += sa; a.s2 += sh;
    h.l1 += lh; h.l2 += la; a.l1 += la; a.l2 += lh;
    if (sh > sa) { h.w++; a.l++; h.p1 += 2; a.p2 += 2; }
    else if (sh < sa) { a.w++; h.l++; a.p1 += 2; h.p2 += 2; }
    else { h.d++; a.d++; h.p1++; h.p2++; a.p1++; a.p2++; }
  });
  allMatches.forEach(m => { row(m.home); row(m.away); });
  const table = Object.values(t)
    .sort((x, y) => (y.p1 - y.p2) - (x.p1 - x.p2) || y.p1 - x.p1 || (y.s1 - y.s2) - (x.s1 - x.s2) || y.s1 - x.s1 || (y.l1 - y.l2) - (x.l1 - x.l2) || y.l1 - x.l1 || x.name.localeCompare(y.name, 'de'))
    .map((r, i) => ({ pos: i + 1, name: r.name, played: r.played, w: r.w, d: r.d, l: r.l, sets: `${r.s1}:${r.s2}`, legs: `${r.l1}:${r.l2}`, points: r.p1, us: r.name === us }));

  // Spieltage der eigenen Mannschaft
  const ours = allMatches.filter(m => m.home === us || m.away === us);
  const byRound = {};
  ours.forEach(m => { (byRound[m.round] = byRound[m.round] || []).push(m); });
  const matchdays = Object.keys(byRound).map(Number).sort((a, b) => a - b).map(r => {
    const games = byRound[r].sort((a, b) => String(a.time).localeCompare(String(b.time)));
    const g0 = games[0];
    // Gastgeber des Spieltags = Mannschaft, deren Spielort an diesem Tag genutzt wird
    const v = (games.find(g => g.venue) || {}).venue || null;
    const isHome = !!(v && cfg.homeVenueMatch && (v.city + ' ' + v.name).includes(cfg.homeVenueMatch));
    return {
      round: r, date: g0.date, venue: v, home: isHome,
      games: games.map(g => ({ time: g.time, home: g.home, away: g.away, score: g.score, legs: g.legs }))
    };
  });

  const pl = ((players && players.playerResults) || [])
    .filter(p => p.team && p.team.name === us)
    .map(p => {
      const s = p.singleResult || {}, d = p.doubleResult || {}, g = p.totalResult || {};
      const nm = (p.member && p.member.player && p.member.player.firstnameLastname) || firstLast(p.displayName);
      return {
        name: nm,
        single: s.matchCount ? `${s.matchWon}:${s.matchLost}` : null,
        double: d.matchCount ? `${d.matchWon}:${d.matchLost}` : null,
        total: g.matchCount ? `${g.matchWon}:${g.matchLost}` : null,
        singleLegs: s.matchCount ? `${s.legs1}:${s.legs2}` : null
      };
    });

  return { table, matchdays, players: pl };
}

/* --------------------------------------------------------------- nuLiga */

/** Tabelle aus der Staffelseite (groupPage) */
export function parseNuGroup(doc, cfg) {
  const tbl = [...doc.querySelectorAll('table.result-set')].find(t => /Rang/.test(txt(t.rows[0])) && /Punkte/.test(txt(t.rows[0])));
  if (!tbl) throw new Error('nuLiga: Tabelle nicht gefunden');
  const rows = [...tbl.rows].slice(1).map(tr => [...tr.cells].map(txt));
  const table = rows.filter(c => c.length >= 11 && /^\d+$/.test(c[1])).map(c => ({
    pos: +c[1], name: c[2], played: +c[3], w: +c[4], d: +c[5], l: +c[6],
    sets: rec(c[7]), legs: rec(c[9]), points: c[10], us: c[2] === cfg.teamName
  }));
  if (!table.length) throw new Error('nuLiga: Tabelle leer');
  return { table };
}

/** Spielplan, Spielorte und Spielerbilanzen aus dem Mannschaftsportrait (teamPortrait) */
export function parseNuTeam(doc, cfg) {
  const tables = [...doc.querySelectorAll('table.result-set')];

  // Spiellokale des Vereins: "Billardcafe Dinkelscherben (09040021)"
  const venues = {};
  const info = tables.find(t => /Verein/.test(txt(t.rows[0])));
  if (info) (info.textContent.match(/[^\n()]+\(\d{8}\)/g) || []).forEach(s => {
    const m = s.match(/(.+?)\s*\((\d{8})\)/); if (m) venues[m[2]] = m[1].trim();
  });

  const sched = tables.filter(t => /Heimmannschaft/.test(txt(t.rows[0])));
  if (!sched.length) throw new Error('nuLiga: Spielplan nicht gefunden');
  const matches = [];
  sched.forEach((t, half) => {
    [...t.rows].slice(1).forEach(tr => {
      const c = [...tr.cells];
      if (c.length < 8) return;
      const d = txt(c[1]).match(/(\d{2})\.(\d{2})\.(\d{4})/);
      const home = txt(c[5]), away = txt(c[6]);
      if (!d || /spielfrei/i.test(home + away)) return;
      const timeCell = txt(c[2]);
      const span = c[3].querySelector('[title]');
      const code = txt(c[3]);
      matches.push({
        half: half === 0 ? 'V' : 'R',
        round: +txt(c[4]) || null,
        date: `${d[3]}-${d[2]}-${d[1]}`,
        time: (timeCell.match(/\d{1,2}:\d{2}/) || [null])[0],
        moved: /\bv\b/.test(timeCell),
        home, away,
        score: rec(txt(c[7])),
        venue: home === cfg.teamName ? (venues[code] || (span && span.getAttribute('title')) || null) : (span && span.getAttribute('title')) || null
      });
    });
  });

  // Spielerbilanz: Einzelzeilen haben einen Link aufs Spielerportrait, Doppelzeilen enthalten " / "
  const pt = tables.find(t => /Name, Vorname/.test(txt(t.rows[0])));
  const players = [];
  if (pt) [...pt.rows].slice(1).forEach(tr => {
    const c = [...tr.cells].map(txt);
    const a = tr.querySelector('a[href*="playerPortrait"]');
    if (!a || c[1].includes('/')) return;
    players.push({ name: firstLast(txt(a)), games: +c[3] || 0, single: rec(c[c.length - 1]) });
  });

  return { matches, players, venues };
}
