# App Shell & Navigation

> Die produktweite Karte von **dem Rahmen, in dem jedes Feature angezeigt wird** — Navigation, Layout-Bereiche und die Muster, die jede Seite wiederholt.
>
> - Erstellt von `/init` (erster Gesamtentwurf: Bereiche + Layout).
> - Verfeinert von `/architecture`, sobald ein Feature entworfen wird.
> - **Flughöhe:** Struktur, nicht Gestaltung. Farben, Schriften und Komponentenstil stehen in `docs/design-system.md`; die Interna einer einzelnen Seite in der `design.md` des Features.

## Zuständiges Feature

Owner: PROJ-1 (Aufgaben verwalten) — das Feature, das den Bildschirm baut, in dem die Kopfzeile sitzt. Änderungen am Rahmen laufen über `/refine PROJ-1`.

Die App hat nur einen Bildschirm, daher gibt es kein eigenes App-Shell-Feature.

## Bereiche der Navigation

| Bereich | Was man dort tut | Sichtbar für | Zuständiges Feature |
|---------|------------------|--------------|---------------------|
| Aufgabenliste (`/`) | Aufgaben anlegen, abhaken, bearbeiten, löschen, filtern | alle (kein Login) | PROJ-1, mit Erweiterungen aus PROJ-2 und PROJ-3 |

## Layout-Bereiche

- **Navigation:** keine. Es gibt keine Seitenleiste und kein Menü.
- **Kopfzeile:** App-Titel links, Umschalter für Hell- und Dunkelmodus rechts.
- **Inhalt:** zentrierte, schmale Spalte (etwa 640 px). Oben das Eingabefeld für neue Aufgaben, darunter bei PROJ-3 die Filterleiste, darunter die Liste.
- **Mobil:** dieselbe Spalte füllt die Breite mit Seitenrand, keine Burger-Navigation.

## Seitenmuster

- **Seitenkopf:** Titel; die Hauptaktion ist das Eingabefeld für neue Aufgaben direkt darunter.
- **Ladezustand:** kurzer Moment, bis die Aufgaben aus dem Browser gelesen sind, mit dezenten Platzhalterflächen. Es gibt keine Server-Wartezeit.
- **Leerer Zustand:** ein Satz («Noch keine Aufgaben. Schreib die erste.») und Fokus im Eingabefeld, ohne Illustration.
- **Fehlerzustand:** Wenn localStorage nicht verfügbar ist (z. B. privater Modus oder voller Speicher), erscheint ein sichtbarer Hinweis, dass Änderungen nicht gespeichert werden.
- **Rückmeldungen:** kurze Hinweise (Toasts) unten mittig, z. B. «Aufgabe gelöscht» mit «Rückgängig».

## Auth-Zustände

Nicht vorhanden: keine Konten, keine Rollen.

## Gemeinsame Bausteine

| Komponente | Datei | Zweck |
|------------|-------|-------|
| `AppHeader` | `src/components/app-header.tsx` | Titel und Theme-Umschalter; gebaut von PROJ-1 |

---

_Dies ist ein lebendes Dokument. Wenn `/architecture` ein Feature entwirft, das einen Navigationseintrag, einen Layout-Bereich oder ein neues Seitenmuster hinzufügt, aktualisiert es zuerst diese Karte. Verhaltensänderungen am Rahmen laufen über `/refine` auf dem zuständigen Feature._
