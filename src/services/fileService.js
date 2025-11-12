/**
 * File Service - Handles all file operations
 * This is part of the Controller layer in MVC architecture
 */
export class FileService {
  constructor(serviceManager = null) {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI
    this.serviceManager = serviceManager
    // Map to store FileHandle objects (not reactive)
    this.fileHandleMap = new Map()
    this.handleIdCounter = 0
  }

  /**
   * Generate unique ID for FileHandle and store it
   */
  storeFileHandle(fileHandle) {
    const id = `handle_${++this.handleIdCounter}`
    this.fileHandleMap.set(id, fileHandle)
    return id
  }

  /**
   * Get FileHandle by ID
   */
  getFileHandle(id) {
    return this.fileHandleMap.get(id)
  }

  /**
   * Clear all stored FileHandles (useful on app restart)
   */
  clearFileHandles() {
    console.log('Clearing all FileHandles, total cleared:', this.fileHandleMap.size)
    this.fileHandleMap.clear()
    this.handleIdCounter = 0
  }

  /**
   * Select audio file using native dialog (Electron) or file input
   */
  async selectAudioFile() {
    if (this.isElectron && window.electronAPI.selectAudioFile) {
      try {
        const filePath = await window.electronAPI.selectAudioFile()
        if (filePath) {
          return {
            path: filePath,
            name: this.extractFilename(filePath),
            isNative: true,
          }
        }
      } catch (error) {
        console.warn('Native file selection failed, falling back to web input:', error)
      }
    }

    // Fallback to web file input
    return this.selectFileWeb()
  }

  /**
   * Select file using web file input
   */
  async selectFileWeb() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'audio/*'

      input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
          resolve({
            file: file,
            path: file.path || URL.createObjectURL(file),
            name: file.name,
            isNative: false,
            isBlob: !file.path,
          })
        } else {
          reject(new Error('No file selected'))
        }
      }

      input.oncancel = () => {
        reject(new Error('File selection cancelled'))
      }

      input.click()
    })
  }

  /**
   * Select video file using native dialog (Electron) or file input
   */
  async selectVideoFile() {
    if (this.isElectron && window.electronAPI.selectVideoFile) {
      try {
        const filePath = await window.electronAPI.selectVideoFile()
        if (filePath) {
          return {
            path: filePath,
            name: this.extractFilename(filePath),
            isNative: true,
          }
        }
      } catch (error) {
        console.warn('Native video selection failed:', error)
      }
    }

    throw new Error('Native video selection not available')
  }

  /**
   * Select directory (for training folders)
   */
  async selectDirectory() {
    if (typeof window !== 'undefined' && window.showDirectoryPicker) {
      try {
        const directoryHandle = await window.showDirectoryPicker()
        return directoryHandle
      } catch (error) {
        throw new Error(`Directory selection failed: ${error.message}`)
      }
    } else {
      throw new Error('Directory selection not supported in this environment')
    }
  }

  /**
   * Read directory recursively for training structure with FileHandle tracking
   */
  async readDirectoryRecursive(directoryHandle, basePath = '') {
    const trainingList = []
    let totalVideos = 0

    try {
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'directory') {
          const trainingType = entry.name
          const trainings = await this.readSubDirectory(
            entry,
            trainingType,
            directoryHandle,
            basePath
          )

          // Count videos in this training
          const videoCount = trainings.reduce((count, training) => {
            return count + (training.videos ? training.videos.length : 1)
          }, 0)

          totalVideos += videoCount

          trainingList.push({
            trainingType,
            trainings,
            videoCount,
            show: false, // For UI accordion state
          })
        }
      }

      // Sort alphabetically
      trainingList.sort((a, b) => a.trainingType.localeCompare(b.trainingType))

      // Add metadata to the result
      return {
        trainings: trainingList,
        metadata: {
          totalTrainings: trainingList.length,
          totalVideos: totalVideos,
          basePath: basePath,
          directoryName: directoryHandle.name,
          scannedAt: new Date().toISOString(),
        },
      }
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`)
    }
  }

  /**
   * Build proper file path
   */
  buildPath(...segments) {
    return segments.filter(Boolean).join('/')
  }

  /**
   * Read subdirectory for training items with FileHandle tracking
   */
  async readSubDirectory(directoryHandle, trainingType, rootHandle, basePath = '') {
    const trainings = []

    try {
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'directory') {
          const name = entry.name
          const videos = await this.readFiles(entry, name, directoryHandle, basePath)

          trainings.push({
            name,
            videos,
            videoCount: videos.length,
            show: false, // For UI accordion state
          })
        } else if (entry.kind === 'file') {
          // Handle direct video files in training directory
          if (this.isVideoFile(entry.name)) {
            const fileHandleId = this.storeFileHandle(entry)
            const absolutePath = basePath
              ? `${basePath.replace(/[\\\/]+$/, '')}/${entry.name}`
              : entry.name

            trainings.push({
              name: entry.name,
              fileHandleId: fileHandleId, // Store ID instead of FileHandle
              absolutePath: absolutePath, // Store absolute path
              isDirectFile: true,
              show: false,
            })
          }
        }
      }

      // Sort alphabetically
      trainings.sort((a, b) => a.name.localeCompare(b.name))
      return trainings
    } catch (error) {
      throw new Error(`Failed to read subdirectory: ${error.message}`)
    }
  }

  /**
   * Read files from directory with FileHandle tracking
   */
  async readFiles(directoryHandle, parentName, parentHandle, basePath = '') {
    const files = []

    try {
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
          if (this.isVideoFile(entry.name)) {
            const fileHandleId = this.storeFileHandle(entry)
            const relativePath = `${parentName}/${entry.name}`
            const absolutePath = basePath
              ? `${basePath.replace(/[\\\/]+$/, '')}/${relativePath}`
              : relativePath

            files.push({
              name: entry.name,
              fileHandleId: fileHandleId, // Store ID instead of FileHandle
              parentName: parentName,
              path: relativePath, // Keep relative path for backwards compatibility
              absolutePath: absolutePath, // Store absolute path for direct access
            })
          }
        } else if (entry.kind === 'directory') {
          // Recursively read subdirectories
          const subFiles = await this.readFiles(
            entry,
            `${parentName}/${entry.name}`,
            directoryHandle,
            basePath
          )
          files.push(...subFiles)
        }
      }

      // Sort alphabetically
      files.sort((a, b) => a.name.localeCompare(b.name))
      return files
    } catch (error) {
      throw new Error(`Failed to read files: ${error.message}`)
    }
  }

  /**
   * Create blob URL from FileHandle ID
   */
  async createBlobUrlFromHandleId(fileHandleId) {
    const fileHandle = this.getFileHandle(fileHandleId)
    if (!fileHandle) {
      throw new Error(`FileHandle not found for ID: ${fileHandleId}`)
    }
    return this.createBlobUrlFromHandle(fileHandle)
  }

  /**
   * Load video from FileHandle ID
   */
  async loadVideoFromHandleId(fileHandleId) {
    const fileHandle = this.getFileHandle(fileHandleId)
    if (!fileHandle) {
      throw new Error(`FileHandle not found for ID: ${fileHandleId}`)
    }
    return this.loadVideoFromHandle(fileHandle)
  }

  /**
   * Create blob URL from FileHandle
   */
  async createBlobUrlFromHandle(fileHandle) {
    try {
      const file = await fileHandle.getFile()
      return {
        url: URL.createObjectURL(file),
        file: file,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      }
    } catch (error) {
      throw new Error(`Failed to create blob URL: ${error.message}`)
    }
  }

  /**
   * Load video from FileHandle
   */
  async loadVideoFromHandle(fileHandle) {
    try {
      const blobData = await this.createBlobUrlFromHandle(fileHandle)
      const video = document.createElement('video')

      return new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          resolve({
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            src: video.src,
            blobUrl: blobData.url,
            file: blobData.file,
          })
        })

        video.addEventListener('error', (error) => {
          reject(new Error(`Failed to load video: ${error.message}`))
        })

        video.src = blobData.url
      })
    } catch (error) {
      throw new Error(`Video loading failed: ${error.message}`)
    }
  }

  /**
   * Extract filename from path
   */
  extractFilename(filePath) {
    if (!filePath) return ''
    const segments = filePath.split(/[\\/]/)
    return segments[segments.length - 1]
  }

  /**
   * Check if file is a video file
   */
  isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return videoExtensions.includes(extension)
  }

  /**
   * Check if file is an audio file
   */
  isAudioFile(filename) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return audioExtensions.includes(extension)
  }

  /**
   * Sanitize file path for URL usage
   */
  sanitizeFilePath(filePath) {
    if (!filePath) return ''
    return filePath.replace(/#/g, '%23')
  }

  /**
   * Create file URL for different environments
   */
  createFileUrl(filePath, isBlob = false) {
    if (isBlob || filePath.startsWith('blob:')) {
      return filePath
    }

    const sanitizedPath = this.sanitizeFilePath(filePath)
    return `file://${sanitizedPath}`
  }

  /**
   * Load video file
   */
  async loadVideoFile(filePath) {
    try {
      const video = document.createElement('video')

      return new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          resolve({
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            src: video.src,
          })
        })

        video.addEventListener('error', (error) => {
          reject(new Error(`Failed to load video: ${error.message}`))
        })

        video.src = this.createFileUrl(filePath)
      })
    } catch (error) {
      throw new Error(`Video loading failed: ${error.message}`)
    }
  }

  /**
   * Validate file size
   */
  validateFileSize(file, maxSizeMB = 100) {
    if (!file) return false

    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }

  /**
   * Get file metadata
   */
  getFileMetadata(file) {
    if (!file) return null

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified),
    }
  }
}
