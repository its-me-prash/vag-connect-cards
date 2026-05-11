const HELPERS = (window as any).loadCardHelpers ? (window as any).loadCardHelpers() : undefined;

import { hasAction } from 'custom-card-helpers';
import memoizeOne from 'memoize-one';

import { combinedFilters, CARD_UPADE_SENSOR, CARD_VERSION, REPOSITORY, VAG_DOMAIN, VAG_SERVICES, VagBrand } from '../const/const';
import { baseDataKeys } from '../const/data-keys';
import { VehicleCardEditor } from '../editor';
import {
  HomeAssistant,
  VehicleEntities,
  VehicleEntity,
  VehicleCardConfig,
  BaseButtonConfig,
  CustomButtonEntity,
  CardTypeConfig,
  ButtonCardEntity,
  AddedCards,
  SECTION,
  defaultConfig,
  Address,
  ButtonActionConfig,
} from '../types';
import { LovelaceCardConfig } from '../types/ha-frontend/lovelace/lovelace';
import { VagConnectCard } from '../vag-connect-card';

// ---------------------------------------------------------------------------
// VAG Connect device + entity discovery
// ---------------------------------------------------------------------------

export interface VagConnectDevice {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  brand: VagBrand | undefined;
  /** Last 17 chars of unique_id that look VIN-like — best-effort. */
  vin?: string;
}

/**
 * Returns the list of HA devices that belong to the `vag_connect` integration.
 * Used by the editor's setup-wizard to populate a "pick your car" dropdown.
 */
export async function listVagConnectDevices(hass: HomeAssistant): Promise<VagConnectDevice[]> {
  const [devices, entries] = await Promise.all([
    hass.callWS<{ id: string; name: string | null; name_by_user: string | null; model: string | null; manufacturer: string | null; config_entries: string[]; identifiers: [string, string][] }[]>({
      type: 'config/device_registry/list',
    }),
    hass.callWS<{ entry_id: string; domain: string }[]>({
      type: 'config_entries/get',
    }),
  ]);

  const vagEntryIds = new Set(entries.filter((e) => e.domain === VAG_DOMAIN).map((e) => e.entry_id));

  return devices
    .filter((d) => d.config_entries.some((id) => vagEntryIds.has(id)))
    .map((d) => {
      // VAG Connect stores the VIN as the second member of identifiers
      // (("vag_connect", VIN)). Falls back to undefined if absent.
      const ident = d.identifiers.find(([dom]) => dom === VAG_DOMAIN);
      const vin = ident ? ident[1] : undefined;
      const manufacturer = (d.manufacturer || '').toLowerCase();
      const brand = resolveVagBrand(manufacturer);
      return {
        id: d.id,
        name: d.name_by_user || d.name || '',
        model: d.model || '',
        manufacturer: d.manufacturer || '',
        brand,
        vin,
      };
    });
}

/**
 * Map a free-text manufacturer string to one of the supported VAG brand
 * identifiers. Returns undefined if no match — caller renders a generic
 * fallback logo.
 */
export function resolveVagBrand(manufacturer: string): VagBrand | undefined {
  const m = manufacturer.toLowerCase().trim();
  if (m.includes('audi')) return 'audi';
  if (m.includes('škoda') || m.includes('skoda')) return 'skoda';
  if (m.includes('cupra')) return 'cupra';
  if (m.includes('seat')) return 'seat';
  if (m.includes('porsche')) return 'porsche';
  if (m.includes('volkswagen')) {
    return m.includes('us') || m.includes('na') ? 'volkswagen_na' : 'volkswagen';
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Entity resolution — given a `config.entity` anchor (any VAG Connect
// sensor for the target vehicle), scans the device-registry for all of
// that device's entities and matches them against the `combinedFilters`
// suffix table.
// ---------------------------------------------------------------------------

const getVehicleEntities = memoizeOne(
  async (
    hass: HomeAssistant,
    config: { entity: string },
    component: VagConnectCard
  ): Promise<VehicleEntities> => {
    const entityState = hass.states[config.entity];
    if (!entityState) {
      component._entityNotFound = true;
      return {};
    }

    const allEntities = await hass.callWS<Required<VehicleEntity>[]>({
      type: 'config/entity_registry/list',
    });

    const carEntity = allEntities.find((e) => e.entity_id === config.entity);
    if (!carEntity) {
      console.warn('[vag-connect-card] Anchor entity not found in registry:', config.entity);
      return {};
    }

    const deviceEntities = allEntities
      .filter((e) => e.device_id === carEntity.device_id && e.hidden_by === null && e.disabled_by === null)
      .filter(
        (e) => hass.states[e.entity_id] && !['unavailable', 'unknown'].includes(hass.states[e.entity_id].state)
      );

    const entityIds: VehicleEntities = {};

    for (const entityName of Object.keys(combinedFilters)) {
      const { prefix, suffix } = combinedFilters[entityName];

      const entity = deviceEntities.find((e) => {
        if (prefix) {
          return e.entity_id.startsWith(prefix) && e.entity_id.endsWith(suffix);
        }
        // VAG Connect unique_id pattern: `<VIN>_<translation_key>`. We
        // also fall back to entity_id-suffix matching for users that have
        // renamed their entity_ids manually.
        return (e.unique_id && e.unique_id.endsWith(suffix)) || e.entity_id.endsWith(suffix);
      });

      if (entity) {
        entityIds[entityName] = {
          entity_id: entity.entity_id,
          original_name: entity.original_name,
        };
      }
    }

    return entityIds;
  }
);

export async function getDeviceMeta(
  hass: HomeAssistant,
  entityId: string
): Promise<{ name: string; model: string; manufacturer: string; brand: VagBrand | undefined } | null> {
  const allEntities = await hass.callWS<{ entity_id: string; device_id: string }[]>({
    type: 'config/entity_registry/list',
  });
  const carEntity = allEntities.find((e) => e.entity_id === entityId);
  if (!carEntity?.device_id) return null;

  const allDevices = await hass.callWS<
    { id: string; name: string | null; name_by_user: string | null; model: string | null; manufacturer: string | null }[]
  >({
    type: 'config/device_registry/list',
  });
  const device = allDevices.find((d) => d.id === carEntity.device_id);
  if (!device) return null;

  return {
    name: device.name_by_user || device.name || '',
    model: device.model || '',
    manufacturer: device.manufacturer || '',
    brand: resolveVagBrand(device.manufacturer || ''),
  };
}

/**
 * Best-effort default-anchor finder. Prefers the `battery_soc` sensor of
 * the first VAG Connect device, falls back to `vehicle_state`. Returns
 * empty string when no VAG entity is present.
 */
export function getCarEntity(hass: HomeAssistant): string {
  const ids = Object.keys(hass.states);
  return (
    ids.find((id) => id.startsWith('sensor.') && id.endsWith('_battery_soc')) ||
    ids.find((id) => id.startsWith('sensor.') && id.endsWith('_vehicle_state')) ||
    ''
  );
}

// ---------------------------------------------------------------------------
// VAG service invocation
// ---------------------------------------------------------------------------

/**
 * Call a `vag_connect.*` service against a vehicle. `target` is one of
 * the vehicle's entity_ids — typically the anchor (config.entity) — which
 * HA resolves to the corresponding device + VIN server-side. Returns the
 * call promise so callers can chain optimistic UI updates or toasts.
 */
export function callVagService(
  hass: HomeAssistant,
  serviceKey: keyof typeof VAG_SERVICES,
  target: string,
  data: Record<string, unknown> = {}
): Promise<unknown> {
  const service = VAG_SERVICES[serviceKey];
  return hass.callService(VAG_DOMAIN, service, { entity_id: target, ...data });
}

// ---------------------------------------------------------------------------
// Custom-button / card factories — generic, not VAG-specific
// ---------------------------------------------------------------------------

export async function createCustomButtons(
  hass: HomeAssistant,
  button: BaseButtonConfig
): Promise<CustomButtonEntity | void> {
  if (!button) {
    return;
  }

  const stateValue = button.secondary
    ? await getTemplateValue(hass, button.secondary)
    : button.attribute && button.entity
    ? hass.formatEntityAttributeValue(hass.states[button.entity], button.attribute)
    : button.entity
    ? hass.formatEntityState(hass.states[button.entity])
    : '';

  const notify = button.notify ? await getBooleanTemplate(hass, button.notify) : false;
  const icon = button.icon_template ? await getTemplateValue(hass, button.icon_template) : button.icon || '';
  const color = button.color_template ? await getTemplateValue(hass, button.color_template) : '';
  const customButton: CustomButtonEntity = {
    enabled: true,
    hide: false,
    primary: button.primary,
    secondary: stateValue,
    icon,
    notify,
    button_type: button.button_type || 'default',
    button_action: button.button_action,
    entity: button.entity || '',
    attribute: button.attribute || '',
    color,
  };

  return customButton;
}

export async function createCardElement(
  hass: HomeAssistant,
  cards: LovelaceCardConfig[]
): Promise<LovelaceCardConfig[]> {
  if (!cards) {
    return [];
  }
  let helpers;

  if ((window as any).loadCardHelpers) {
    helpers = await (window as any).loadCardHelpers();
  } else if (HELPERS) {
    helpers = HELPERS;
  }

  if (!helpers || !helpers.createCardElement) {
    console.error('Card helpers or createCardElement not available.');
    return [];
  }

  const cardElements = await Promise.all(
    cards.map(async (card) => {
      try {
        const element = await helpers.createCardElement(card);
        element.hass = hass;
        return element;
      } catch (error) {
        console.error('Error creating card element:', error);
        return null;
      }
    })
  );
  return cardElements;
}

async function getTemplateValue(hass: HomeAssistant, templateConfig: string): Promise<string> {
  if (!hass || !templateConfig) return '';
  try {
    const result = await hass.callApi<string>('POST', 'template', { template: templateConfig });
    return result;
  } catch (error) {
    throw new Error(`Error evaluating template: ${error}`);
  }
}

async function getBooleanTemplate(hass: HomeAssistant, templateConfig: string): Promise<boolean> {
  if (!hass || !templateConfig) return false;
  try {
    const result = await hass.callApi<string>('POST', 'template', { template: templateConfig });
    return result.trim().toLowerCase() === 'true';
  } catch (error) {
    console.error(`Error evaluating template: ${error}`);
    return false;
  }
}

export async function getDefaultButton(
  hass: HomeAssistant,
  config: VehicleCardConfig,
  baseCard: CardTypeConfig
): Promise<ButtonCardEntity> {
  const button = config[baseCard.button];
  const useCustom = config.use_custom_cards?.[baseCard.config] || false;
  const customCard = config[baseCard.config] !== undefined;
  const verticalConfig = [
    {
      type: 'vertical-stack',
      cards: config[baseCard.config],
    },
  ];
  return {
    key: baseCard.type,
    default_name: baseCard.name,
    default_icon: baseCard.icon,
    button: {
      hidden: button?.hide || false,
      button_action: button?.button_action || {},
      entity: button?.entity || '',
      icon: button?.icon || '',
      primary: button?.primary || '',
      secondary: button?.secondary || '',
      attribute: button?.attribute || '',
      notify: button?.notify || '',
      icon_template: button?.icon_template || '',
      color_template: button?.color_template || '',
      picture_template: button?.picture_template || '',
      state_color: button?.state_color || false,
      notify_icon: button?.notify_icon || '',
      notify_color: button?.notify_color || '',
    },
    button_type: button?.button_type || 'default',
    card_type: useCustom ? ('custom' as const) : ('default' as const),
    custom_button: button?.enabled || false,
    custom_card: customCard ? await createCardElement(hass, verticalConfig) : [],
  };
}

export async function getAddedButton(
  hass: HomeAssistant,
  addedCard: AddedCards[keyof AddedCards],
  key: string
): Promise<ButtonCardEntity> {
  const button = addedCard.button;
  const customCard = addedCard.cards && addedCard.cards.length > 0;
  const verticalConfig = [
    {
      type: 'vertical-stack',
      cards: addedCard.cards,
    },
  ];
  return {
    key,
    custom_button: button.enabled ?? false,
    button: {
      hidden: button.hide ?? false,
      button_action: button?.button_action || {},
      entity: button.entity || '',
      icon: button.icon || '',
      primary: button.primary || '',
      secondary: button.secondary || '',
      attribute: button.attribute || '',
      notify: button.notify || '',
      icon_template: button.icon_template || '',
      color_template: button.color_template || '',
      picture_template: button.picture_template || '',
      state_color: button.state_color || false,
      notify_icon: button.notify_icon || '',
      notify_color: button.notify_color || '',
    },
    button_type: button.button_type || 'default',
    card_type: 'custom' as const,
    custom_card: customCard ? await createCardElement(hass, verticalConfig) : [],
  };
}

// ---------------------------------------------------------------------------
// First-updated hooks
// ---------------------------------------------------------------------------

export async function handleFirstUpdated(editor: VehicleCardEditor): Promise<void> {
  if (!editor._latestRelease.version) {
    const [latestVersion, installed] = await Promise.all([
      fetchLatestReleaseTag(),
      installedByHACS(editor.hass as HomeAssistant),
    ]);

    editor._latestRelease.version = latestVersion ?? '';
    editor._latestRelease.hacs = !!installed;
    editor._latestRelease.updated = (latestVersion ?? '') === CARD_VERSION;
  }

  const updates: Partial<VehicleCardConfig> = {};

  if (!editor._config.entity) {
    updates.entity = getCarEntity(editor.hass as HomeAssistant);
  } else if (!editor._modelName) {
    const meta = await getDeviceMeta(editor.hass as HomeAssistant, editor._config.entity);
    if (meta) editor._modelName = meta.model;
  } else if (editor._config.extra_configs?.section_order === undefined) {
    const extraConfig = { ...(editor._config.extra_configs || {}) };
    const section = {
      show_header_info: SECTION.HEADER_INFO,
      show_slides: SECTION.IMAGES_SLIDER,
      show_map: SECTION.MINI_MAP,
      show_buttons: SECTION.BUTTONS,
    };

    const sectionOrder: string[] = [];
    for (const sectionKey in section) {
      if (editor._config[sectionKey] === undefined || editor._config[sectionKey] === true) {
        sectionOrder.push(section[sectionKey]);
      }
    }

    extraConfig.section_order = sectionOrder;
    updates.extra_configs = extraConfig;
  } else if (editor._config?.extra_configs?.images_swipe === undefined) {
    const extraConfig = { ...(editor._config.extra_configs || {}) };
    extraConfig.images_swipe = defaultConfig.extra_configs.images_swipe;
    updates.extra_configs = extraConfig;
  }

  if (Object.keys(updates).length > 0) {
    editor._config = { ...editor._config, ...updates };
    editor.configChanged();
  }
}

async function installedByHACS(hass: HomeAssistant): Promise<boolean> {
  const hacs = hass?.config?.components?.includes('hacs');
  if (!hacs) return false;
  const hacsEntities = await hass.callWS<{ entity_id: string }[]>({
    type: 'config/entity_registry/list',
  });

  return !!hacsEntities.find((entity) => entity.entity_id === CARD_UPADE_SENSOR);
}

// ---------------------------------------------------------------------------
// Map + address helpers — Maptiler stripped; HA built-in map is the
// default popup, with OpenStreetMap / Google as optional reverse geocoders.
// ---------------------------------------------------------------------------

export async function createMapPopup(hass: HomeAssistant, config: VehicleCardConfig): Promise<LovelaceCardConfig[]> {
  const { default_zoom, hours_to_show, theme_mode } = config.map_popup_config || {};
  const haMapConfig = [
    {
      type: 'map',
      default_zoom: default_zoom || 14,
      hours_to_show,
      theme_mode,
      entities: [
        {
          entity: config.device_tracker,
        },
      ],
    },
  ];
  return await createCardElement(hass, haMapConfig);
}

export async function handleCardFirstUpdated(component: VagConnectCard): Promise<void> {
  const hass = component._hass as HomeAssistant;
  const config = component.config as VehicleCardConfig;
  component.vehicleEntities = await getVehicleEntities(hass, config, component);
  component.DataKeys = baseDataKeys(component.userLang);
  if (!component.vehicleEntities || Object.keys(component.vehicleEntities).length === 0) {
    component._entityNotFound = true;
  }

  // Resolve manufacturer + model from the device-registry. We deliberately
  // don't memo this across config-entity changes — it's cheap and keeps
  // the brand header reactive when the user swaps vehicles in the editor.
  try {
    const meta = await getDeviceMeta(hass, config.entity);
    if (meta) {
      component._brandManufacturer = meta.manufacturer || '';
      if (!config.model_name && meta.model) {
        // Backfill model_name on the runtime config so the header has
        // something useful to print even when the user never set it.
        (component.config as any).model_name = meta.model;
      }
    }
  } catch (e) {
    console.warn('[vag-connect-card] Could not resolve device metadata:', e);
  }

  // Auto-image-slider: if the user hasn't configured any images, discover
  // the VAG Connect `image.<slug>_render_*` entities of this car and use
  // them. Preference order matches the integration's image quality tiers
  // (side_lg = recommended big render, angle_lg = 3/4 view, etc.).
  if (!config.images || config.images.length === 0) {
    try {
      const renders = await discoverRenderImages(hass, config.entity);
      if (renders.length > 0) {
        (component.config as any).images = renders;
      }
    } catch (e) {
      console.warn('[vag-connect-card] Could not auto-discover render images:', e);
    }
  }

  // Auto device_tracker: same pattern — pick `device_tracker.<slug>_position`
  // of this car if the user hasn't set one. Allows the map section to work
  // out-of-the-box.
  if (!config.device_tracker) {
    try {
      const tracker = await discoverDeviceTracker(hass, config.entity);
      if (tracker) {
        (component.config as any).device_tracker = tracker;
      }
    } catch (e) {
      console.warn('[vag-connect-card] Could not auto-discover device_tracker:', e);
    }
  }

  _getMapDat(component);
}

/**
 * Find every `image.*` entity belonging to the same device as `anchorEntityId`
 * and return them as a `[{url, title}]` list suitable for VAG Connect's
 * image slider. URLs are HA `/api/image_proxy/<entity_id>?token=...` paths
 * — HA handles auth automatically when the user is logged in.
 */
async function discoverRenderImages(
  hass: HomeAssistant,
  anchorEntityId: string
): Promise<{ url: string; title: string }[]> {
  const allEntities = await hass.callWS<{ entity_id: string; device_id: string; original_name: string }[]>({
    type: 'config/entity_registry/list',
  });
  const anchor = allEntities.find((e) => e.entity_id === anchorEntityId);
  if (!anchor?.device_id) return [];

  const imageEntities = allEntities
    .filter((e) => e.device_id === anchor.device_id && e.entity_id.startsWith('image.'))
    .filter((e) => hass.states[e.entity_id]);

  // Prefer the larger renders so the slider looks good; cap to ~5 so a
  // car with all 7 quality tiers doesn't flood the UI.
  const priority = ['side_lg', 'angle_lg', 'angle_hd', 'side_sm', 'medium', 'small', 'icon'];
  imageEntities.sort((a, b) => {
    const ai = priority.findIndex((p) => a.entity_id.endsWith('_render_' + p));
    const bi = priority.findIndex((p) => b.entity_id.endsWith('_render_' + p));
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return imageEntities.slice(0, 5).map((e) => {
    const stateObj = hass.states[e.entity_id];
    // image entities expose either an `entity_picture` attribute (proxied)
    // or a direct `image_url`. Prefer entity_picture so HA handles auth.
    const url =
      (stateObj?.attributes?.entity_picture as string) ||
      (stateObj?.attributes?.image_url as string) ||
      `/api/image_proxy/${e.entity_id}`;
    const title = e.original_name || e.entity_id.replace(/^image\./, '');
    return { url, title };
  });
}

/**
 * Find the `device_tracker.<slug>_position` entity of the same device as
 * `anchorEntityId`. Returns the entity_id (or undefined when the car has
 * no position tracker — e.g. integration in read-only mode).
 */
async function discoverDeviceTracker(hass: HomeAssistant, anchorEntityId: string): Promise<string | undefined> {
  const allEntities = await hass.callWS<{ entity_id: string; device_id: string }[]>({
    type: 'config/entity_registry/list',
  });
  const anchor = allEntities.find((e) => e.entity_id === anchorEntityId);
  if (!anchor?.device_id) return undefined;

  const tracker = allEntities.find(
    (e) => e.device_id === anchor.device_id && e.entity_id.startsWith('device_tracker.')
  );
  return tracker?.entity_id;
}

/**
 * Single-map-card factory. The Mercedes original built a custom-styled
 * Maptiler `extra-map-card`; we now return a plain HA `type: map` so
 * we drop the Maptiler dependency. Custom styling is left to the user
 * via the editor's Advanced view.
 */
export async function _getSingleCard(card: VagConnectCard): Promise<LovelaceCardConfig | void> {
  const config = card.config as VehicleCardConfig;
  if (!config.map_popup_config?.single_map_card || !config.device_tracker) return;
  const hass = card._hass as HomeAssistant;
  const mapConfig = config.map_popup_config;

  const haMapConfig = {
    type: 'map',
    default_zoom: mapConfig.default_zoom || 14,
    hours_to_show: mapConfig.hours_to_show ?? 0,
    theme_mode: mapConfig.theme_mode,
    aspect_ratio: mapConfig.aspect_ratio,
    auto_fit: mapConfig.auto_fit,
    fit_zones: mapConfig.fit_zones,
    entities:
      mapConfig.extra_entities && mapConfig.extra_entities.length > 0
        ? mapConfig.extra_entities
        : [
            {
              entity: config.device_tracker,
              label_mode: mapConfig.label_mode,
              attribute: mapConfig.attribute,
              focus: true,
            },
          ],
  };

  const mapCardEl = await createCardElement(hass, [haMapConfig]);
  return mapCardEl[0];
}

export async function _getMapDat(card: VagConnectCard): Promise<void> {
  const config = card.config as VehicleCardConfig;
  if (!config.show_map || !config.device_tracker || card._currentPreviewType !== null) return;

  const hass = card._hass as HomeAssistant;
  const deviceStateObj = hass.states[config.device_tracker];
  if (!deviceStateObj) return;
  const { latitude, longitude, entity_picture } = deviceStateObj.attributes;
  card.MapData = {
    lat: latitude,
    lon: longitude,
    entityPic: entity_picture ?? undefined,
    address: {},
  };
}

export const _getMapAddress = memoizeOne(
  async (card: VagConnectCard, lat: number, lon: number): Promise<Address | undefined> => {
    if (card.config.map_popup_config?.show_address === false) return undefined;

    const apiKey = card.config?.google_api_key;
    const usFormat = card.config.map_popup_config?.us_format;
    const address = apiKey
      ? await getAddressFromGoggle(lat, lon, apiKey)
      : await getAddressFromOpenStreet(lat, lon);

    if (!address) return undefined;

    address.streetName = usFormat
      ? `${address.streetNumber} ${address.streetName}`
      : `${address.streetName} ${address.streetNumber}`;
    address.city = !address.sublocality ? address.city : address.sublocality;
    return address;
  }
);

async function getAddressFromGoggle(lat: number, lon: number, apiKey: string): Promise<Address | null> {
  const filterParams: Record<string, keyof Address> = {
    street_number: 'streetNumber',
    route: 'streetName',
    neighborhood: 'sublocality',
  };
  const filterCity = ['locality', 'administrative_area_level_2', 'administrative_area_level_1'];

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'OK') throw new Error('No results found');

    const addressComponents = data.results[0].address_components;
    const address: Partial<Address> = {};

    addressComponents.forEach((comp) => {
      const placeType = comp.types[0];
      if (filterParams[placeType]) {
        address[filterParams[placeType]] = comp.short_name;
      } else if (filterCity.some((type) => comp.types.includes(type)) && !address.city) {
        address.city = comp.short_name;
      }
    });

    return address.streetName && address.city ? (address as Address) : null;
  } catch (error) {
    console.warn('Error fetching address from Google:', error);
    return null;
  }
}

async function getAddressFromOpenStreet(lat: number, lon: number): Promise<Address | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`);
    if (!response.ok) throw new Error('Failed to fetch address from OpenStreetMap');

    const data = await response.json();
    const { house_number, road, suburb, village, city, town, neighbourhood } = data.address;
    return {
      streetNumber: house_number || '',
      streetName: road || '',
      sublocality: neighbourhood || village || '',
      city: suburb || city || town || '',
    };
  } catch (error) {
    console.warn('Error fetching address:', error);
    return null;
  }
}

async function fetchLatestReleaseTag(): Promise<string | undefined> {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/releases/latest`);
    if (response.ok) {
      const data = await response.json();
      return data.tag_name;
    }
  } catch (error) {
    console.error('Error fetching the latest release tag:', error);
  }
  return undefined;
}

export const hasActions = (config: ButtonActionConfig): boolean => {
  return Object.keys(config)
    .filter((key) => key !== 'entity')
    .some((action) => hasAction(config[action]));
};
