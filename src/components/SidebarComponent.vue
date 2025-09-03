<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h3>Guitar App</h3>
    </div>

    <!-- Presets Section -->
    <div class="sidebar-section">
      <h4>Quick Presets</h4>
      <div class="preset-buttons">
        <button 
          v-for="preset in presets" 
          :key="preset.key"
          class="preset-button"
          @click="componentManager.applyPreset(preset.key)"
        >
          {{ preset.icon }} {{ preset.name }}
        </button>
      </div>
    </div>
    
    <div class="sidebar-sections">
      <!-- Dynamic Component Groups -->
      <div 
        v-for="(group, groupKey) in componentGroups" 
        :key="groupKey"
        class="sidebar-section"
      >
        <div class="section-header">
          <h4>{{ group.title }}</h4>
          <button 
            class="group-toggle"
            @click="toggleGroup(groupKey)"
            :title="`Toggle all ${group.title.toLowerCase()}`"
          >
            {{ getGroupActiveCount(group) > 0 ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
        
        <div class="sidebar-items">
          <div 
            v-for="component in group.components"
            :key="component.key"
            class="sidebar-item" 
            :class="{ active: isComponentActive(component.key) }"
            @click="componentManager.toggleComponent(component.key)"
          >
            <span>{{ component.icon }} {{ component.name }}</span>
            <span class="status-indicator" v-if="isComponentActive(component.key)">●</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/appStore.js'
import ComponentManager from '@/services/componentManager.js'

export default {
  name: 'SidebarComponent',
  
  setup() {
    const appStore = useAppStore()
    
    // Initialize ComponentManager
    let componentManager
    try {
      componentManager = new ComponentManager(appStore)
    } catch (error) {
      console.error('Error initializing ComponentManager:', error)
      // Fallback to direct store access
      componentManager = {
        toggleComponent: (key) => {
          console.log('Fallback toggle for:', key)
          // Direct toggle calls
          switch(key) {
            case 'mancheDisplay': appStore.toggleManche(); break;
            case 'notesSelectedDisplay': appStore.toggleNotesSelected(); break;
            case 'keyboard': appStore.toggleKeyboard(); break;
            case 'tunderDisplay': appStore.toggleTuner(); break;
            case 'scalesDisplay': appStore.toggleScales(); break;
            case 'chordssuggestDisplay': appStore.toggleChordssuggestion(); break;
            case 'soundDisplay': appStore.toggleSound(); break;
            case 'videoDisplay': appStore.toggleVideo(); break;
            case 'videoDisplayNew': appStore.toggleVideoNew(); break;
            case 'pictureDisplay': appStore.togglePicture(); break;
            case 'gameDisplay': appStore.toggleGame(); break;
            case 'autoGammeSelect': appStore.toggleAutoGammeSelect(); break;
            case 'settingsView': appStore.toggleSettings(); break;
          }
        },
        applyPreset: (presetName) => {
          console.log('Fallback preset:', presetName)
        }
      }
    }
    
    // Presets configuration
    const presets = ref([
      { key: 'practice', name: 'Practice', icon: '🎯' },
      { key: 'tuning', name: 'Tuning', icon: '🎛️' },
      { key: 'game', name: 'Game', icon: '🎮' },
      { key: 'video', name: 'Video', icon: '🎬' },
      { key: 'minimal', name: 'Minimal', icon: '📱' }
    ])
    
    // Get component groups from manager or fallback
    const componentGroups = computed(() => {
      try {
        return componentManager.getComponentGroups ? componentManager.getComponentGroups() : {
          main: {
            title: 'Main Components',
            components: [
              { key: 'mancheDisplay', name: 'Manche', icon: '🎸' },
              { key: 'notesSelectedDisplay', name: 'Selection notes', icon: '🎵' },
              { key: 'keyboard', name: 'Keyboard', icon: '⌨️' }
            ]
          },
          tools: {
            title: 'Tools',
            components: [
              { key: 'tunderDisplay', name: 'Tuner', icon: '🎛️' },
              { key: 'scalesDisplay', name: 'Scales', icon: '🎼' },
              { key: 'chordssuggestDisplay', name: 'Chord Suggestions', icon: '🎹' }
            ]
          },
          media: {
            title: 'Media',
            components: [
              { key: 'soundDisplay', name: 'Play Sound', icon: '🔊' },
              { key: 'videoDisplay', name: 'Play Video', icon: '📹' },
              { key: 'videoDisplayNew', name: 'Play Video New', icon: '🎬' },
              { key: 'pictureDisplay', name: 'Display Picture', icon: '🖼️' }
            ]
          },
          training: {
            title: 'Training',
            components: [
              { key: 'gameDisplay', name: 'Play Game', icon: '🎮' },
              { key: 'autoGammeSelect', name: 'Auto Gamme Select', icon: '🔄' }
            ]
          },
          settings: {
            title: 'Settings',
            components: [
              { key: 'settingsView', name: 'Settings', icon: '⚙️' }
            ]
          }
        }
      } catch (error) {
        console.error('Error getting component groups:', error)
        return {}
      }
    })
    
    // Helper methods
    const isComponentActive = (componentKey) => {
      return appStore[componentKey] || false
    }
    
    const getGroupActiveCount = (group) => {
      return group.components ? group.components.filter(comp => isComponentActive(comp.key)).length : 0
    }
    
    const toggleGroup = (groupKey) => {
      const group = componentGroups.value[groupKey]
      if (!group) return
      
      const activeCount = getGroupActiveCount(group)
      
      // If any are active, turn all off, otherwise turn all on
      group.components.forEach(comp => {
        if (activeCount > 0) {
          // Turn off if currently on
          if (isComponentActive(comp.key)) {
            componentManager.toggleComponent(comp.key)
          }
        } else {
          // Turn on if currently off
          if (!isComponentActive(comp.key)) {
            componentManager.toggleComponent(comp.key)
          }
        }
      })
    }
    
    return {
      appStore,
      componentManager,
      presets,
      componentGroups,
      isComponentActive,
      getGroupActiveCount,
      toggleGroup
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px 15px;
  border-bottom: 1px solid #34495e;
  text-align: center;
}

.sidebar-header h3 {
  margin: 0;
  color: #ecf0f1;
  font-size: 1.2rem;
  font-weight: 600;
}

.sidebar-sections {
  padding: 10px 0;
}

.sidebar-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 15px 10px 15px;
}

.section-header h4 {
  margin: 0;
  color: #bdc3c7;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.group-toggle {
  background: none;
  border: none;
  color: #bdc3c7;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.group-toggle:hover {
  background: rgba(189, 195, 199, 0.2);
  color: white;
}

.preset-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 15px;
}

.preset-button {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: left;
}

.preset-button:hover {
  background: linear-gradient(135deg, #2980b9, #1f4e79);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.sidebar-items {
  display: flex;
  flex-direction: column;
}

.sidebar-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-item:hover {
  background-color: #3a4f63;
  border-left-color: #3498db;
}

.sidebar-item.active {
  background-color: #2980b9;
  border-left-color: #e74c3c;
  font-weight: 500;
}

.sidebar-item span {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  color: #2ecc71;
  font-size: 0.6rem;
}

/* Custom scrollbar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #2c3e50;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #34495e;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #4a5f7a;
}
</style>
