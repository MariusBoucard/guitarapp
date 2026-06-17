/**
 * Tab Store - Tab playlists and files UI state
 *
 * Syncs persistent data into Pinia state for reactivity.
 * Delegates mutations to UserDataService.
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'

export const useTabStore = defineStore('tab', {
  state: () => ({
    selectedPlaylist: 0,
    currentTabName: '',
    currentTabPath: '',
    currentTabFile: null,
    isTabLoaded: false,
    _tabPlaylists: JSON.parse(JSON.stringify(userDataService.getTabPlaylists())),
    _tabFiles: JSON.parse(JSON.stringify(userDataService.getTabFiles())),
  }),

  getters: {
    tabPlaylists: (state) => state._tabPlaylists,
    tabFiles: (state) => state._tabFiles,

    currentPlaylistData: (state) => {
      return state._tabPlaylists.find((p) => p.id === state.selectedPlaylist)
    },
    currentPlaylistTabs() {
      return this.currentPlaylistData?.tabs || []
    },
    totalPlaylistsCount: (state) => state._tabPlaylists.length,
    totalTabsCount() {
      return this._tabPlaylists.reduce((t, p) => t + (p.tabs?.length || 0), 0)
    },
    playlistByIndex: (state) => (index) => state._tabPlaylists[index],
    allTabs() {
      const tabs = []
      this._tabPlaylists.forEach((p) => {
        if (p.tabs) tabs.push(...p.tabs)
      })
      return tabs
    },
  },

  actions: {
    _syncFromUserData() {
      this._tabPlaylists = JSON.parse(JSON.stringify(userDataService.getTabPlaylists()))
      this._tabFiles = JSON.parse(JSON.stringify(userDataService.getTabFiles()))
    },

    createPlaylist(name) {
      const id = userDataService.createTabPlaylist(name)
      this._syncFromUserData()
      return id
    },

    renamePlaylist(playlistId, newName) {
      userDataService.renameTabPlaylist(playlistId, newName)
      this._syncFromUserData()
    },

    deletePlaylist(playlistId) {
      userDataService.deleteTabPlaylist(playlistId)
      this._syncFromUserData()
      if (this.selectedPlaylist === playlistId && this._tabPlaylists.length > 0) {
        this.selectedPlaylist = this._tabPlaylists[0].id
      }
    },

    selectPlaylist(playlistId) {
      this.selectedPlaylist = playlistId
    },

    getPlaylistById(playlistId) {
      return this._tabPlaylists.find((p) => p.id === playlistId)
    },

    addTabToPlaylist(playlistId, tabData) {
      const id = userDataService.addTabToPlaylist(playlistId, tabData)
      this._syncFromUserData()
      return id
    },

    removeTabFromPlaylist(playlistId, tabId) {
      userDataService.removeTabFromPlaylist(playlistId, tabId)
      this._syncFromUserData()
    },

    updateTabInPlaylist(playlistId, tabId, updates) {
      const playlist = this.getPlaylistById(playlistId)
      if (!playlist) return
      const tab = playlist.tabs.find((t) => t.id === tabId)
      if (tab) {
        Object.assign(tab, updates)
        playlist.lastModified = new Date().toISOString()
        userDataService.save()
      }
    },

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

    saveTabsToStorage() {
      userDataService.save()
    },

    loadFromStorage() {
      this._syncFromUserData()
    },

    syncFromUserData() {
      this._syncFromUserData()
    },
  },
})
