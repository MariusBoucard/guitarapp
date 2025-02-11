const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
        fs: false // Add this line to handle fs module
      }
    }},
  pluginOptions: {
    electronBuilder: {
      
      builderOptions: {
        appId: 'com.MariusCompany.ChristmasTree',
        productName: 'Neck Wanker v2\'s',
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
          icon: 'public/icon.png'
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
