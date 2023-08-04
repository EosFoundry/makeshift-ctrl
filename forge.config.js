const pkg = require('./package.json');

module.exports = {
  packagerConfig: {
    extraResource: [
      './data/',
      './examples/',
    ],
    ignore: [
      // hidden folders
      /^\/\.cache.*/,
      /^\/\.secrets.*/,

      // hidden files
      /^\/\.gitignore.*/,
      /^\/\.gitmodules.*/,
      /^\/\.nvmrc.*/,
      // folders
      /^\/data.*/,
      /^\/examples.*/,
      /^\/public.*/,
      /^\/node\-src.*/,
      /^\/tsconfig.*/,
      /^\/scripts.*/,
      /^\/src.*/,
      /^\/types.*/,
      // files
      /^\/forge\..*/,
      /^\/test\.mjs/,
      /^\/vite\..*/,
    ],
    // asar: true,
    junk: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: "James Liu",
        description: pkg.description,
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'node-src/main/index.ts',
            config: 'vite.main.config.ts',
          },
          {
            entry: 'node-src/preload/index.ts',
            config: 'vite.preload.config.ts',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.ts',
          },
        ],
      },
    },
  ],
};
