import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import filesize from 'rollup-plugin-filesize';
import { version } from './package.json';
import { logCardInfo, defaultPlugins } from './rollup.config.helper.mjs';

const dev = process.env.ROLLUP_WATCH;
const port = process.env.PORT || 8235;
const currentVersion = dev ? `DEV - v${version}` : `v${version}`;
const custombanner = logCardInfo(currentVersion);

const serveopts = {
  contentBase: ['./dist'],
  port,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const terserOpt = {
  module: true,
  compress: {
    drop_console: ['log', 'error'],
    module: false,
  },
};

const plugins = [dev && serve(serveopts), !dev && terser(terserOpt), !dev && filesize()];

export default [
  {
    input: 'src/vag-connect-card.ts',
    output: [
      {
        file: dev ? 'dist/vag-connect-card.js' : 'build/vag-connect-card.js',
        format: 'es',
        sourcemap: dev ? true : false,
        inlineDynamicImports: true,
        banner: custombanner,
      },
    ],
    watch: {
      exclude: 'node_modules/**',
    },
    plugins: [...plugins, ...defaultPlugins],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    },
  },
];
