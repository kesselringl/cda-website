# Supabase-Skripte – Reihenfolge und Regeln

Die Skripte wurden **einmal in dieser Reihenfolge** im Supabase SQL Editor ausgeführt:
01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09.

**Ältere Skripte nicht erneut einzeln ausführen.** Spätere Teile ersetzen Regeln früherer Teile
(z. B. 05 verschärft die Board-Rechte aus 04, 08 verschärft das Steckbrief-Formular aus 07,
09 schränkt Lese-Rechte aus 01 ein). Wer 04 oder 07 noch einmal ausführt, setzt diese Schutzregeln zurück.

Änderungen immer als **neues Skript mit der nächsten Nummer** anlegen.

Prüfen, ob alles greift: GitHub → Actions → „Sicherheitscheck Datenbank“ → „Run workflow“.
