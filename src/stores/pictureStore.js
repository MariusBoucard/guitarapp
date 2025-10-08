/**
 * Picture Store - Image gallery management
 * Per-user picture data stored in userStore
 */
import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const usePictureStore = defineStore('picture', {
  state: () => ({
    // UI state (not persisted)
    imageCache: new Map(),
    selectedPictureIndex: null,
    currentImageUrl: ''
  }),

  getters: {
    // Get current user's picture list from userStore
    pictureList() {
      const userStore = useUserStore()
      return userStore.currentUser?.data.pictures || []
    },

    // Get selected picture
    selectedPicture() {
      if (this.selectedPictureIndex === null || this.selectedPictureIndex >= this.pictureList.length) {
        return null
      }
      return this.pictureList[this.selectedPictureIndex]
    }
  },

  actions: {
    // Add a picture to the current user's list
    addPicture(pictureData) {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        // Check if picture already exists
        const exists = userStore.currentUser.data.pictures.some(pic => 
          pic.name === pictureData.name && pic.size === pictureData.size
        )
        
        if (!exists) {
          userStore.currentUser.data.pictures.push({
            name: pictureData.name,
            size: pictureData.size,
            type: pictureData.type,
            lastModified: pictureData.lastModified,
            dataUrl: pictureData.dataUrl // Store the base64 data URL
          })
          userStore.saveUsersToStorage()
          return true
        }
      }
      return false
    },

    // Remove a picture by index
    removePicture(index) {
      const userStore = useUserStore()
      if (userStore.currentUser && index >= 0 && index < userStore.currentUser.data.pictures.length) {
        const removedPicture = userStore.currentUser.data.pictures[index]
        userStore.currentUser.data.pictures.splice(index, 1)
        
        // Clear cache for removed picture
        this.imageCache.delete(removedPicture.name)
        
        // Adjust selected index if needed
        if (this.selectedPictureIndex === index) {
          if (userStore.currentUser.data.pictures.length > 0) {
            this.selectedPictureIndex = Math.min(index, userStore.currentUser.data.pictures.length - 1)
            this.loadPictureUrl(this.selectedPictureIndex)
          } else {
            this.clearSelection()
          }
        } else if (this.selectedPictureIndex > index) {
          this.selectedPictureIndex--
        }
        
        userStore.saveUsersToStorage()
      }
    },

    // Clear all pictures for current user
    clearAllPictures() {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        userStore.currentUser.data.pictures = []
        this.imageCache.clear()
        this.clearSelection()
        userStore.saveUsersToStorage()
      }
    },

    // Select a picture and load its URL
    selectPicture(index) {
      if (index >= 0 && index < this.pictureList.length) {
        this.selectedPictureIndex = index
        this.loadPictureUrl(index)
      }
    },

    // Load picture URL from data or cache
    loadPictureUrl(index) {
      const picture = this.pictureList[index]
      if (!picture) {
        this.currentImageUrl = ''
        return
      }

      // Check cache first
      if (this.imageCache.has(picture.name)) {
        this.currentImageUrl = this.imageCache.get(picture.name)
        return
      }

      // Use stored dataUrl
      if (picture.dataUrl) {
        this.currentImageUrl = picture.dataUrl
        this.imageCache.set(picture.name, picture.dataUrl)
      }
    },

    // Get image preview (with caching)
    getImagePreview(pictureName) {
      if (this.imageCache.has(pictureName)) {
        return this.imageCache.get(pictureName)
      }

      const picture = this.pictureList.find(p => p.name === pictureName)
      if (picture && picture.dataUrl) {
        this.imageCache.set(pictureName, picture.dataUrl)
        return picture.dataUrl
      }

      // Return placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik0yMCAyNUwyNSAxNUgxNUwyMCAyNVoiIGZpbGw9IiNjY2MiLz4KPC9zdmc+'
    },

    // Clear selection
    clearSelection() {
      this.selectedPictureIndex = null
      this.currentImageUrl = ''
    },

    // Cache an image
    cacheImage(name, dataUrl) {
      this.imageCache.set(name, dataUrl)
    }
  }
})
