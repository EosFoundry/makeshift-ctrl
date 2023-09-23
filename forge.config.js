const pkg = require('./package.json');
let appVersion = pkg.version;
switch (process.env.BUILD_TYPE) {
  case 'production':
    process.env.NODE_ENV = 'production';
    break;
  case 'ci':
    break;
  case 'development':
    process.env.NODE_ENV = 'development';
    break;
  default:
    process.env.NODE_ENV = 'development';
    break;
}



module.exports = {
  packagerConfig: {
    asar: true,
    junk: true,
    icon: './forge/icons/makeshift-ctrl.ico',
    appVersion: pkg.version,
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
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: "James Liu",
        description: pkg.description,
        setupExe: 'makeshift-ctrl_win32-x64-setup.exe',
      },
    },
    {
      name: '@electron-forge/maker-flatpak',
      config: {
        options: {
          maintainer: 'James Liu',
          productName: 'MakeShift Ctrl',
          genericName: 'MakeShift Ctrl',
          homepage: 'https://eosfoundry.dev/',
          icon: './forge/icons/makeshift-ctrl.png',
          id:'dev.eosfoundry.makeshift-ctrl',
          finishArgs: [
            '--device=all',
            '--share=network',
            '--socket=fallback-x11',
            '--share=ipc',
            '--socket=wayland',
            '--device=dri',
            '--socket=pulseaudio',
            '--filesystem=home',
            '--filesystem=xdg-download',
            '--filesystem=xdg-config/makeshift-ctrl',
          ],
          base:'org.electronjs.Electron2.BaseApp',
          baseVersion: `v${pkg.devDependencies['electron'].replace('^', '')}`,
        },
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'James Liu',
          homepage: 'https://eosfoundry.dev/',
          icon: './forge/icons/makeshift-ctrl.png',
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://eosfoundry.dev/',
          icon: './forge/icons/makeshift-ctrl.png',
        },
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'EosFoundry',
          name: 'makeshift-ctrl'
        },
        draft: true,
      },
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
            entry: 'node-src/plugin/index.ts',
            config: 'vite.plugin.config.ts',
          },
          {
            entry: 'node-src/preload/index.ts',
            config: 'vite.preload.config.ts',
          },
        ],
        renderer: [
          {
            name: 'makeshift ctrl',
            config: 'vite.renderer.config.ts',
          },
        ],
      },
    },
  ],
}
