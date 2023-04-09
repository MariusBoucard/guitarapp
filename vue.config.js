const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        path: require.resolve('path-browserify')
      }
    }},
  pluginOptions: {
    electronBuilder: {
      
      builderOptions: {
        appId: 'com.yourcompany.yourappname',
        productName: 'Your App Name',
        linux: {
          target: ['deb', 'snap', 'AppImage'],
          icon: 'public/icon.png'
        },
        mac: {
          target: ['dmg', 'zip'],
          icon: 'public/icon.icns'
        },
        win: {
          target: ['nsis', 'zip'],
          icon: 'public/icon.ico'
        },
        extraResources: {
          from: 'public',
          to: './',
          filter: ['**/*']
        },
     
      } 
    }
  }
});
