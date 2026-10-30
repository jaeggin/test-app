# Datenmodell

> Die produktweite Karte von **welche Daten das Produkt speichert und wie sie zusammenhängen** — der gemeinsame Bauplan, dem die Daten jedes Features entsprechen.
>
> - Erstellt von `/init` (erster Gesamtentwurf: Entitäten + Beziehungen).
> - Verfeinert von `/architecture`, sobald ein Feature entworfen wird.
> - **Flughöhe:** Entitäten, Beziehungen und Besitz stehen hier (Produktebene). Datentypen und genaue Felder werden pro Feature in dessen `design.md` entschieden — nicht hier.

## Entitäten

| Entität | Was sie darstellt | Besitzer / wer sie sieht |
|---------|-------------------|--------------------------|
| `tasks` (Aufgabe) | Eine einzelne Aufgabe mit Titel, Erledigt-Status und optionalem Fälligkeitsdatum. | Die Person, die den Browser benutzt. Die Daten liegen nur lokal in diesem Browser (localStorage) und sind für niemand sonst sichtbar. |

## Beziehungen

- Es gibt nur diese eine Entität, und sie hat keine Beziehungen zu anderen.
- Die Aufgabenliste ist schlicht die Menge aller `tasks`.
- Die Reihenfolge der Liste (neueste oben) ist Teil der Daten und wird mitgespeichert; es gibt kein eigenes Sortierfeld.
- Der Filter (alle / offen / erledigt) ist eine Ansicht auf diese Liste und wird nicht gespeichert.
- Die Aufgaben liegen als ein einziges, versioniertes Dokument im Browser (Details: `features/PROJ-1-aufgaben-verwalten/design.md`).

## Wer ergänzt was

- PROJ-1 legt `tasks` an (Titel, Erledigt-Status).
- PROJ-2 ergänzt das optionale Fälligkeitsdatum.
- PROJ-3 ändert am Datenmodell nichts, sie filtert nur.

## Diagramm

```
(Browser-Nutzer:in)
  └─ besitzt viele tasks   (lokal gespeichert, localStorage)
```

---

_Dies ist ein lebendes Dokument. Wenn `/architecture` ein Feature entwirft, das eine Entität einführt oder ändert, aktualisiert es zuerst diese Karte, damit spätere Features auf einem korrekten Bild aufbauen._
