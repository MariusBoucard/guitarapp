import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { alphaTab } from '@coderline/alphatab/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    alphaTab(), // Add AlphaTab plugin first to handle fonts and assets
    vue({
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('guitar')
      }
    }),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'src/background.js',
      },
      {
        entry: 'public/preload.js',
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
          // instead of restarting the entire Electron App.
          options.reload()
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['guitar-chords', 'guitar-js'],
    exclude: ['electron']
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: ['electron']
    }
  },
  server: {
    port: 8080
  }
})
