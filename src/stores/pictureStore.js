/**
 * Picture Store - Image gallery UI state
 *
 * Syncs persistent data into Pinia state for reactivity.
 * Delegates mutations to UserDataService.
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'

export const usePictureStore = defineStore('picture', {
  state: () => ({
    imageCache: new Map(),
    selectedPictureIndex: null,
    currentImageUrl: '',
    _pictures: JSON.parse(JSON.stringify(userDataService.getPictures())),
  }),

  getters: {
    pictureList: (state) => state._pictures,

    selectedPicture() {
      if (
        this.selectedPictureIndex === null ||
        this.selectedPictureIndex >= this._pictures.length
      ) {
        return null
      }
      return this._pictures[this.selectedPictureIndex]
    },
  },

  actions: {
    _syncFromUserData() {
      this._pictures = JSON.parse(JSON.stringify(userDataService.getPictures()))
    },

    addPicture(pictureData) {
      const result = userDataService.addPicture(pictureData)
      if (result) this._syncFromUserData()
      return result
    },

    removePicture(index) {
      if (index >= 0 && index < this._pictures.length) {
        const removedPicture = this._pictures[index]
        this.imageCache.delete(removedPicture.name)
        userDataService.removePicture(index)
        this._syncFromUserData()

        const newPictures = this._pictures
        if (this.selectedPictureIndex === index) {
          if (newPictures.length > 0) {
            this.selectedPictureIndex = Math.min(index, newPictures.length - 1)
            this.loadPictureUrl(this.selectedPictureIndex)
          } else {
            this.clearSelection()
          }
        } else if (this.selectedPictureIndex > index) {
          this.selectedPictureIndex--
        }
      }
    },

    clearAllPictures() {
      userDataService.clearAllPictures()
      this._pictures = []
      this.imageCache.clear()
      this.clearSelection()
    },

    selectPicture(index) {
      if (index >= 0 && index < this._pictures.length) {
        this.selectedPictureIndex = index
        this.loadPictureUrl(index)
      }
    },

    loadPictureUrl(index) {
      const picture = this._pictures[index]
      if (!picture) {
        this.currentImageUrl = ''
        return
      }
      if (this.imageCache.has(picture.name)) {
        this.currentImageUrl = this.imageCache.get(picture.name)
        return
      }
      if (picture.dataUrl) {
        this.currentImageUrl = picture.dataUrl
        this.imageCache.set(picture.name, picture.dataUrl)
      }
    },

    getImagePreview(pictureName) {
      if (this.imageCache.has(pictureName)) {
        return this.imageCache.get(pictureName)
      }
      const picture = this._pictures.find((p) => p.name === pictureName)
      if (picture?.dataUrl) {
        this.imageCache.set(pictureName, picture.dataUrl)
        return picture.dataUrl
      }
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik0yMCAyNUwyNSAxNUgxNUwyMCAyNVoiIGZpbGw9IiNjY2MiLz4KPC9zdmc+'
    },

    clearSelection() {
      this.selectedPictureIndex = null
      this.currentImageUrl = ''
    },

    cacheImage(name, dataUrl) {
      this.imageCache.set(name, dataUrl)
    },

    syncFromUserData() {
      this._syncFromUserData()
    },
  },
})
