import { version, repository } from '../../package.json';

export const CARD_VERSION = `v${version}`;
export const CARD_UPADE_SENSOR = 'update.canyonero_card_update';
export const REPOSITORY = repository.url.replace('https://github.com/', '');

export const PREVIEW_CONFIG_TYPES = ['btn_preview', 'card_preview', 'tire_preview'];

// ---------------------------------------------------------------------------
// Multi-integration support
// ---------------------------------------------------------------------------
//
// Canyonero is integration-agnostic — it works with any HA integration that
// publishes per-vehicle `sensor.*` / `binary_sensor.*` / `image.*` /
// `device_tracker.*` entities. We ship presets for the most common car
// integrations; users can switch via the `integration:` config key
// (default: `vag_connect`).
//
// A preset declares:
//   - `domain`: HA config-entry domain to filter the device-registry by
//     (or `null` to skip integration-filtering — purely entity-driven)
//   - `filters`: semantic-key → unique_id-suffix map. Entity discovery
//     walks the anchor device's entities and matches each filter against
//     the unique_id (preferred) or entity_id suffix.
//   - `services`: semantic-action → `<domain>.<service>` map. The action-
//     button row reads from this when firing commands.
//
// Adding a new integration = one new preset entry; the rest of the card
// adapts automatically.

export interface IntegrationPreset {
  domain: string | null;
  filters: Record<string, { prefix?: string; suffix: string }>;
  services: Record<string, string>;
}

// VAG Connect — the canonical implementation, full coverage of all
// translation_keys the integration exposes (see custom_components/
// vag_connect/entity_base.py for `<VIN>_<key>` unique_id pattern).
const VAG_CONNECT_PRESET: IntegrationPreset = {
  domain: 'vag_connect',
  filters: {
    // ---- binary sensors -------------------------------------------------
    doorsLocked: { suffix: '_doors_locked' },
    doorsOpen: { suffix: '_doors_open' },
    windowsOpen: { suffix: '_windows_open' },
    plugConnected: { suffix: '_plug_connected' },
    connectorLocked: { suffix: '_connector_locked' },
    isCharging: { suffix: '_is_charging' },
    isDriving: { suffix: '_is_driving' },
    isOnline: { suffix: '_is_online' },
    lightsOn: { suffix: '_lights_on' },
    climatisationActive: { suffix: '_climatisation_active' },
    windowHeatingEnabled: { suffix: '_window_heating_enabled' },
    windowHeatingFront: { suffix: '_window_heating_front' },
    windowHeatingBack: { suffix: '_window_heating_back' },
    batteryCareEnabled: { suffix: '_battery_care_enabled' },
    climateAtUnlock: { suffix: '_climate_at_unlock' },
    autoUnlockWhenCharged: { suffix: '_auto_unlock_when_charged' },
    otaUpdateAvailable: { suffix: '_ota_update_available' },
    warning12vLow: { suffix: '_warning_12v_low' },
    warningActive: { suffix: '_warning_active' },
    warningBrakes: { suffix: '_warning_brakes' },
    warningEngine: { suffix: '_warning_engine' },
    warningOil: { suffix: '_warning_oil' },
    warningTyre: { suffix: '_warning_tyre' },
    // ---- battery / charging --------------------------------------------
    soc: { suffix: '_battery_soc' },
    targetSoc: { suffix: '_target_soc' },
    batteryCareTargetSoc: { suffix: '_battery_care_target_soc_pct' },
    chargingPower: { suffix: '_charging_power_kw' },
    chargingRate: { suffix: '_charging_rate_kmh' },
    chargeCompleteEta: { suffix: '_charge_complete_eta' },
    chargingType: { suffix: '_charging_type' },
    chargingState: { suffix: '_charging_state' },
    plugState: { suffix: '_plug_state' },
    maxChargeCurrent: { suffix: '_max_charge_current_a' },
    totalChargedEnergy: { suffix: '_total_charged_energy_kwh' },
    lastChargingSessionKwh: { suffix: '_last_charging_session_kwh' },
    lastChargingSessionDuration: { suffix: '_last_charging_session_duration_min' },
    activeChargingProfileName: { suffix: '_active_charging_profile_name' },
    activeChargingProfileTargetSoc: { suffix: '_active_charging_profile_target_soc_pct' },
    // ---- range / fuel ---------------------------------------------------
    fuelLevel: { suffix: '_fuel_level' },
    adblueRange: { suffix: '_adblue_range_km' },
    rangeElectric: { suffix: '_electric_range_km' },
    rangeCombustion: { suffix: '_combustion_range_km' },
    rangeTotal: { suffix: '_total_range_km' },
    rangeLegacy: { suffix: '_range_km' },
    secondaryEngineRange: { suffix: '_secondary_engine_range_km' },
    // ---- position / driving --------------------------------------------
    odometer: { suffix: '_odometer_km' },
    outsideTemp: { suffix: '_outside_temp' },
    batteryTemp: { suffix: '_battery_temp' },
    voltage12v: { suffix: '_voltage_12v' },
    vehicleState: { suffix: '_vehicle_state' },
    connectionState: { suffix: '_connection_state' },
    parkingAddress: { suffix: '_parking_address' },
    parkingCity: { suffix: '_parking_city' },
    // ---- climate -------------------------------------------------------
    climatisationState: { suffix: '_climatisation_state' },
    targetTemperature: { suffix: '_target_temperature' },
    // ---- service / diagnostics -----------------------------------------
    serviceDueInDays: { suffix: '_service_due_in_days' },
    serviceDueAt: { suffix: '_service_due_at' },
    serviceKm: { suffix: '_service_km' },
    oilServiceDueInDays: { suffix: '_oil_service_due_in_days' },
    oilServiceAt: { suffix: '_oil_service_at' },
    oilServiceKm: { suffix: '_oil_service_km' },
    softwareVersion: { suffix: '_software_version' },
    licensePlate: { suffix: '_license_plate' },
    requestsRemaining: { suffix: '_requests_remaining_today' },
    wakeCountToday: { suffix: '_wake_count_today' },
    lastUpdatedAt: { suffix: '_last_updated_at' },
    // ---- last trip -----------------------------------------------------
    lastTripDistance: { suffix: '_last_trip_distance_km' },
    lastTripAvgSpeed: { suffix: '_last_trip_avg_speed_kmh' },
    lastTripAvgFuelConsumption: { suffix: '_last_trip_avg_fuel_consumption_l_100km' },
    lastTripAvgElectricConsumption: { suffix: '_last_trip_avg_electric_consumption_kwh_100km' },
  },
  services: {
    refresh: 'refresh_vehicle',
    refreshCache: 'refresh_cloud_cache',
    lock: 'lock',
    unlock: 'unlock',
    startClimate: 'start_climatisation',
    stopClimate: 'stop_climatisation',
    startCharging: 'start_charging',
    stopCharging: 'stop_charging',
    flashLights: 'flash_lights',
    startWindowHeating: 'start_window_heating',
    stopWindowHeating: 'stop_window_heating',
    startVentilation: 'start_ventilation',
    stopVentilation: 'stop_ventilation',
    startAuxHeating: 'start_aux_heating',
    stopAuxHeating: 'stop_aux_heating',
    wake: 'wake_vehicle',
    engineStart: 'engine_start',
    engineStop: 'engine_stop',
    setTargetSoc: 'set_target_soc',
    setClimateTemp: 'set_climatisation_temperature',
    setDepartureTimer: 'set_departure_timer',
    sendDestination: 'send_destination',
  },
};

// Tesla Custom Integration (tesla_custom) — common keys only; users can
// always override via `extra_filters:` once that lands in v0.0.4.
const TESLA_CUSTOM_PRESET: IntegrationPreset = {
  domain: 'tesla_custom',
  filters: {
    soc: { suffix: '_battery' },
    targetSoc: { suffix: '_charge_limit' },
    rangeElectric: { suffix: '_battery_range' },
    chargingPower: { suffix: '_charger_power' },
    chargingState: { suffix: '_charger' },
    plugState: { suffix: '_charger_plug' },
    odometer: { suffix: '_odometer' },
    outsideTemp: { suffix: '_outside_temp' },
    batteryTemp: { suffix: '_battery_heater' },
    isCharging: { suffix: '_charger' },
    isOnline: { suffix: '_online' },
    doorsLocked: { suffix: '_doors_locked' },
    softwareVersion: { suffix: '_software_update_version' },
  },
  services: {
    lock: 'lock_doors',
    unlock: 'unlock_doors',
    startClimate: 'climate_on',
    stopClimate: 'climate_off',
    startCharging: 'charging_start',
    stopCharging: 'charging_stop',
    flashLights: 'flash_lights',
    wake: 'wake_up',
  },
};

// Mercedes-Benz mbapi2020 — partial coverage, kept for users coming
// over from ngocjohn/vehicle-info-card. Only the entity keys Canyonero
// actually renders are mapped; Mercedes-only concepts (eco scores,
// per-wheel pressures) have no card surface in Canyonero.
const MBAPI2020_PRESET: IntegrationPreset = {
  domain: 'mbapi2020',
  filters: {
    soc: { prefix: 'sensor.', suffix: 'soc' },
    targetSoc: { prefix: 'sensor.', suffix: '_max_state_of_charge' },
    rangeElectric: { suffix: '_rangeelectrickm' },
    rangeCombustion: { suffix: '_rangeliquid' },
    fuelLevel: { suffix: '_tanklevelpercent' },
    adblueRange: { suffix: '_tankleveladblue' },
    chargingPower: { suffix: '_chargingpowerkw' },
    odometer: { suffix: '_odometer' },
    doorsLocked: { prefix: 'lock', suffix: '_lock' },
    windowsOpen: { suffix: '_windowstatusoverall' },
    warningTyre: { suffix: '_tirewarninglamp' },
  },
  services: {
    // mbapi2020 services are not invoked from Canyonero's action row
    // (they require an SPIN and have a different shape). Users who
    // need them can wire custom buttons via the editor.
  },
};

// Generic / fallback — no integration filter at all, purely entity-
// suffix-driven. Useful for installs where the integration domain is
// unknown or where the user maintains a thin custom integration.
const GENERIC_PRESET: IntegrationPreset = {
  domain: null,
  filters: VAG_CONNECT_PRESET.filters,
  services: {},
};

export const INTEGRATION_PRESETS: Record<string, IntegrationPreset> = {
  vag_connect: VAG_CONNECT_PRESET,
  tesla_custom: TESLA_CUSTOM_PRESET,
  mbapi2020: MBAPI2020_PRESET,
  generic: GENERIC_PRESET,
};

export type IntegrationKey = keyof typeof INTEGRATION_PRESETS;
export const DEFAULT_INTEGRATION: IntegrationKey = 'vag_connect';

/** Resolve a preset by key, with VAG fallback. */
export function getPreset(key: string | undefined): IntegrationPreset {
  if (!key) return INTEGRATION_PRESETS[DEFAULT_INTEGRATION];
  return INTEGRATION_PRESETS[key] || INTEGRATION_PRESETS[DEFAULT_INTEGRATION];
}

// ---------------------------------------------------------------------------
// Brand wordmarks
// ---------------------------------------------------------------------------
//
// All known brand identifiers; the card looks up `device.manufacturer`
// against this list to render a styled wordmark in the header. Unknown
// brands fall back to the literal manufacturer string.

export const KNOWN_BRANDS = [
  // VAG group
  'audi',
  'volkswagen',
  'skoda',
  'seat',
  'cupra',
  'porsche',
  'volkswagen_na',
  // Non-VAG
  'tesla',
  'bmw',
  'mercedes',
  'toyota',
  'volvo',
  'ford',
  'hyundai',
  'kia',
  'nissan',
  'mazda',
  'honda',
  'subaru',
] as const;
export type KnownBrand = (typeof KNOWN_BRANDS)[number];

// Back-compat alias: ha-helpers still imports `VagBrand` in a few places.
// New code should prefer `KnownBrand`.
export type VagBrand = KnownBrand;
export const VAG_BRANDS = KNOWN_BRANDS;

// Back-compat shims for the v0.0.x cycle — callers that imported these
// directly keep compiling while we migrate them to the preset-based API.
// Will be removed in v0.0.3.
export const VAG_DOMAIN = 'vag_connect';
export const VAG_SERVICES = VAG_CONNECT_PRESET.services as Record<string, string>;
export const combinedFilters = VAG_CONNECT_PRESET.filters;
