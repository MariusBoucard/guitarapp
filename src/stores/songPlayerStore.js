import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useSongPlayerStore = defineStore('songPlayer', {
  state: () => ({
    currentSong: '',
    songLength: 0,
    startTime: 0,
    endTime: 0,
    speed: 100,
    pitch: 0,
    loop: false,
    defaultPath: '/media/marius/DISK GROS/',
    
    playlists: [],
    selectedPlaylistId: null,
    currentPlaylistName: '',
  }),

  getters: {
    audioPath() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.audioFiles) {
        if (userStore.currentUser) {
          userStore.currentUser.data.audioFiles = []
        }
        return []
      }
      return userStore.currentUser.data.audioFiles
    },

    songPath() {
      return this.audioPath
    },

    formattedSongLength: (state) => {
      const dateObj = new Date(state.songLength * 1000)
      const minutes = dateObj.getUTCMinutes()
      const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0')
      const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10)
        .toString()
        .padStart(2, '0')
      return `${minutes}:${seconds}.${milliseconds}`
    },

    playlistList() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.audioPlaylists) {
        if (userStore.currentUser) {
          userStore.currentUser.data.audioPlaylists = []
        }
        return []
      }
      return userStore.currentUser.data.audioPlaylists
    },

    currentPlaylistData: (state) => {
      const userStore = useUserStore()
      const playlists = userStore.currentUser?.data?.audioPlaylists || []
      return playlists.find((playlist) => playlist.id === state.selectedPlaylistId)
    },

    currentPlaylistAudioFiles() {
      return this.currentPlaylistData?.audioFiles || []
    },
  },

  actions: {
    // Playlist management actions
    addPlaylist(name) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      if (!userStore.currentUser.data.audioPlaylists) {
        userStore.currentUser.data.audioPlaylists = []
      }

      const playlists = userStore.currentUser.data.audioPlaylists
      playlists.push({
        id: playlists.length,
        name: name || this.currentPlaylistName,
        audioFiles: [],
      })
      this.reindexPlaylists()
      userStore.saveUsersToStorage()
    },

    removePlaylist(index = this.selectedPlaylistId) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      if (!userStore.currentUser.data.audioPlaylists) return

      userStore.currentUser.data.audioPlaylists.splice(index, 1)
      this.reindexPlaylists()
      
      if (this.selectedPlaylistId === index) {
        this.selectedPlaylistId = null
      }
      
      userStore.saveUsersToStorage()
    },

    selectPlaylist(playlist) {
      this.selectedPlaylistId = playlist.id
    },

    reindexPlaylists() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.audioPlaylists) return

      userStore.currentUser.data.audioPlaylists.forEach((playlist, index) => {
        playlist.id = index
      })
    },

    addAudioFile(filePath, fileName) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      if (this.currentPlaylistData) {
        if (!this.currentPlaylistData.audioFiles.includes(filePath)) {
          this.currentPlaylistData.audioFiles.push(filePath)
        }
      } else {
        if (!userStore.currentUser.data.audioFiles) {
          userStore.currentUser.data.audioFiles = []
        }
        if (!userStore.currentUser.data.audioFiles.includes(filePath)) {
          userStore.currentUser.data.audioFiles.push(filePath)
        }
      }

      this.currentSong = fileName
      userStore.saveUsersToStorage()
    },

    removeAudioFile(filePath) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      if (this.currentPlaylistData) {
        const index = this.currentPlaylistData.audioFiles.indexOf(filePath)
        if (index > -1) {
          this.currentPlaylistData.audioFiles.splice(index, 1)
        }
      } else {
        const audioFiles = userStore.currentUser.data.audioFiles || []
        const index = audioFiles.indexOf(filePath)
        if (index > -1) {
          audioFiles.splice(index, 1)
        }
      }

      userStore.saveUsersToStorage()
    },

    setPlaybackSettings({ startTime, endTime, speed, pitch, loop }) {
      if (startTime !== undefined) this.startTime = startTime
      if (endTime !== undefined) this.endTime = endTime
      if (speed !== undefined) this.speed = speed
      if (pitch !== undefined) this.pitch = pitch
      if (loop !== undefined) this.loop = loop
    },

    setSongLength(duration) {
      this.songLength = duration
      this.endTime = duration
    },

    saveAudioToStorage() {
      const userStore = useUserStore()
      userStore.saveUsersToStorage()
    },

    loadFromStorage() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      if (
        (!userStore.currentUser.data.audioPlaylists ||
          userStore.currentUser.data.audioPlaylists.length === 0) &&
        localStorage.getItem('songSave')
      ) {
        const oldPlaylists = JSON.parse(localStorage.getItem('songSave'))
        userStore.currentUser.data.audioPlaylists = oldPlaylists.map((playlist, index) => ({
          id: index,
          name: playlist.name || `Playlist ${index + 1}`,
          audioFiles: playlist.audioFiles || [],
        }))
        userStore.saveUsersToStorage()
      }
    },
  },
})