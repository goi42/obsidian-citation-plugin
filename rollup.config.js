import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default {
  input: 'src/main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default',
  },
  external: ['obsidian', 'path', 'fs', 'util', 'events', 'stream', 'os'],
  plugins: [
    /**
     * Chokidar hacks to get working with platform-general Electron build.
     *
     * HACK: Manually replace fsevents import. This is only available on OS X,
     * and we need to make a platform-general build here.
     */
    replace({
      delimiters: ['', ''],
      include: "node_modules/chokidar/**/*.js",

      "require('fsevents')": "null",
      "require('fs')": "require('original-fs')",
    }),

    /*
     * Don't include create-frame because it has a silly lazy cache 
     * hack that breaks the build.
     */
    replace({
      include: [
        "node_modules/handlebars-helpers/lib/misc.js",
        "node_modules/handlebars-helpers/lib/utils/utils.js",
      ],

      "require('handlebars-helper-create-frame')": "null",
      "require('create-frame')": "null",
    }),

    typescript(),
    nodeResolve({ browser: true }),
    commonjs({ ignore: ['original-fs'] }),
    json(),
    webWorkerLoader({
      targetPlatform: 'browser',
      extensions: ['.ts'],
      preserveSource: true,
      sourcemap: true,
    }),
  ],
};
