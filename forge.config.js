module.exports = {
  packagerConfig: {},
  electronRebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ctrl'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: [
        'darwin'
      ]
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        // background: './assets/dmg-background.png',
        format: 'ULFO'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ]
  // publishers: [],
  // plugins: [],
  // hooks: {},
}
