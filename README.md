# Website Clochard Darter Augsburg e.V.

Die Vereinsseite liegt im Ordner `site/` und wird über **GitHub Pages** veröffentlicht. Das kostet nichts.

## Was automatisch passiert

Der Ablauf `.github/workflows/update.yml` läuft
- jede Nacht gegen 4–5 Uhr,
- Montag bis Donnerstag nach den Bezirksliga-Abenden (ca. 23:30 Uhr),
- an Samstagen mehrmals nachmittags und abends (Bundesliga-Spieltage),
- und nach jeder Änderung an der Seite.

Dabei holt `scripts/fetch-data.mjs` Tabellen, Spielpläne, Spielorte und Einzelbilanzen:

| Mannschaft | Quelle |
|---|---|
| CDA I | 3K-Portal (WINMAU 2. Bundesliga Süd) |
| CDA II–IV | nuLiga Dart (BDV, Bezirk Schwaben) |

Das Ergebnis landet in `site/data.json`, und die Startseite liest diese Datei beim Öffnen.

**Wenn eine Quelle ausfällt**, bleibt der letzte gute Stand der Mannschaft stehen. Der Ablauf wird dann rot markiert und GitHub schickt dem Kontoinhaber eine E-Mail. Meist hat sich in dem Fall nur kurz ein Portal verschluckt, und der nächste Lauf klappt wieder.

## Neue Saison

In `scripts/sources.json` einmal pro Saison die Adressen anpassen:
- **3K:** `eventId` und `phaseId` stehen in der Adresse der Liga-Seite (`…/event/1408/phase/2101/…`).
- **nuLiga:** `groupUrl` ist die Seite „Tabelle und Spielplan“, `teamUrl` das „Mannschaftsportrait“.

Ändert sich ein Liganame oder steigt eine Mannschaft auf, auch `league` anpassen.

## Von Hand starten

Im Reiter **Actions** auf „Ergebnisse aktualisieren und veröffentlichen“ und dann auf **Run workflow** klicken.

## Lokal testen

```bash
npm test        # prüft die Parser mit gespeicherten Beispielen
npm run fetch   # holt die echten Daten nach site/data.json
```

Dafür wird nur Node.js 20 oder neuer gebraucht. Weitere Pakete sind nicht nötig.
