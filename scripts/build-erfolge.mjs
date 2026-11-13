#!/usr/bin/env node
// Erfolge & Abzeichen der CDA Masters / Competition → site/erfolge.json
// Quelle: abgeschlossene, echte Abende aus Supabase (öffentlich lesbar, ohne Testabende).
// Gäste bekommen keine Abzeichen (ihre Namen erscheinen nur mit Einwilligung).
// Aufruf: node scripts/build-erfolge.mjs            (holt aus Supabase)
//         node scripts/build-erfolge.mjs datei.json  (Test mit exportierten Abenden [{date,state}])
import { readFile, writeFile } from 'node:fs/promises';

const U = 'https://qeevsqrmltewbtrnfrfm.supabase.co', K = 'sb_publishable_pwnzx63cque5lKZEVCe4mA_5SvBP8Yd';
const OUT = new URL('../site/erfolge.json', import.meta.url);

// Reihenfolge = Anzeige-Reihenfolge (wertvollste zuerst). tier: legende | gold | silber | bronze
export const DEFS = {
  'neun-darter':     { icon: '💎', glyph: '9',    tier: 'legende', label: '9-Darter',          desc: 'Ein Leg 501 mit nur 9 Darts – das perfekte Leg' },
  'masters-champion':{ icon: '👑', glyph: '★',    tier: 'legende', label: 'Masters-Champion',  desc: 'Sieger der CDA-Masters-Finals' },
  'big-fish':        { icon: '🐟', glyph: '170',  tier: 'gold',    label: 'Big Fish',          desc: '170 ausgecheckt – das höchste Finish' },
  'zwoelf-darter':   { icon: '⚡', glyph: '12',   tier: 'gold',    label: '12-Darter',         desc: 'Ein Leg 501 mit höchstens 12 Darts' },
  'masters-sieg':    { icon: '🏆', glyph: 'M',    tier: 'gold',    label: 'Masters-Sieg',      desc: 'Einen Masters-Abend gewonnen' },
  'hattrick':        { icon: '🎩', glyph: '3×',   tier: 'gold',    label: 'Hattrick',          desc: 'Drei Abende gewonnen' },
  '180-x25':         { icon: '🔥', glyph: '25',   tier: 'gold',    label: '180er-Maschine',    desc: '25 Mal die 180 geworfen' },
  'avg-80':          { icon: '🚀', glyph: '80+',  tier: 'gold',    label: 'Average 80+',       desc: 'Einen ganzen Abend über 80 Average' },
  'abende-50':       { icon: '🏛️', glyph: '50',   tier: 'gold',    label: 'Vereinslegende',    desc: '50 Abende dabei' },
  'serie-10':        { icon: '🔗', glyph: '10',   tier: 'gold',    label: 'Dauerbrenner',      desc: '10 Abende in Folge dabei' },
  'tagessieg':       { icon: '🥇', glyph: '1.',   tier: 'silber',  label: 'Tagessieg',         desc: 'Einen Abend gewonnen' },
  'hundert-finish':  { icon: '💯', glyph: '100+', tier: 'silber',  label: '100er-Finish',      desc: 'Ein Finish von 100 oder mehr' },
  'fuenfzehn-darter':{ icon: '⏱️', glyph: '15',   tier: 'silber',  label: '15-Darter',         desc: 'Ein Leg 501 mit höchstens 15 Darts' },
  '180-x10':         { icon: '🎯', glyph: '10×',  tier: 'silber',  label: '180er-Sammler',     desc: '10 Mal die 180 geworfen' },
  'avg-70':          { icon: '📈', glyph: '70+',  tier: 'silber',  label: 'Average 70+',       desc: 'Einen ganzen Abend über 70 Average' },
  'abende-25':       { icon: '🗓️', glyph: '25',   tier: 'silber',  label: 'Stammspieler',      desc: '25 Abende dabei' },
  'favoritenschreck':{ icon: '🗡️', glyph: '!',    tier: 'silber',  label: 'Favoritenschreck',  desc: 'Den Tagessieger des Abends geschlagen' },
  'comeback':        { icon: '🔄', glyph: '↺',    tier: 'silber',  label: 'Comeback',          desc: 'Nach zwei Legs Rückstand noch gewonnen' },
  'allrounder':      { icon: '🧩', glyph: '4',    tier: 'silber',  label: 'Allrounder',        desc: '501, Double-In, Cricket und Doppel gespielt' },
  'erste-180':       { icon: '🎯', glyph: '180',  tier: 'bronze',  label: 'Erste 180',         desc: 'Die erste 180 bei der Competition' },
  'podest':          { icon: '🥉', glyph: 'Top3', tier: 'bronze',  label: 'Aufs Podest',       desc: 'Zum ersten Mal unter den Top 3' },
  'revanche':        { icon: '⚔️', glyph: 'R',    tier: 'bronze',  label: 'Revanche geglückt', desc: 'Gegen den Gegner gewonnen, der einen beim letzten Mal geschlagen hat' },
  'avg-60':          { icon: '📊', glyph: '60+',  tier: 'bronze',  label: 'Average 60+',       desc: 'Einen ganzen Abend über 60 Average' },
  'serie-5':         { icon: '🔁', glyph: '5',    tier: 'bronze',  label: 'Stammgast',         desc: '5 Abende in Folge dabei' },
  'abende-10':       { icon: '🎟️', glyph: '10',   tier: 'bronze',  label: 'Zehn Abende',       desc: '10 Abende dabei' },
  'erster-sieg':     { icon: '✅', glyph: '1',    tier: 'bronze',  label: 'Erster Sieg',       desc: 'Das erste gewonnene Spiel' },
  'debuet':          { icon: '👋', glyph: 'Hi',   tier: 'bronze',  label: 'Debüt',             desc: 'Der erste Abend bei der Competition' },
};

export function compute(rows) {
  const evs = rows.map(r => r.state || r).filter(e => e && e.date && e.matches && !e.test).sort((a, b) => a.date < b.date ? -1 : 1);
  const P = {}, won = {}, award = [];
  const me = n => P[n] || (P[n] = { n: 0, streak: 0, lastIdx: -2, t180: 0, wins: 0, evWins: 0, modes: {}, h2h: {} });
  const give = (name, id, date) => { won[name] = won[name] || {}; if (won[name][id]) return; won[name][id] = date; award.push({ name, id, date }); };
  evs.forEach((ev, idx) => {
    const R = ev.roster || {}, nm = id => R[id] && R[id].name, guest = id => !R[id] || R[id].guest;
    const parts = ev.parts || {}, mode = ev.mode, cricket = mode === 'cricket', date = ev.date;
    const members = pid => (parts[pid] && parts[pid].members) || [];
    const pids = (ev.pids || []).filter(id => !guest(id));
    // Teilnahme
    pids.forEach(id => { const n = nm(id), s = me(n); s.n++; s.streak = s.lastIdx === idx - 1 ? s.streak + 1 : 1; s.lastIdx = idx;
      s.modes[mode === 'lucky' || mode === 'friend' ? 'dbl' : mode === 'm501' || mode === 'finals' || mode === 'c501' ? 'x01' : mode] = 1;
      give(n, 'debuet', date);
      if (s.n >= 10) give(n, 'abende-10', date); if (s.n >= 25) give(n, 'abende-25', date); if (s.n >= 50) give(n, 'abende-50', date);
      if (s.streak >= 5) give(n, 'serie-5', date); if (s.streak >= 10) give(n, 'serie-10', date);
      if (s.modes.x01 && s.modes.di301 && s.modes.cricket && s.modes.dbl) give(n, 'allrounder', date); });
    const winnerName = ev.summary && ev.summary.podium && ev.summary.podium[0] && ev.summary.podium[0].name;
    const sc = {}, dt = {};
    (ev.matches || []).forEach(m => {
      if (!m.a || !m.b) return;
      const A = members(m.a), B = members(m.b), single = A.length === 1 && B.length === 1;
      const full = parts[m.a] && parts[m.b] && parts[m.a].start === 501 && parts[m.b].start === 501 && !cricket && mode !== 'di301';
      // Legs: 180er, Finishes, kurze Legs, Comeback
      let la = 0, lb = 0, maxBehind = [0, 0];
      (m.legs || []).forEach(l => {
        const darts = [0, 0];
        (l.visits || []).forEach(v => {
          darts[v.p] += v.darts || 0; const n = nm(v.who);
          if (cricket || !n || guest(v.who)) return;
          sc[n] = (sc[n] || 0) + (v.bust ? 0 : v.score || 0); dt[n] = (dt[n] || 0) + (v.darts || 0);
          if (!v.bust && v.score === 180) { const s = me(n); s.t180++; give(n, 'erste-180', date); if (s.t180 >= 10) give(n, '180-x10', date); if (s.t180 >= 25) give(n, '180-x25', date); }
          if (v.co && !v.bust) { if (v.score >= 100) give(n, 'hundert-finish', date); if (v.score === 170) give(n, 'big-fish', date);
            if (single && full) { const d = darts[v.p]; if (d <= 15) give(n, 'fuenfzehn-darter', date); if (d <= 12) give(n, 'zwoelf-darter', date); if (d <= 9) give(n, 'neun-darter', date); } }
        });
        if (l.winner === 0) la++; else if (l.winner === 1) lb++;
        maxBehind[0] = Math.max(maxBehind[0], lb - la); maxBehind[1] = Math.max(maxBehind[1], la - lb);
      });
      if (m.status !== 'done' || (m.winner !== 0 && m.winner !== 1)) return;
      const W = m.winner === 0 ? A : B, Lo = m.winner === 0 ? B : A, wn = W.filter(id => !guest(id)).map(nm), ln = Lo.map(id => nm(id) || '?').join(' & ');
      wn.forEach(n => { const s = me(n); s.wins++; give(n, 'erster-sieg', date);
        if (maxBehind[m.winner] >= 2) give(n, 'comeback', date);
        if (winnerName && ln === winnerName) give(n, 'favoritenschreck', date); });
      // Revanche (nur Einzel)
      if (single) { const wName = nm(W[0]), lName = nm(Lo[0]); if (wName && lName) {
        if (!guest(W[0]) && me(wName).h2h[lName] === 'L') give(wName, 'revanche', date);
        if (!guest(W[0])) me(wName).h2h[lName] = 'W'; if (!guest(Lo[0])) me(lName).h2h[wName] = 'L'; } }
    });
    // Abend-Average (mind. 30 Darts)
    Object.keys(dt).forEach(n => { if (dt[n] < 30) return; const a = sc[n] / dt[n] * 3; if (a >= 60) give(n, 'avg-60', date); if (a >= 70) give(n, 'avg-70', date); if (a >= 80) give(n, 'avg-80', date); });
    // Platzierungen aus der Zusammenfassung
    const all = (ev.summary && ev.summary.all) || [];
    const guestNames = new Set(Object.values(R).filter(x => x.guest).map(x => x.name));
    all.forEach(x => String(x.name || '').split(' & ').forEach(n => { if (!n || guestNames.has(n) || !P[n]) return;
      if (x.place <= 3) give(n, 'podest', date);
      if (x.place === 1) { const s = me(n); s.evWins++; give(n, 'tagessieg', date); if (s.evWins >= 3) give(n, 'hattrick', date);
        if (mode === 'm501') give(n, 'masters-sieg', date); if (mode === 'finals') give(n, 'masters-champion', date); } }));
  });
  const order = Object.keys(DEFS), players = {};
  Object.keys(won).forEach(n => { players[n] = Object.keys(won[n]).sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(id => ({ id, date: won[n][id] })); });
  const last = evs.length ? evs[evs.length - 1].date : null;
  return { updated: new Date().toISOString(), events: evs.length, defs: DEFS, players,
    recent: last ? { date: last, awards: award.filter(a => a.date === last && a.id !== 'debuet').sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)) } : null };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    let rows;
    if (process.argv[2]) rows = JSON.parse(await readFile(process.argv[2], 'utf8'));
    else { const r = await fetch(`${U}/rest/v1/events?select=date,state&status=eq.done&test=eq.false&order=date`, { headers: { apikey: K } }); if (!r.ok) throw new Error('HTTP ' + r.status); rows = await r.json(); }
    const out = compute(rows);
    await writeFile(process.argv[3] ? new URL(process.argv[3], 'file://' + process.cwd() + '/') : OUT, JSON.stringify(out));
    console.log(`erfolge.json: ${out.events} Abende, ${Object.keys(out.players).length} Spieler mit Abzeichen, ${Object.values(out.players).reduce((a, l) => a + l.length, 0)} Abzeichen`);
  } catch (e) { console.log('::warning::Abzeichen nicht aktualisiert: ' + e.message); }
}
