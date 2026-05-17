<h1 align="center">🚙 Canyonero</h1>

<p align="center">
  <strong>Universal vehicle dashboard card for Home Assistant</strong><br>
  <em>VAG Connect · Mercedes mbapi2020 · Tesla · BMW · works with most car integrations</em>
</p>

<p align="center">
  <a href="https://hacs.xyz"><img src="https://img.shields.io/badge/HACS-Custom-orange.svg" alt="HACS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://github.com/its-me-prash/vag-connect-cards/releases"><img src="https://img.shields.io/github/v/release/its-me-prash/vag-connect-cards" alt="Version"></a>
</p>

---

## Was es ist

Eine Lovelace-Karte, die dein Auto schön darstellt — egal ob VW, Audi, Škoda, SEAT, CUPRA, Porsche, Mercedes, Tesla oder eine andere Marke. Sie spricht direkt mit der Integration, die dein Auto in Home Assistant verbunden hat, und rendert die Daten als:

- **Brand-Header** mit Marken-Wordmark, Modell, VIN-Last-6 und Online-Indikator
- **Image-Slider** mit deinen Fahrzeug-Renders (auto-discovery)
- **Range-Bar** mit Tank- und SoC-Anzeige
- **Mini-Map** mit GPS-Position (auto-discovery vom Device-Tracker)
- **4 Slide-Cards**:
  - **Trip & Range** — Kilometerstand, Reichweiten, Tank, SoC, letzte Fahrt
  - **Vehicle Status** — Türen, Fenster, Ladekabel, Licht, Online, Warnungen
  - **Service & Diagnose** — Service-Tage, Ölservice, 12-V, OTA, Software, API-Quota
  - **Akku & Laden** — SoC-Donut mit Charging-Pulse-Animation, Lade-Stats
- **Action-Buttons** für Lock / Unlock / Climate / Charging / Honk-Flash / Wake / Refresh
- **Read-only-Modus** respektiert die `read_only_mode`-Option deiner Integration

---

## Voraussetzungen

- Home Assistant ≥ 2024.4
- Eine der unterstützten Car-Integrationen mit mindestens einem Fahrzeug:
  - [VAG Connect](https://github.com/its-me-prash/vag-connect-ha) (VW / Audi / Škoda / SEAT / CUPRA / Porsche / VW US/CA) — bestmöglicher Support
  - Mercedes mbapi2020 — funktioniert mit angepasster `entity:` Konfiguration
  - Tesla, BMW, andere Marken — funktioniert in der Regel out-of-the-box wenn die Integration `sensor.<auto>_*` Entitäten exponiert

---

## Installation (HACS)

1. HACS → **Frontend** → ⋮ → **Custom repositories**
2. URL: `https://github.com/its-me-prash/vag-connect-cards`
3. Kategorie: **Dashboard**
4. **Canyonero** installieren
5. HA hart refreshen (`Strg+Shift+R`)

---

## Minimum-Konfiguration

```yaml
type: custom:canyonero-vehicle-dashboard
entity: sensor.<dein_auto>_battery_soc
```

Wähle irgendeinen Sensor deines Autos — die Karte resolved daraus das Device + alle weiteren Entitäten + Bilder + GPS-Tracker automatisch aus dem Device-Registry.

---

## Voll-Konfiguration

```yaml
type: custom:canyonero-vehicle-dashboard
entity: sensor.audi_a4_b9_battery_soc
device_tracker: device_tracker.audi_a4_b9_position
model_name: Audi A4 B9 Avant
brand_logo_url: /local/my-audi-logo.svg    # optional, custom Logo
show_slides: true
show_buttons: true
show_map: true
show_header_info: true
enable_services_control: true
images:
  - url: https://example.com/audi-a4-front.jpg
    title: Front
map_popup_config:
  hours_to_show: 24
  default_zoom: 13
  theme_mode: auto
services:
  doorsLock: true
  charge: true
  preheat: true
selected_language: de
```

Alle Optionen sind auch über den **visuellen Editor** verfügbar.

---

## Branding

Die Karte rendert die Marke standardmäßig als **Text-Wordmark** (AUDI · VW · ŠKODA · SEAT · CUPRA · PORSCHE · VW US · VAG). Bewusst keine Original-Hersteller-Logos out-of-the-box (Markenrechte). Wenn du dein eigenes Logo zeigen willst:

```yaml
brand_logo_url: /local/logos/audi-rings.svg
```

---

## Sprachen

- 🇩🇪 Deutsch (`de`)
- 🇬🇧 English (`en`)
- 🇫🇷 Français (`fr`)

Auto-Detection über `selected_language: system` (Default) oder explizit via `selected_language: de`.

---

## Easter Eggs

Öffne F12 → Console und tippe `canyonero.about()`. Wirf einen Blick aufs Brand-Header — Triple-Click rotiert. Mehr findest du selbst.

---

## Roadmap

- 🪄 Setup-Wizard im Editor (Device-Dropdown + Sektionen-Tickboxen)
- 🚗 Multi-Integration-Support per Config-Key `integration:`
- 🎨 Mehr Brand-Wordmarks (Tesla, BMW, Mercedes, Toyota, Volvo, Ford, Hyundai, Kia)

---

## Warum heißt es Canyonero?

[Die SUV-Werbung aus den Simpsons](https://simpsons.fandom.com/wiki/Canyonero) (S9E15). Plus: subtile Refs zu *How I Met Your Mother* und *Big Bang Theory* sind im Code versteckt. Suit up.

---

## Lizenz

MIT — siehe [`LICENSE`](LICENSE).

Originale Card-Architektur basiert auf einem MIT-lizenzierten Lovelace-Vorgänger; diese Karte ist davon abgespalten und für Multi-Brand-VAG-Integration komplett umgebaut.
