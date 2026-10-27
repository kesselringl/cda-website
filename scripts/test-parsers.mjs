// Prüft die Parser mit Ausschnitten der echten Seiten (Stand 27.10.2026).
// Läuft vor jedem Abruf; schlägt er fehl, wird nichts veröffentlicht.
import assert from 'node:assert/strict';
import { MiniDocument } from './minidom.mjs';
import { parse3K, parseNuGroup, parseNuTeam, berlinDateTime, firstLast } from './parsers.mjs';

let n = 0;
const test = (name, fn) => { fn(); n++; console.log('✓', name); };

test('Namen und Zeitzone', () => {
  assert.equal(firstLast('Kesselring, Leon'), 'Leon Kesselring');
  assert.deepEqual(berlinDateTime('2026-10-24T13:00:00.000+0000'), { date: '2026-10-24', time: '15:00' }); // Sommerzeit
  assert.deepEqual(berlinDateTime('2026-11-07T11:00:00.000+0000'), { date: '2026-11-07', time: '12:00' }); // Winterzeit
});

const nuGroup = `<html><body><table id="layout"><tr><td>
<table class="result-set" cellspacing="0">
<tr><th>&nbsp;</th><th>Rang</th><th>Mannschaft</th><th>Begegnungen</th><th>S</th><th>U</th><th>N</th><th>Spiele</th><th>+/-</th><th>Legs</th><th>Punkte</th></tr>
<tr> <td> <img alt="Aufsteiger" src="/x/up_11x11.gif"> </td> <td align="center">1</td> <td nowrap="nowrap"> <a title="Mannschaftsportrait" href="/cgi-bin/WebObjects/nuLigaDARTDE.woa/wa/teamPortrait?teamtable=1529586&amp;group=211693">Clochard Darter Augsburg II</a> </td> <td align="center">4</td> <td align="center">4</td> <td align="center">0</td> <td align="center">0</td> <td align="center"> 26:14 </td> <td align="center">+12</td> <td align="center">87:69</td> <td align="center">8:0</td></tr>
<tr> <td> </td> <td align="center">2</td> <td nowrap="nowrap"> <a href="/x">D&acute;Augschburger</a> </td> <td align="center">5</td> <td align="center">4</td> <td align="center">0</td> <td align="center">1</td> <td align="center"> 31:19 </td> <td align="center">+12</td> <td align="center">112:83</td> <td align="center">8:2</td></tr>
</table>
<table class="result-set"><tr><td>Tag</td><td>Datum</td><td>Heimmannschaft</td></tr></table>
</td></tr></table></body></html>`;

test('nuLiga Tabelle', () => {
  const { table } = parseNuGroup(new MiniDocument(nuGroup), { teamName: 'Clochard Darter Augsburg II' });
  assert.equal(table.length, 2);
  assert.deepEqual(table[0], { pos: 1, name: 'Clochard Darter Augsburg II', played: 4, w: 4, d: 0, l: 0, sets: '26:14', legs: '87:69', points: '8:0', us: true });
  assert.equal(table[1].name, 'D´Augschburger');
});

const nuTeam = `<html><body>
<table class="result-set"><tr><td><b>Verein</b></td><td>Clochard Darter Augsburg e.V.<br>
Billardcafe Dinkelscherben (09040021)<br>
Bismarck Bistro (09040020)<br>
Sportheim TSV Dinkelscherben (09040022)<br></td></tr>
<tr> <td> <b>Mannschaftsverantwortlicher</b> </td> <td>Lautenschlager, Ewald<br><script type="text/JavaScript"> encodeEmail('de', 'x', 'y', '')</script></td> </tr></table>
<h2>Spieltermine (Vorrunde)</h2>
<table class="result-set">
<tr><th>Tag</th><th>Datum</th><th>Zeit</th><th>Ort</th><th>Runde</th><th>Heimmannschaft</th><th>Gastmannschaft</th><th>Spiele</th><th></th><th></th><th></th></tr>
<tr> <td class="right" nowrap="nowrap"> Mi </td> <td class="left" nowrap="nowrap"> 16.09.2026 </td> <td nowrap="nowrap" title="verlegt, ursprünglicher Termin: Mi. 16.09.2026 20:00" class="left"> 19:00 &nbsp;v &nbsp;</td> <td> <span alt="Vereinsheim Nordheim" title="Vereinsheim Nordheim"> <a href="/courtInfo?location=20637">09040070</a> </span> </td> <td class="center"> 1 </td> <td nowrap="nowrap">Dscheina Darter Donauwörth</td> <td nowrap="nowrap"> Clochard Darter Augsburg II&nbsp; </td> <td nowrap="nowrap" class="center"> <a title="Spielbericht" href="/report?meeting=6108141"> <span> 4:6 </span> </a> </td> <td></td><td></td><td></td></tr>
<tr> <td class="right"> Mi </td> <td class="left"> 28.10.2026 </td> <td class="left"> 20:00 &nbsp;</td> <td> <span title="Billardcafe Dinkelscherben"> <a href="/courtInfo?location=23507">09040021</a> </span> </td> <td class="center"> 5 </td> <td nowrap="nowrap">Clochard Darter Augsburg II</td> <td nowrap="nowrap"> DJK Lechhausen III&nbsp; </td> <td class="center"> </td> <td>&nbsp;</td> <td> &nbsp; <span></span> </td> <td class="right"> </td></tr>
</table>
<h2>Spieltermine (Rückrunde)</h2>
<table class="result-set">
<tr><th>Tag</th><th>Datum</th><th>Zeit</th><th>Ort</th><th>Runde</th><th>Heimmannschaft</th><th>Gastmannschaft</th><th>Spiele</th></tr>
<tr> <td> Mo </td> <td> 01.03.2027 </td> <td> 00:00 </td> <td> </td> <td> 3 </td> <td>spielfrei</td> <td>Clochard Darter Augsburg II</td> <td> </td> </tr>
<tr> <td> Mo </td> <td> 07.06.2027 </td> <td> 20:00 &nbsp;</td> <td> <span title="Sportgaststätte"><a href="/c">09040160</a></span> </td> <td> 11 </td> <td>SV Steingriff II</td> <td> Clochard Darter Augsburg II&nbsp; </td> <td> </td> </tr>
</table>
<table class="result-set">
<tr><td>Rang</td><td>Name, Vorname</td><td></td><td>Einsätze</td><td>Einzel/Doppel</td><td></td><td>gesamt</td></tr>
<tr> <td>2.4</td> <td> <a title="Spielerportrait" href="/playerPortrait?person=2466154&amp;club=115">Mors, Andreas</a>&nbsp;&nbsp; </td> <td align="right">&nbsp;</td> <td class="center">3</td> <td class="center">3</td> <td class="center">&nbsp;</td> <td class="center">4:2</td> </tr>
<tr> <td>2.5</td> <td> <a href="/playerPortrait?person=1">Mader, Claus</a> </td> <td></td> <td class="center">0</td> <td></td> <td></td> <td></td> </tr>
<tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td>Einzel</td> <td>20:12</td> </tr>
<tr> <td></td> <td>Mors, Andreas / Thoma, Jonas</td> <td></td> <td></td> <td>2</td> <td></td> <td>2:0</td> </tr>
</table>
</body></html>`;

test('nuLiga Mannschaftsportrait', () => {
  const r = parseNuTeam(new MiniDocument(nuTeam), { teamName: 'Clochard Darter Augsburg II' });
  assert.equal(r.venues['09040021'], 'Billardcafe Dinkelscherben');
  assert.equal(r.matches.length, 3, 'spielfrei wird übersprungen');
  assert.deepEqual(r.matches[0], { half: 'V', round: 1, date: '2026-09-16', time: '19:00', moved: true, home: 'Dscheina Darter Donauwörth', away: 'Clochard Darter Augsburg II', score: '4:6', venue: 'Vereinsheim Nordheim' });
  assert.equal(r.matches[1].venue, 'Billardcafe Dinkelscherben');
  assert.equal(r.matches[1].score, null);
  assert.equal(r.matches[2].half, 'R');
  assert.deepEqual(r.players, [{ name: 'Andreas Mors', games: 3, single: '4:2' }, { name: 'Claus Mader', games: 0, single: null }]);
});

const m = (h, a, utc, sh, sa, lh, la, v) => ({ statusCd: sh == null ? 'OPEN' : 'FINISH', datePlanned: utc, setsHome: sh, setsAway: sa, legsHome: lh, legsAway: la,
  participantHome: { displayName: h }, participantGuest: { displayName: a }, playingVenue: { name: v[0], locationStreet: v[1], locationPostalCode: v[2], locationCity: v[3] } });
const ROSE = ['Zur alten Rose', 'Häuserstraße 22', '68789', 'Sankt Leon-Rot'];
const TSV = ['TSV Dinkelscherben', 'Burggasse 50', '86424', 'Dinkelscherben'];
const CDA = 'Clochard Darter Augsburg';

test('3K Spieltage, Tabelle und Spieler', () => {
  const phase = { rounds: [{ id: 3, name: 'Spieltag 3', index: 2, dateFrom: '2026-10-24T16:00:00.000+0000' }, { id: 4, name: 'Spieltag 4', index: 3, dateFrom: '2026-11-07T17:00:00.000+0000' }] };
  const rounds = [
    { matches: [m('Darts Pub Walldorf', 'DVK 1', '2026-10-24T10:00:00.000+0000', 6, 6, 35, 38, ROSE), m('DVK 1', CDA, '2026-10-24T13:00:00.000+0000', 5, 7, 35, 34, ROSE), m(CDA, 'Darts Pub Walldorf', '2026-10-24T16:00:00.000+0000', 6, 6, 34, 31, ROSE)] },
    { matches: [m(CDA, 'DC Urbach', '2026-11-07T11:00:00.000+0000', null, null, null, null, TSV), m('DSC Bandits 1', CDA, '2026-11-07T17:00:00.000+0000', null, null, null, null, TSV)] }
  ];
  const players = { playerResults: [{ displayName: 'Kesselring, Leon', team: { name: CDA }, member: { player: { firstnameLastname: 'Leon Kesselring' } },
    singleResult: { matchCount: 6, matchWon: 5, matchLost: 1, legs1: 22, legs2: 9 }, doubleResult: { matchCount: 6, matchWon: 4, matchLost: 2 }, totalResult: { matchCount: 12, matchWon: 9, matchLost: 3 } },
    { displayName: 'Bauer, X', team: { name: 'DVK 1' }, singleResult: {} }] };
  const r = parse3K(phase, rounds, players, { teamName: CDA, homeVenueMatch: 'Dinkelscherben' });
  assert.equal(r.table[0].name, CDA);
  assert.equal(r.table[0].points, 3);
  assert.equal(r.table[0].sets, '13:11');
  assert.equal(r.matchdays.length, 2);
  assert.equal(r.matchdays[0].home, false);
  assert.equal(r.matchdays[0].venue.city, 'Sankt Leon-Rot');
  assert.equal(r.matchdays[0].games[0].time, '15:00');
  assert.equal(r.matchdays[1].home, true);
  assert.deepEqual(r.matchdays[1].games.map(g => g.time), ['12:00', '18:00']);
  assert.deepEqual(r.players, [{ name: 'Leon Kesselring', single: '5:1', double: '4:2', total: '9:3', singleLegs: '22:9' }]);
});

console.log(`${n} Tests bestanden`);
