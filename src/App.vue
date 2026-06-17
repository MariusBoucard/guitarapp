<template>
  <div class="app-container">
    <div class="image-container">
      <img class="background-image" src="/sky.jpg" alt="Background" />
      <div class="app-layout">
        <div class="sidebar-container">
          <SidebarComponent />
        </div>
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
  import { userDataService } from '@/services/userDataService.js'

  import SidebarComponent from './components/SidebarComponent.vue'
  import GuitarTrainingComponent from './components/GuitarTrainingComponent.vue'

  export default {
    name: 'App',
    components: {
      SidebarComponent,
      GuitarTrainingComponent,
    },

    setup() {
      const appStore = useAppStore()
      const notesStore = useNotesStore()
      const tuningStore = useTuningStore()
      const gameStore = useGameStore()
      const userStore = useUserStore()

      const appController = new AppController(serviceManager)
      provide('appController', appController)

      const handleBeforeQuit = async () => {
        try {
          userDataService.save()
          if (window.electronAPI && window.electronAPI.saveComplete) {
            await window.electronAPI.saveComplete()
          }
        } catch (error) {
          console.error('Error saving data on quit:', error)
          if (window.electronAPI && window.electronAPI.saveComplete) {
            await window.electronAPI.saveComplete()
          }
        }
      }

      onMounted(async () => {
        try {
          userStore.initialize()
          await appController.initialize()
          console.log('App Mounted')

          if (window.electronAPI && window.electronAPI.onBeforeQuit) {
            window.electronAPI.onBeforeQuit(handleBeforeQuit)
          }
        } catch (error) {
          console.error('Failed to initialize app:', error)
        }
      })

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
</style>
