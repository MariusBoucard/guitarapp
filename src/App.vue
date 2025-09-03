<template>
  <div class="app-container">
    <div class="image-container">
      <img class="background-image" src="../public/sky.jpg" alt="Background">
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
import { onMounted, provide } from 'vue'
import { useAppStore } from '@/stores/appStore.js'
import { useNotesStore } from '@/stores/notesStore.js'
import { useTuningStore } from '@/stores/tuningStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { AppController } from '@/controllers/appController.js'
import { serviceManager } from '@/services/index.js'

// Components
import SidebarComponent from './components/SidebarComponentSimple.vue'
import GuitarTrainingComponent from './components/GuitarTrainingComponent.vue'

export default {
  name: 'App',
  components: {
    SidebarComponent,
    GuitarTrainingComponent
  },
  
  setup() {
    // Initialize stores
    const appStore = useAppStore()
    const notesStore = useNotesStore()
    const tuningStore = useTuningStore()
    const gameStore = useGameStore()
    
    // Initialize controller
    const appController = new AppController(serviceManager)
    
    // Provide controller to child components
    provide('appController', appController)
    
    // Initialize application on mount
    onMounted(async () => {
      try {
        await appController.initialize()
        appController.setupAutoSave()
        console.log('App Mounted')
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    })
    
    return {
      appStore,
      notesStore,
      tuningStore,
      gameStore,
      appController
    }
  }
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

h1, p, h3 {
  color: white;
}
</style>
