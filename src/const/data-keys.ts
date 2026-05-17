import { localize } from '../localize/localize';
import { CardTypeConfig } from '../types/card-types';

const createShowOpts = (nameKey: string, lang: string, configKey: string) => ({
  label: localize(nameKey, lang),
  configKey,
});

export const editorShowOpts = (lang: string) => [
  createShowOpts('editor.showOpts.show_slides', lang, 'show_slides'),
  createShowOpts('editor.showOpts.show_buttons', lang, 'show_buttons'),
  createShowOpts('editor.showOpts.show_map', lang, 'show_map'),
  createShowOpts('editor.showOpts.show_header_info', lang, 'show_header_info'),
  createShowOpts('editor.showOpts.show_background', lang, 'show_background'),
  createShowOpts('editor.showOpts.enable_map_popup', lang, 'enable_map_popup'),
  createShowOpts('editor.showOpts.show_address', lang, 'show_address'),
  createShowOpts('editor.showOpts.enable_services_control', lang, 'enable_services_control'),
  createShowOpts('editor.showOpts.show_error_notify', lang, 'show_error_notify'),
];

const createCard = (key: string, icon: string, config: string, button: string, lang: string): CardTypeConfig => ({
  type: key,
  name: localize(`card.cardType.${key}`, lang),
  icon,
  config,
  button,
});

/**
 * The four card slots — internal keys are kept identical to the original
 * mbapi2020 layout (tripCards/vehicleCards/ecoCards/tyreCards) so that
 * legacy user YAML and the card-config types continue to work, but each
 * slot has been re-purposed for VAG Connect data:
 *
 *   tripCards    → Trip & Range  (odometer, ranges, fuel, SoC, last-trip)
 *   vehicleCards → Vehicle Status (doors, windows, plug, lights, warnings)
 *   ecoCards     → Service & Diagnostics (service days, 12V, OTA, software)
 *   tyreCards    → Battery & Charging (charging power/rate/type/ETA)
 */
export const cardTypes = (lang: string) => [
  createCard('tripCards', 'mdi:road-variant', 'trip_card', 'trip_button', lang),
  createCard('vehicleCards', 'mdi:car-info', 'vehicle_card', 'vehicle_button', lang),
  createCard('ecoCards', 'mdi:wrench-clock', 'eco_card', 'eco_button', lang),
  createCard('tyreCards', 'mdi:battery-charging', 'tyre_card', 'tyre_button', lang),
];

export type CardItem = {
  key: string;
  name: string;
  icon?: string;
};

const createItem = (key: string, nameKey: string, lang: string, icon?: string): CardItem => ({
  key,
  name: localize(`card.${nameKey}`, lang),
  ...(icon ? { icon } : {}),
});

// --- Trip & Range ----------------------------------------------------------

const tripOverview = (lang: string): CardItem[] => [
  createItem('odometer', 'tripCard.odometer', lang, 'mdi:counter'),
  createItem('rangeTotal', 'tripCard.rangeTotal', lang, 'mdi:map-marker-distance'),
  createItem('rangeElectric', 'tripCard.rangeElectric', lang, 'mdi:lightning-bolt'),
  createItem('rangeCombustion', 'tripCard.rangeCombustion', lang, 'mdi:gas-station'),
  createItem('fuelLevel', 'tripCard.fuelLevel', lang, 'mdi:fuel'),
  createItem('adblueRange', 'tripCard.adblueRange', lang),
  createItem('soc', 'tripCard.soc', lang, 'mdi:battery-high'),
  createItem('targetSoc', 'tripCard.targetSoc', lang),
];

const lastTripStats = (lang: string): CardItem[] => [
  createItem('lastTripDistance', 'tripCard.lastTripDistance', lang, 'mdi:map-marker-path'),
  createItem('lastTripAvgSpeed', 'tripCard.lastTripAvgSpeed', lang, 'mdi:speedometer'),
  createItem('lastTripAvgFuelConsumption', 'tripCard.lastTripAvgFuelConsumption', lang, 'mdi:gas-station'),
  createItem('lastTripAvgElectricConsumption', 'tripCard.lastTripAvgElectricConsumption', lang, 'mdi:lightning-bolt'),
  createItem('outsideTemp', 'tripCard.outsideTemp', lang, 'mdi:thermometer'),
  createItem('batteryTemp', 'tripCard.batteryTemp', lang, 'mdi:thermometer-low'),
];

// --- Vehicle Status --------------------------------------------------------

const vehicleOverview = (lang: string): CardItem[] => [
  createItem('doorsLocked', 'vehicleCard.doorsLocked', lang, 'mdi:car-door-lock'),
  createItem('doorsOpen', 'vehicleCard.doorsOpen', lang, 'mdi:car-door'),
  createItem('windowsOpen', 'vehicleCard.windowsOpen', lang, 'mdi:window-closed-variant'),
  createItem('plugConnected', 'vehicleCard.plugConnected', lang, 'mdi:ev-plug-type2'),
  createItem('lightsOn', 'vehicleCard.lightsOn', lang, 'mdi:car-light-high'),
  createItem('isOnline', 'vehicleCard.isOnline', lang, 'mdi:wifi'),
];

const vehicleWarnings = (lang: string): CardItem[] => [
  createItem('warning12vLow', 'vehicleCard.warning12vLow', lang, 'mdi:car-battery'),
  createItem('warningActive', 'vehicleCard.warningActive', lang, 'mdi:alert'),
  createItem('warningOil', 'vehicleCard.warningOil', lang, 'mdi:oil'),
  createItem('warningTyre', 'vehicleCard.warningTyre', lang, 'mdi:tire'),
  createItem('warningBrakes', 'vehicleCard.warningBrakes', lang, 'mdi:car-brake-alert'),
  createItem('warningEngine', 'vehicleCard.warningEngine', lang, 'mdi:engine'),
];

// --- Service & Diagnostics -------------------------------------------------

const serviceOverview = (lang: string): CardItem[] => [
  createItem('serviceDueInDays', 'ecoCard.serviceDueInDays', lang, 'mdi:wrench-clock'),
  createItem('serviceKm', 'ecoCard.serviceKm', lang, 'mdi:map-marker-distance'),
  createItem('oilServiceDueInDays', 'ecoCard.oilServiceDueInDays', lang, 'mdi:oil'),
  createItem('oilServiceKm', 'ecoCard.oilServiceKm', lang),
  createItem('voltage12v', 'ecoCard.voltage12v', lang, 'mdi:car-battery'),
  createItem('softwareVersion', 'ecoCard.softwareVersion', lang, 'mdi:numeric'),
];

const diagnosticsOverview = (lang: string): CardItem[] => [
  createItem('otaUpdateAvailable', 'ecoCard.otaUpdateAvailable', lang, 'mdi:cloud-download'),
  createItem('requestsRemaining', 'ecoCard.requestsRemaining', lang, 'mdi:gauge'),
  createItem('wakeCountToday', 'ecoCard.wakeCountToday', lang, 'mdi:alarm'),
  createItem('connectionState', 'ecoCard.connectionState', lang, 'mdi:cloud-check'),
  createItem('lastUpdatedAt', 'ecoCard.lastUpdatedAt', lang, 'mdi:clock-check'),
];

// --- Battery & Charging ----------------------------------------------------

const chargingOverview = (lang: string): CardItem[] => [
  createItem('soc', 'chargingOverview.soc', lang, 'mdi:battery-high'),
  createItem('targetSoc', 'chargingOverview.targetSoc', lang, 'mdi:battery-charging-100'),
  createItem('chargingState', 'chargingOverview.chargingState', lang, 'mdi:battery-charging'),
  createItem('plugState', 'chargingOverview.plugState', lang, 'mdi:ev-plug-type2'),
];

const chargingDetails = (lang: string): CardItem[] => [
  createItem('chargingPower', 'tyreCard.chargingPower', lang, 'mdi:flash'),
  createItem('chargingRate', 'tyreCard.chargingRate', lang, 'mdi:speedometer'),
  createItem('chargingType', 'tyreCard.chargingType', lang, 'mdi:ev-station'),
  createItem('chargeCompleteEta', 'tyreCard.chargeCompleteEta', lang, 'mdi:timer'),
  createItem('maxChargeCurrent', 'tyreCard.maxChargeCurrent', lang, 'mdi:current-ac'),
  createItem('totalChargedEnergy', 'tyreCard.totalChargedEnergy', lang, 'mdi:counter'),
];

// --- Climate ---------------------------------------------------------------

const climateOverview = (lang: string): CardItem[] => [
  createItem('climatisationState', 'climateOverview.climatisationState', lang, 'mdi:air-conditioner'),
  createItem('targetTemperature', 'climateOverview.targetTemperature', lang, 'mdi:thermometer'),
];

/**
 * Returns the data-key map consumed by the card body to render each
 * section. Sub-section identifiers (tripOverview, vehicleOverview, …)
 * remain stable across the Mercedes → VAG rework so card-render code
 * keeps working; only the items they contain swap to VAG-native keys.
 *
 * Legacy slots `tripFromReset`, `tripFromStart`, `precondSeats`,
 * `precondTemps`, `ecoScores`, `tyrePressures` are now empty —
 * those Mercedes-only concepts have no equivalent on the VAG side.
 */
export const baseDataKeys = (lang: string) => ({
  tripOverview: tripOverview(lang),
  lastTripStats: lastTripStats(lang),
  vehicleOverview: vehicleOverview(lang),
  vehicleWarnings: vehicleWarnings(lang),
  serviceOverview: serviceOverview(lang),
  diagnosticsOverview: diagnosticsOverview(lang),
  chargingOverview: chargingOverview(lang),
  chargingDetails: chargingDetails(lang),
  climateOverview: climateOverview(lang),
});
