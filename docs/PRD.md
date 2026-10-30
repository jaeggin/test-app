# Product Requirements Document

## Vision
Eine minimalistische To-Do-Liste für den persönlichen Gebrauch. Aufgaben lassen sich schnell erfassen, abhaken, bearbeiten und nach Status filtern, und jede Aufgabe kann ein Fälligkeitsdatum haben. Die App braucht kein Konto und keine Einrichtung: öffnen und loslegen.

## Target Users
Einzelpersonen, die ihre Aufgaben auf einem Gerät im Blick behalten wollen. Sie finden die vorhandenen Tools überladen oder zu anmeldepflichtig. Sie wollen Aufgaben notieren und erledigen, ohne Konto und ohne Ablenkung.

## Core Features (Roadmap)

_Die Feature-Map (Name, Beschreibung, Status, Build-Reihenfolge) steht in **`features/INDEX.md`** und nur dort._

Die erste Version muss Aufgaben anlegen, abhaken, bearbeiten und löschen können und dazu Filter (alle / offen / erledigt) und ein optionales Fälligkeitsdatum bieten. Bewusst später oder gar nicht: Kategorien, Wiederholungen, Erinnerungen, Sortierung per Drag-and-drop, Teilen und Synchronisation zwischen Geräten.

## Success Metrics
- Eine neue Aufgabe lässt sich in unter 5 Sekunden erfassen (Text tippen, Enter).
- Die Aufgaben bleiben nach Neuladen und Browser-Neustart erhalten.
- Alle Kernaktionen sind per Tastatur bedienbar, und die Seite besteht einen Lighthouse-Accessibility-Check mit mindestens 95 Punkten.

## Constraints
- Tech-Stack: Next.js, Tailwind und shadcn/ui, wie im Projekt-Template.
- Kein Backend: Daten liegen nur im Browser (localStorage). Keine Konten, keine personenbezogenen Daten auf Servern.
- Qualitätsstufe: Standard.
- Design-System: siehe `docs/design-system.md`.
- Hosting: noch offen, wird bei `/deploy` entschieden.

## Non-Goals
Keine Benutzerkonten, keine Synchronisation zwischen Geräten, keine geteilten Listen, keine Benachrichtigungen, keine Kategorien oder Tags, keine native App.

---

Nächster Schritt: `/write-spec` für die Features in `features/INDEX.md`.
