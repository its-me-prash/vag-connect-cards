import { localize } from '../localize/localize';

/**
 * State-string translators for VAG Connect entity values.
 *
 * Sources:
 *   - sensor.py     translation_keys (charging_state, plug_state, vehicle_state,
 *                   connection_state, charging_type)
 *   - binary_sensor binary on/off semantics (doors_locked, plug_connected,
 *                   is_charging, is_online, lights_on, warning_*)
 *   - strings.json  (HA-side translation table for state values)
 *
 * The exported helpers (lockStates, doorStatus, ignitionState, …) keep
 * the same names as the Mercedes layout so vag-connect-card.ts can
 * render them without rewiring. The mapping bodies were rebuilt for
 * VAG semantics.
 */

const createStateMap = (stateMap: { [key: string]: string }, lang: string) => ({
  state: Object.keys(stateMap).reduce(
    (acc, key) => {
      acc[key] = localize(stateMap[key], lang);
      return acc;
    },
    {} as { [key: string]: string }
  ),
});

const createNameStateMap = (nameKey: string, stateMap: { [key: string]: string }, lang: string) => ({
  name: localize(nameKey, lang),
  ...createStateMap(stateMap, lang),
});

// --- Lock / Doors / Windows ------------------------------------------------

/** Sensor `doors_locked` (binary): on=unlocked, off=locked. */
export const lockStates = (lang: string) => ({
  on: localize('card.common.stateUnlocked', lang),
  off: localize('card.common.stateLocked', lang),
});

/** Sensor `doors_open` / `windows_open` (binary): on=open, off=closed. */
export const doorStatus = (lang: string) => ({
  on: localize('card.common.stateOpen', lang),
  off: localize('card.common.stateClosed', lang),
});

// --- Charging / Plug -------------------------------------------------------

/** sensor.<vin>_charging_state — Skoda/Audi/VW string values. */
export const chargingState = (lang: string) =>
  createStateMap(
    {
      charging: 'card.chargingState.charging',
      not_charging: 'card.chargingState.notCharging',
      ready_for_charging: 'card.chargingState.readyForCharging',
      conservation: 'card.chargingState.conservation',
      error: 'card.common.stateUnknown',
      off: 'card.chargingState.off',
      unsupported: 'card.common.stateUnknown',
    },
    lang
  );

/** sensor.<vin>_plug_state — connected / disconnected / locked. */
export const plugState = (lang: string) =>
  createStateMap(
    {
      connected: 'card.plugState.connected',
      disconnected: 'card.plugState.disconnected',
      invalid: 'card.common.stateUnknown',
    },
    lang
  );

/** sensor.<vin>_charging_type — ac / dc / off. */
export const chargingType = (lang: string) =>
  createStateMap(
    {
      ac: 'card.chargingType.ac',
      dc: 'card.chargingType.dc',
      off: 'card.chargingType.off',
      invalid: 'card.common.stateUnknown',
    },
    lang
  );

/** sensor.<vin>_climatisation_state — heating / cooling / off / ventilation. */
export const climatisationState = (lang: string) =>
  createStateMap(
    {
      heating: 'card.climateState.heating',
      cooling: 'card.climateState.cooling',
      ventilation: 'card.climateState.ventilation',
      off: 'card.climateState.off',
      invalid: 'card.common.stateUnknown',
    },
    lang
  );

/** sensor.<vin>_connection_state — online / offline / waking / unknown. */
export const connectionState = (lang: string) =>
  createStateMap(
    {
      online: 'card.connectionState.online',
      offline: 'card.connectionState.offline',
      waking: 'card.connectionState.waking',
      unknown: 'card.common.stateUnknown',
    },
    lang
  );

/** sensor.<vin>_vehicle_state — parked / driving / charging / climatizing. */
export const vehicleState = (lang: string) =>
  createStateMap(
    {
      parked: 'card.vehicleState.parked',
      driving: 'card.vehicleState.driving',
      charging: 'card.vehicleState.charging',
      climatizing: 'card.vehicleState.climatizing',
      ready: 'card.vehicleState.ready',
      unknown: 'card.common.stateUnknown',
    },
    lang
  );

// --- Door / Window per-position attribute tables ---------------------------
//
// VAG Connect aggregates doors/windows into single binary sensors
// (doors_open / windows_open) and exposes per-position state as
// `extra_state_attributes.detail` (an object: front_left, front_right,
// rear_left, rear_right, hood, trunk, sunroof — each open/closed/unknown).
// These tables let the sub-card view label each row.

export const doorAttributes = (lang: string) => ({
  front_left: createNameStateMap(
    'card.doorAttributes.frontLeft',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed' },
    lang
  ),
  front_right: createNameStateMap(
    'card.doorAttributes.frontRight',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed' },
    lang
  ),
  rear_left: createNameStateMap(
    'card.doorAttributes.rearLeft',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed' },
    lang
  ),
  rear_right: createNameStateMap(
    'card.doorAttributes.rearRight',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed' },
    lang
  ),
  trunk: createNameStateMap(
    'card.doorAttributes.trunk',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed' },
    lang
  ),
  hood: createNameStateMap(
    'card.doorAttributes.hood',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed' },
    lang
  ),
  sunroof: createNameStateMap(
    'card.doorAttributes.sunroof',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed' },
    lang
  ),
});

export const lockAttributes = (lang: string) => ({
  front_left: createNameStateMap(
    'card.lockAttributes.frontLeft',
    { unlocked: 'card.common.stateUnlocked', locked: 'card.common.stateLocked' },
    lang
  ),
  front_right: createNameStateMap(
    'card.lockAttributes.frontRight',
    { unlocked: 'card.common.stateUnlocked', locked: 'card.common.stateLocked' },
    lang
  ),
  rear_left: createNameStateMap(
    'card.lockAttributes.rearLeft',
    { unlocked: 'card.common.stateUnlocked', locked: 'card.common.stateLocked' },
    lang
  ),
  rear_right: createNameStateMap(
    'card.lockAttributes.rearRight',
    { unlocked: 'card.common.stateUnlocked', locked: 'card.common.stateLocked' },
    lang
  ),
});

export const windowAttributes = (lang: string) => ({
  front_left: createNameStateMap(
    'card.windowAttributes.frontLeft',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed', ventilation: 'card.windowState.ventilation' },
    lang
  ),
  front_right: createNameStateMap(
    'card.windowAttributes.frontRight',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed', ventilation: 'card.windowState.ventilation' },
    lang
  ),
  rear_left: createNameStateMap(
    'card.windowAttributes.rearLeft',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed', ventilation: 'card.windowState.ventilation' },
    lang
  ),
  rear_right: createNameStateMap(
    'card.windowAttributes.rearRight',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed', ventilation: 'card.windowState.ventilation' },
    lang
  ),
  sunroof: createNameStateMap(
    'card.windowAttributes.sunroof',
    { open: 'card.common.stateOpen', closed: 'card.common.stateClosed', tilt: 'card.windowState.tilt' },
    lang
  ),
});

