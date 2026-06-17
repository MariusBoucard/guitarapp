/**
 * UserDataService - Single authority for all persistent user data
 *
 * Owns the data model and handles all localStorage persistence.
 * Each domain (settings, notes, tuning, trainings, etc.) is a separate
 * concern with its own getter/setter methods.
 *
 * Storage: Single key 'guitarapp_users' contains all users + currentUserId.
 * Legacy keys are migrated on load and removed.
 */

const STORAGE_KEY = 'guitarapp_users'
const META_KEY = 'guitarapp_userMeta'

function createDefaultColors() {
  return [
    { note: 'A', color: 'black' },
    { note: 'AS', color: 'grey' },
    { note: 'B', color: 'white' },
    { note: 'C', color: 'blue' },
    { note: 'CS', color: 'lightblue' },
    { note: 'D', color: 'red' },
    { note: 'DS', color: 'pink' },
    { note: 'E', color: 'green' },
    { note: 'F', color: 'brown' },
    { note: 'FS', color: '#b5651d' },
    { note: 'G', color: 'yellow' },
    { note: 'GS', color: 'lightyellow' },
  ]
}

function createDefaultNoteSelection() {
  return [
    { note: 'A', enabled: false },
    { note: 'AS', enabled: false },
    { note: 'B', enabled: false },
    { note: 'C', enabled: false },
    { note: 'CS', enabled: false },
    { note: 'D', enabled: false },
    { note: 'DS', enabled: false },
    { note: 'E', enabled: true },
    { note: 'F', enabled: false },
    { note: 'FS', enabled: false },
    { note: 'G', enabled: false },
    { note: 'GS', enabled: false },
  ]
}

function createDefaultTuningList() {
  return [
    { cordeId: 0, tuning: 'E4' },
    { cordeId: 1, tuning: 'B3' },
    { cordeId: 2, tuning: 'G3' },
    { cordeId: 3, tuning: 'D3' },
    { cordeId: 4, tuning: 'A2' },
    { cordeId: 5, tuning: 'E2' },
  ]
}

function createDefaultSettings() {
  return {
    mancheDisplay: true,
    notesSelectedDisplay: true,
    tunerDisplay: false,
    pictureDisplay: false,
    soundDisplay: false,
    scalesDisplay: true,
    videoDisplay: false,
    videoDisplayNew: true,
    trainingDisplay: false,
    gameDisplay: false,
    chordssuggestDisplay: false,
    tabReaderDisplay: false,
  }
}

function createDefaultUserData() {
  return {
    trainings: [],
    videos: [],
    niouTrainingList: [],
    videoMetadata: {
      lastUpdated: null,
      totalVideos: 0,
      totalTrainings: 0,
      averageDuration: 0,
    },
    settings: createDefaultSettings(),
    notes: {
      noteSlectedList: createDefaultNoteSelection(),
      gammeSelected: '',
    },
    colors: createDefaultColors(),
    tuning: {
      nbfrettes: 24,
      diapason: 648,
      nbStrings: 6,
      tuningList: createDefaultTuningList(),
    },
    audioFiles: [],
    videoFiles: [],
    pictures: [],
    tabs: {
      playlists: [],
      files: [],
      metadata: {
        lastUpdated: null,
        totalTabs: 0,
        totalPlaylists: 0,
      },
    },
  }
}

function createDefaultUser() {
  return {
    id: 'default',
    name: 'Default User',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    avatar: '',
    email: '',
    data: createDefaultUserData(),
  }
}

export class UserDataService {
  constructor() {
    this.users = []
    this.currentUserId = null
    this.listeners = []
    this._loadFromStorage()
  }

  // ─── Persistence ───────────────────────────────────────────────

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.users && Array.isArray(parsed.users)) {
          this.users = parsed.users
          this.currentUserId = parsed.currentUserId || this.users[0]?.id
        } else if (Array.isArray(parsed)) {
          this.users = parsed
          this.currentUserId = this.users[0]?.id
        }
      } else {
        this.users = [createDefaultUser()]
        this.currentUserId = 'default'
      }
    } catch (e) {
      console.error('UserDataService: Failed to load from storage', e)
      this.users = [createDefaultUser()]
      this.currentUserId = 'default'
    }

    this._migrateLegacyData()
    this._ensureDataIntegrity()
  }

  save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ users: this.users, currentUserId: this.currentUserId })
      )
      this._notifyListeners()
    } catch (e) {
      console.error('UserDataService: Failed to save', e)
    }
  }

  _notifyListeners() {
    this.listeners.forEach((fn) => {
      try { fn() } catch (e) { console.error('UserDataService listener error', e) }
    })
  }

  onChange(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback)
    }
  }

  // ─── User Profile ──────────────────────────────────────────────

  get usersList() {
    return this.users
  }

  get currentUser() {
    return this.users.find((u) => u.id === this.currentUserId) || this.users[0]
  }

  get currentUserId() {
    return this._currentUserId
  }

  set currentUserId(id) {
    this._currentUserId = id
  }

  getUserById(userId) {
    return this.users.find((u) => u.id === userId)
  }

  userExists(userId) {
    return this.users.some((u) => u.id === userId)
  }

  createUser(userName, email = '', avatar = '') {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newUser = {
      id: userId,
      name: userName,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      avatar,
      email,
      data: createDefaultUserData(),
    }
    this.users.push(newUser)
    this.save()
    return userId
  }

  deleteUser(userId) {
    if (this.users.length <= 1) throw new Error('Cannot delete the last user')
    const index = this.users.findIndex((u) => u.id === userId)
    if (index === -1) throw new Error('User not found')
    this.users.splice(index, 1)
    if (this.currentUserId === userId) {
      this.switchUser(this.users[0].id)
    }
    this.save()
  }

  switchUser(userId) {
    if (!this.userExists(userId)) throw new Error('User does not exist')
    this.currentUserId = userId
    this.currentUser.lastActive = new Date().toISOString()
    this.save()
  }

  updateUserProfile(userId, updates) {
    const user = this.getUserById(userId)
    if (!user) throw new Error('User not found')
    if (updates.name !== undefined) user.name = updates.name
    if (updates.email !== undefined) user.email = updates.email
    if (updates.avatar !== undefined) user.avatar = updates.avatar
    this.save()
  }

  updateLastActive() {
    if (this.currentUser) {
      this.currentUser.lastActive = new Date().toISOString()
    }
  }

  // ─── Settings Domain ───────────────────────────────────────────

  getSettings() {
    return this.currentUser?.data?.settings || createDefaultSettings()
  }

  getSetting(key) {
    const settings = this.getSettings()
    return settings[key]
  }

  updateSetting(key, value) {
    if (!this.currentUser?.data?.settings) return
    this.currentUser.data.settings[key] = value
    this.save()
  }

  updateSettings(settingsUpdate) {
    if (!this.currentUser?.data?.settings) return
    Object.assign(this.currentUser.data.settings, settingsUpdate)
    this.save()
  }

  // ─── Notes Domain ──────────────────────────────────────────────

  getNoteSelectionList() {
    const notes = this.currentUser?.data?.notes
    if (!notes?.noteSlectedList || notes.noteSlectedList.length === 0) {
      return createDefaultNoteSelection()
    }
    return notes.noteSlectedList
  }

  getGammeSelected() {
    return this.currentUser?.data?.notes?.gammeSelected || ''
  }

  updateNoteSelection(noteName, enabled) {
    const notes = this.currentUser?.data?.notes
    if (!notes) return
    const note = notes.noteSlectedList.find((n) => n.note === noteName)
    if (note) {
      note.enabled = enabled
    }
    notes.gammeSelected = ''
    this.save()
  }

  updateAllNoteSelections(notesArray) {
    if (!this.currentUser?.data?.notes) return
    this.currentUser.data.notes.noteSlectedList = notesArray
    this.save()
  }

  setGammeSelected(scale) {
    if (!this.currentUser?.data?.notes) return
    this.currentUser.data.notes.gammeSelected = scale
    this.save()
  }

  // ─── Colors Domain ─────────────────────────────────────────────

  getColors() {
    const colors = this.currentUser?.data?.colors
    if (!colors || colors.length === 0) {
      return createDefaultColors()
    }
    return colors
  }

  setColors(colors) {
    if (!this.currentUser?.data) return
    this.currentUser.data.colors = colors
    this.save()
  }

  // ─── Tuning Domain ─────────────────────────────────────────────

  getTuning() {
    return this.currentUser?.data?.tuning || {
      nbfrettes: 24,
      diapason: 648,
      nbStrings: 6,
      tuningList: createDefaultTuningList(),
    }
  }

  getDiapason() {
    return this.getTuning().diapason
  }

  setDiapason(value) {
    if (!this.currentUser?.data?.tuning) return
    this.currentUser.data.tuning.diapason = value
    this.save()
  }

  getNbStrings() {
    return this.getTuning().nbStrings
  }

  setNbStrings(nb) {
    if (!this.currentUser?.data?.tuning) return
    this.currentUser.data.tuning.nbStrings = nb
    this.save()
  }

  getTuningList() {
    return this.getTuning().tuningList || []
  }

  setTuningList(list) {
    if (!this.currentUser?.data?.tuning) return
    this.currentUser.data.tuning.tuningList = list
    this.save()
  }

  updateStringTuning(stringId, tuning) {
    if (!this.currentUser?.data?.tuning) return
    const existing = this.currentUser.data.tuning.tuningList.find(
      (t) => t.cordeId === stringId
    )
    if (existing) {
      existing.tuning = tuning
    } else {
      this.currentUser.data.tuning.tuningList.push({ cordeId: stringId, tuning })
    }
    this.save()
  }

  setNumberOfFrets(nbFrets) {
    if (!this.currentUser?.data?.tuning) return
    this.currentUser.data.tuning.nbfrettes = nbFrets
    this.save()
  }

  resetTuningToDefault() {
    if (!this.currentUser?.data?.tuning) return
    this.currentUser.data.tuning.tuningList = createDefaultTuningList()
    this.currentUser.data.tuning.nbStrings = 6
    this.save()
  }

  // ─── Trainings Domain ──────────────────────────────────────────

  getTrainings() {
    return this.currentUser?.data?.trainings || []
  }

  addTraining(name) {
    const trainings = this.getTrainings()
    trainings.push({
      id: trainings.length,
      name: name || '',
      list: [],
      audioFiles: [],
    })
    this._reindexTrainings()
    this.save()
  }

  removeTraining(index) {
    const trainings = this.getTrainings()
    trainings.splice(index, 1)
    this._reindexTrainings()
    this.save()
  }

  _reindexTrainings() {
    const trainings = this.getTrainings()
    trainings.forEach((t, i) => { t.id = i })
  }

  addVideoToTraining(trainingId, videoData) {
    const training = this.getTrainings().find((t) => t.id === trainingId)
    if (!training) return
    const identifier = typeof videoData === 'string'
      ? videoData
      : (videoData.path || videoData.fileHandleId || videoData.identifier || videoData.url)
    const exists = training.list.some((item) => {
      const id = typeof item === 'string' ? item : (item.path || item.fileHandleId || item.identifier || item.url)
      return id === identifier
    })
    if (!exists) {
      training.list.push(videoData)
      this.save()
    }
  }

  removeVideoFromTraining(trainingId, videoData) {
    const training = this.getTrainings().find((t) => t.id === trainingId)
    if (!training) return
    const identifier = typeof videoData === 'string'
      ? videoData
      : (videoData.path || videoData.fileHandleId || videoData.identifier || videoData.url)
    const index = training.list.findIndex((item) => {
      const id = typeof item === 'string' ? item : (item.path || item.fileHandleId || item.identifier || item.url)
      return id === identifier
    })
    if (index > -1) {
      training.list.splice(index, 1)
      this.save()
    }
  }

  // ─── Videos Domain ─────────────────────────────────────────────

  getVideos() {
    return this.currentUser?.data?.videos || []
  }

  addVideoTraining(name) {
    const videos = this.getVideos()
    videos.push({
      id: videos.length,
      name: name || '',
      list: [],
    })
    this._reindexVideoTrainings()
    this.save()
  }

  removeVideoTraining(index) {
    const videos = this.getVideos()
    videos.splice(index, 1)
    this._reindexVideoTrainings()
    this.save()
  }

  _reindexVideoTrainings() {
    const videos = this.getVideos()
    videos.forEach((v, i) => { v.id = i })
  }

  getNiouTrainingList() {
    return this.currentUser?.data?.niouTrainingList || []
  }

  setNiouTrainingList(list) {
    if (!this.currentUser?.data) return
    this.currentUser.data.niouTrainingList = list
    this.save()
  }

  toggleTrainingVisibility(index) {
    const list = this.getNiouTrainingList()
    if (list[index]) {
      list[index].show = !list[index].show
      this.save()
    }
  }

  toggleItemVisibility(trainingIndex, itemIndex) {
    const list = this.getNiouTrainingList()
    if (list[trainingIndex]?.trainings?.[itemIndex]) {
      list[trainingIndex].trainings[itemIndex].show =
        !list[trainingIndex].trainings[itemIndex].show
      this.save()
    }
  }

  getVideoMetadata() {
    return this.currentUser?.data?.videoMetadata || {
      lastUpdated: null,
      totalVideos: 0,
      totalTrainings: 0,
      averageDuration: 0,
    }
  }

  updateVideoMetadata() {
    if (!this.currentUser?.data) return
    const metadata = this.currentUser.data.videoMetadata || {}
    const niouList = this.currentUser.data.niouTrainingList || []
    metadata.totalTrainings = niouList.length
    metadata.totalVideos = niouList.reduce((total, training) => {
      return total + training.trainings.reduce((t, item) => {
        return t + (item.videos ? item.videos.length : 1)
      }, 0)
    }, 0)
    metadata.lastUpdated = new Date().toISOString()
    this.currentUser.data.videoMetadata = metadata
    this.save()
  }

  setTrainingListWithMetadata(trainingList) {
    if (!this.currentUser?.data) return
    this.currentUser.data.niouTrainingList = trainingList
    this.updateVideoMetadata()
    this.save()
  }

  clearNiouTrainingData() {
    if (!this.currentUser?.data) return
    this.currentUser.data.niouTrainingList = []
    this.currentUser.data.videoMetadata = {
      lastUpdated: null,
      totalVideos: 0,
      totalTrainings: 0,
      averageDuration: 0,
    }
    this.save()
  }

  // ─── Audio Domain ──────────────────────────────────────────────

  getAudioFiles() {
    return this.currentUser?.data?.audioFiles || []
  }

  addAudioFile(filePath) {
    if (!this.currentUser?.data) return
    if (!this.currentUser.data.audioFiles) {
      this.currentUser.data.audioFiles = []
    }
    if (!this.currentUser.data.audioFiles.includes(filePath)) {
      this.currentUser.data.audioFiles.push(filePath)
      this.save()
    }
  }

  removeAudioFile(filePath) {
    if (!this.currentUser?.data?.audioFiles) return
    const index = this.currentUser.data.audioFiles.indexOf(filePath)
    if (index > -1) {
      this.currentUser.data.audioFiles.splice(index, 1)
      this.save()
    }
  }

  addAudioToTraining(trainingId, audioPath) {
    const training = this.getTrainings().find((t) => t.id === trainingId)
    if (!training) return
    if (!training.audioFiles) training.audioFiles = []
    if (!training.audioFiles.includes(audioPath)) {
      training.audioFiles.push(audioPath)
      this.save()
    }
  }

  removeAudioFromTraining(trainingId, audioPath) {
    const training = this.getTrainings().find((t) => t.id === trainingId)
    if (!training?.audioFiles) return
    const index = training.audioFiles.indexOf(audioPath)
    if (index > -1) {
      training.audioFiles.splice(index, 1)
      this.save()
    }
  }

  // ─── Video Files Domain ────────────────────────────────────────

  getVideoFiles() {
    return this.currentUser?.data?.videoFiles || []
  }

  addVideoFile(filePath) {
    if (!this.currentUser?.data) return
    if (!this.currentUser.data.videoFiles) {
      this.currentUser.data.videoFiles = []
    }
    this.currentUser.data.videoFiles.push(filePath)
    this.save()
  }

  removeVideoFile(filePath) {
    const files = this.getVideoFiles()
    const index = files.indexOf(filePath)
    if (index > -1) {
      files.splice(index, 1)
      this.save()
    }
  }

  // ─── Tabs Domain ───────────────────────────────────────────────

  getTabs() {
    return this.currentUser?.data?.tabs || {
      playlists: [],
      files: [],
      metadata: { lastUpdated: null, totalTabs: 0, totalPlaylists: 0 },
    }
  }

  getTabPlaylists() {
    return this.getTabs().playlists || []
  }

  getTabFiles() {
    return this.getTabs().files || []
  }

  createTabPlaylist(name) {
    const tabs = this.getTabs()
    if (!tabs.playlists) tabs.playlists = []
    const playlist = {
      id: Date.now(),
      name: name || `Playlist ${tabs.playlists.length + 1}`,
      tabs: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
    tabs.playlists.push(playlist)
    this._updateTabMetadata()
    this.save()
    return playlist.id
  }

  renameTabPlaylist(playlistId, newName) {
    const playlist = this.getTabPlaylists().find((p) => p.id === playlistId)
    if (playlist) {
      playlist.name = newName
      playlist.lastModified = new Date().toISOString()
      this.save()
    }
  }

  deleteTabPlaylist(playlistId) {
    const tabs = this.getTabs()
    const index = tabs.playlists.findIndex((p) => p.id === playlistId)
    if (index > -1) {
      tabs.playlists.splice(index, 1)
      this._updateTabMetadata()
      this.save()
    }
  }

  addTabToPlaylist(playlistId, tabData) {
    const playlist = this.getTabPlaylists().find((p) => p.id === playlistId)
    if (!playlist) return
    const newTab = {
      id: Date.now(),
      name: tabData.name || 'Untitled Tab',
      path: tabData.path || '',
      artist: tabData.artist || '',
      album: tabData.album || '',
      fileHandleId: tabData.fileHandleId || null,
      addedAt: new Date().toISOString(),
    }
    playlist.tabs.push(newTab)
    playlist.lastModified = new Date().toISOString()
    const tabs = this.getTabs()
    if (tabData.path && !tabs.files.includes(tabData.path)) {
      tabs.files.push(tabData.path)
    }
    this._updateTabMetadata()
    this.save()
    return newTab.id
  }

  removeTabFromPlaylist(playlistId, tabId) {
    const playlist = this.getTabPlaylists().find((p) => p.id === playlistId)
    if (!playlist) return
    const index = playlist.tabs.findIndex((t) => t.id === tabId)
    if (index > -1) {
      playlist.tabs.splice(index, 1)
      playlist.lastModified = new Date().toISOString()
      this._updateTabMetadata()
      this.save()
    }
  }

  _updateTabMetadata() {
    const tabs = this.getTabs()
    const playlists = tabs.playlists || []
    tabs.metadata.totalPlaylists = playlists.length
    tabs.metadata.totalTabs = playlists.reduce((t, p) => t + (p.tabs?.length || 0), 0)
    tabs.metadata.lastUpdated = new Date().toISOString()
  }

  // ─── Pictures Domain ───────────────────────────────────────────

  getPictures() {
    return this.currentUser?.data?.pictures || []
  }

  addPicture(pictureData) {
    if (!this.currentUser?.data) return false
    const pictures = this.getPictures()
    const exists = pictures.some(
      (p) => p.name === pictureData.name && p.size === pictureData.size
    )
    if (!exists) {
      pictures.push({
        name: pictureData.name,
        size: pictureData.size,
        type: pictureData.type,
        lastModified: pictureData.lastModified,
        dataUrl: pictureData.dataUrl,
      })
      this.save()
      return true
    }
    return false
  }

  removePicture(index) {
    const pictures = this.getPictures()
    if (index >= 0 && index < pictures.length) {
      pictures.splice(index, 1)
      this.save()
      return true
    }
    return false
  }

  clearAllPictures() {
    if (!this.currentUser?.data) return
    this.currentUser.data.pictures = []
    this.save()
  }

  // ─── Legacy Migration ──────────────────────────────────────────

  _migrateLegacyData() {
    // Migrate from old flat localStorage keys if user data is empty
    const user = this.currentUser
    if (!user) return

    // Migrate old tab data
    try {
      const oldTabs = localStorage.getItem('guitarapp_tabs')
      if (oldTabs && (!user.data.tabs?.playlists || user.data.tabs.playlists.length === 0)) {
        const parsed = JSON.parse(oldTabs)
        if (parsed.playlists && parsed.playlists.length > 0) {
          user.data.tabs = parsed
          localStorage.removeItem('guitarapp_tabs')
        }
      }
    } catch (e) { /* ignore */ }

    // Migrate old training data
    try {
      const oldTrainings = localStorage.getItem('songSave') || localStorage.getItem('videoSave')
      if (oldTrainings && (!user.data.trainings || user.data.trainings.length === 0)) {
        const parsed = JSON.parse(oldTrainings)
        parsed.forEach((t) => { if (!t.audioFiles) t.audioFiles = [] })
        user.data.trainings = parsed
      }
    } catch (e) { /* ignore */ }

    // Migrate old niou training list
    try {
      const oldNiou = localStorage.getItem('Trainings')
      if (oldNiou && (!user.data.niouTrainingList || user.data.niouTrainingList.length === 0)) {
        user.data.niouTrainingList = JSON.parse(oldNiou)
      }
    } catch (e) { /* ignore */ }

    // Migrate old directory info
    try {
      const oldDirInfo = localStorage.getItem('directoryInfo')
      if (oldDirInfo) {
        const parsed = JSON.parse(oldDirInfo)
        if (parsed.rootDirectoryPath) {
          // Just store the path info, directory handle can't be migrated
        }
      }
    } catch (e) { /* ignore */ }
  }

  _ensureDataIntegrity() {
    const user = this.currentUser
    if (!user) return

    // Ensure all required data structures exist
    if (!user.data) user.data = createDefaultUserData()
    if (!user.data.settings) user.data.settings = createDefaultSettings()
    if (!user.data.notes) user.data.notes = { noteSlectedList: createDefaultNoteSelection(), gammeSelected: '' }
    if (!user.data.notes.noteSlectedList || user.data.notes.noteSlectedList.length === 0) {
      user.data.notes.noteSlectedList = createDefaultNoteSelection()
    }
    if (!user.data.colors || user.data.colors.length === 0) {
      user.data.colors = createDefaultColors()
    }
    if (!user.data.tuning) user.data.tuning = {
      nbfrettes: 24, diapason: 648, nbStrings: 6, tuningList: createDefaultTuningList(),
    }
    if (!user.data.tuning.tuningList) user.data.tuning.tuningList = createDefaultTuningList()
    if (!user.data.trainings) user.data.trainings = []
    if (!user.data.videos) user.data.videos = []
    if (!user.data.niouTrainingList) user.data.niouTrainingList = []
    if (!user.data.videoMetadata) user.data.videoMetadata = {
      lastUpdated: null, totalVideos: 0, totalTrainings: 0, averageDuration: 0,
    }
    if (!user.data.audioFiles) user.data.audioFiles = []
    if (!user.data.videoFiles) user.data.videoFiles = []
    if (!user.data.pictures) user.data.pictures = []
    if (!user.data.tabs) user.data.tabs = {
      playlists: [], files: [], metadata: { lastUpdated: null, totalTabs: 0, totalPlaylists: 0 },
    }
  }

  // ─── Import/Export ─────────────────────────────────────────────

  exportUser(userId) {
    const user = this.getUserById(userId)
    if (!user) throw new Error('User not found')
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        data: JSON.parse(JSON.stringify(user.data)),
      },
    }
  }

  exportAllUsers() {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      users: this.users.map((u) => ({
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        createdAt: u.createdAt,
        data: u.data,
      })),
    }
  }

  importUser(importData, overwriteExisting = false) {
    if (!importData?.user) throw new Error('Invalid import data')
    const userData = importData.user
    const existing = this.users.find((u) => u.name === userData.name)

    if (existing && !overwriteExisting) {
      const newName = `${userData.name} (Imported ${new Date().toLocaleDateString()})`
      const id = this.createUser(newName, userData.email || '', userData.avatar || '')
      const newUser = this.getUserById(id)
      newUser.data = JSON.parse(JSON.stringify(userData.data))
    } else if (existing && overwriteExisting) {
      existing.data = JSON.parse(JSON.stringify(userData.data))
      existing.email = userData.email || existing.email
      existing.avatar = userData.userData || existing.avatar
    } else {
      const id = this.createUser(userData.name, userData.email || '', userData.avatar || '')
      const newUser = this.getUserById(id)
      newUser.data = JSON.parse(JSON.stringify(userData.data))
    }
    this.save()
  }

  // ─── Reset ─────────────────────────────────────────────────────

  resetAllUsers() {
    this.users = [createDefaultUser()]
    this.currentUserId = 'default'
    this.save()
  }

  // ─── Storage Info ──────────────────────────────────────────────

  getStorageInfo() {
    const raw = localStorage.getItem(STORAGE_KEY)
    return {
      size: raw ? new Blob([raw]).size : 0,
      usersCount: this.users.length,
      currentUser: this.currentUser?.name,
    }
  }
}

// Singleton instance
export const userDataService = new UserDataService()
