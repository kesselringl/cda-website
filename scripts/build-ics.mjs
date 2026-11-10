// Erzeugt die Kalender-Abos (iCal) für die Donnerstags-Competition:
//   site/kalender/cda-competition.ics  – alle Termine
//   site/kalender/cda-masters.ics      – nur CDA-Masters-Abende und Finals
// Läuft bei jedem Workflow-Durchlauf (nachts), damit die Liste immer ab heute aktuell ist.
// Die Termin-Logik ist dieselbe wie auf der Homepage (cdaCalendar) und im Competition-System.
import { mkdirSync, writeFileSync } from 'node:fs';

const SITE = process.env.SITE_URL || 'https://kesselringl.github.io/cda-website/';
const RELAUNCH = '2027-01-07';
const MASTERS_PER_SEASON = 16;
const BISTRO = 'Bismarck Bistro, Bismarckstraße 7, 86159 Augsburg';
const TSV = 'Sportheim TSV Dinkelscherben, Burggasse 50, 86424 Dinkelscherben';

const MODE = {
  m501: ['CDA Masters', '501 Double-out. Zählt für die Masters-Rangliste und die Finals. Startgeld 15 € (5 € Preisgeld am Abend, 10 € in den Masters-Pott).'],
  c501: ['Competition 501', '501 Double-out, ohne Masters-Wertung.'],
  di301: ['301 Double-In', '301 Double-in / Double-out: Punkte zählen erst nach dem ersten Doppel.'],
  cricket: ['Cricket-Nacht', 'Cricket: 15 bis 20 und Bull.'],
  lucky: ['Lucky Doubles', 'Zugeloste Doppel, stark und schwach zusammen.'],
  friend: ['Bring a Friend', 'Mitglied und Gast spielen zusammen im Doppel.'],
  finals: ['CDA-Masters-Finals', 'Saisonfinale der besten 32 mit mindestens 5 Masters-Abenden. Der Masters-Pott wird ausgespielt.'],
  alt: ['CDA Competition', 'Offene Competition, jeder kann mitspielen.'],
};

const plusDays = (iso, n) => { const t = new Date(iso + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };

export function cdaCalendar(year) {
  const out = []; const d = new Date(Date.UTC(year, 0, 7, 12));
  let i = 0, ms = 0, lf = -99, lc = 0, ll = 2, alt = 0;
  while (d.getUTCDay() !== 4) d.setUTCDate(d.getUTCDate() + 1);
  for (; d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 7)) {
    const iso = d.toISOString().slice(0, 10); if (iso.slice(5) >= '12-23') continue;
    let m = null;
    if (i % 3 === 1 && ms < MASTERS_PER_SEASON) { m = 'm501'; ms++; }
    if (!m) { const w = i; if (i === 0 || w - lf >= 17) { m = 'friend'; lf = w; } else if (w - lc >= 7) { m = 'cricket'; lc = w; } else if (w - ll >= 11) { m = 'lucky'; ll = w; } else { m = (alt++ % 2) ? 'di301' : 'c501'; } }
    out.push({ date: iso, mode: m }); i++;
  }
  // Finals: Samstag, 9 Tage nach dem letzten Masters-Abend (Anfang Dezember, mit Abstand zu Weihnachten)
  const lm = out.filter(e => e.mode === 'm501').map(e => e.date).pop();
  if (lm && ms >= MASTERS_PER_SEASON) {
    out.forEach(e => { if (e.date === plusDays(lm, 7)) e.note = 'Finals am Samstag'; });
    out.push({ date: plusDays(lm, 9), mode: 'finals' }); out.sort((a, b) => a.date < b.date ? -1 : 1);
  }
  return out;
}

function events(fromIso, toYear) {
  const out = [];
  // bis zum Neustart: jeden Donnerstag im bisherigen Format (Weihnachtspause ausgenommen)
  const t = new Date(fromIso + 'T12:00:00Z'); while (t.getUTCDay() !== 4) t.setUTCDate(t.getUTCDate() + 1);
  for (; t.toISOString().slice(0, 10) < RELAUNCH; t.setUTCDate(t.getUTCDate() + 7)) {
    const iso = t.toISOString().slice(0, 10), md = iso.slice(5);
    if (md >= '12-23' || md < '01-07') continue; out.push({ date: iso, mode: 'alt' });
  }
  for (let y = 2027; y <= toYear; y++) cdaCalendar(y).forEach(e => out.push(e));
  return out.filter(e => e.date >= fromIso);
}

// iCal-Hilfen: Zeilen falten (max. 75 Bytes), Sonderzeichen maskieren, CRLF
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
function fold(line) {
  const b = Buffer.from(line, 'utf8'); if (b.length <= 75) return line;
  const parts = []; let cur = '';
  for (const ch of line) { if (Buffer.byteLength(cur + ch) > (parts.length ? 74 : 75)) { parts.push(cur); cur = ''; } cur += ch; }
  parts.push(cur); return parts.join('\r\n ');
}
const ymd = iso => iso.replace(/-/g, '');
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

const VTZ = ['BEGIN:VTIMEZONE', 'TZID:Europe/Berlin',
  'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
  'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
  'END:VTIMEZONE'];

function ics(name, desc, list) {
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Clochard Darter Augsburg e.V.//Competition//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:' + esc(name), 'X-WR-CALDESC:' + esc(desc), 'X-WR-TIMEZONE:Europe/Berlin',
    'REFRESH-INTERVAL;VALUE=DURATION:P1D', 'X-PUBLISHED-TTL:P1D', ...VTZ];
  for (const e of list) {
    const [title, text] = MODE[e.mode];
    const finals = e.mode === 'finals';
    L.push('BEGIN:VEVENT', `UID:cda-${e.date}-${e.mode}@clochard-darter-augsburg`, 'DTSTAMP:' + stamp);
    if (finals) L.push('DTSTART;VALUE=DATE:' + ymd(e.date), 'DTEND;VALUE=DATE:' + ymd(plusDays(e.date, 1)));
    else L.push(`DTSTART;TZID=Europe/Berlin:${ymd(e.date)}T200000`, `DTEND;TZID=Europe/Berlin:${ymd(e.date)}T230000`);
    L.push('SUMMARY:' + esc((finals ? '🏆 ' : e.mode === 'm501' ? '★ ' : '🎯 ') + title + (e.note ? ' (' + e.note + ')' : '')),
      'LOCATION:' + esc(finals ? TSV : BISTRO),
      'DESCRIPTION:' + esc(text + (finals ? '' : '\nAnmeldung: ' + SITE + '#kontakt') + '\nAlle Infos: ' + SITE + '#masters'),
      'URL:' + SITE + (finals ? '#masters' : '#kontakt'),
      'TRANSP:' + (finals ? 'TRANSPARENT' : 'OPAQUE'), 'END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.map(fold).join('\r\n') + '\r\n';
}

const today = new Date().toISOString().slice(0, 10);
const from = plusDays(today, -14), toYear = new Date().getUTCFullYear() + 1;
const all = events(from, toYear);
mkdirSync('site/kalender', { recursive: true });
writeFileSync('site/kalender/cda-competition.ics', ics('CDA Competition', 'Alle Donnerstags-Termine des Clochard Darter Augsburg e.V. mit Spielmodus', all));
writeFileSync('site/kalender/cda-masters.ics', ics('CDA Masters', 'CDA-Masters-Abende und Masters-Finals des Clochard Darter Augsburg e.V.', all.filter(e => e.mode === 'm501' || e.mode === 'finals')));
console.log(`Kalender: ${all.length} Termine, davon ${all.filter(e => e.mode === 'm501').length} Masters-Abende (bis ${toYear}).`);
