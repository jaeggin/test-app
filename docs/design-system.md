# Design-System

> Konkrete Werte, die `/build` bei jedem Feature anwendet, ohne nachzufragen.
> Quelle: Jäggin-Farbpalette (vom Betreiber geliefert) und Grundhaltung «minimalistisch».
> Zwei Abweichungen von der Palette sind bewusst und unten begründet (Kontrast).

## Grundhaltung

Minimalistisch. Viel Weissraum, keine Schatten, Flächen werden mit 1-px-Linien getrennt.
Jäggin Orange kommt sparsam und gezielt zum Einsatz (Hauptaktion, Abgehaktes, aktiver Filter).

## Farben

### Hell

| Token | Wert | Verwendung |
|---|---|---|
| `background` | `#FFFFFF` | Seite |
| `surface` | `#F5F5F5` | Karten, Eingabefelder, Filterleiste |
| `foreground` | `#000001` | Haupttext, Titel |
| `muted-foreground` | `#6B6B6B` | Datum, Hinweise, erledigte Aufgaben (Text) |
| `muted-icon` | `#999999` | Icons, Platzhalter, nicht als Textfarbe |
| `border` | `#E5E5E5` | Trennlinien, Feldränder |
| `primary` | `#FF7C00` | Hauptbutton, abgehaktes Kästchen, aktiver Filter |
| `primary-hover` | `#E67000` | Hover auf Primärflächen |
| `primary-active` | `#CC6300` | Gedrückt |
| `primary-subtle` | `#FFF1E3` | Leichte Hervorhebung (z. B. ausgewählte Zeile) |
| `primary-foreground` | `#000001` | Text auf Orange |
| `accent` | `#00B7D9` | Fälligkeit «heute», Info-Markierungen |
| `accent-foreground` | `#000001` | Text auf Blau |
| `destructive` | `#C62828` | Löschen, überfällige Aufgaben |
| `destructive-foreground` | `#FFFFFF` | Text auf Destruktiv-Fläche |

### Dunkel

| Token | Wert |
|---|---|
| `background` | `#111111` |
| `surface` | `#1C1C1C` |
| `foreground` | `#F2F2F2` |
| `muted-foreground` | `#A3A3A3` |
| `muted-icon` | `#8A8A8A` |
| `border` | `#2E2E2E` |
| `primary` / `-hover` / `-active` | `#FF7C00` / `#FF8F26` / `#E67000` |
| `primary-subtle` | `#2A1A0A` |
| `primary-foreground` | `#000001` |
| `accent` | `#00B7D9` |
| `destructive` | `#EF5350` |

### Kontrast-Regeln (Text mind. 4.5:1, in beiden Themes)

1. **Grau Mittel `#999999` hat auf Weiss nur etwa 2.9:1.** Für Text gilt `#6B6B6B` (etwa 5.3:1), das originale Grau bleibt Icons und Platzhaltern vorbehalten.
2. **Jäggin Orange `#FF7C00` hat auf Weiss nur etwa 2.6:1.** Orange ist nie eine Textfarbe, nur Fläche. Text darauf ist schwarz (etwa 8:1).
3. **Jäggin Blau `#00B7D9` hat auf Weiss nur etwa 2.4:1.** Gleiche Regel: nur Fläche oder Markierung, nie Textfarbe auf hellem Grund.

**Reines Schwarz/Weiss:** Im Hell-Modus gelten `#000001` und `#FFFFFF` unverändert, weil das Corporate Design sie festlegt. Im Dunkel-Modus ist der Hintergrund Near-Black (`#111111`), weil `#000001` dort hart wirkt.

## Typografie

- Schrift: Inter (Alternative: Geist, der Next.js-Standard)
- Grössen: 14 / 16 / 20 / 28 px
- Gewichte: 400 für Text, 600 für Titel

## Form und Raster

- **Eine Rundung für alles:** 8 px (`--radius: 0.5rem`)
- Abstände im 4-px-Raster
- Keine Schatten; Flächen werden durch `border` (1 px) und `surface` getrennt

## Komponenten-Konventionen

- Standard-Button: Variante «primary» (Orange, schwarze Schrift), Grösse mittel
- Eingabefelder: Höhe 40 px, Fläche `surface`, Rand `border`
- Erledigte Aufgaben: durchgestrichen, `muted-foreground`
- Leerer Zustand: ein Satz Text, keine Illustration
- Ladezustand: dezente Platzhalterflächen in `surface`

## Interaktion

- Jedes bedienbare Element hat einen sichtbaren **Hover**- und **Fokus**-Zustand.
- Fokus: 2-px-Ring mit 2 px Abstand; hell in `#000001`, dunkel in `#FF7C00`.
- Orange hat nie eine flache Einheitsfläche: Hover, Aktiv und Subtil sind oben definiert.
