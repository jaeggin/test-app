# PROJ-1: Aufgaben verwalten

<!-- Diese Datei (spec.md) ist der stabile VERTRAG — sie definiert das WAS, nicht das WIE.
     Owner: /write-spec (erstellt), /refine (ändert). Während /build ist sie READ-ONLY.
     Technisches Design steht in design.md, QA-Ergebnisse in qa-report.md. -->

## Dependencies
- Keine

## User Stories
- Als Nutzer:in möchte ich eine Aufgabe in wenigen Sekunden erfassen, damit ich sie nicht vergesse.
- Als Nutzer:in möchte ich Aufgaben abhaken und wieder aufheben, damit ich sehe, was erledigt ist und was noch offen ist.
- Als Nutzer:in möchte ich den Titel einer Aufgabe nachträglich ändern, damit ich Tippfehler oder geänderte Pläne korrigieren kann.
- Als Nutzer:in möchte ich Aufgaben löschen und einen Fehlklick rückgängig machen können, damit meine Liste aufgeräumt bleibt, ohne dass ich etwas versehentlich verliere.
- Als Nutzer:in möchte ich, dass meine Aufgaben nach dem Schliessen des Browsers noch da sind, damit ich der Liste vertrauen kann.

## Out of Scope
- Fälligkeitsdatum und Markierung überfälliger Aufgaben (PROJ-2)
- Filter alle / offen / erledigt (PROJ-3)
- Umsortieren per Drag-and-drop, automatische Sortierung
- «Alle erledigten löschen», Papierkorb mit Wiederherstellung über die 6 Sekunden hinaus
- Notizfeld, Kategorien, Tags, Prioritäten, Unteraufgaben
- Zähler wie «3 offene Aufgaben»
- Export, Import und Backup der Daten (siehe Open Questions)
- Synchronisation zwischen Geräten, Konten

## Acceptance Criteria

**Anlegen**
- [ ] **AC-1** — Angenommen die Seite wird geöffnet, wenn sie fertig geladen ist, dann hat das Eingabefeld für neue Aufgaben den Fokus
- [ ] **AC-2** — Angenommen im Eingabefeld steht ein gültiger Titel, wenn der Nutzer `Enter` drückt oder «Hinzufügen» klickt, dann erscheint die Aufgabe als offene Aufgabe **oben** in der Liste, das Feld leert sich und behält den Fokus
- [ ] **AC-3** — Angenommen das Eingabefeld ist leer oder enthält nur Leerzeichen, wenn der Nutzer absendet, dann wird keine Aufgabe angelegt und der Hinweis «Bitte einen Titel eingeben.» erscheint
- [ ] **AC-4** — Angenommen der Nutzer tippt oder fügt Text ein, wenn der Titel länger als 200 Zeichen würde, dann werden nur die ersten 200 Zeichen übernommen
- [ ] **AC-5** — Angenommen ein Titel hat Leerzeichen am Anfang oder Ende, wenn er gespeichert wird, dann werden diese entfernt
- [ ] **AC-6** — Angenommen eine Aufgabe mit dem Titel «Anrufen» existiert, wenn der Nutzer erneut «Anrufen» anlegt, dann entsteht eine zweite, eigene Aufgabe

**Abhaken**
- [ ] **AC-7** — Angenommen eine offene Aufgabe, wenn der Nutzer ihr Kästchen anklickt, dann wird sie erledigt (durchgestrichen, sekundäres Grau) und bleibt an ihrer Position in der Liste
- [ ] **AC-8** — Angenommen eine erledigte Aufgabe, wenn der Nutzer ihr Kästchen anklickt, dann ist sie wieder offen und normal dargestellt, ebenfalls an ihrer Position

**Bearbeiten**
- [ ] **AC-9** — Angenommen eine Aufgabe in der Liste, wenn der Nutzer das Stift-Symbol anklickt, dann wird der Titel direkt in der Liste zu einem Eingabefeld mit dem aktuellen Titel und Fokus
- [ ] **AC-10** — Angenommen der Titel wird bearbeitet, wenn der Nutzer `Enter` drückt oder das Feld verlässt und der Titel gültig ist, dann wird er gespeichert, Position und Erledigt-Status bleiben unverändert
- [ ] **AC-11** — Angenommen der Titel wird bearbeitet, wenn der Nutzer `Esc` drückt, dann wird die Änderung verworfen und der alte Titel bleibt
- [ ] **AC-12** — Angenommen der Titel wird bearbeitet, wenn das Feld leer oder nur Leerzeichen ist und gespeichert werden soll, dann wird nichts übernommen, ein Hinweis erscheint und der bisherige Titel bleibt, bis ein gültiger Titel eingegeben oder mit `Esc` abgebrochen wird
- [ ] **AC-13** — Angenommen eine erledigte Aufgabe, wenn der Nutzer das Stift-Symbol anklickt, dann lässt sich ihr Titel ebenfalls bearbeiten
- [ ] **AC-14** — Angenommen ein Klick auf den Titeltext einer Aufgabe, wenn der Nutzer ihn anklickt, dann passiert nichts (kein Bearbeiten, kein Abhaken)

**Löschen**
- [ ] **AC-15** — Angenommen eine Aufgabe, wenn der Nutzer das Papierkorb-Symbol anklickt, dann verschwindet sie sofort ohne Bestätigungsdialog und ein Hinweis «Aufgabe gelöscht» mit «Rückgängig» erscheint für etwa 6 Sekunden
- [ ] **AC-16** — Angenommen der Hinweis ist sichtbar, wenn der Nutzer «Rückgängig» klickt, dann kehrt die Aufgabe mit Titel und Erledigt-Status an ihre alte Position zurück
- [ ] **AC-17** — Angenommen der Hinweis ist abgelaufen, wenn der Nutzer die Seite betrachtet, dann ist die Aufgabe endgültig gelöscht

**Speichern**
- [ ] **AC-18** — Angenommen es existieren Aufgaben, wenn der Nutzer die Seite neu lädt oder den Browser neu startet, dann sind alle Aufgaben mit Titel, Erledigt-Status und Reihenfolge unverändert da
- [ ] **AC-19** — Angenommen die App ist in zwei Tabs offen, wenn der Nutzer in einem Tab etwas ändert (anlegen, abhaken, bearbeiten, löschen), dann erscheint die Änderung im anderen Tab ohne Neuladen
- [ ] **AC-20** — Angenommen beide Tabs ändern gleichzeitig dieselbe Aufgabe, wenn beide speichern, dann gilt die zuletzt gespeicherte Änderung
- [ ] **AC-21** — Angenommen der Browserspeicher ist nicht verfügbar oder voll (z. B. privater Modus), wenn der Nutzer etwas ändert, dann erscheint ein sichtbarer Hinweis, dass Änderungen nicht gespeichert werden, und die App bleibt in dieser Sitzung bedienbar

**Zustände und Rahmen**
- [ ] **AC-22** — Angenommen es gibt keine Aufgaben, wenn die Seite angezeigt wird, dann steht dort «Noch keine Aufgaben. Schreib die erste.» ohne Illustration
- [ ] **AC-23** — Angenommen die Aufgaben werden aus dem Browser gelesen, wenn die Seite lädt, dann zeigt sie bis dahin dezente Platzhalterflächen
- [ ] **AC-24** — Angenommen die Kopfzeile, wenn die Seite angezeigt wird, dann zeigt sie den App-Titel links und einen Umschalter für Hell- und Dunkelmodus rechts; ohne Wahl folgt die App der Systemeinstellung, eine manuelle Wahl bleibt nach Neuladen erhalten
- [ ] **AC-25** — Angenommen ein Gerät mit Tastatur, wenn der Nutzer anlegt, abhakt, bearbeitet, löscht und das Löschen rückgängig macht, dann geht alles ohne Maus; jedes bedienbare Element hat einen sichtbaren Fokus und einen zugänglichen Namen
- [ ] **AC-26** — Angenommen ein schmaler Bildschirm ab 320 px Breite, wenn die Seite angezeigt wird, dann füllt die Spalte die Breite und alle Aktionen bleiben bedienbar

## Edge Cases
- **EC-1** — Angenommen ein Titel aus 200 Zeichen ohne Leerzeichen, wenn er angezeigt wird, dann bricht er um und die Seite scrollt nicht horizontal
- **EC-2** — Angenommen ein Titel enthält `<script>` oder andere Sonderzeichen, wenn er angezeigt wird, dann erscheint er als reiner Text und wird nie als HTML ausgeführt
- **EC-3** — Angenommen der Nutzer drückt `Enter` zweimal schnell hintereinander, wenn ein gültiger Titel im Feld steht, dann entsteht genau eine Aufgabe
- **EC-4** — Angenommen eine Aufgabe wird in Tab A bearbeitet und in Tab B gelöscht, wenn Tab A speichert, dann wird sie nicht wiederhergestellt und der Nutzer sieht den Hinweis, dass die Aufgabe nicht mehr existiert
- **EC-5** — Angenommen der Hinweis «Aufgabe gelöscht» ist sichtbar, wenn eine zweite Aufgabe gelöscht wird, dann bezieht sich «Rückgängig» nur auf die zuletzt gelöschte und die vorherige ist endgültig weg
- **EC-6** — Angenommen der Hinweis «Aufgabe gelöscht» ist sichtbar, wenn die Seite neu geladen wird, dann bleibt die Aufgabe gelöscht
- **EC-7** — Angenommen die gespeicherten Daten sind unlesbar (z. B. von Hand verändert), wenn die Seite lädt, dann stürzt die App nicht ab, zeigt eine leere Liste und den Hinweis «Gespeicherte Aufgaben konnten nicht gelesen werden.»

## Technical Requirements
- Performance: Anlegen, Abhaken, Bearbeiten und Löschen wirken sofort, auch bei 500 Aufgaben
- Datenhaltung: nur im Browser (localStorage), keine Übertragung an einen Server
- Barrierefreiheit: Textkontrast mindestens 4.5:1 in beiden Themes (siehe `docs/design-system.md`)
- Browser: aktuelle Versionen von Chrome, Firefox, Safari und Edge

## Open Questions
- [ ] Browserdaten können durch «Browserdaten löschen» verloren gehen. Brauchen wir später Export und Import als Sicherung? (nicht in dieser Version)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Aufgaben oben, erledigte bleiben an ihrer Stelle | Ruhig und vorhersehbar, keine Sortierlogik, nichts rutscht weg | 2026-10-30 |
| Titel Pflichtfeld, einzeilig, höchstens 200 Zeichen, Duplikate erlaubt | Verhindert Listen-Chaos, ein Notizfeld ist bewusst nicht Teil der Version | 2026-10-30 |
| Bearbeiten inline per Stift-Symbol, Klick auf Titel tut nichts | Verhindert versehentliches Bearbeiten und Abhaken | 2026-10-30 |
| Löschen ohne Dialog, dafür «Rückgängig» ca. 6 Sekunden | Schneller als ein Dialog bei jedem Löschen und schützt trotzdem vor Fehlklicks | 2026-10-30 |
| Tabs gleichen sich automatisch ab, bei Gleichzeitigkeit gewinnt die letzte Änderung | Verhindert stillen Datenverlust durch veraltete Tabs, Konfliktbehandlung wäre für eine persönliche Liste übertrieben | 2026-10-30 |
| Fokus im Eingabefeld beim Start und nach dem Anlegen | Mehrere Aufgaben lassen sich hintereinander eintippen | 2026-10-30 |
| Keine Obergrenze für die Anzahl der Aufgaben | Fehlerhinweis bei vollem Speicher genügt (AC-21) | 2026-10-30 |
| Theme folgt der Systemeinstellung, manuelle Wahl wird gespeichert | Erwartetes Verhalten, ohne dass der Nutzer erst etwas einstellen muss | 2026-10-30 |
