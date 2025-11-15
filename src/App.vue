<template>
  <div class="app-container">
    <div class="image-container">
      <img class="background-image" src="/sky.jpg" alt="Background" />
      <div class="app-layout">
        <!-- Sidebar -->
        <div class="sidebar-container">
          <SidebarComponent />
        </div>

        <!-- Main Content -->
        <div class="main-container">
          <GuitarTrainingComponent />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { onMounted, onBeforeUnmount, provide } from 'vue'
  import { useAppStore } from '@/stores/appStore.js'
  import { useNotesStore } from '@/stores/notesStore.js'
  import { useTuningStore } from '@/stores/tuningStore.js'
  import { useGameStore } from '@/stores/gameStore.js'
  import { useUserStore } from '@/stores/userStore.js'
  import { AppController } from '@/controllers/appController.js'
  import { serviceManager } from '@/services/index.js'

  // Components
  import SidebarComponent from './components/SidebarComponent.vue'
  import GuitarTrainingComponent from './components/GuitarTrainingComponent.vue'

  export default {
    name: 'App',
    components: {
      SidebarComponent,
      GuitarTrainingComponent,
    },

    setup() {
      // Initialize stores
      const appStore = useAppStore()
      const notesStore = useNotesStore()
      const tuningStore = useTuningStore()
      const gameStore = useGameStore()
      const userStore = useUserStore()

      // Initialize controller
      const appController = new AppController(serviceManager)

      // Provide controller to child components
      provide('appController', appController)

      // Handle app quit event
      const handleBeforeQuit = async () => {
        console.log('� RENDERER: Received app-before-quit event!')
        console.log('�📦 RENDERER: App is closing - saving data...')

        try {
          // Check what we're about to save
          const currentUser = userStore.currentUser
          console.log(
            '💾 RENDERER: Current user before save:',
            currentUser?.name,
            'ID:',
            currentUser?.id
          )
          console.log('💾 RENDERER: Number of users:', userStore.users?.length)

          // Save all user data
          console.log('💾 RENDERER: Calling userStore.saveUsersToStorage()...')
          userStore.saveUsersToStorage()

          // Verify it was saved to localStorage
          const savedData = localStorage.getItem('guitarapp_users')
          if (savedData) {
            const parsed = JSON.parse(savedData)
            console.log('✅ RENDERER: Data saved to localStorage!')
            console.log('✅ RENDERER: Saved', parsed.users?.length, 'user(s)')
            console.log('✅ RENDERER: Current user ID:', parsed.currentUserId)
          } else {
            console.error('❌ RENDERER: No data in localStorage after save!')
          }

          // Notify main process that save is complete
          console.log('📤 RENDERER: Notifying main process save is complete...')
          if (window.electronAPI && window.electronAPI.saveComplete) {
            await window.electronAPI.saveComplete()
            console.log('✅ RENDERER: Main process notified')
          } else {
            console.error('❌ RENDERER: electronAPI.saveComplete not available!')
          }
        } catch (error) {
          console.error('❌ RENDERER: Error saving data on quit:', error)
          // Still notify main process even if save failed
          if (window.electronAPI && window.electronAPI.saveComplete) {
            await window.electronAPI.saveComplete()
            console.log('✅ RENDERER: Main process notified (after error)')
          }
        }
      }

      // Initialize application on mount
      onMounted(async () => {
        try {
          // Check localStorage availability FIRST
          console.log('🔍 APP MOUNT: Checking localStorage...')
          console.log('🔍 localStorage available?', typeof localStorage !== 'undefined')
          if (typeof localStorage !== 'undefined') {
            const testKey = 'guitarapp_test_' + Date.now()
            try {
              localStorage.setItem(testKey, 'test')
              const readBack = localStorage.getItem(testKey)
              localStorage.removeItem(testKey)
              console.log(
                '✅ localStorage read/write test:',
                readBack === 'test' ? 'PASSED' : 'FAILED'
              )
            } catch (e) {
              console.error('❌ localStorage test failed:', e)
            }

            // Check if we have existing data
            const existingData = localStorage.getItem('guitarapp_users')
            console.log(
              '🔍 Existing guitarapp_users:',
              existingData ? `YES (${existingData.length} chars)` : 'NO'
            )

            // List ALL guitarapp keys in localStorage
            console.log('📋 All guitarapp localStorage keys:')
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && key.startsWith('guitarapp')) {
                const value = localStorage.getItem(key)
                console.log(`   - ${key}: ${value ? value.length + ' chars' : 'null'}`)
              }
            }
          }

          // Initialize user store first (loads user data) - no longer async
          userStore.initialize()
          console.log('User store initialized, current user:', userStore.currentUser?.name)
          console.log('📊 Total users loaded:', userStore.users.length)
          console.log('📊 User names:', userStore.users.map((u) => u.name).join(', '))

          // Then initialize app controller
          await appController.initialize()
          appController.setupAutoSave()
          console.log('App Mounted')

          // Register before-quit listener
          console.log('🔍 RENDERER: Checking for electronAPI...', !!window.electronAPI)
          if (window.electronAPI) {
            console.log('🔍 RENDERER: onBeforeQuit available?', !!window.electronAPI.onBeforeQuit)
            console.log('🔍 RENDERER: saveComplete available?', !!window.electronAPI.saveComplete)
          }

          if (window.electronAPI && window.electronAPI.onBeforeQuit) {
            window.electronAPI.onBeforeQuit(handleBeforeQuit)
            console.log('✅ RENDERER: Registered app quit handler')
          } else {
            console.error('❌ RENDERER: Cannot register quit handler - electronAPI not available')
          }
        } catch (error) {
          console.error('❌ RENDERER: Failed to initialize app:', error)
        }
      })

      // Cleanup on unmount
      onBeforeUnmount(() => {
        if (window.electronAPI && window.electronAPI.removeBeforeQuitListener) {
          window.electronAPI.removeBeforeQuitListener(handleBeforeQuit)
        }
      })

      return {
        appStore,
        notesStore,
        tuningStore,
        gameStore,
        userStore,
        appController,
      }
    },
  }
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  .app-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .image-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }

  .app-layout {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .sidebar-container {
    width: 250px;
    height: 100%;
    background: rgba(44, 62, 80, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
  }

  .main-container {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.1);
  }

  /* h1, p, h3 {
  color: white;
} */
</style>
