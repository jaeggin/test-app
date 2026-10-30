# PROJ-1 — Tech Design: Aufgaben verwalten

> Das technische Design (das WIE) für das Feature. Zwei Leser: die PM (muss freigeben) und `/build` (setzt es um). Kein Code, aber so genau, dass `/build` nichts raten muss.
> Owner: `/architecture`. Der Vertrag (das WAS) steht in `spec.md`, die Aufgabenliste in `tasks.md`.
> Kein Status- oder Datumsfeld hier: der Status steht nur in `features/INDEX.md`.

## Ausgangslage

- Reines Frontend-Feature. Kein Backend, keine Konten, keine API-Routen, keine Server Actions (`.ai-eng-kit` → `stack.backend: localstorage`).
- Die App besteht heute nur aus dem Template-Grundstock: `src/app/page.tsx` ist die Next.js-Willkommensseite, `src/app/layout.tsx` hat `lang="en"`, und `src/app/globals.css` enthält noch die Standardfarben von shadcn. PROJ-1 ist das erste Feature und ersetzt das alles.
- Bereits installiert und hier wiederverwendet: `Button`, `Input`, `Checkbox`, `Skeleton`, `Alert` (`src/components/ui/`), `lucide-react` (Icons), `next-themes` (Hell/Dunkel), `zod` (Validierung). Es kommt **kein neues Paket** dazu.
- Codebase-Map (`docs/codebase/`) gibt es nicht, der Modus ist `new`.

## Component Structure

```
Layout (src/app/layout.tsx)                       ← Schrift, lang="de", Theme-Provider
+-- AppHeader                                     ← Rahmen, gehört PROJ-1
|   +-- App-Titel (links)
|   +-- ThemeToggle (rechts)
+-- Seite "/" (src/app/page.tsx)
    +-- TasksView                                 ← Hauptbaustein des Features
        +-- StorageAlert                          ← nur bei Speicherproblem / unlesbaren Daten
        +-- TaskComposer                          ← Eingabefeld + Button "Hinzufügen" + Hinweis bei leerem Titel
        +-- Zustand der Liste (genau einer):
        |     +-- Ladezustand: Platzhalterflächen (Skeleton)
        |     +-- Leerer Zustand: "Noch keine Aufgaben. Schreib die erste."
        |     +-- TaskList
        |           +-- TaskItem (pro Aufgabe)
        |                 +-- Kästchen (abhaken)
        |                 +-- Titel (Text) ODER Eingabefeld (beim Bearbeiten)
        |                 +-- Stift-Symbol, Papierkorb-Symbol
        +-- TaskNotice                            ← eine Hinweisleiste unten mittig (Rückgängig / Aufgabe nicht mehr da)
```

Hinweisleiste und Rückgängig-Knopf stehen im Seitenaufbau direkt hinter der Liste, damit man sie mit der Tab-Taste nach dem Löschen erreicht (AC-25).

## Code Structure

Das Feature liegt komplett unter `src/features/tasks/` (stabiler Produktname «tasks», Vorgabe aus `docs/stacks/framework-nextjs.md`). Der Ordner `features/PROJ-1-*/` enthält nur die Spezifikation, keinen Code.

| Modul / Pfad | Aufgabe und Schnittstelle | Erlaubte Abhängigkeiten / wiederverwendet |
| --- | --- | --- |
| `src/features/tasks/tasks.schema.ts` | Reine Regeln für die Form der Daten: gültiger Titel (Leerzeichen am Rand entfernen, 1 bis 200 Zeichen), Form einer Aufgabe, Form des gespeicherten Dokuments. Liefert auch die Typen. | Nur Zod. Kein Browser, kein IO. |
| `src/features/tasks/tasks.rules.ts` | Reine Listenoperationen: anlegen (neue oben), abhaken/aufheben, Titel ändern, löschen (merkt sich die alte Position), wiederherstellen (an alter Position). ID und Zeit kommen als Eingabe hinein. Meldet «Aufgabe nicht gefunden», statt zu raten. | Nur `tasks.schema.ts` und Typen. |
| `src/features/tasks/tasks.storage.ts` | Der Speicher: liest und schreibt das eine Dokument im Browser, hält eine Kopie im Arbeitsspeicher, meldet Änderungen aus anderen Tabs und kennt drei Zustände: in Ordnung, nicht verfügbar/voll, unlesbar. | Nur Browser-APIs (`localStorage`, `storage`-Ereignis), `tasks.schema.ts`. |
| `src/features/tasks/use-tasks.ts` | Hook für die Oberfläche: liefert Aufgaben, Ladezustand, Speicherzustand und die Aktionen (anlegen, abhaken, ändern, löschen, rückgängig). Erzeugt IDs und Zeit, wendet jede Aktion auf den **frisch gelesenen** Speicherstand an. | `tasks.rules.ts`, `tasks.storage.ts`. |
| `src/features/tasks/tasks-view.tsx` | Client-Komponente, setzt die Seite des Features zusammen und hält den Zustand der Hinweisleiste. | Alle Komponenten unten, `use-tasks.ts`. |
| `src/features/tasks/task-composer.tsx` | Eingabefeld und Hinzufügen-Knopf. | `Input`, `Button`, `tasks.schema.ts`. |
| `src/features/tasks/task-list.tsx`, `task-item.tsx` | Liste und einzelne Zeile mit Kästchen, Titel/Bearbeitungsfeld, Stift und Papierkorb. | `Checkbox`, `Button`, `Input`, `lucide-react`, `tasks.schema.ts`. |
| `src/features/tasks/task-notice.tsx` | Die eine Hinweisleiste unten mittig, schliesst sich nach 6 Sekunden. | `Button`. |
| `src/features/tasks/storage-alert.tsx` | Dauerhafter Hinweis bei Speicherproblem oder unlesbaren Daten. | `Alert`. |
| `src/components/app-header.tsx` | Kopfzeile des Rahmens: Titel links, Umschalter rechts. | `ThemeToggle`. Importiert nichts aus `src/features/`. |
| `src/components/theme-provider.tsx`, `theme-toggle.tsx` | Hell/Dunkel: Provider um die App, Knopf zum Umschalten. | `next-themes`, `Button`, `lucide-react`. |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` | Anbindung: Schrift, `lang="de"`, Titel, Theme-Provider, `AppHeader`; die Seite zeigt nur `TasksView`; Farben und Rundung aus dem Design-System. | Importieren die Schnittstellen des Features, nie umgekehrt. |

Tests liegen jeweils neben dem Modul (`tasks.rules.test.ts`, `tasks.schema.test.ts`, `tasks.storage.test.ts`, `use-tasks.test.tsx`, Komponententests). Browser-Tests mit Playwright folgen bei Bedarf über `/e2e-tests`.

Nicht angelegt, weil nicht nötig: `*.data.ts`, `*.actions.ts`, `*.integration.ts`, Server-Module, Wrapper-Schichten.

## Footprint

- Code und Tests: `src/features/tasks/*` (Module und Tests oben), `src/components/app-header.tsx`, `theme-provider.tsx`, `theme-toggle.tsx`; geändert: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`. Die Template-Willkommensseite entfällt.
- Migrationen, Tabellen und Zugriffsregeln: keine.
- Umgebungsvariablen (nur Namen): keine.
- Pakete: keine neuen. Genutzt werden `zod`, `next-themes`, `lucide-react`, `class-variance-authority` (über shadcn).
- Anbindungspunkte (Route, Rahmen, externe Dienste): Route `/` (`src/app/page.tsx`), Rahmen `src/app/layout.tsx`; Browser-Speicher `localStorage` mit den Schlüsseln `tasks:v1` (Aufgaben), `tasks:v1:backup` (Sicherung bei unlesbaren Daten) und `theme` (Hell/Dunkel, von `next-themes`). Keine externen Dienste, keine Netzwerkaufrufe.

## Data Model

Gespeichert wird **ein einziges Dokument** unter dem Schlüssel `tasks:v1` im `localStorage` des Browsers:

```
Dokument:
- version (ganze Zahl, aktuell 1)
- tasks (Liste von Aufgaben, die Reihenfolge der Liste IST die Anzeigereihenfolge, neueste oben)

Jede Aufgabe hat:
- id          (Text, eindeutig, vom Programm erzeugt, nie vom Nutzer sichtbar oder änderbar)
- title       (Text, Pflicht, nach dem Entfernen der Leerzeichen am Rand 1 bis 200 Zeichen, einzeilig)
- done        (ja/nein, Standard: nein)

Besitz und Zugriff: gehört der Person, die diesen Browser benutzt; keine Konten, keine Rollen,
nichts verlässt den Browser.
Aufbewahrung: bis die Person die Aufgabe löscht oder die Browserdaten löscht. Kein automatisches Ablaufen.
```

Bewusst weggelassen (Datensparsamkeit, nichts davon braucht ein Kriterium der Spec): Erstellungszeit, Änderungszeit, Sortierfeld, Notizen. Wenn PROJ-2 ein Fälligkeitsdatum braucht, kommt dort ein optionales Feld dazu, die `version` bleibt kompatibel.

**Verhalten bei fehlerhaften Daten (EC-7).** Das Dokument gilt als unlesbar, wenn es kein gültiger Text im erwarteten Format ist oder eine Aufgabe die Regeln oben verletzt. Dann: leere Liste zeigen, dauerhaften Hinweis «Gespeicherte Aufgaben konnten nicht gelesen werden.» anzeigen, den unlesbaren Inhalt zuerst unverändert unter `tasks:v1:backup` ablegen und erst dann beim nächsten Speichern das Dokument überschreiben. So geht nichts unwiederbringlich verloren, wenn die Daten nur von Hand verändert wurden.

**Aufbau der Titel-Regel (AC-3, AC-4, AC-5, AC-12).** Eine einzige Regel gilt für Anlegen und Bearbeiten: Leerzeichen am Anfang und Ende entfernen, danach mindestens 1 und höchstens 200 Zeichen. Zusätzlich begrenzt das Eingabefeld selbst die Länge auf 200, sodass eingefügter Text gleich gekürzt wird. Eine Zeilenumbruch-Taste gibt es in einem einzeiligen Feld nicht; eingefügte Zeilenumbrüche werden zu Leerzeichen.

## Verhalten und Zugriff (Frontend-Variante)

Kein Server, daher keine Zugriffsregeln, nur Regeln dafür, wie Aktionen den Speicher ändern. Die Operationen im Einzelnen:

```
Jede Aktion (anlegen, abhaken, Titel ändern, löschen, rückgängig):
1. liest den aktuellen Stand frisch aus dem Browser-Speicher (nicht aus dem Bildschirm)
2. wendet genau diese eine Änderung darauf an
3. schreibt das Ergebnis zurück und aktualisiert die Anzeige
Gibt es die Zielaufgabe nicht mehr (in einem anderen Tab gelöscht), passiert nichts am Bestand
und die Person bekommt den Hinweis «Diese Aufgabe existiert nicht mehr.» (EC-4).

- Anlegen:       Titel prüfen, neue Aufgabe (done: nein) ganz oben einfügen
- Abhaken:       done umdrehen, Position bleibt
- Titel ändern:  Titel prüfen und ersetzen, Position und done bleiben
- Löschen:       sofort aus dem gespeicherten Dokument entfernen; Aufgabe und alte Position
                 nur im Arbeitsspeicher für «Rückgängig» merken
- Rückgängig:    Aufgabe an der gemerkten Position wieder einsetzen
                 (ist die Liste inzwischen kürzer, ans Ende)
```

**Gleichzeitigkeit (AC-19, AC-20).**
- Ändert ein Tab etwas, löst der Browser in allen anderen Tabs das Ereignis `storage` aus; sie lesen das Dokument neu und zeigen es an, ohne Neuladen.
- Weil jede Aktion zuerst den frischen Stand liest, gehen Änderungen verschiedener Aufgaben aus zwei Tabs nicht verloren. Ändern beide dieselbe Aufgabe, gewinnt, wer zuletzt speichert, so wie die Spec es verlangt.

**Löschen und Rückgängig (AC-15 bis AC-17, EC-5, EC-6).**
- Das Löschen wird sofort gespeichert, «Rückgängig» ist nur ein erneutes Einsetzen. Darum bleibt eine gelöschte Aufgabe nach einem Neuladen gelöscht (EC-6).
- Es gibt immer nur eine Hinweisleiste. Wird eine zweite Aufgabe gelöscht, ersetzt deren Hinweis den ersten, und die erste Aufgabe ist endgültig weg (EC-5).
- Nach Ablauf von 6 Sekunden verschwindet die Leiste und der Arbeitsspeicher wird geleert (AC-17).

**Doppeltes Absenden (EC-3).** Das Eingabefeld wird beim Absenden sofort und ohne Wartezeit geleert. Ein zweites `Enter` im selben Moment findet ein leeres Feld und legt nichts an.

**Speicher nicht verfügbar oder voll (AC-21).** Der Speicher prüft beim Start und bei jedem Schreiben, ob er benutzbar ist. Schlägt es fehl, zeigt `StorageAlert` dauerhaft «Änderungen werden nicht gespeichert.» und die App arbeitet mit der Kopie im Arbeitsspeicher weiter, solange der Tab offen bleibt.

**Anzeige von Titeln (EC-1, EC-2).** Titel werden immer als reiner Text ausgegeben, nie als HTML. Lange Wörter brechen im Zeilenumbruch um; die Spalte scrollt nie horizontal.

## Aufbau der Oberfläche (Details für `/build`)

- **Ladezustand (AC-23).** Der Server rendert nur den Rahmen und die Platzhalter. Erst im Browser wird der Speicher gelesen; bis dahin bleiben die Platzhalter sichtbar. Es gibt nie einen kurzen Blitz des leeren Zustands.
- **Fokus (AC-1, AC-2).** Das Eingabefeld hat nach dem Laden und nach jedem Anlegen den Fokus.
- **Bearbeiten (AC-9 bis AC-14).** Der Bearbeitungszustand ist reiner Bildschirmzustand einer Zeile. `Enter` und Verlassen des Feldes speichern, `Esc` verwirft. Ist der Titel leer, bleibt das Feld offen, die Zeile zeigt einen kurzen Hinweis, der alte Titel bleibt gespeichert. Der Titeltext selbst ist nicht klickbar.
- **Tastatur (AC-25).** Kästchen, Stift, Papierkorb, «Hinzufügen» und «Rückgängig» sind echte Knöpfe mit sichtbarem Fokus und Namen (z. B. «Aufgabe „Anrufen“ bearbeiten»). Nach dem Löschen springt der Fokus auf die nächste Zeile oder das Eingabefeld, nicht ins Leere.
- **Hinweise (AC-3, AC-12, Hinweisleiste).** Statusmeldungen erscheinen in einem Bereich mit `aria-live`, damit Screenreader sie vorlesen.
- **Hell/Dunkel (AC-24).** `next-themes` mit Klassen-Umschaltung, Standard ist die Systemeinstellung, die Wahl bleibt unter dem Schlüssel `theme` erhalten. Beim ersten Laden wird die Klasse vor dem Zeichnen gesetzt, damit es nicht blitzt.
- **Schmale Bildschirme (AC-26).** Eine zentrierte Spalte, höchstens 640 px breit, mit seitlichem Rand; Zeilen umbrechen statt zu scrollen. Knöpfe in Zeilen mindestens 40 × 40 px Trefferfläche.
- **Gestaltung.** Gemäss `docs/design-system.md`. Da PROJ-1 das erste Feature ist, ersetzt es die Standardfarben in `src/app/globals.css` durch die dort definierten Werte (Hell und Dunkel), setzt die Rundung auf 8 px, den Fokusring (hell schwarz, dunkel orange), lädt die Schrift Inter und ergänzt die dort definierten Zusatzfarben (Orange-Zustände, Blau, Grau für Icons). Orange und Blau dienen nie als Textfarbe.

## Abdeckung der Acceptance Criteria

| AC / EC | Wo gelöst |
| --- | --- |
| AC-1 bis AC-6 | `task-composer.tsx`, Titel-Regel in `tasks.schema.ts`, Anlegen in `tasks.rules.ts` |
| AC-7, AC-8 | Abhaken in `tasks.rules.ts`, `task-item.tsx` |
| AC-9 bis AC-14 | `task-item.tsx`, Titel-Regel, Titeländerung in `tasks.rules.ts` |
| AC-15 bis AC-17, EC-5, EC-6 | Löschen/Wiederherstellen in `tasks.rules.ts`, `use-tasks.ts`, `task-notice.tsx` |
| AC-18 bis AC-20, EC-4 | `tasks.storage.ts` (Speicher + `storage`-Ereignis), «frisch lesen, dann ändern» in `use-tasks.ts` |
| AC-21, EC-7 | `tasks.storage.ts` (Zustände), `storage-alert.tsx`, Sicherungsschlüssel `tasks:v1:backup` |
| AC-22, AC-23 | `tasks-view.tsx` (Leer- und Ladezustand) |
| AC-24 | `app-header.tsx`, `theme-provider.tsx`, `theme-toggle.tsx` |
| AC-25, AC-26 | alle Oberflächen-Komponenten, Gestaltung aus dem Design-System |
| EC-1, EC-2 | `task-item.tsx` (Textausgabe, Umbruch) |
| EC-3 | `task-composer.tsx` (sofortiges Leeren) |

## Dependencies

Keine neuen Pakete. Bereits installiert und hier genutzt:

- `zod` — prüft Titel und das gespeicherte Dokument
- `next-themes` — Hell/Dunkel-Umschaltung mit Systemstandard
- `lucide-react` — Symbole (Stift, Papierkorb, Sonne, Mond)

## Settings the user makes

none

## Technical Decisions

| Decision | Rationale | Alternative considered | Trade-off | Date |
| --- | --- | --- | --- | --- |
| Ein Dokument `tasks:v1` mit versionierter Liste statt eines Schlüssels pro Aufgabe | Reihenfolge, Inhalt und Version werden in einem Schritt gespeichert; kein halb geschriebener Zustand; Migrationen später einfach | Ein Schlüssel pro Aufgabe; IndexedDB | Die ganze Liste wird bei jeder Änderung neu geschrieben (bei einigen Tausend Aufgaben immer noch unmerklich) | 2026-10-30 |
| Reihenfolge ist die Reihenfolge der Liste, kein Sortierfeld und keine Zeitstempel | Datensparsamkeit; die Spec verlangt nur «neue oben, nichts rutscht» | `createdAt` und Sortierung beim Anzeigen | Wer später nach Datum sortieren will, braucht ein neues Feld (PROJ-2 bringt das Fälligkeitsdatum ohnehin mit) | 2026-10-30 |
| Jede Aktion liest zuerst den frischen Stand, ändert dann genau eine Sache, schreibt zurück | Löst AC-19, AC-20 und EC-4 ohne Zusatzpaket: verschiedene Aufgaben aus zwei Tabs überschreiben sich nicht, dieselbe Aufgabe: letzter gewinnt | Ganze Liste aus dem Bildschirmzustand schreiben; Web Locks / BroadcastChannel | Zwischen Lesen und Schreiben ist theoretisch eine winzige Lücke; da beides im selben Augenblick passiert, ist das für eine persönliche Liste vernachlässigbar | 2026-10-30 |
| Abgleich zwischen Tabs über das `storage`-Ereignis des Browsers | Eingebaut, in allen Zielbrowsern vorhanden, kein Paket nötig | `BroadcastChannel`; Neuladen per Zeitschaltung | Das Ereignis kommt nur in **anderen** Tabs an, der eigene Tab aktualisiert sich selbst | 2026-10-30 |
| Löschen sofort speichern, «Rückgängig» setzt wieder ein | Macht EC-6 (Neuladen) automatisch richtig; keine «halb gelöschten» Aufgaben im Speicher | Löschen erst nach Ablauf der 6 Sekunden speichern | Wer in den 6 Sekunden den Tab schliesst, kann nichts mehr rückgängig machen (so ist es auch gewollt) | 2026-10-30 |
| Eigene Hinweisleiste statt Toast-Paket (Sonner/Radix-Toast) | AC-25 verlangt Rückgängig per Tastatur; ein Toast-Paket legt seine Meldungen ans Ende der Seite und ist nur über Tastenkürzel erreichbar. Die eigene Leiste steht direkt hinter der Liste im Tab-Ablauf; es gibt immer nur eine (EC-5) | `sonner` (bereits installiert) | Eine kleine Komponente mehr; Sonner bleibt installiert, wird aber nicht genutzt | 2026-10-30 |
| Unlesbare Daten zuerst als Sicherung ablegen, erst dann überschreiben | EC-7 verlangt, dass nichts abstürzt; so geht zusätzlich nichts verloren, wenn nur ein Zeichen kaputt war | Sofort überschreiben; Daten stehen lassen und nie schreiben | Ein zweiter Schlüssel im Browserspeicher, der bei jedem erneuten Fehler überschrieben wird | 2026-10-30 |
| Speicher-Probleme: Kopie im Arbeitsspeicher als Wahrheit, Browserspeicher als Spiegel | So bleibt die App im privaten Modus oder bei vollem Speicher bedienbar (AC-21) | Beim Fehler alles sperren | Änderungen gehen beim Schliessen des Tabs verloren (der Hinweis sagt das) | 2026-10-30 |
| Lesen des Speichers erst im Browser; Server rendert Platzhalter | Der Server kennt `localStorage` nicht; so gibt es nie ein Aufblitzen des leeren Zustands (AC-23) und keine Abweichung zwischen Server und Browser | Mit leerer Liste rendern und nachladen | Beim ersten Bild sieht man kurz Platzhalter statt der Liste | 2026-10-30 |
| Eine gemeinsame Titel-Regel für Anlegen und Bearbeiten, zusätzlich Längenbegrenzung im Eingabefeld | Verhindert abweichendes Verhalten an zwei Stellen; eingefügter langer Text wird gleich gekürzt (AC-4) | Zwei getrennte Prüfungen | Keine nennenswerten | 2026-10-30 |
| Reine Module für Regeln und Prüfungen (`*.rules.ts`, `*.schema.ts`), ID und Zeit kommen von aussen | Leicht und schnell zu testen; die Strukturprüfung (`npm run check:structure`) erzwingt es | Alles im Hook | Etwas mehr Dateien | 2026-10-30 |
| IDs über `crypto.randomUUID`, mit zufälligem Text als Rückfall | Eindeutigkeit ohne Zähler im Speicher; der Rückfall deckt Browser ohne gesicherten Kontext ab | Laufende Nummer im Dokument | Eine Zeichenkette statt einer Zahl; nur intern sichtbar | 2026-10-30 |
| `next-themes` für Hell/Dunkel | Schon installiert; setzt die Klasse vor dem Zeichnen, löst Systemstandard und Speicherung (AC-24) | Eigener Umschalter mit eigener Speicherung | Ein kleines Skript im Seitenkopf gegen das Aufblitzen | 2026-10-30 |
| Schrift Inter über `next/font` | Wird beim Bau mit eingebunden, kein Aufruf an Google zur Laufzeit (datenschutzfreundlich), passt zu `docs/design-system.md` | Systemschrift | Eine Schriftdatei mehr (wenige KB) | 2026-10-30 |
| Design-System-Werte setzt PROJ-1 in `globals.css` | Erstes Feature, das UI baut; ohne das hätte es das Standard-shadcn-Aussehen | Eigenes «Theme»-Feature | PROJ-2 und PROJ-3 erben die Werte und ändern sie nicht | 2026-10-30 |
| Kein Server-Code für dieses Feature (keine Server Actions, API-Routen, `server-only`-Module) | Alles läuft im Browser; der Server liefert nur das Seitengerüst | Server-Speicher | Kein Teilen zwischen Geräten (bewusst Nicht-Ziel) | 2026-10-30 |

## Open Questions

none

## Umsetzungshinweise (von `/build`, Abweichungen und Ergänzungen zum Design)

- **Farbnamen in `globals.css`:** Das `accent` von shadcn ist eine neutrale Hover-Fläche (Ghost-Knöpfe, Menüs) und trägt deshalb die Farbe «Fläche» (`#F5F5F5` bzw. `#1C1C1C`). Das Jäggin Blau aus dem Design-System heisst im Code `highlight`. Zusätzlich gibt es `primary-hover`, `primary-active`, `primary-subtle` und `muted-icon`. Der Farbton von Orange steht auf 29,2° statt 29°, damit der Browser genau `#FF7C00` rechnet.
- **Speicherzustand:** `TasksState` hat zwei getrennte Felder statt eines Dreier-Zustands: `storage` (`ok` oder `unavailable`) und `unreadable` (Ja/Nein, gilt nach dem ersten Fund bis zum Neuladen). So bleibt der Hinweis «Gespeicherte Aufgaben konnten nicht gelesen werden.» sichtbar, auch nachdem die erste neue Aufgabe gespeichert wurde.
- **`TaskComposer`** bekommt das Eingabefeld als `inputRef` vom Elternteil, damit `TasksView` den Fokus nach dem Löschen der letzten Aufgabe zurückgeben kann. Das Feld nutzt eine eigene, eindeutige ID (`useId`).
- **`TasksView`** hat eine optionale Eigenschaft `store`, über die Tests einen frischen Speicher einsetzen. Im Betrieb wird nichts übergeben.
- **Fokus:** Nach dem Löschen springt der Fokus auf die nächste Zeile (sonst die vorige, sonst das Eingabefeld); nach «Rückgängig» auf das Kästchen der zurückgekehrten Aufgabe; nach `Enter`/`Esc` beim Bearbeiten auf das Stift-Symbol.
- **Kästchen:** Randfarbe `muted-foreground` statt Orange, weil Orange auf Weiss nur etwa 2,6:1 hat und ein Bedienelement mindestens 3:1 braucht. Die Trefferfläche ist über einen unsichtbaren Rahmen auf etwa 40 × 40 px erweitert.

### Nachträge nach `/qa` (Bugfixes BUG-1 bis BUG-5)

- **Rückgängig per Tastatur (BUG-2):** Zusätzlich zum Knopf löst `Strg+Z` / `⌘Z` «Rückgängig» aus, solange die Hinweisleiste eine Aktion trägt und der Fokus in keinem Textfeld steht (dort bleibt das normale Rückgängig des Browsers). Die 6 Sekunden laufen nicht ab, solange die Leiste den Fokus oder den Mauszeiger hat; danach beginnen sie von neuem.
- **Bearbeitungsfeld und anderer Tab (BUG-1):** `TasksView` merkt sich, welche Aufgabe gerade bearbeitet wird (`TaskItem` meldet das über `onEditingChange`). Verschwindet genau diese Aufgabe durch einen Abgleich mit einem anderen Tab, erscheint «Diese Aufgabe existiert nicht mehr.». Löscht die Person die Aufgabe selbst oder schliesst das Bearbeiten ab, bleibt es still.
- **Formular ohne JavaScript (BUG-3):** Das Aufgabenformular trägt `method="post"`. Wird es vor dem Laden der Skripte abgeschickt, steht der Titel nicht mehr in der URL.
- **Security-Header (BUG-4):** `next.config.ts` setzt `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` und `Strict-Transport-Security` auf jeder Route und schaltet `X-Powered-By` ab. Vorlage: `docs/stacks/framework-nextjs.md`. Am Live-URL ist es bei `/deploy` noch einmal zu prüfen, ein Host kann Header ändern.
- **Test für das doppelte Beenden (BUG-5):** Die Tests lösen `Enter` oder `Esc` und das `blur` in einem gemeinsamen `act()` aus, damit das Feld noch eingehängt ist, wenn das `blur` eintrifft. Ohne den Schutz in `task-item.tsx` schlagen sie jetzt an.
