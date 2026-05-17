import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssLit from 'rollup-plugin-postcss-lit';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';

import { description, repository } from './package.json';

/**
 * Browser-console banner shown when the card loads. Subtle nods to the
 * favourite-shows trifecta of the author: Simpsons (Canyonero!), HIMYM
 * (Legen… dary), Big Bang Theory (Bazinga). One quote rotates per build.
 */
const CANYONERO_QUOTES = [
  '"Canyonero! Canyonero!" — Hank Williams Jr.',
  '"Legen… wait for it… DARY!" — Barney Stinson',
  '"Bazinga." — Sheldon Cooper',
  '"Suit up." — Barney Stinson',
  '"D\'oh!" — Homer Simpson',
  '"Knock-knock-knock, Penny." — Sheldon Cooper',
  '"Have you met Ted?" — Barney Stinson',
];

export function logCardInfo(version) {
  const part1 = '🚗 💨  CANYONERO  💨 🚙';
  const part2 = `${version}`;
  const part1Style =
    'background-color: #b58450; color: #fff; padding: 2px 6px; border: 1px solid #b58450; border-radius: 2px 0 0 2px; font-family: Roboto, system-ui, sans-serif; text-shadow: 0 1px 0 rgba(0,0,0,0.3); font-weight: 700';
  const part2Style =
    'background-color: transparent; color: #b58450; padding: 2px 6px; border: 1px solid #b58450; border-radius: 0 2px 2px 0; font-family: Roboto, system-ui, sans-serif';
  const repo = `GitHub: ${repository.url}`;
  // Pick a quote pseudo-randomly per build by hashing the version string.
  const quoteIdx =
    [...version].reduce((acc, c) => acc + c.charCodeAt(0), 0) % CANYONERO_QUOTES.length;
  const quote = CANYONERO_QUOTES[quoteIdx];

  return `
    console.groupCollapsed(
      "%c${part1}%c${part2}",
      '${part1Style}',
      '${part2Style}',
    );
    console.info('${description}');
    console.info('${repo}');
    console.info('${quote}');
    console.groupEnd();
  `;
}

export const defaultPlugins = [
  nodeResolve({ preferBuiltins: false }),
  nodePolyfills(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    removeComments: false,
  }),
  json(),
  postcss({
    plugins: [
      postcssPresetEnv({
        stage: 1,
        features: {
          'nesting-rules': true,
        },
      }),
    ],
    extract: false,
    inject: false,
  }),
  postcssLit(),
];
