import memoizeOne from 'memoize-one';

export const ENTITY_CARD_NAME_SCHEMA = memoizeOne(
  (modelName?: string) =>
    [
      {
        name: 'entity',
        // VAG Connect's entity-registry "platform" field is `vag_connect`, but
        // HA's frontend entity-selector `filter: { integration: ... }` is
        // strict on some installs and silently returns 0 matches. We fall
        // back to a plain domain filter (sensors) so the dropdown is never
        // empty — the user picks any sensor of their car (battery_soc is the
        // canonical anchor) and the card auto-resolves the device + rest of
        // the entities from the device registry.
        selector: {
          entity: { domain: ['sensor'] },
        },
        required: true,
      },
      {
        name: 'name',
        label: 'Card name or select model name (optional)',
        selector: {
          select: {
            mode: 'dropdown',
            custom_value: true,
            options: ['Vehicle Info Card', modelName],
          },
        },
      },
    ] as const
);

export const SHOW_CONFIG_SCHEMA = memoizeOne((options: any[]) => [
  {
    name: '',
    type: 'grid',
    column_min_width: '140px',
    schema: [
      ...options.map((option) => ({
        name: option.configKey,
        label: option.label,
        type: 'boolean',
      })),
    ],
  },
]);

export const LANG_SCHEMA = memoizeOne(
  (languages: string[]) =>
    [
      {
        name: 'selected_language',
        label: 'Selected Language',
        selector: { language: { languages, native_name: true, no_sort: false } },
      },
    ] as const
);

const THEME_MODE_OPTIONS = ['auto', 'light', 'dark'] as const;

export const THEME_CONFIG_SCHEMA = [
  {
    name: 'selected_theme',
    type: 'grid',
    schema: [
      {
        name: 'theme',
        label: 'Theme',
        default: 'default',
        required: false,
        selector: { theme: { include_default: true } },
      },
      {
        name: 'mode',
        label: 'Theme Mode',
        default: 'auto',
        selector: {
          select: {
            mode: 'dropdown',
            options: THEME_MODE_OPTIONS.map((mode) => ({
              value: mode,
              label: mode.charAt(0).toUpperCase() + mode.slice(1),
            })),
          },
        },
      },
    ],
  },
] as const;

export const SERVICE_SCHEMA = memoizeOne(
  (options: { value: string; label: string }[]) =>
    [
      {
        name: 'services',
        type: 'grid',
        schema: [
          ...options.map((option) => ({
            name: option.value,
            label: option.label,
            type: 'boolean',
            default: false,
          })),
        ],
      },
    ] as const
);
