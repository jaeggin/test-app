# QA-Testergebnisse — PROJ-1 Aufgaben verwalten

**Getestet:** 2026-10-30
**App-URL:** http://localhost:3000 (`probe.kind: http`), ausgeliefert als Produktions-Build (`next start`) vom Stand `450d761`. Der Dev-Server liess sich nicht starten, weil noch ein eigener Server von vorher auf Port 3000 lief; der Code war derselbe. Der Server ist danach beendet worden.
**Tester:** QA Engineer (AI) — drei unabhängige `qa-engineer`-Prüfer (Abnahme, Sicherheit, Regression), die den Build nicht kennen, plus dieser Eigentümer-Lauf (Suites, Bericht, Unit-Tests)
**Scope:** `full` (Erstlauf, kein früherer `qa-report.md`)

> Legende: `[x]` in diesem Lauf verifiziert (mit Beleg) · `[ ] BUG` als fehlerhaft belegt · `[!] NOT VERIFIED` in diesem Lauf nicht prüfbar (mit Grund)
>
> **Wichtig zum Umfang:** Dieser Lauf hat **keinen Browser**. Fokus, Darstellung, zwei echte Tabs, echter Browserspeicher und Layout bei 320 px sind deshalb nur über Code, Server-HTML und jsdom-Tests belegt und unten als `[!] NOT VERIFIED` aufgeführt.

**Belege, die in diesem Lauf entstanden sind:**
- Suites einmal vor den Prüfern: `npm test` → `/tmp/qa-suite.log`, 12 Dateien, 143 Tests, 0 fehlgeschlagen.
- Eigentümer-Lauf: `npm run lint` ohne Befund, `npm run typecheck` ohne Fehler, `npm run build` erfolgreich (Route `/` statisch).
- Gegenproben der Prüfer (temporäre Einzeltests, danach gelöscht, `git status` sauber): Abnahme `/tmp/qa-acc-probe/out.txt`, Sicherheit `/tmp/qa-sec-probe.out`.

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
- [ ] BUG-5: Der Schutz gegen doppeltes Beenden (`task-item.tsx:48`) ist durch keinen Test abgesichert

#### AC-11: Esc verwirft
- [x] `task-item.tsx:95-97`; Test `task-item.test.tsx:122`
- [ ] BUG-5 (gleicher Testmangel wie bei AC-10)

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
- [ ] BUG-2: «Rückgängig» ist bei längeren Listen nicht innerhalb der 6 Sekunden per Tastatur erreichbar (Gegenprobe mit 10 Aufgaben: 27 Tab-Schritte)
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
- [ ] BUG-1: Der verlangte Hinweis erscheint im realistischen Ablauf nie (Gegenprobe: `EC4: edit field still present = false | GONE notice in A = false | A rows = []`). Die Tests stellen das `storage`-Ereignis bewusst nicht zu (`tasks-view.integration.test.tsx:128-139`, `tasks-view.test.tsx:203-213`).

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
- [ ] BUG-3: Zugangsdaten sind nicht betroffen, aber das Aufgabenformular (`task-composer.tsx:46`) hat weder `method` noch `action`. Vor der Hydration oder ohne JavaScript schickt `Enter` den Titel per GET nach `/?title=…` (`curl 'http://localhost:3000/?title=Arzttermin%20Dr.%20Muster'` → HTTP 200). Ein Titel kann Personendaten enthalten.
- [x] Keine Secrets im Client-Bundle: Dev-Chunks (21) und `.next/static` (12 JS-Dateien) auf `sk_live|sk_test_|service_role|eyJhbGciOi|BEGIN … PRIVATE|AKIA|ghp_` durchsucht, 0 Treffer; `NEXT_PUBLIC_` kommt in den Chunks 0-mal vor; keine Source Maps
- [x] Keine Secrets in Git: `git ls-files` führt nur `.env.local.example` (Platzhalter), `.gitignore:32-35` ignoriert `.env*`, `git log -p --all` mit Schlüsselmustern ergibt nur Doku-Text
- [x] `NEXT_PUBLIC_`-Nutzung: nur `NEXT_PUBLIC_SUPABASE_URL` und `…_ANON_KEY` als Platzhalter in `.env.local.example:15-16`
- [x] Keine Übertragung an Dritte zur Laufzeit: App-Chunks ohne `fetch`, `sendBeacon`, `XMLHttpRequest`, `WebSocket`; Schrift Inter wird selbst ausgeliefert (`/_next/static/media/*.woff2`), kein Aufruf an `fonts.g…`
- [x] Abhängigkeiten: `npm audit --omit=dev` → 0 Schwachstellen
- [ ] BUG-4: Security-Header fehlen vollständig. `curl -sI http://localhost:3000/` zeigt weder `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` noch `Strict-Transport-Security`, dazu `X-Powered-By: Next.js`; `next.config.ts` hat kein `headers()`. Gemessen am lokalen Server, ein Live-URL existiert nicht.
- [!] Sensible Daten in API-Antworten: NOT VERIFIED — kein Gegenstück (keine API)

### Regression

- [x] Deployed-Nachbarn: keine. `features/INDEX.md:28-30` — PROJ-1 In Review, PROJ-2 und PROJ-3 Roadmap
- [x] Geteilte Komponenten unverändert: `git diff main...HEAD --stat -- src/components/ui src/lib src/hooks` leer; geändert nur `globals.css`, `layout.tsx`, `page.tsx` (wie im Design vorgesehen)
- [x] `GET /` → 200, `lang="de"`, Titel «Aufgaben», keine Template-Reste (`grep -c "next.svg|Get started by editing|Deploy now|vercel.svg|Read our docs"` → 0); `GET /does-not-exist` → 404
- [x] Keine abgeschwächte Prüfung: `git diff main...HEAD -- vitest.config.mts eslint.config.mjs package.json scripts .dependency-cruiser.cjs tsconfig.json next.config.ts components.json` leer
- [x] Alle 12 Testdateien des Branches werden gefunden, keine `skip`/`only`/`todo`, keine `eslint-disable`, `@ts-ignore` oder `as any` in `src/features`, `src/components/*.tsx`, `src/app`
- [x] Testqualität per Datei geprüft; Stichprobe `input.value = ""` entfernt → 2 von 9 Tests in `task-composer.test.tsx` schlagen an
- [ ] BUG-5: Eine Mutation überlebt (`task-item.tsx:48` entfernt → 17 von 17 Tests grün)
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
- [!] Security-Header am Live-URL — es gibt keinen (`stack.deploy: null`), geprüft wurde nur der lokale Server
- [!] Authentifizierung, Autorisierung, Brute Force, Enumeration, API-Antworten — kein Gegenstück in diesem Feature
- [!] Rate Limiting — nicht umgesetzt, kein eigener Endpunkt
- [!] Kontrastwerte der neuen Tokens in Hell und Dunkel — kein Browser, keine berechneten Styles

### Bugs Found

#### BUG-1: Bearbeitungsfeld verschwindet ohne Hinweis, wenn ein anderer Tab die Aufgabe löscht
- **Severity:** Medium
- **Status:** Open
- **Class:** Bildschirmzustand (offenes Bearbeitungsfeld) geht bei einem externen Abgleich still verloren; der Hinweis «nicht mehr da» hängt nur an Aktionen, nicht am Abgleich
- **Sweep:** `grep -n "showNotice(GONE_MESSAGE)" src/features/tasks/*.tsx` — 3 Treffer, alle in Aktionen (`tasks-view.tsx:30,35,42`); der Abgleichpfad `tasks.storage.ts:124` meldet nichts
- **Steps to Reproduce:**
  1. Tab A: «Erste» zum Bearbeiten öffnen und «Neu getippt» eingeben
  2. Tab B: «Erste» löschen
  3. Erwartet (EC-4): Tab A zeigt «Diese Aufgabe existiert nicht mehr.», die Aufgabe kommt nicht zurück
  4. Tatsächlich: In Tab A verschwindet die Zeile samt Eingabe sofort, kein Hinweis

#### BUG-2: «Rückgängig» ist per Tastatur nur bei kurzen Listen erreichbar
- **Severity:** Medium
- **Status:** Open
- **Class:** zeitlich begrenzte Aktion, deren Bedienelement am Ende der Tab-Reihenfolge steht, ohne Rücksicht auf die Tastatur (auch fällt der Fokus auf `body`, wenn die Leiste abläuft, während «Rückgängig» ihn hat)
- **Sweep:** `grep -rn 'setTimeout' src --include='*.tsx' | grep -v '\.test\.'` — 1 Treffer (`task-notice.tsx:30`)
- **Steps to Reproduce:**
  1. 10 Aufgaben anlegen, die oberste per Tastatur löschen
  2. Erwartet (AC-25): «Rückgängig» ist ohne Maus erreichbar
  3. Tatsächlich: Der Fokus springt auf die nächste Zeile; bis «Rückgängig» sind es 27 Tab-Schritte (3 pro verbleibende Zeile) bei 6 Sekunden Frist, kein Tastenkürzel, keine Pause bei Fokus

#### BUG-3: Aufgabenformular kann den Titel vor der Hydration per GET in die URL schreiben
- **Severity:** Medium
- **Status:** Open
- **Class:** Formular verlässt sich allein auf ein clientseitiges `onSubmit` und hat keinen sicheren nativen Rückfall (Regel «Keine Personendaten in der URL», `AGENTS.md` → Sensitive Data in URLs; Spec: «keine Übertragung an einen Server»)
- **Sweep:** `grep -rn '<form' src | grep -v '\.test\.' | grep -vE 'method=|action='` — 1 Treffer (`task-composer.tsx:46`)
- **Steps to Reproduce:**
  1. Seite bei langsamem Netz oder mit blockiertem JavaScript öffnen
  2. Einen Titel eintippen und `Enter` drücken, bevor die Skripte geladen sind
  3. Erwartet: nichts verlässt den Browser
  4. Tatsächlich: Navigation nach `/?title=<Titel>`, der Titel steht in Verlauf, Server-Logs und `Referer`; die Eingabe geht verloren

#### BUG-4: Security-Header fehlen, `X-Powered-By` verrät das Framework
- **Severity:** Medium
- **Status:** Open
- **Class:** Sicherheits-Header nicht in der Framework-Konfiguration gesetzt (Security Rules in `AGENTS.md`)
- **Sweep:** `grep -cE 'headers\(\)|X-Frame-Options|poweredByHeader' next.config.ts` — 0 Treffer; live: `curl -sI http://localhost:3000/ | grep -ciE '^(x-frame-options|x-content-type-options|referrer-policy|strict-transport-security):'` — 0 Treffer
- **Steps to Reproduce:** `curl -sI http://localhost:3000/`; erwartet die vier Header, tatsächlich keiner. Hinweis: am Live-URL zu bestätigen, ein Host kann Header ergänzen oder entfernen (Vorlage: `docs/stacks/framework-nextjs.md`).

#### BUG-5: Schutz gegen doppeltes Beenden beim Bearbeiten ist ungetestet
- **Severity:** Medium
- **Status:** Open
- **Class:** Test löst ein Ereignis auf einem bereits ausgehängten Element aus, die Assertion ist dadurch immer wahr
- **Sweep:** `grep -n -A2 "key: 'Enter'\|key: 'Escape'" src/features/tasks/task-item.test.tsx | grep -c 'fireEvent.blur'` — 2 Treffer (`task-item.test.tsx:118`, `:128`)
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

### Hinweise ausserhalb des Features (keine Bugs von PROJ-1)
- `src/lib/supabase/client.ts` und `server.ts` stammen aus dem Template und werden nicht benutzt (`stack.backend: localstorage`); `public/` enthält 5 unbenutzte Template-SVGs; `sonner` ist installiert, aber ungenutzt (im Design so festgehalten) — ein Fall für `/cleanup`
- Kein Favicon (`/favicon.ico` → 404), gab es auch auf `main` nie
- `use-tasks.ts:45`: `useRef(store)` folgt einem späteren Wechsel der Eigenschaft `store` nicht; ohne Wirkung, weil der Store nur in Tests übergeben wird
- Nach der ersten manuellen Theme-Wahl gibt es keinen Weg zurück zu «System»; die Spec verlangt das nicht

### Summary
- **Acceptance Criteria:** 22/26 bestanden (davon mehrere nur bis zur Browser-Grenze, siehe NOT VERIFIED), 2 mit Bug (AC-16, AC-25), 2 nicht verifiziert (AC-19, AC-26). Edge Cases: 5/7 bestanden, 1 mit Bug (EC-4), 1 nicht verifiziert (EC-1).
- **Bugs Found:** 12 total (0 critical, 0 high, 5 medium, 7 low) — Open: 5, Deferred: 7 (Vorschlag, Entscheidung im Schritt 8)
- **Security:** 8 Prüfungen bestanden, 2 Befunde (BUG-3, BUG-4), 7 NOT VERIFIED (6 ohne Gegenstück, Header am Live-URL)
- **Production Ready:** JA im Sinne der Regel «keine Critical/High» — aber 5 Medium-Bugs sind `Open`, deshalb bleibt der Status **In Review**, bis sie behoben sind
- **Recommendation:** Erst die offenen Bugs beheben (`/build PROJ-1`), danach `/qa` (Re-Verifikation im Umfang des Fixes); dann `/e2e-tests` für die Browser-Themen, die hier nicht prüfbar waren

> «Production Ready: JA» heisst *keine Critical/High-Bugs*. Es heisst nicht, dass alles geprüft wurde: Alles unter «Not Verified In This Run» ist weiter offen und braucht einen Menschen oder `/e2e-tests`.
