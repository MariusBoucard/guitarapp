/**
 * Tab Service - Handles tab file operations, import/export, and playlist management
 * This is part of the Controller layer in MVC architecture
 */
export class TabService {
  constructor(serviceManager = null) {
    this.serviceManager = serviceManager
  }

  /**
   * Load tab file and return metadata
   */
  async loadTabFile(filePath) {
    try {
      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`Failed to load tab file: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const metadata = await this.extractTabMetadata(arrayBuffer, filePath)

      return {
        data: arrayBuffer,
        metadata,
        path: filePath,
      }
    } catch (error) {
      throw new Error(`Tab loading failed: ${error.message}`)
    }
  }

  /**
   * Extract metadata from Guitar Pro file
   * This is a simplified version - AlphaTab will do the full parsing
   */
  async extractTabMetadata(arrayBuffer, filePath) {
    const fileName = this.extractFilename(filePath)

    return {
      name: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
      path: filePath,
      size: arrayBuffer.byteLength,
      artist: '',
      album: '',
    }
  }

  /**
   * Open file picker for Guitar Pro files
   */
  async openTabFilePicker() {
    return new Promise((resolve, reject) => {
      try {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.gp3,.gp4,.gp5,.gpx,.gp,.ptb'

        input.onchange = async (event) => {
          const file = event.target.files[0]
          if (!file) {
            reject(new Error('No file selected'))
            return
          }

          try {
            const arrayBuffer = await file.arrayBuffer()
            const metadata = await this.extractTabMetadata(arrayBuffer, file.name)

            resolve({
              file,
              arrayBuffer,
              metadata,
              path: file.name,
            })
          } catch (error) {
            reject(new Error(`Failed to read tab file: ${error.message}`))
          }
        }

        input.onerror = () => {
          reject(new Error('Failed to open file picker'))
        }

        input.click()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Export playlist to JSON file
   */
  async exportPlaylistToFile(playlist) {
    try {
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        playlist: {
          name: playlist.name,
          tabs: playlist.tabs,
          createdAt: playlist.createdAt,
        },
      }

      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `playlist_${this.sanitizeFilename(playlist.name)}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      return { success: true, filename: link.download }
    } catch (error) {
      console.error('Error exporting playlist:', error)
      throw new Error(`Failed to export playlist: ${error.message}`)
    }
  }

  /**
   * Import playlist from JSON file
   */
  async importPlaylistFromFile() {
    return new Promise((resolve, reject) => {
      try {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'

        input.onchange = async (event) => {
          const file = event.target.files[0]
          if (!file) {
            reject(new Error('No file selected'))
            return
          }

          try {
            const text = await file.text()
            const importData = JSON.parse(text)

            if (!this.validatePlaylistImport(importData)) {
              reject(new Error('Invalid playlist file format'))
              return
            }

            resolve({
              success: true,
              playlist: importData.playlist,
            })
          } catch (error) {
            reject(new Error(`Failed to parse playlist file: ${error.message}`))
          }
        }

        input.onerror = () => {
          reject(new Error('Failed to read file'))
        }

        input.click()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Validate playlist import data
   */
  validatePlaylistImport(data) {
    if (!data || typeof data !== 'object') return false
    if (!data.version || !data.playlist) return false
    if (!data.playlist.name || !Array.isArray(data.playlist.tabs)) return false
    return true
  }

  /**
   * Extract filename from path
   */
  extractFilename(filePath) {
    if (!filePath) return 'Unknown'
    return filePath.split(/[\\\/]/).pop() || 'Unknown'
  }

  /**
   * Sanitize filename for safe file downloads
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
  }

  /**
   * Check if file is a valid Guitar Pro tab file
   */
  isValidTabFile(filename) {
    const tabExtensions = ['.gp3', '.gp4', '.gp5', '.gpx', '.gp', '.ptb']
    const extension = filename.toLowerCase().split('.').pop()
    return tabExtensions.includes(`.${extension}`)
  }

  /**
   * Get file extension
   */
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase()
  }

  /**
   * Format file size to human-readable string
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Sort tabs in playlist by various criteria
   */
  sortPlaylistTabs(tabs, sortBy = 'name', ascending = true) {
    const sorted = [...tabs].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'artist':
          comparison = (a.artist || '').localeCompare(b.artist || '')
          break
        case 'addedAt':
          comparison = new Date(a.addedAt) - new Date(b.addedAt)
          break
        default:
          comparison = 0
      }

      return ascending ? comparison : -comparison
    })

    return sorted
  }

  /**
   * Search tabs across playlists
   */
  searchTabs(playlists, searchTerm) {
    const results = []
    const term = searchTerm.toLowerCase()

    playlists.forEach((playlist) => {
      const matchingTabs = playlist.tabs.filter((tab) => {
        return (
          tab.name.toLowerCase().includes(term) ||
          (tab.artist && tab.artist.toLowerCase().includes(term)) ||
          (tab.album && tab.album.toLowerCase().includes(term))
        )
      })

      if (matchingTabs.length > 0) {
        results.push({
          playlist,
          tabs: matchingTabs,
        })
      }
    })

    return results
  }

  /**
   * Get statistics for tab collection
   */
  getTabStatistics(playlists) {
    const stats = {
      totalPlaylists: playlists.length,
      totalTabs: 0,
      tabsByArtist: {},
      tabsByPlaylist: {},
    }

    playlists.forEach((playlist) => {
      stats.totalTabs += playlist.tabs.length
      stats.tabsByPlaylist[playlist.name] = playlist.tabs.length

      playlist.tabs.forEach((tab) => {
        if (tab.artist) {
          stats.tabsByArtist[tab.artist] = (stats.tabsByArtist[tab.artist] || 0) + 1
        }
      })
    })

    return stats
  }
}
