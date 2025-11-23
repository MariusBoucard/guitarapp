export class AudioService {
  constructor(serviceManager = null) {
    this.serviceManager = serviceManager
    this.audioContext = null
    this.sourceNode = null
    this.currentAudio = null
  }

  initializeAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this.audioContext
  }

  async loadAudioFile(filePath) {
    try {
      const audio = new Audio()

      return new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
          resolve({
            duration: audio.duration,
            src: audio.src,
            audio: audio,
          })
        })

        audio.addEventListener('error', (error) => {
          reject(new Error(`Failed to load audio: ${error.message}`))
        })

        // Handle different file path types and normalize to valid URLs:
        // - blob: URLs are used as-is
        // - existing file:// URLs are used as-is
        // - Windows absolute paths (C:\...) must become file:///C:/path
        // - Unix absolute paths (/path) become file:///path
        // - Relative or http(s) URLs are used as-is
        if (!filePath) {
          return reject(new Error('Empty file path'))
        }

        const isBlob = filePath.startsWith('blob:')
        const isFileUrl = filePath.startsWith('file:')
        const isHttp = filePath.startsWith('http:') || filePath.startsWith('https:')

        if (isBlob || isHttp || isFileUrl) {
          audio.src = filePath
        } else {
          // Normalize Windows paths like C:\foo\bar.mp3 -> file:///C:/foo/bar.mp3
          const winAbsPath = /^[a-zA-Z]:\\/.test(filePath)
          const uncPath = /^\\\\/.test(filePath)

          if (winAbsPath) {
            const forward = filePath.replace(/\\/g, '/')
            const fileUrl = 'file:///' + forward.replace(/^\/+/, '')
            audio.src = encodeURI(fileUrl)
          } else if (uncPath) {
            // UNC path \\server\share\file -> file://server/share/file
            const withoutLeading = filePath.replace(/^\\+/, '')
            const forward = withoutLeading.replace(/\\/g, '/')
            const fileUrl = 'file://' + forward
            audio.src = encodeURI(fileUrl)
          } else if (filePath.startsWith('/')) {
            // Unix absolute path
            const fileUrl = 'file://' + filePath
            audio.src = encodeURI(fileUrl)
          } else {
            // Treat as relative path or other scheme - use directly
            audio.src = filePath
          }
        }
      })
    } catch (error) {
      throw new Error(`Audio loading failed: ${error.message}`)
    }
  }

  createBlobUrl(file) {
    if (!(file instanceof File)) {
      throw new Error('Invalid file object')
    }
    return URL.createObjectURL(file)
  }

  revokeBlobUrl(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  setPlaybackRate(audio, rate) {
    if (audio && typeof rate === 'number' && rate > 0) {
      audio.playbackRate = rate / 100
    }
  }

  setCurrentTime(audio, time, startTime = 0, endTime = Infinity) {
    if (!audio) return

    const clampedTime = Math.max(startTime, Math.min(time, endTime))
    audio.currentTime = clampedTime
  }

  handleTimeUpdate(audio, currentTime, startTime, endTime, loop = false) {
    if (!audio) return

    if (currentTime >= endTime) {
      if (loop) {
        audio.currentTime = startTime
      } else {
        audio.currentTime = startTime
        audio.pause()
      }
    } else if (currentTime < startTime) {
      audio.currentTime = startTime
    }
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00.00'

    const dateObj = new Date(seconds * 1000)
    const minutes = dateObj.getUTCMinutes()
    const secondsFormatted = dateObj.getUTCSeconds().toString().padStart(2, '0')
    const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10)
      .toString()
      .padStart(2, '0')
    return `${minutes}:${secondsFormatted}.${milliseconds}`
  }

  extractFilename(filePath) {
    if (!filePath) return ''

    const segments = filePath.split(/[\\/]/)
    return segments[segments.length - 1]
  }

  isValidAudioFile(filename) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return audioExtensions.includes(extension)
  }

  initWaveSurfer(containerId, audioUrl, options = {}) {
    console.log('Initializing WaveSurfer for:', audioUrl)
    // TODO: Implement WaveSurfer integration when needed
    // This would handle waveform visualization
  }

  async playAudio(audio, playbackRate = 1) {
    if (!audio) return

    try {
      if (playbackRate !== 1) {
        audio.playbackRate = playbackRate
      }
      await audio.play()
    } catch (error) {
      throw new Error(`Playback failed: ${error.message}`)
    }
  }

  pauseAudio(audio) {
    if (audio && !audio.paused) {
      audio.pause()
    }
  }

  stopAudio(audio, startTime = 0) {
    if (audio) {
      audio.pause()
      audio.currentTime = startTime
    }
  }

  getPlaybackState(audio) {
    if (!audio) {
      return {
        currentTime: 0,
        duration: 0,
        paused: true,
        ended: true,
        playbackRate: 1,
      }
    }

    return {
      currentTime: audio.currentTime,
      duration: audio.duration,
      paused: audio.paused,
      ended: audio.ended,
      playbackRate: audio.playbackRate,
    }
  }

  cleanup() {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.src = ''
      this.currentAudio = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}
