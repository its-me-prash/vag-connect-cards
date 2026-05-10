<p align="center">
  <img src="https://raw.githubusercontent.com/its-me-prash/vag-connect-ha/main/custom_components/vag_connect/logo.png" alt="VAG Connect" width="160">
</p>

<h1 align="center">VAG Connect Card</h1>

<p align="center">
  <strong>Home-Assistant Lovelace card für die <a href="https://github.com/its-me-prash/vag-connect-ha">VAG Connect</a> Integration</strong><br>
  <em>Audi · Volkswagen · Škoda · SEAT · CUPRA · Porsche · VW US/CA</em>
</p>

<p align="center">
  <a href="https://hacs.xyz"><img src="https://img.shields.io/badge/HACS-Custom-orange.svg" alt="HACS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://github.com/its-me-prash/vag-connect-cards/releases"><img src="https://img.shields.io/github/v/release/its-me-prash/vag-connect-cards?include_prereleases" alt="Version"></a>
</p>

---

## Was ist das

Eine Lovelace-Custom-Card, die deinen VAG-Fuhrpark schön darstellt. Sie liest **direkt die Entitäten der `vag_connect` Integration** und rendert sie als:

- **Brand-Header** mit Marken-Wordmark (AUDI · VW · ŠKODA · SEAT · CUPRA · PORSCHE), Modellname, VIN-Last-6, Online-Indikator
- **Image-Slider** mit deinen Fahrzeug-Renders
- **Range-Anzeige** mit Tank-/SoC-Balken
- **Mini-Map** mit GPS-Position aus `device_tracker.<auto>_position`
- **4 Slide-Cards**:
  - **Trip & Range** — Kilometerstand, Reichweiten, Tank, SoC, letzte Fahrt
  - **Vehicle Status** — Türen, Fenster, Ladekabel, Licht, Online-Status, Warnungen
  - **Service** — Service-Tage, Ölservice, 12-V-Spannung, OTA, Softwareversion, API-Kontingent
  - **Battery & Charging** — SoC-Donut, Ladeleistung, ETA, Lade-Typ, Ladestrom
- **Action-Buttons** für Lock/Unlock, Climate, Charging, Honk-Flash, Wake (via `vag_connect.*` Services)
- **Read-only-Modus-aware** (richtet sich nach dem Integration-Option `read_only_mode`)

Optik basiert auf [ngocjohn/vehicle-info-card](https://github.com/ngocjohn/vehicle-info-card) (MIT), die Card-Architektur, Daten-Discovery und alle Card-Inhalte wurden für VAG Connect neu gebaut.

---

## Voraussetzungen

- Home Assistant ≥ 2024.4
- [VAG Connect Integration](https://github.com/its-me-prash/vag-connect-ha) installiert + mindestens ein Fahrzeug konfiguriert

---

## Installation

### Via HACS (empfohlen)

1. HACS → **Frontend** → ⋮ → **Custom repositories**
2. URL: `https://github.com/its-me-prash/vag-connect-cards`
3. Kategorie: **Lovelace**
4. **VAG Connect Card** installieren
5. Home Assistant neu laden (`Ctrl+F5`)

### Manuell

1. Lade `vag-connect-card.js` aus dem [neuesten Release](https://github.com/its-me-prash/vag-connect-cards/releases)
2. Lege es nach `/config/www/vag-connect-card.js`
3. **Settings → Dashboards → ⋮ → Resources → Add resource**:
   - URL: `/local/vag-connect-card.js`
   - Type: **JavaScript Module**

---

## Konfiguration

### Minimum-Setup

```yaml
type: custom:vag-connect-card
entity: sensor.audi_a4_b9_battery_soc
```

Die Card erkennt automatisch das Device hinter `entity` und mappt alle weiteren VAG-Connect-Entitäten (`sensor.<vin>_*`, `binary_sensor.<vin>_*`, `image.<vin>_*`, `device_tracker.<vin>_position`).

### Vollkonfiguration

```yaml
type: custom:vag-connect-card
entity: sensor.audi_a4_b9_battery_soc
device_tracker: device_tracker.audi_a4_b9_position
model_name: Audi A4 B9 Avant
brand_logo_url: /local/my-audi-logo.svg   # optional custom logo override
show_slides: true
show_buttons: true
show_map: true
show_header_info: true
show_background: true
enable_map_popup: true
enable_services_control: true
images:
  - url: https://example.com/audi-a4-front.jpg
    title: Front
  - url: https://example.com/audi-a4-side.jpg
    title: Side
map_popup_config:
  hours_to_show: 24
  default_zoom: 13
  theme_mode: auto
services:
  doorsLock: true
  charge: true
  preheat: true
  auxheat: true
selected_language: de
selected_theme:
  theme: default
  mode: auto
```

Alle Optionen sind außerdem über den **visuellen Editor** im Lovelace-Dashboard zugänglich.

---

## Marken-Branding

Die Card rendert standardmäßig die Marke als **Text-Wordmark** (AUDI / VW / ŠKODA / SEAT / CUPRA / PORSCHE / VW US / VAG) — bewusst kein Original-Hersteller-Logo, weil das public HACS-Repos markenrechtlich gefährdet.

Wenn du in deinem privaten HA-Setup ein echtes Logo zeigen willst:

```yaml
brand_logo_url: /local/logos/audi-rings.svg
```

Pfad zeigt auf jedes Asset, das HA via `/local/...` ausliefern kann.

---

## Action-Buttons

Die Card stellt die folgenden VAG-Connect-Services bereit (Action-Buttons-Reihe):

| Button | VAG Service | Erfordert |
|---|---|---|
| Lock | `vag_connect.lock` | — |
| Unlock | `vag_connect.unlock` | S-PIN bei einigen Marken |
| Climate Start | `vag_connect.start_climatisation` | — |
| Climate Stop | `vag_connect.stop_climatisation` | — |
| Charging Start | `vag_connect.start_charging` | — |
| Charging Stop | `vag_connect.stop_charging` | — |
| Honk & Flash | `vag_connect.flash_lights` | — |
| Wake | `vag_connect.wake_vehicle` | (zählt gegen Smart-Wake-Cap) |
| Refresh | `vag_connect.refresh_vehicle` | — |

Buttons werden **deaktiviert**, wenn die Integration im `read_only_mode` läuft (kein versehentliches Steuern in Automationen).

---

## Sprachen

- 🇩🇪 Deutsch (`de`)
- 🇬🇧 Englisch (`en`)
- 🇫🇷 Französisch (`fr`)

Auto-Erkennung aus `selected_language: system` (Default) oder explizit per `selected_language: de`.

---

## Status

Diese Card ist eine **Native-Migration** von `ngocjohn/vehicle-info-card` (Mercedes mbapi2020) auf VAG Connect. Aktuell **Beta** — Optik 1:1 vom Original übernommen, Daten/Discovery/Services komplett auf VAG umgebaut.

Geplante Features (Future-Releases):
- 🪄 **Setup-Wizard** im Editor — Dropdown-Auswahl deiner VAG-Connect-Devices + Tickboxen für Sektionen (statt manuellem YAML)
- 🖼️ **Auto-Image-Slider** der `image.<vin>_render_*` Entities ohne manuelle URL-Pflege
- 🎨 Optionale eingebettete Hersteller-Logo-Assets (falls Markenrechte geklärt)

---

## Credits

- Basis-Architektur, Editor-Framework, Slide-Carousel, CSS-Layout: [ngocjohn/vehicle-info-card](https://github.com/ngocjohn/vehicle-info-card) (MIT)
- VAG-Connect-Migration, Entity-Discovery, Marken-Header, Service-Mapping: [@its-me-prash](https://github.com/its-me-prash)
- VAG-Connect-HA-Integration: [`its-me-prash/vag-connect-ha`](https://github.com/its-me-prash/vag-connect-ha)

---

## Lizenz

MIT — siehe [`LICENSE`](LICENSE).
