import { createApp } from 'vue'
import App from './App.vue'
import { pinia } from './stores'
import './assets/styles/colors.css'
import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import fr from './locales/fr.json'

localStorage.setItem("lang", "en")
location.reload()

Object.defineProperty(navigator, "language", { value: "en-US" })
const i18n = createI18n({
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: {
      en,
      fr
  }
})

const app = createApp(App, {
  compilerOptions: {
    isCustomElement: (tag) => tag.startsWith('guitar'),
  },
  silent: true,
})

app.use(i18n)
app.use(pinia)

window.$pinia = pinia
window.__VUE_APP__ = app

app.mount('#app')

console.log('🚀 Vue app mounted with Pinia exposed globally')
