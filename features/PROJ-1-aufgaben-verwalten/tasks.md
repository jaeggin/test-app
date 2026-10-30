# PROJ-1 Tasks

> Erzeugt von `/tasks` aus `spec.md` + `design.md`. Der geordnete, rückverfolgbare Bauplan — die Brücke zwischen Vertrag (WAS) und Umsetzung (WIE).
> `[P]` = parallelisierbar: Die Dateien der Aufgabe sind disjunkt zu allen anderen `[P]`-Aufgaben derselben Ebene, `/build` kann sie an einen eigenen Teilagenten geben.
> Ebenen laufen **nacheinander** (jede ist eine Schranke). Aufgaben **innerhalb** einer Ebene laufen parallel, wo `[P]` steht. Jede Aufgabe nennt die AC-IDs aus `spec.md`, die sie erfüllt (Kette AC → Task → Test).
> Owner: `/tasks` erstellt diese Datei; `/build` hakt die Kästchen ab.
> Kein Statusfeld hier — die Kästchen sind der Fortschritt, der Feature-Status steht nur in `features/INDEX.md`.
> Pfade liegen unter `src/features/tasks/`, ausser wo ein voller Pfad steht.

## Ebene 1 — Fundament

- [x] T1 [P]  Titel-Regel und Datenformat prüfen, mit Test  · files: src/features/tasks/tasks.schema.ts, src/features/tasks/tasks.schema.test.ts  · → AC-3, AC-4, AC-5, AC-12, EC-7
- [x] T2 [P]  Farben, Rundung, Fokusring und Zusatzfarben aus dem Design-System (Hell und Dunkel)  · files: src/app/globals.css  · → AC-24, AC-25
- [x] T3 [P]  Hell/Dunkel-Umschaltung und Kopfzeile, mit Test  · files: src/components/theme-provider.tsx, src/components/theme-toggle.tsx, src/components/app-header.tsx, src/components/theme-toggle.test.tsx  · → AC-24, AC-26

## Ebene 2 — Kernlogik

- [x] T4 [P]  Listenoperationen (anlegen, abhaken, Titel ändern, löschen, wiederherstellen), mit Test  · files: src/features/tasks/tasks.rules.ts, src/features/tasks/tasks.rules.test.ts  · → AC-2, AC-6, AC-7, AC-8, AC-10, AC-13, AC-15, AC-16, EC-4, EC-5
- [x] T5 [P]  Browser-Speicher: Kopie im Arbeitsspeicher, Tab-Abgleich, Zustände, Sicherung bei unlesbaren Daten, mit Test  · files: src/features/tasks/tasks.storage.ts, src/features/tasks/tasks.storage.test.ts  · → AC-18, AC-19, AC-21, EC-7

## Ebene 3 — Verbindung

- [ ] T6  Hook `use-tasks`: frisch lesen, ändern, schreiben; Rückgängig, Ladezustand, Speicherzustand, mit Test  · files: src/features/tasks/use-tasks.ts, src/features/tasks/use-tasks.test.tsx  · → AC-2, AC-7, AC-8, AC-10, AC-15, AC-16, AC-17, AC-18, AC-19, AC-20, AC-21, EC-4, EC-5, EC-6

## Ebene 4 — Oberflächen-Bausteine

- [ ] T7 [P]  Eingabefeld mit Hinzufügen-Knopf und Hinweis bei leerem Titel, mit Test  · files: src/features/tasks/task-composer.tsx, src/features/tasks/task-composer.test.tsx  · → AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-25, EC-3
- [ ] T8 [P]  Liste und Zeile mit Kästchen, Inline-Bearbeiten, Löschen, mit Tests  · files: src/features/tasks/task-list.tsx, src/features/tasks/task-list.test.tsx, src/features/tasks/task-item.tsx, src/features/tasks/task-item.test.tsx  · → AC-7, AC-8, AC-9, AC-10, AC-11, AC-12, AC-13, AC-14, AC-25, AC-26, EC-1, EC-2
- [ ] T9 [P]  Hinweisleiste (Rückgängig, «Aufgabe existiert nicht mehr») und Speicher-Hinweis, mit Tests  · files: src/features/tasks/task-notice.tsx, src/features/tasks/task-notice.test.tsx, src/features/tasks/storage-alert.tsx, src/features/tasks/storage-alert.test.tsx  · → AC-15, AC-16, AC-17, AC-21, AC-25, EC-4, EC-5, EC-7

## Ebene 5 — Zusammenbau

- [ ] T10  Seite zusammensetzen: `TasksView` mit Lade- und Leerzustand, Layout (Sprache, Schrift Inter, Theme, Kopfzeile), Startseite ersetzt die Willkommensseite, mit Test  · files: src/features/tasks/tasks-view.tsx, src/features/tasks/tasks-view.test.tsx, src/app/layout.tsx, src/app/page.tsx  · → AC-1, AC-22, AC-23, AC-24, EC-7

## Ebene 6 — Feinschliff

- [ ] T11  Gesamtablauf-Test (anlegen, abhaken, bearbeiten, löschen, rückgängig, Neuladen, zwei Tabs) und ein Durchgang bei 320 px Breite und nur mit Tastatur; Funde werden direkt in den vorhandenen Dateien behoben  · files: src/features/tasks/tasks-view.integration.test.tsx  · → AC-18, AC-19, AC-25, AC-26, EC-3, EC-5, EC-6

## Parallelisierung

- **Ebenen sind Schranken.** Eine Ebene startet erst, wenn die vorige integriert und gegen ihre AC-IDs geprüft ist: Regeln und Speicher (E2) vor dem Hook (E3), Hook vor den Oberflächen-Bausteinen (E4), Bausteine vor dem Zusammenbau (E5).
- **`[P]` verlangt disjunkte Dateien.** Zwei `[P]`-Aufgaben derselben Ebene teilen nie einen Pfad.
- **Höchstens drei Teilagenten gleichzeitig** (Ebenen 1 und 4 haben je drei `[P]`-Aufgaben).
- **Keine `[user]`-Aufgaben:** Das Design braucht keine Einstellungen im Dashboard.
- Jede `[P]`-Aufgabe läuft in einem eigenen Teilagenten mit isoliertem Git-Worktree; danach integriert der Hauptagent, prüft gegen die AC-IDs der Ebene und hakt die Kästchen hier ab.
