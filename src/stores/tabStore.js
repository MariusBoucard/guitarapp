/**
 * Tab Store - Manages tab playlists and files for guitar pro tabs
 * Each user has their own tab playlists stored in user.data.tabs
 * This is the Model layer for tab management in MVC architecture
 */
import { defineStore } from 'pinia'
import { useUserStore } from './userStore.js'

export const useTabStore = defineStore('tab', {
  state: () => ({
    // Current selected playlist and tab (session-specific)
    selectedPlaylist: 0,
    currentTabName: '',
    currentTabPath: '',
    
    // Current tab file data
    currentTabFile: null,
    isTabLoaded: false
  }),
  
  getters: {
    // Reference userStore data directly
    tabPlaylists() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.tabs?.playlists) {
        return []
      }
      return userStore.currentUser.data.tabs.playlists
    },
    
    tabFiles() {
      const userStore = useUserStore()
      return userStore.currentUser?.data?.tabs?.files || []
    },
    
    currentPlaylistData: (state) => {
      const userStore = useUserStore()
      const playlists = userStore.currentUser?.data?.tabs?.playlists || []
      return playlists.find(playlist => playlist.id === state.selectedPlaylist)
    },
    
    currentPlaylistTabs() {
      return this.currentPlaylistData?.tabs || []
    },
    
    totalPlaylistsCount() {
      return this.tabPlaylists.length
    },
    
    totalTabsCount() {
      return this.tabPlaylists.reduce((total, playlist) => {
        return total + (playlist.tabs?.length || 0)
      }, 0)
    },
    
    playlistByIndex() {
      return (index) => this.tabPlaylists[index]
    },
    
    // Get all tabs from all playlists
    allTabs() {
      const tabs = []
      this.tabPlaylists.forEach(playlist => {
        if (playlist.tabs) {
          tabs.push(...playlist.tabs)
        }
      })
      return tabs
    }
  },
  
  actions: {
    // Initialize tabs data structure for user if not exists
    ensureTabsDataStructure() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return
      
      if (!userStore.currentUser.data.tabs) {
        userStore.currentUser.data.tabs = {
          playlists: [],
          files: [],
          metadata: {
            lastUpdated: null,
            totalTabs: 0,
            totalPlaylists: 0
          }
        }
      }
      
      if (!userStore.currentUser.data.tabs.playlists) {
        userStore.currentUser.data.tabs.playlists = []
      }
      
      if (!userStore.currentUser.data.tabs.files) {
        userStore.currentUser.data.tabs.files = []
      }
    },
    
    // Playlist management
    createPlaylist(name) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return
      
      this.ensureTabsDataStructure()
      
      const playlists = userStore.currentUser.data.tabs.playlists
      const newPlaylist = {
        id: Date.now(),
        name: name || `Playlist ${playlists.length + 1}`,
        tabs: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      
      playlists.push(newPlaylist)
      this.updateTabMetadata()
      userStore.saveUsersToStorage()
      
      return newPlaylist.id
    },
    
    renamePlaylist(playlistId, newName) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return
      
      const playlist = this.getPlaylistById(playlistId)
      if (playlist) {
        playlist.name = newName
        playlist.lastModified = new Date().toISOString()
        userStore.saveUsersToStorage()
      }
    },
    
    deletePlaylist(playlistId) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return
      
      const playlists = userStore.currentUser.data.tabs.playlists
      const index = playlists.findIndex(p => p.id === playlistId)
      
      if (index > -1) {
        playlists.splice(index, 1)
        
        // Reset selected playlist if deleted
        if (this.selectedPlaylist === playlistId && playlists.length > 0) {
          this.selectedPlaylist = playlists[0].id
        }
        
        this.updateTabMetadata()
        userStore.saveUsersToStorage()
      }
    },
    
    selectPlaylist(playlistId) {
      this.selectedPlaylist = playlistId
    },
    
    getPlaylistById(playlistId) {
      const userStore = useUserStore()
      const playlists = userStore.currentUser?.data?.tabs?.playlists || []
      return playlists.find(p => p.id === playlistId)
    },
    
    // Tab management within playlists
    addTabToPlaylist(playlistId, tabData) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return
      
      const playlist = this.getPlaylistById(playlistId)
      if (!playlist) return
      
      const newTab = {
        id: Date.now(),
        name: tabData.name || 'Untitled Tab',
        path: tabData.path || '',
        artist: tabData.artist || '',
        album: tabData.album || '',
        fileHandleId: tabData.fileHandleId || null, // Store the handle ID, not the handle itself
        addedAt: new Date().toISOString()
      }
      
      playlist.tabs.push(newTab)
      playlist.lastModified = new Date().toISOString()
      
      // Add to files list if not already there
      if (tabData.path && !userStore.currentUser.data.tabs.files.includes(tabData.path)) {
        userStore.currentUser.data.tabs.files.push(tabData.path)
      }
      
      this.updateTabMetadata()
      userStore.saveUsersToStorage()
      
      return newTab.id
    },
    
    removeTabFromPlaylist(playlistId, tabId) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return
      
      const playlist = this.getPlaylistById(playlistId)
      if (!playlist) return
      
      const index = playlist.tabs.findIndex(t => t.id === tabId)
      if (index > -1) {
        playlist.tabs.splice(index, 1)
        playlist.lastModified = new Date().toISOString()
        this.updateTabMetadata()
        userStore.saveUsersToStorage()
      }
    },
    
    updateTabInPlaylist(playlistId, tabId, updates) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return
      
      const playlist = this.getPlaylistById(playlistId)
      if (!playlist) return
      
      const tab = playlist.tabs.find(t => t.id === tabId)
      if (tab) {
        Object.assign(tab, updates)
        playlist.lastModified = new Date().toISOString()
        userStore.saveUsersToStorage()
      }
    },
    
    // Set current tab
    setCurrentTab(tabPath, tabName) {
      this.currentTabPath = tabPath
      this.currentTabName = tabName
      this.isTabLoaded = true
    },
    
    clearCurrentTab() {
      this.currentTabPath = ''
      this.currentTabName = ''
      this.currentTabFile = null
      this.isTabLoaded = false
    },
    
    // Metadata management
    updateTabMetadata() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return
      
      this.ensureTabsDataStructure()
      
      const metadata = userStore.currentUser.data.tabs.metadata
      const playlists = userStore.currentUser.data.tabs.playlists || []
      
      metadata.totalPlaylists = playlists.length
      metadata.totalTabs = playlists.reduce((total, playlist) => {
        return total + (playlist.tabs?.length || 0)
      }, 0)
      metadata.lastUpdated = new Date().toISOString()
      
      userStore.saveUsersToStorage()
    },
    
    // Storage methods
    saveTabsToStorage() {
      const userStore = useUserStore()
      userStore.saveUsersToStorage()
    },
    
    // Migration from old storage format
    loadFromStorage() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return
      
      this.ensureTabsDataStructure()
      
      // Migration: Load old tab data if exists
      if (localStorage.getItem('guitarapp_tabs')) {
        try {
          const oldData = JSON.parse(localStorage.getItem('guitarapp_tabs'))
          if (oldData.playlists && oldData.playlists.length > 0) {
            userStore.currentUser.data.tabs = oldData
            userStore.saveUsersToStorage()
            localStorage.removeItem('guitarapp_tabs')
            console.log('Migrated old tab data to user storage')
          }
        } catch (error) {
          console.error('Error migrating old tab data:', error)
        }
      }
      
      this.updateTabMetadata()
    }
  }
})
