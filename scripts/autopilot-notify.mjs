#!/usr/bin/env node
// Content-Autopilot: meldet neue Ergebnisse („Grafik liegt bereit“) und montags den Wochenplan
// als GitHub-Issue an Leon – GitHub schickt dazu eine E-Mail. Issue schließen = erledigt.
// Die IDs (#ap=…) sind dieselben wie im Studio-Reiter „Autopilot“.
import { readFile } from 'node:fs/promises';

const TOKEN = process.env.GITHUB_TOKEN, REPO = process.env.GITHUB_REPOSITORY || 'kesselringl/cda-website';
const OWNER = REPO.split('/')[0];
const STUDIO = process.env.STUDIO_URL || 'https://kesselringl.github.io/cda-studio/';
if (!TOKEN) { console.log('Kein GITHUB_TOKEN – Autopilot-Meldungen übersprungen'); process.exit(0); }

const gh = async (path, opt = {}) => {
  const r = await fetch('https://api.github.com/repos/' + REPO + path, { ...opt, headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' } });
  if (!r.ok && r.status !== 422) throw new Error(path + ': HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r.status === 204 ? null : r.json();
};
const berlin = d => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(d);
const today = berlin(new Date());
const addD = (iso, n) => { const t = new Date(iso + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const dmy = iso => iso.slice(8, 10) + '.' + iso.slice(5, 7) + '.';
const isUs = n => /clochard|cda/i.test(n || '');
const short = n => String(n || '').replace(/^(1\.\s*)?(Dart(club|sportverein)?|DC|DSC|TSV|SV|SC|FC)\s+/i, s => s).trim();

try {
  const data = JSON.parse(await readFile(new URL('../site/data.json', import.meta.url), 'utf8'));
  await gh('/labels', { method: 'POST', body: JSON.stringify({ name: 'autopilot', color: '0CA12D', description: 'Content-Autopilot: Grafik zum Posten bereit' }) });
  const issues = await gh('/issues?labels=autopilot&state=all&per_page=100');
  const has = id => (issues || []).some(i => (i.body || '').includes('[ap:' + id + ']'));
  const create = async (id, title, body) => {
    if (has(id)) return;
    await gh('/issues', { method: 'POST', body: JSON.stringify({ title, body: body + '\n\n<sub>[ap:' + id + '] Erledigt? Einfach dieses Issue schließen.</sub>', labels: ['autopilot'], assignees: [OWNER] }) });
    console.log('Autopilot-Meldung:', title);
  };
  const week = [];
  for (const [k, t] of Object.entries(data.teams)) {
    const mds = t.matchdays
      ? t.matchdays.map(m => ({ key: 'r' + m.round, label: m.round + '. Spieltag', date: m.date, games: m.games }))
      : (t.matches || []).filter(m => isUs(m.home) || isUs(m.away)).map(m => ({ key: m.date + m.home, label: 'gegen ' + (isUs(m.home) ? m.away : m.home), date: m.date, games: [m] }));
    for (const m of mds) {
      const done = m.games.every(g => g.score);
      if (done && m.date >= addD(today, -3) && m.date <= today) {
        const res = m.games.map(g => isUs(g.home) ? `CDA ${g.score} ${short(g.away)}` : `${short(g.home)} ${g.score} CDA`).join(' · ');
        const id = 'erg-' + k + '-' + m.key;
        await create(id, `📸 Grafik bereit: ${t.label} – ${m.label} (${m.games.map(g => g.score).join(', ')})`,
          `**${t.label}** · ${t.league}\n${res}\n\n👉 **[Grafik im Studio öffnen](${STUDIO}#ap=${encodeURIComponent(id)})** – Ergebnis-Grafik und Bildunterschrift sind fertig eingestellt, nur noch prüfen und posten.\n\nWeitere Vorschläge (Tabelle, Meilensteine …) stehen im Studio unter **Autopilot**.`);
      }
      if (!done && m.date > today && m.date <= addD(today, 7)) week.push(`- **${['So','Mo','Di','Mi','Do','Fr','Sa'][new Date(m.date + 'T12:00:00Z').getUTCDay()]} ${dmy(m.date)}** · ${t.label}: ${m.label}${m.games.length > 1 ? ' (' + m.games.map(g => isUs(g.home) ? g.away : g.home).join(' & ') + ')' : ''} → Vorschau 2 Tage vorher`);
    }
  }
  // Montags: Wochenplan
  const wd = new Date(today + 'T12:00:00Z').getUTCDay();
  if (wd === 1) {
    const d = new Date(today + 'T12:00:00Z'), j = new Date(Date.UTC(d.getUTCFullYear(), 0, 4)), kw = 1 + Math.round(((d - j) / 864e5 - 3 + ((j.getUTCDay() + 6) % 7)) / 7);
    const extra = [];
    if (+today.slice(8) <= 7) extra.push('- ⭐ **Spieler des Monats** für den Vormonat (Vorschlag steht im Studio)');
    if (+today.slice(8) >= 12 && +today.slice(8) <= 18) extra.push('- 🎯 **Top 5 nach Average** (CDA I) um den 18.');
    if (today.slice(5) >= '12-14' && today.slice(5) <= '12-24') extra.push('- 🎁 **CDA Wrapped** – Jahresrückblick als Karussell');
    extra.push('- 💬 **WhatsApp-Einladung** für Donnerstag am Mittwoch, Erinnerung am Donnerstag mittags');
    await create('wp-' + today, `🗓️ Wochenplan KW ${kw}: das steht zum Posten an`,
      (week.length ? '**Spieltage diese Woche**\n' + week.join('\n') + '\n\n' : 'Diese Woche keine Ligaspiele.\n\n') + '**Außerdem**\n' + extra.join('\n') + `\n\n👉 **[Autopilot im Studio öffnen](${STUDIO}#ap=plan)** – dort steht alles mit einem Klick fertig eingestellt.`);
  }
} catch (e) { console.log('::warning::Autopilot-Meldung fehlgeschlagen: ' + e.message); }
