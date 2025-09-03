/**
 * Component Manager Service
 * Manages the display state and toggling of different components
 * This helps clean up the clutter in the main component
 */

export class ComponentManager {
  constructor(appStore) {
    this.appStore = appStore
  }

  // Component groups for easier management
  getComponentGroups() {
    return {
      main: {
        title: 'Main Components',
        components: [
          { key: 'mancheDisplay', name: 'Manche', icon: '🎸', action: () => this.appStore.toggleManche() },
          { key: 'notesSelectedDisplay', name: 'Selection notes', icon: '🎵', action: () => this.appStore.toggleNotesSelected() },
          { key: 'keyboard', name: 'Keyboard', icon: '⌨️', action: () => this.appStore.toggleKeyboard() }
        ]
      },
      tools: {
        title: 'Tools',
        components: [
          { key: 'tunderDisplay', name: 'Tuner', icon: '🎛️', action: () => this.appStore.toggleTuner() },
          { key: 'scalesDisplay', name: 'Scales', icon: '🎼', action: () => this.appStore.toggleScales() },
          { key: 'chordssuggestDisplay', name: 'Chord Suggestions', icon: '🎹', action: () => this.appStore.toggleChordssuggestion() }
        ]
      },
      media: {
        title: 'Media',
        components: [
          { key: 'soundDisplay', name: 'Play Sound', icon: '🔊', action: () => this.appStore.toggleSound() },
          { key: 'videoDisplay', name: 'Play Video', icon: '📹', action: () => this.appStore.toggleVideo() },
          { key: 'videoDisplayNew', name: 'Play Video New', icon: '🎬', action: () => this.appStore.toggleVideoNew() },
          { key: 'pictureDisplay', name: 'Display Picture', icon: '🖼️', action: () => this.appStore.togglePicture() }
        ]
      },
      training: {
        title: 'Training',
        components: [
          { key: 'gameDisplay', name: 'Play Game', icon: '🎮', action: () => this.appStore.toggleGame() },
          { key: 'autoGammeSelect', name: 'Auto Gamme Select', icon: '🔄', action: () => this.appStore.toggleAutoGammeSelect() }
        ]
      },
      settings: {
        title: 'Settings',
        components: [
          { key: 'settingsView', name: 'Settings', icon: '⚙️', action: () => this.appStore.toggleSettings() }
        ]
      }
    }
  }

  // Get all components as a flat array
  getAllComponents() {
    const groups = this.getComponentGroups()
    return Object.values(groups).flatMap(group => group.components)
  }

  // Get active components
  getActiveComponents() {
    return this.getAllComponents().filter(component => 
      this.appStore[component.key]
    )
  }

  // Toggle a specific component by key
  toggleComponent(componentKey) {
    const component = this.getAllComponents().find(comp => comp.key === componentKey)
    if (component) {
      component.action()
    }
  }

  // Get component state
  isComponentActive(componentKey) {
    return this.appStore[componentKey]
  }

  // Hide all components in a specific group
  hideGroup(groupKey) {
    const groups = this.getComponentGroups()
    if (groups[groupKey]) {
      groups[groupKey].components.forEach(component => {
        if (this.appStore[component.key]) {
          component.action()
        }
      })
    }
  }

  // Show only specific components (hide all others first)
  showOnly(componentKeys) {
    // First, hide all active components
    this.getActiveComponents().forEach(component => {
      if (!componentKeys.includes(component.key)) {
        component.action()
      }
    })

    // Then show the requested components
    componentKeys.forEach(key => {
      if (!this.appStore[key]) {
        this.toggleComponent(key)
      }
    })
  }

  // Preset configurations for different workflows
  applyPreset(presetName) {
    const presets = {
      'practice': ['mancheDisplay', 'notesSelectedDisplay', 'scalesDisplay'],
      'tuning': ['mancheDisplay', 'tunderDisplay', 'settingsView'],
      'game': ['mancheDisplay', 'gameDisplay', 'notesSelectedDisplay'],
      'video': ['videoDisplayNew', 'mancheDisplay'],
      'minimal': ['mancheDisplay'],
      'all': [
        'mancheDisplay', 'notesSelectedDisplay', 'tunderDisplay', 'pictureDisplay',
        'soundDisplay', 'scalesDisplay', 'videoDisplay', 'videoDisplayNew',
        'gameDisplay', 'chordssuggestDisplay', 'settingsView', 'keyboard'
      ]
    }

    if (presets[presetName]) {
      this.showOnly(presets[presetName])
    }
  }
}

export default ComponentManager
