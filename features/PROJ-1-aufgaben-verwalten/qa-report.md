# QA-Testergebnisse — PROJ-1 Aufgaben verwalten

**Getestet:** 2026-10-30
**App-URL:** http://localhost:3000 (`probe.kind: http`), ausgeliefert als Produktions-Build (`next start`) vom Stand `450d761`. Der Dev-Server liess sich nicht starten, weil noch ein eigener Server von vorher auf Port 3000 lief; der Code war derselbe. Der Server ist danach beendet worden.
**Tester:** QA Engineer (AI) — drei unabhängige `qa-engineer`-Prüfer (Abnahme, Sicherheit, Regression), die den Build nicht kennen, plus dieser Eigentümer-Lauf (Suites, Bericht, Unit-Tests)
**Scope:** `re-verification` — Erstlauf am selben Tag (Commit `b922e08`), danach Bugfix-Commit `43722f4`. `git diff --stat b922e08..HEAD` — geänderte Produktionsdateien: `next.config.ts`, `src/features/tasks/task-composer.tsx`, `task-item.tsx`, `task-list.tsx`, `task-notice.tsx`, `tasks-view.tsx` (dazu Tests und `design.md`). Mehr als drei Dateien, deshalb wieder drei unabhängige Prüfer (Abnahme, Sicherheit, Regression), zugeschnitten auf den Diff und die offenen Bugs BUG-1 bis BUG-5.
**Zweiter Lauf, App-URL:** http://localhost:3000, Dev-Server (`npm run dev`) vom Stand `43722f4`, einmal gestartet und danach beendet. Suites einmal vorher: `npm test` → `/tmp/qa-suite2.log`, 14 Dateien, 162 Tests, 0 fehlgeschlagen.

> Legende: `[x]` in diesem Lauf verifiziert (mit Beleg) · `[ ] BUG` als fehlerhaft belegt · `[!] NOT VERIFIED` in diesem Lauf nicht prüfbar (mit Grund)
>
> **Wichtig zum Umfang:** Dieser Lauf hat **keinen Browser**. Fokus, Darstellung, zwei echte Tabs, echter Browserspeicher und Layout bei 320 px sind deshalb nur über Code, Server-HTML und jsdom-Tests belegt und unten als `[!] NOT VERIFIED` aufgeführt.

**Belege, die in diesem Lauf entstanden sind:**
- Suites einmal vor den Prüfern: `npm test` → `/tmp/qa-suite.log`, 12 Dateien, 143 Tests, 0 fehlgeschlagen.
- Eigentümer-Lauf: `npm run lint` ohne Befund, `npm run typecheck` ohne Fehler, `npm run build` erfolgreich (Route `/` statisch).
- Gegenproben der Prüfer (temporäre Einzeltests, danach gelöscht, `git status` sauber): Abnahme `/tmp/qa-acc-probe/out.txt`, Sicherheit `/tmp/qa-sec-probe.out`.

### Re-Verifikation (zweiter Lauf, Diff `b922e08..43722f4`)

> Was nicht im Diff liegt, gilt unverändert aus dem ersten Lauf und ist **nicht neu abgehakt**. Der Speicher- und Abgleichpfad (`tasks.storage.ts`, `use-tasks.ts`, `tasks.rules.ts`, `tasks.schema.ts`, `storage-alert.tsx`) ist vom Diff nicht berührt (`git diff --stat b922e08..HEAD` für diese Dateien leer).

**Die fünf offenen Bugs — alle geschlossen:**
- [x] BUG-1 geschlossen — Abgleichpfad meldet jetzt «Diese Aufgabe existiert nicht mehr.» (`tasks-view.tsx:36-39`); Sweep `grep -n "showNotice(GONE_MESSAGE)" src/features/tasks/*.tsx` → 4 Treffer (vorher 3, neu ist der Abgleichpfad); Gegenproben ohne Fehlalarm: Umbenennen in anderem Tab, Löschen einer anderen Aufgabe, `Esc`, Verlassen des Feldes, eigenes Löschen, Ladezustand; Mutation `showNotice` im Abgleich entfernt → 1 Test rot, `editingId` beim eigenen Löschen nicht zurückgesetzt → 1 rot, beim normalen Beenden → 1 rot
- [x] BUG-2 geschlossen — `Strg+Z` / `⌘Z` löst «Rückgängig» ausserhalb von Textfeldern aus, die 6 Sekunden pausieren bei Fokus oder Mauszeiger (`task-notice.tsx:37-61,82-85`); Mutationen Textfeld-Prüfung, `shiftKey`, `onDismiss()`, Pause entfernt → je mindestens 1 Test rot; Sweep `setTimeout` → 1 Treffer, jetzt pausierbar
- [x] BUG-3 geschlossen (Titel nicht mehr in der URL) — `curl -s http://localhost:3000/ | grep -o '<form[^>]*>'` → `<form noValidate="" method="post">`; Sweep `<form` ohne `method=`/`action=` → 0 Treffer; POST-Body erscheint weder in der Antwort noch im Server-Log; `curl -g '/?title=…</script><img…'` wird nur prozentkodiert zurückgegeben. Der Rest steht als BUG-13.
- [x] BUG-4 geschlossen (Dev-Server) — `curl -s -D -` auf `/`, `HEAD /`, `POST /`, `/does-not-exist` (404), `/favicon.ico` (404), RSC-Request und vier Assets unter `/_next/static/chunks/`: überall `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, kein `X-Powered-By`; `next.config.ts` ohne `output: 'export'` und ohne `basePath`, die Header gelten also auch im Produktions-Build. Mutation HSTS entfernt und `poweredByHeader: true` → `next.config.test.ts` 2 von 2 rot. Live-URL: siehe Not Verified.
- [x] BUG-5 geschlossen — Mutation `if (finishedRef.current) return` in `task-item.tsx:54` entfernt → `npx vitest run src/features/tasks/task-item.test.tsx` 2 von 17 rot (AC-10 und AC-11), danach exakt wiederhergestellt (`git diff` leer). Der Text-Sweep aus dem ersten Lauf zählt weiterhin 2 Treffer, ist aber überholt: die Ereignisse laufen jetzt im selben `act()`; massgeblich ist die Mutationsprobe.

**Neu geprüfte AC/EC (im Diff berührt):**
- [x] AC-2 — Anlegen unverändert, `preventDefault` in `task-composer.tsx:26`; Gegenprobe `["Zwei","Eins"]`, Feld leer
- [x] AC-3 — Leerzeichen-Titel erzeugt keine Aufgabe, Hinweis erscheint (Gegenprobe, `task-composer.tsx:38-42`)
- [x] AC-10, AC-11 — Gegenprobe: `Enter` speichert «B2» an Position 2, `Esc` verwirft; Mutationsbeleg siehe BUG-5
- [x] AC-12 — Fehlerhinweis sichtbar, Feld bleibt offen (`task-item.tsx:55-65`)
- [x] AC-15, AC-17 — Suite-Tests `tasks-view.test.tsx`, `task-notice.test.tsx`; Frist pausiert bei Fokus/Hover und startet danach neu; `Strg+Z` nach Ablauf bewirkt nichts (Gegenprobe)
- [x] AC-16 — Knopf und `Strg+Z` bringen Titel und Status zurück, Fokus kehrt zurück (Suite-Test «undo by keyboard»); BUG-6 besteht unverändert
- [x] AC-25 — Rückgängig per Tastatur erreichbar; zwei Löschungen, dann `Strg+Z` → nur die zuletzt gelöschte kommt zurück (EC-5); Hover einer alten Leiste hält die nächste nicht fest. Restbefunde BUG-14 bis BUG-16 (alle Low)
- [x] EC-3 — genau eine Aufgabe (Gegenprobe `["Einmal"]`); BUG-8 besteht unverändert
- [x] EC-4 — Hinweis erscheint, Aufgabe wird nicht wiederhergestellt, `localStorage` bleibt `[]`
- [x] EC-5 — nur eine Leiste, die neuere ersetzt die ältere
- [!] AC-19, AC-20, EC-4 mit zwei echten Tabs, AC-25 echte Tab-Reihenfolge — NOT VERIFIED, kein Browser (siehe unten)

**Weitere Prüfungen im zweiten Lauf:**
- [x] Keine abgeschwächte Prüfung: `git diff b922e08..HEAD -- vitest.config.mts eslint.config.mjs package.json package-lock.json scripts .dependency-cruiser.cjs tsconfig.json components.json` leer; keine neuen `skip`/`only`/`todo`, `eslint-disable`, `@ts-ignore`, `as any`; Tests/Assertions je Datei nicht weniger (`task-item.test.tsx` 17 → 17 Tests, 36 → 36 Assertions; `task-notice.test.tsx` 7 → 14; `tasks-view.test.tsx` 17 → 22; `task-composer.test.tsx` 9 → 10)
- [x] Mutationsproben der neuen Tests (Einzeldateien, jeweils exakt wiederhergestellt, Prüfsummen unverändert): 9 von 11 Mutationen schlagen an; die zwei überlebenden sind BUG-17
- [x] Neue Angriffsfläche geprüft: der globale `keydown`-Listener (`task-notice.tsx:47-61`) liest nichts und sendet nichts, löst nur `result.undo()` aus; `Strg+Z` aus `textarea`, `select`, `input` löst 0-mal aus; kein `message`/`postMessage`/`BroadcastChannel`; Einbettung durch Dritte verhindert `X-Frame-Options: DENY`
- [x] Titel weiter nur als Text: `grep -rnE 'dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|document\.write' src | grep -v '\.test\.'` → 0 Treffer
- [x] Keine Secrets im Client-Bundle: 21 Dev-Chunks, Muster `sk_live|sk_test_|service_role|SUPABASE_SERVICE|PRIVATE KEY|AKIA|ghp_|eyJhbGciOi` → 0 Dateien; `git diff b922e08..HEAD` ohne Schlüsselmuster; `npm audit --omit=dev` → 0 Schwachstellen
- [x] Regression: `GET /` → 200, `lang="de"`, Titel «Aufgaben», keine Template-Reste; `GET /does-not-exist` → 404; `git diff b922e08..HEAD --stat -- src/components src/lib src/hooks src/app` zeigt nur `theme-provider.test.tsx` (Test); Dev-Log ohne Fehler aus der App
- [!] Lint, Typen und Produktions-Build: in diesem Lauf nicht neu ausgeführt (kein Beleg aus diesem Lauf; `/build` hat sie mit `npm run check` am Ende des Fixes gefahren). Die Header wurden deshalb nur am Dev-Server gemessen.

### Acceptance Criteria Status

#### AC-1: Fokus im Eingabefeld beim Öffnen
- [x] Fokus beim Einhängen gesetzt, Komponente wird auch im Ladezustand gerendert — `task-composer.tsx:21-23`, `tasks-view.tsx:58`, Test `tasks-view.test.tsx:39-44`
- [!] NOT VERIFIED: Fokus im echten Browser — kein Browser

#### AC-2: Anlegen mit Enter oder Knopf, neue Aufgabe oben, Feld leer und fokussiert
- [x] `tasks.rules.ts:17`, `task-composer.tsx:33-35`; Tests `tasks-view.test.tsx:77-83`, `task-composer.test.tsx:25-38`

#### AC-3: Leerer Titel wird abgelehnt, Hinweis «Bitte einen Titel eingeben.»
- [x] `tasks.schema.ts:38-40`, `task-composer.tsx:41`; Test `task-composer.test.tsx:41`. Gegenprobe: Leerzeichen, NBSP, Tab, U+3000 und U+2028 werden abgewiesen (`/tmp/qa-acc-probe/out.txt`)
- Randfall siehe BUG-7 (unsichtbare Zeichen)

#### AC-4: Titel auf 200 Zeichen begrenzt
- [x] `maxLength={200}` in `task-composer.tsx:57` und `task-item.tsx:86`, Schema `tasks.schema.ts:41`; `curl http://localhost:3000/` zeigt `maxLength="200"` im Server-HTML
- [!] NOT VERIFIED: echtes Kürzen beim Einfügen — jsdom setzt `maxLength` nicht durch, der Test (`task-composer.test.tsx:59`) prüft nur das Attribut. `maxLength` zählt ausserdem UTF-16-Einheiten (100 Emoji füllen die 200).

#### AC-5: Leerzeichen am Rand werden entfernt
- [x] `tasks.schema.ts:7`; Tests `tasks.schema.test.ts:10`, `tasks.rules.test.ts:20`

#### AC-6: Duplikate erlaubt
- [x] keine Duplikatprüfung `tasks.rules.ts:14-18`, eigene ID `use-tasks.ts:31-36`; Tests `use-tasks.test.tsx:39`, `tasks.rules.test.ts:33`

#### AC-7: Abhaken, durchgestrichen und grau, Position bleibt
- [x] `tasks.rules.ts:21-26`, `task-item.tsx:110`; `--muted-foreground` ergibt `#6B6B6B` (`globals.css:94`); Tests `tasks-view.test.tsx:85-95`, `task-item.test.tsx:31`
- [!] NOT VERIFIED: tatsächliche Darstellung — kein Browser

#### AC-8: Abgehakte Aufgabe wieder öffnen
- [x] `tasks.rules.ts:25`; Tests `tasks-view.test.tsx:93-94`, `tasks.rules.test.ts:54`

#### AC-9: Stift öffnet Bearbeitungsfeld mit aktuellem Titel und Fokus
- [x] `task-item.tsx:85`, Fokus und Markierung `task-item.tsx:31-34`; Test `task-item.test.tsx:82`
- [!] NOT VERIFIED: Fokus im echten Browser — kein Browser

#### AC-10: Enter oder Verlassen speichert, Position und Status bleiben
- [x] `task-item.tsx:92-94`, `:100`, `tasks.rules.ts:36`; Tests `task-item.test.tsx:91-120`, `tasks.rules.test.ts:65`
- [x] BUG-5 behoben und neu geprüft (zweiter Lauf, siehe Re-Verifikation)

#### AC-11: Esc verwirft
- [x] `task-item.tsx:95-97`; Test `task-item.test.tsx:122`
- [x] BUG-5 behoben und neu geprüft (zweiter Lauf)

#### AC-12: Leerer Titel beim Bearbeiten bleibt offen mit Hinweis
- [x] `task-item.tsx:51-58`; Gegenprobe: Feld bleibt offen, gespeicherter Titel unverändert, nach Esc wieder der alte Titel; Tests `task-item.test.tsx:133-155`

#### AC-13: Erledigte Aufgaben bearbeitbar
- [x] Stift unabhängig von `done` `task-item.tsx:117-127`; Test `task-item.test.tsx:156`

#### AC-14: Klick auf den Titeltext tut nichts
- [x] `<span>` ohne Handler und ohne `<label>` `task-item.tsx:107-114`; Test `task-item.test.tsx:65`

#### AC-15: Löschen ohne Dialog, Hinweis mit «Rückgängig» ca. 6 Sekunden
- [x] `use-tasks.ts:75`, `tasks-view.tsx:45-46`, `task-notice.tsx:7,30`; Tests `tasks-view.test.tsx:109`, `task-notice.test.tsx:32`

#### AC-16: Rückgängig bringt die Aufgabe an ihre alte Position zurück
- [x] Titel und Erledigt-Status kommen zurück — Test `tasks-view.test.tsx:118-135`
- [ ] BUG-6: Ändert sich die Liste innerhalb der 6 Sekunden, landet die Aufgabe an der falschen Stelle (Gegenprobe: [A,B,C], B löschen, X anlegen, Rückgängig → `["X","B","A","C"]`)

#### AC-17: Nach Ablauf endgültig gelöscht
- [x] `tasks-view.tsx:22`, `task-notice.tsx:30`; Test `tasks-view.test.tsx:137-149`

#### AC-18: Aufgaben bleiben nach Neuladen und Browser-Neustart
- [x] ein Dokument in Listenreihenfolge `tasks.storage.ts:113`; Tests `tasks.storage.test.ts:50-59`, `tasks-view.integration.test.tsx:26-47`
- [!] NOT VERIFIED: echter Browser-Neustart mit echtem `localStorage` — kein Browser

#### AC-19: Änderungen erscheinen in einem zweiten Tab ohne Neuladen
- [x] Codepfad: `storage`-Ereignis löst Neulesen und Benachrichtigung aus, `tasks.storage.ts:122-134`, `:82-100`
- [!] NOT VERIFIED: zwei echte Tabs — die Tests spielen das Ereignis von Hand ein (`tasks-view.integration.test.tsx:82-109`)

#### AC-20: Bei gleichzeitiger Änderung derselben Aufgabe gewinnt die letzte
- [x] jede Aktion liest frisch und schreibt synchron `use-tasks.ts:47-81`; Test `tasks-view.integration.test.tsx:111-126`

#### AC-21: Speicher nicht verfügbar oder voll
- [x] Probe beim Start `tasks.storage.ts:33-42`, Schreibfehler setzt «unavailable» `:114-116`, Hinweis `storage-alert.tsx:11-17`; Tests `tasks-view.test.tsx:56-64`, `tasks.storage.test.ts:169-205`
- [!] NOT VERIFIED: echter privater Modus oder volles Kontingent — `setItem` ist nur gemockt

#### AC-22: Leerer Zustand
- [x] Text exakt `tasks-view.tsx:67`; Test `tasks-view.test.tsx:39-41`

#### AC-23: Platzhalter bis der Speicher gelesen ist
- [x] `curl http://localhost:3000/` enthält drei Platzhalter mit `aria-busy="true"` und weder im Body noch im Payload «Noch keine Aufgaben»; `tasks.storage.ts:141-143`; Test `tasks-view.test.tsx:33`

#### AC-24: Kopfzeile, Hell/Dunkel mit Systemstandard und gespeicherter Wahl
- [x] `curl`: Titel «Aufgaben» vor dem Umschalter, `app-header.tsx:6-8`; Inline-Skript von `next-themes` liest `theme` vor dem Zeichnen
- [x] Neu in diesem Lauf: `src/components/theme-provider.test.tsx` prüft mit dem echten `next-themes` den Systemstandard (hell und dunkel), das Speichern der Wahl unter `theme` und deren Vorrang nach Neuladen — 4 Tests, rote Gegenprobe (`defaultTheme="light"`, ohne `enableSystem`, `attribute="data-theme"`) schlägt an
- [!] NOT VERIFIED: Wechsel der Systemeinstellung und tatsächliche Darstellung — kein Browser

#### AC-25: Tastaturbedienung, sichtbarer Fokus, zugängliche Namen
- [x] zugängliche Namen `task-item.tsx:76,122,131`, Test `task-item.test.tsx:50`; Fokusring `focus-visible:ring-2` (Server-HTML, `checkbox.tsx:16`), hell schwarz, dunkel orange (`globals.css:104,146`)
- [x] BUG-2 behoben und neu geprüft (zweiter Lauf, siehe Re-Verifikation); Restbefunde BUG-14, BUG-15, BUG-16 (Low)
- [!] NOT VERIFIED: sichtbarer Fokusring als gerenderter Pixel und echte Tab-Reihenfolge — kein Browser

#### AC-26: Schmaler Bildschirm ab 320 px
- [!] NOT VERIFIED: kein Viewport. Code plausibel (`tasks-view.tsx:56`, `task-item.tsx:109`, `button.tsx:26`); Restrisiko ist die Mindestbreite des Eingabefelds neben «Hinzufügen» (`task-composer.tsx:47-63`)

### Edge Cases Status

#### EC-1: 200 Zeichen ohne Leerzeichen
- [!] NOT VERIFIED: Layout — `break-words min-w-0` ist gesetzt (`task-item.tsx:109`), der Test (`task-item.test.tsx:37`) prüft nur Klassennamen und kann einen echten Überlauf nicht erkennen

#### EC-2: Markup im Titel wird als Text angezeigt
- [x] React-Textknoten `task-item.tsx:113`; `grep -rnE 'dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|document\.write' src` ausserhalb von Tests: 0 Treffer; Gegenprobe mit `<img onerror>` und `<script>` im Titel und in der ID: 0 `img`, 0 `script` im DOM; Test `task-item.test.tsx:43-48`

#### EC-3: Zweimal schnell Enter erzeugt genau eine Aufgabe
- [x] Feld wird synchron geleert `task-composer.tsx:33`; Gegenprobe ergibt `["Einmal"]`; Test `tasks-view.integration.test.tsx:49-58`
- Nebenbefund siehe BUG-8 (zweiter Druck zeigt den Hinweis «Bitte einen Titel eingeben.»)

#### EC-4: Aufgabe wird in Tab A bearbeitet, in Tab B gelöscht
- [x] Nicht wiederhergestellt: `tasks.rules.ts:31`
- [x] BUG-1 behoben und neu geprüft (zweiter Lauf, siehe Re-Verifikation)

#### EC-5: Zwei Löschungen hintereinander
- [x] ein einziger `notice`-Zustand, neue ID ersetzt die alte Leiste und startet die Zeit neu `tasks-view.tsx:24-27`, `task-notice.tsx:28-32`; Tests `tasks-view.test.tsx:151-162`, `task-notice.test.tsx:47`

#### EC-6: Neuladen während der Rückgängig-Frist
- [x] Löschen wird sofort geschrieben `use-tasks.ts:75`; Tests `tasks-view.test.tsx:164`, `tasks-view.integration.test.tsx:60-72`

#### EC-7: Unlesbare gespeicherte Daten
- [x] `tasks.storage.ts:21-31`, Sicherung unter `tasks:v1:backup` vor dem Überschreiben `:109-113`, Hinweis `storage-alert.tsx:19-22`; Tests `tasks-view.test.tsx:66-73`, `tasks.storage.test.ts:135-166`, `tasks.schema.test.ts:71-104`; Gegenprobe der Sicherheitsprüfung: falsche Typen, `__proto__`, doppelte IDs, 3-MB-Titel gelten alle als unlesbar, keine Abstürze

#### Zusätzliche Randfälle der Prüfer
- Meldung «Diese Aufgabe existiert nicht mehr.» ersetzt eine offene Rückgängig-Leiste — siehe BUG-9
- Läuft die Leiste ab, während «Rückgängig» den Fokus hat, fällt der Fokus auf `body` (aus dem Code abgeleitet) — siehe BUG-2
- Eingefügte Zeilenumbrüche: Ein `<input type="text">` entfernt sie vermutlich schon beim Einfügen, dann würde aus «Milch⏎Brot» «MilchBrot» statt «Milch Brot» — [!] NOT VERIFIED (kein Browser)
- Strenge beim Lesen: Eine einzige von Hand veränderte Aufgabe macht das ganze Dokument unlesbar; im Design so gewollt, die Daten bleiben unter `tasks:v1:backup` erhalten

### Security Audit Results

_Das Feature hat keinen Server-Teil: keine Konten, keine API-Route, keine Datenbank. Prüfungen ohne Gegenstück sind deshalb `NOT VERIFIED — kein Gegenstück`, nicht bestanden._

- [!] Authentifizierung: NOT VERIFIED — kein Gegenstück. Es gibt nur `src/app/page.tsx`, `/api` und `/api/tasks` liefern 404 (`curl`)
- [!] Autorisierung: NOT VERIFIED — kein Gegenstück. Die Daten liegen nur im `localStorage` des eigenen Browsers (`tasks.storage.ts:3,113`)
- [x] Eingabevalidierung / Injection: Prototype-Pollution (`__proto__`, `constructor.prototype`) bleibt wirkungslos, falsche Typen und 3-MB-Titel gelten als unlesbar — Gegenprobe `/tmp/qa-sec-probe.out`, `tasks.schema.ts:17-28`
- [x] XSS über gespeicherte Titel: siehe EC-2; zusätzlich ergibt `curl 'http://localhost:3000/?title=<script>alert(1)</script>'` im Antworttext 0-mal `<script>alert`
- [!] Rate Limiting: NOT VERIFIED — nicht umgesetzt (optional für ein MVP); 30 Anfragen auf `/` → 30 × 200. Es gibt keinen eigenen Endpunkt, der es bräuchte
- [!] Brute Force: NOT VERIFIED — kein Gegenstück (kein Login, kein Signup, kein Passwort-Reset)
- [!] Account Enumeration / Massen-Signup: NOT VERIFIED — kein Gegenstück
- [x] BUG-3: Titel steht nicht mehr in der URL (zweiter Lauf, `method="post"`); der Rest, die Übertragung im Request-Body vor der Hydration, steht als BUG-13 (Low, Deferred)
- [x] Keine Secrets im Client-Bundle: Dev-Chunks (21) und `.next/static` (12 JS-Dateien) auf `sk_live|sk_test_|service_role|eyJhbGciOi|BEGIN … PRIVATE|AKIA|ghp_` durchsucht, 0 Treffer; `NEXT_PUBLIC_` kommt in den Chunks 0-mal vor; keine Source Maps
- [x] Keine Secrets in Git: `git ls-files` führt nur `.env.local.example` (Platzhalter), `.gitignore:32-35` ignoriert `.env*`, `git log -p --all` mit Schlüsselmustern ergibt nur Doku-Text
- [x] `NEXT_PUBLIC_`-Nutzung: nur `NEXT_PUBLIC_SUPABASE_URL` und `…_ANON_KEY` als Platzhalter in `.env.local.example:15-16`
- [x] Keine Übertragung an Dritte zur Laufzeit: App-Chunks ohne `fetch`, `sendBeacon`, `XMLHttpRequest`, `WebSocket`; Schrift Inter wird selbst ausgeliefert (`/_next/static/media/*.woff2`), kein Aufruf an `fonts.g…`
- [x] Abhängigkeiten: `npm audit --omit=dev` → 0 Schwachstellen
- [x] BUG-4 behoben und neu geprüft am Dev-Server (zweiter Lauf, siehe Re-Verifikation); [!] Live-URL weiterhin NOT VERIFIED
- [!] Sensible Daten in API-Antworten: NOT VERIFIED — kein Gegenstück (keine API)

### Regression

- [x] Deployed-Nachbarn: keine. `features/INDEX.md:28-30` — PROJ-1 In Review, PROJ-2 und PROJ-3 Roadmap
- [x] Geteilte Komponenten unverändert: `git diff main...HEAD --stat -- src/components/ui src/lib src/hooks` leer; geändert nur `globals.css`, `layout.tsx`, `page.tsx` (wie im Design vorgesehen)
- [x] `GET /` → 200, `lang="de"`, Titel «Aufgaben», keine Template-Reste (`grep -c "next.svg|Get started by editing|Deploy now|vercel.svg|Read our docs"` → 0); `GET /does-not-exist` → 404
- [x] Keine abgeschwächte Prüfung: `git diff main...HEAD -- vitest.config.mts eslint.config.mjs package.json scripts .dependency-cruiser.cjs tsconfig.json next.config.ts components.json` leer
- [x] Alle 12 Testdateien des Branches werden gefunden, keine `skip`/`only`/`todo`, keine `eslint-disable`, `@ts-ignore` oder `as any` in `src/features`, `src/components/*.tsx`, `src/app`
- [x] Testqualität per Datei geprüft; Stichprobe `input.value = ""` entfernt → 2 von 9 Tests in `task-composer.test.tsx` schlagen an
- [x] BUG-5 behoben und neu geprüft: Mutation schlägt jetzt an (2 von 17 rot)
- [ ] BUG-12 (latent): `text-primary` in geteilten Komponenten würde Orange als Textfarbe ergeben

### Unit-Tests (Schritt 6)

Die 12 Testdateien aus `/build` decken Regeln, Speicher, Hook und Komponenten ab. In diesem Lauf ergänzt oder korrigiert:
- [x] Neu: `src/components/theme-provider.test.tsx` (echtes `next-themes`, 4 Tests) — Einzellauf 4 passed; rote Gegenprobe: Provider-Konfiguration verändert → 1 bzw. 2 von 4 schlagen an, danach wiederhergestellt und wieder 4 passed
- [x] Korrigiert: `src/features/tasks/use-tasks.test.tsx` — Mock-Aufräumen nun in `afterEach` statt im Testkörper (`vi.restoreAllMocks`); Einzellauf zusammen mit der neuen Datei 19 passed

### E2E Tests
- Status: **not run** (`/e2e-tests` für kritische Abläufe ausführen). Es gibt kein `tests/`-Verzeichnis.

### Not Verified In This Run

- [!] Alles, was einen echten Browser braucht: Fokus (AC-1, AC-9, nach Löschen und Rückgängig), echtes Kürzen auf 200 Zeichen beim Einfügen (AC-4), Darstellung durchgestrichen und grau (AC-7), Themes und Systemwechsel (AC-24), sichtbarer Fokusring und echte Tab-Reihenfolge (AC-25) — kein Browser in `/qa`
- [!] Layout bei 320, 375, 768 und 1440 px (AC-26, EC-1) — kein Viewport
- [!] Zwei echte Tabs (AC-19, AC-20) und echter Browser-Neustart (AC-18) — kein Browser; nur simulierte Ereignisse in jsdom
- [!] Echter privater Modus oder volles Kontingent (AC-21) — `setItem` nur gemockt
- [!] Verhalten beim Einfügen von Zeilenumbrüchen in ein `<input>` — kein Browser
- [!] Cross-Browser (Chrome, Firefox, Safari, Edge) und das Performance-Ziel mit 500 Aufgaben — kein Browser
- [!] Browserkonsole und Hydration-Warnungen — braucht DevTools (nur das Server-Log wurde gesichtet: keine Fehler)
- [!] Security-Header am Live-URL — es gibt keinen (`stack.deploy: null`), geprüft wurde nur der lokale Dev-Server; im Produktions-Build wurden sie im zweiten Lauf nicht neu gemessen (nur aus der Konfiguration abgeleitet, vom ersten Lauf liegt eine Messung am Produktions-Build vor `/build` vor)
- [!] `Strg+Z` / `⌘Z`, Pause bei Fokus und Mauszeiger, Abfangen von `⌘Z` in Safari und echtes Absenden vor der Hydration im Browser — kein Browser; nur jsdom und `curl`
- [!] Authentifizierung, Autorisierung, Brute Force, Enumeration, API-Antworten — kein Gegenstück in diesem Feature
- [!] Rate Limiting — nicht umgesetzt, kein eigener Endpunkt
- [!] Kontrastwerte der neuen Tokens in Hell und Dunkel — kein Browser, keine berechneten Styles

### Bugs Found

#### BUG-1: Bearbeitungsfeld verschwindet ohne Hinweis, wenn ein anderer Tab die Aufgabe löscht
- **Severity:** Medium
- **Status:** Fixed (2026-10-30, re-verified)
- **Class:** Bildschirmzustand (offenes Bearbeitungsfeld) geht bei einem externen Abgleich still verloren; der Hinweis «nicht mehr da» hängt nur an Aktionen, nicht am Abgleich
- **Sweep:** `grep -n "showNotice(GONE_MESSAGE)" src/features/tasks/*.tsx` — 3 Treffer, alle in Aktionen (`tasks-view.tsx:30,35,42`); der Abgleichpfad `tasks.storage.ts:124` meldet nichts
- **Steps to Reproduce:**
  1. Tab A: «Erste» zum Bearbeiten öffnen und «Neu getippt» eingeben
  2. Tab B: «Erste» löschen
  3. Erwartet (EC-4): Tab A zeigt «Diese Aufgabe existiert nicht mehr.», die Aufgabe kommt nicht zurück
  4. Tatsächlich: In Tab A verschwindet die Zeile samt Eingabe sofort, kein Hinweis

#### BUG-2: «Rückgängig» ist per Tastatur nur bei kurzen Listen erreichbar
- **Severity:** Medium
- **Status:** Fixed (2026-10-30, re-verified)
- **Class:** zeitlich begrenzte Aktion, deren Bedienelement am Ende der Tab-Reihenfolge steht, ohne Rücksicht auf die Tastatur (auch fällt der Fokus auf `body`, wenn die Leiste abläuft, während «Rückgängig» ihn hat)
- **Sweep:** `grep -rn 'setTimeout' src --include='*.tsx' | grep -v '\.test\.'` — 1 Treffer (`task-notice.tsx:30`)
- **Steps to Reproduce:**
  1. 10 Aufgaben anlegen, die oberste per Tastatur löschen
  2. Erwartet (AC-25): «Rückgängig» ist ohne Maus erreichbar
  3. Tatsächlich: Der Fokus springt auf die nächste Zeile; bis «Rückgängig» sind es 27 Tab-Schritte (3 pro verbleibende Zeile) bei 6 Sekunden Frist, kein Tastenkürzel, keine Pause bei Fokus

#### BUG-3: Aufgabenformular kann den Titel vor der Hydration per GET in die URL schreiben
- **Severity:** Medium
- **Status:** Fixed (2026-10-30, re-verified)
- **Class:** Formular verlässt sich allein auf ein clientseitiges `onSubmit` und hat keinen sicheren nativen Rückfall (Regel «Keine Personendaten in der URL», `AGENTS.md` → Sensitive Data in URLs; Spec: «keine Übertragung an einen Server»)
- **Sweep:** `grep -rn '<form' src | grep -v '\.test\.' | grep -vE 'method=|action='` — 1 Treffer (`task-composer.tsx:46`)
- **Steps to Reproduce:**
  1. Seite bei langsamem Netz oder mit blockiertem JavaScript öffnen
  2. Einen Titel eintippen und `Enter` drücken, bevor die Skripte geladen sind
  3. Erwartet: nichts verlässt den Browser
  4. Tatsächlich: Navigation nach `/?title=<Titel>`, der Titel steht in Verlauf, Server-Logs und `Referer`; die Eingabe geht verloren

#### BUG-4: Security-Header fehlen, `X-Powered-By` verrät das Framework
- **Severity:** Medium
- **Status:** Fixed (2026-10-30, re-verified)
- **Class:** Sicherheits-Header nicht in der Framework-Konfiguration gesetzt (Security Rules in `AGENTS.md`)
- **Sweep:** `grep -cE 'headers\(\)|X-Frame-Options|poweredByHeader' next.config.ts` — 0 Treffer; live: `curl -sI http://localhost:3000/ | grep -ciE '^(x-frame-options|x-content-type-options|referrer-policy|strict-transport-security):'` — 0 Treffer
- **Steps to Reproduce:** `curl -sI http://localhost:3000/`; erwartet die vier Header, tatsächlich keiner. Hinweis: am Live-URL zu bestätigen, ein Host kann Header ergänzen oder entfernen (Vorlage: `docs/stacks/framework-nextjs.md`).

#### BUG-5: Schutz gegen doppeltes Beenden beim Bearbeiten ist ungetestet
- **Severity:** Medium
- **Status:** Fixed (2026-10-30, re-verified)
- **Class:** Test löst ein Ereignis auf einem bereits ausgehängten Element aus, die Assertion ist dadurch immer wahr
- **Sweep:** `grep -n -A2 "key: 'Enter'\|key: 'Escape'" src/features/tasks/task-item.test.tsx | grep -c 'fireEvent.blur'` — 2 Treffer im ersten Lauf; nach dem Fix zählt er weiter 2, ist aber überholt (die Ereignisse laufen jetzt im selben `act()`). Massgeblich ist die Mutationsprobe: Schutz entfernt → 2 von 17 Tests rot.
- **Steps to Reproduce:**
  1. In `task-item.tsx:48` die Zeile `if (finishedRef.current) return` entfernen
  2. `npx vitest run src/features/tasks/task-item.test.tsx`
  3. Erwartet: mindestens ein Test schlägt an
  4. Tatsächlich: 17 von 17 grün. Fällt der Schutz weg, würde ein Browser, der beim Entfernen eines fokussierten Feldes `blur` auslöst, einen mit `Esc` verworfenen Text trotzdem speichern (AC-11). In jsdom lässt sich das nicht nachstellen, ein Test im echten Browser (`/e2e-tests`) ist der passende Weg.

#### BUG-6: «Rückgängig» setzt nach einer Listenänderung an der falschen Stelle ein
- **Severity:** Low
- **Status:** Deferred
- **Class:** Wiederherstellung über eine absolute Position statt über den Nachbarn
- **Sweep:** `grep -n "removed.index" src/features/tasks/*.ts | grep -v test` — 1 Treffer (`tasks.rules.ts:55`)
- **Steps to Reproduce:** Liste [A,B,C], B löschen, X anlegen, «Rückgängig». Erwartet (AC-16): B zwischen A und C. Tatsächlich: `["X","B","A","C"]`. Gleiches gilt, wenn ein anderer Tab die Liste ändert.

#### BUG-7: Titel-Regel lässt unsichtbare und Steuerzeichen zu
- **Severity:** Low
- **Status:** Deferred
- **Class:** Die Leer-Prüfung stützt sich nur auf `trim()`, Zeichen ohne Whitespace-Eigenschaft (Zero-Width-Space U+200B, Bidi-Zeichen U+202E, Steuerzeichen) gelten als Inhalt
- **Sweep:** `grep -rn '\.trim()' src --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` — 1 Treffer (`tasks.schema.ts:7`)
- **Steps to Reproduce:** Titel aus nur `​` absenden. Erwartet (AC-3): abgelehnt. Tatsächlich: `parseTitle("​")` liefert `{ok:true}`, es entsteht eine Zeile ohne sichtbaren Text, das Kästchen heisst «Aufgabe „“ erledigt».

#### BUG-8: Zweiter schneller Enter zeigt den Hinweis «Bitte einen Titel eingeben.» nach erfolgreichem Anlegen
- **Severity:** Low
- **Status:** Deferred
- **Class:** Fehlerhinweis erscheint für ein erneutes Absenden eines schon geleerten Feldes
- **Sweep:** `grep -n 'Bitte einen Titel eingeben' src/features/tasks/*.tsx | grep -v test` — 2 Treffer (`task-composer.tsx`, `task-item.tsx`)
- **Steps to Reproduce:** Titel eintippen, zweimal schnell `Enter`. Erwartet (EC-3): genau eine Aufgabe, ohne Fehlermeldung. Tatsächlich: eine Aufgabe, aber zusätzlich der Hinweis.

#### BUG-9: Die Meldung «Diese Aufgabe existiert nicht mehr.» verdrängt die Rückgängig-Leiste
- **Severity:** Low
- **Status:** Deferred
- **Class:** Es gibt nur einen Hinweis-Zustand, jede neue Meldung ersetzt die vorherige, auch wenn diese eine Aktion trägt (aus dem Code abgeleitet, nicht ausgeführt)
- **Sweep:** `grep -n 'setNotice\|showNotice(' src/features/tasks/tasks-view.tsx` — Treffer in `tasks-view.tsx:24-27` (ein einziger Zustand)
- **Steps to Reproduce:** Aufgabe löschen, innerhalb von 6 Sekunden in einem anderen Tab dieselbe Liste so ändern, dass eine Aktion «nicht gefunden» meldet. Erwartet: «Rückgängig» bleibt nutzbar. Tatsächlich: Die Leiste wird ersetzt.
- **Zweiter Lauf:** leicht verschlechtert, weiterhin Low. Der Abgleichpfad aus dem Fix von BUG-1 (`tasks-view.tsx:38`) ist ein weiterer Auslöser: B löschen, A bearbeiten, ein anderer Tab löscht A → «Diese Aufgabe existiert nicht mehr.» ersetzt die Rückgängig-Leiste, `Strg+Z` bringt B nicht mehr zurück (Gegenprobe). Sweep jetzt 4 statt 3 Treffer.

#### BUG-10: Die Seite hat keine Überschrift (`<h1>`)
- **Severity:** Low
- **Status:** Deferred
- **Class:** Seitentitel als Fliesstext statt als Überschrift ausgezeichnet
- **Sweep:** `grep -rn "<h1" src/app src/components/*.tsx src/features | wc -l` — 0 Treffer (`app-header.tsx:7` ist ein `<p>`)
- **Steps to Reproduce:** Server-HTML von `/` enthält kein `<h1>`–`<h6>`; Screenreader finden keine Überschrift zum Navigieren.

#### BUG-11: Die 404-Seite ist der englische Next.js-Standard und ignoriert das Theme
- **Severity:** Low
- **Status:** Deferred
- **Class:** Standardseiten des Frameworks (not-found, error) nicht an Sprache und Theme angepasst
- **Sweep:** `ls src/app/not-found.tsx src/app/error.tsx src/app/global-error.tsx 2>&1 | grep -c 'No such'` — 3 Treffer
- **Steps to Reproduce:** `curl -s http://localhost:3000/does-not-exist` → englischer Text «This page could not be found.», Inline-CSS mit `prefers-color-scheme` statt der `.dark`-Klasse.

#### BUG-12: Das neue Farb-Token `primary` macht `text-primary` in geteilten Komponenten zu oranger Schrift (latent)
- **Severity:** Low
- **Status:** Deferred
- **Class:** Ein geändertes Farb-Token verändert die Bedeutung geteilter Komponenten, die es als Textfarbe nutzen (Orange auf Weiss etwa 2,6:1, Spec verlangt 4.5:1)
- **Sweep:** `grep -rn "text-primary\b" src/components/ui | grep -v text-primary-foreground` — 2 Treffer (`button.tsx:20` Variante `link`, `radio-group.tsx:31`)
- **Steps to Reproduce:** Heute nicht erreichbar: `grep -rn 'variant="link"\|RadioGroup' src/app src/features src/components/*.tsx` → 0 Treffer. Betroffen wären PROJ-2 und PROJ-3, sobald sie eine dieser Komponenten nutzen.

#### BUG-13: Natives Absenden vor der Hydration schickt den Titel weiterhin im Request-Body an den Server
- **Severity:** Low
- **Status:** Deferred
- **Class:** Formular, das nur per JavaScript abgesendet wird, hat einen nativen Rückfall, der trotzdem Feldwerte an den Server schickt (Spec, Technical Requirements: «keine Übertragung an einen Server»)
- **Sweep:** `grep -rn 'name="' src/features src/app src/components/*.tsx | grep -v '\.test\.'` — 1 Treffer (`task-composer.tsx:55`)
- **Steps to Reproduce:** `curl -s -X POST --data 'title=Arzttermin' http://localhost:3000/` → HTTP 200, die Seite wird neu gerendert, der Titel wird nicht zurückgespiegelt, nicht geloggt und nicht gespeichert, geht aber an den eigenen Origin. Im Browser: JavaScript blockieren oder vor dem Laden `Enter` drücken; das Feld ist danach leer. Möglicher Fix: Feld oder Knopf bis zur Hydration deaktivieren.

#### BUG-14: Das Tastenkürzel für «Rückgängig» ist für reine Tastaturnutzer nicht sichtbar
- **Severity:** Low
- **Status:** Deferred
- **Class:** Ein Ersatz für Barrierefreiheit ist nur über Kanäle erklärt, die Maus oder Screenreader voraussetzen (`title`, `aria-keyshortcuts`)
- **Sweep:** `grep -rn 'title="' src/features --include='*.tsx' | grep -v test` — 1 Treffer (`task-notice.tsx:92`)
- **Steps to Reproduce:** Aufgabe per Tastatur löschen: Auf `Strg+Z` weist nur ein Tooltip bei Mausberührung hin.

#### BUG-15: `Strg+Z` wirkt nicht, wenn die letzte Aufgabe gelöscht wurde
- **Severity:** Low
- **Status:** Deferred
- **Class:** Die App setzt den Fokus selbst dorthin, wo ihr eigenes Tastenkürzel abgeschaltet ist (Textfeld)
- **Sweep:** none
- **Steps to Reproduce:** Die einzige Aufgabe löschen. Der Fokus springt ins Eingabefeld (`task-list.tsx:30`), `Strg+Z` wird dort ignoriert (`task-notice.tsx:54`). Ausweg: zweimal `Tab`, dann «Rückgängig».

#### BUG-16: Eine ersetzte Hinweisleiste läuft ab, obwohl der Mauszeiger darauf liegt
- **Severity:** Low
- **Status:** Deferred
- **Class:** Der Pause-Zustand ist an die Hinweis-ID gebunden, die Mausereignisse aber an den wiederverwendeten DOM-Knoten (widerspricht `design.md` → Nachträge)
- **Sweep:** none
- **Steps to Reproduce:** Löschen, Maus auf die Leiste legen, per Tastatur eine zweite Aufgabe löschen. React nutzt den DOM-Knoten weiter, es kommt kein neues `mouseenter`; die neue Leiste verschwindet nach 6 Sekunden.

#### BUG-17: Zwei Schutzzeilen der Fixes sind durch keinen Test abgesichert
- **Severity:** Low
- **Status:** Deferred
- **Class:** Eine Schutzzeile aus einem Fix hat keinen Test, die Mutation überlebt; ausserdem überschreibt ein Testtitel seine Aussage
- **Sweep:** none (gefunden durch Mutationsproben)
- **Steps to Reproduce:** (1) In `task-notice.tsx:38` `hold.id === noticeId &&` entfernen → `npx vitest run src/features/tasks/task-notice.test.tsx`: 14 von 14 grün; Folge im Browser: Fokus oder Hover der vorigen Leiste hält die nächste fest. (2) In `tasks-view.tsx:37` `editingId.current = null` entfernen → `tasks-view.test.tsx`: 22 von 22 grün; Folge: Der Hinweis «Diese Aufgabe existiert nicht mehr.» käme bei jeder weiteren Listenänderung erneut und könnte eine Rückgängig-Leiste verdrängen. (3) Der Test «restores the deleted task with Ctrl+Z, wherever the focus is in the list» (`tasks-view.test.tsx` ~Zeile 285) schickt die Taste an `document.body`, nicht an das fokussierte Element. Der Code ist heute korrekt, es fehlen nur Tests.

### Hinweise ausserhalb des Features (keine Bugs von PROJ-1)
- `src/lib/supabase/client.ts` und `server.ts` stammen aus dem Template und werden nicht benutzt (`stack.backend: localstorage`); `public/` enthält 5 unbenutzte Template-SVGs; `sonner` ist installiert, aber ungenutzt (im Design so festgehalten) — ein Fall für `/cleanup`
- Kein Favicon (`/favicon.ico` → 404), gab es auch auf `main` nie
- `use-tasks.ts:45`: `useRef(store)` folgt einem späteren Wechsel der Eigenschaft `store` nicht; ohne Wirkung, weil der Store nur in Tests übergeben wird
- Nach der ersten manuellen Theme-Wahl gibt es keinen Weg zurück zu «System»; die Spec verlangt das nicht

### Summary
- **Acceptance Criteria:** unverändert aus dem ersten Lauf: 22/26 bestanden, 2 nicht verifiziert (AC-19, AC-26). Die zwei Bug-ACs (AC-16 wegen BUG-6, AC-25 wegen BUG-2) sind neu geprüft: AC-25 bestanden (Rückgängig per Tastatur erreichbar, Restbefunde Low), AC-16 mit unverändertem Deferred-Bug BUG-6. Edge Cases: EC-4 jetzt bestanden (BUG-1 behoben), EC-1 nicht verifiziert.
- **Bugs Found:** 17 total (0 critical, 0 high, 5 medium, 12 low) — Open: 0, Fixed: 5 (BUG-1 bis BUG-5, re-verified), Deferred: 12 (BUG-6 bis BUG-17, alle Low)
- **Security:** 8 Prüfungen des ersten Laufs bestanden, die zwei Befunde BUG-3 und BUG-4 sind behoben, der Rest von BUG-3 steht als BUG-13 (Low, Deferred); NOT VERIFIED: 6 ohne Gegenstück, Header am Live-URL und im Produktions-Build
- **Production Ready:** JA — keine Critical/High-Bugs, kein Bug ist `Open`
- **Recommendation:** Deployen ist möglich. Vorher oder gleichzeitig `/e2e-tests` für die Browser-Themen, die hier nicht prüfbar waren; die Security-Header beim Deploy am Live-URL noch einmal prüfen

> «Production Ready: JA» heisst *keine Critical/High-Bugs*. Es heisst nicht, dass alles geprüft wurde: Alles unter «Not Verified In This Run» ist weiter offen und braucht einen Menschen oder `/e2e-tests`. In einer Re-Verifikation starten neue Low-Funde keine weitere Runde, sie stehen als `Deferred`.
