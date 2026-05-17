// VAG Connect Card — background / loading assets.
//
// The Mercedes original shipped 1.1 MB of base64-encoded AMG / Mercedes
// watermark + Mercedes-stern loading logo. Those have been replaced with
// neutral inline SVGs so the card carries no manufacturer branding it
// has no licence to ship.
//
// Users that want their own brand watermark behind the card can set
// `brand_logo_url` in the YAML or layer their own picture via theme CSS:
//
//   .vag-connect-card .header-background {
//     background-image: url(/local/my-audi-watermark.svg);
//   }

// Empty 1x1 SVG data URI — keeps `background-image: url(...)` valid CSS
// without rendering anything (avoids the broken-image icon you'd get with
// `url()`).
const emptyBg =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';

// Tyre background was a Mercedes wheel diagram used to position 4
// per-wheel pressure boxes — that layout was replaced by an SVG battery
// donut in v0.1.0, so this asset is no longer referenced.
const tyreBg = emptyBg;

// Loading spinner — neutral inline car silhouette, tinted via fill stops
// so themes pick it up.
const loading =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
       <g fill="none" stroke="#777" stroke-width="2" stroke-linecap="round" opacity="0.55">
         <path d="M14 38h36l-4-12c-1-3-3-4-6-4H24c-3 0-5 1-6 4z"/>
         <circle cx="22" cy="42" r="4" fill="#777"/>
         <circle cx="42" cy="42" r="4" fill="#777"/>
       </g>
     </svg>`
  );

export const IMAGE = {
  BACK_DARK: emptyBg,
  BACK_WHITE: emptyBg,
  BACK_TYRE: tyreBg,
  LOADING: loading,
};

export const themeTogglerIcon =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 18a6 6 0 0 1 0-12v12z"/></svg>`
  );

export const carLocationIcon =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`
  );
