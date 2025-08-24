/**
 * Audio Service - Handles all audio-related operations
 * This is part of the Controller layer in MVC architecture
 */
export class AudioService {
  constructor() {
    this.audioContext = null;
    this.sourceNode = null;
    this.currentAudio = null;
  }

  /**
   * Initialize audio context
   */
  initializeAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Load audio file and return metadata
   */
  async loadAudioFile(filePath) {
    try {
      const audio = new Audio();
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
          resolve({
            duration: audio.duration,
            src: audio.src,
            audio: audio
          });
        });
        
        audio.addEventListener('error', (error) => {
          reject(new Error(`Failed to load audio: ${error.message}`));
        });
        
        // Handle different file path types
        if (filePath.startsWith('blob:')) {
          audio.src = filePath;
        } else {
          audio.src = `file://${filePath}`;
        }
      });
    } catch (error) {
      throw new Error(`Audio loading failed: ${error.message}`);
    }
  }

  /**
   * Create blob URL from file
   */
  createBlobUrl(file) {
    if (!(file instanceof File)) {
      throw new Error('Invalid file object');
    }
    return URL.createObjectURL(file);
  }

  /**
   * Clean up blob URL
   */
  revokeBlobUrl(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Set playback rate
   */
  setPlaybackRate(audio, rate) {
    if (audio && typeof rate === 'number' && rate > 0) {
      audio.playbackRate = rate / 100;
    }
  }

  /**
   * Set current time with bounds checking
   */
  setCurrentTime(audio, time, startTime = 0, endTime = Infinity) {
    if (!audio) return;
    
    const clampedTime = Math.max(startTime, Math.min(time, endTime));
    audio.currentTime = clampedTime;
  }

  /**
   * Handle time update with loop logic
   */
  handleTimeUpdate(audio, currentTime, startTime, endTime, loop = false) {
    if (!audio) return;

    if (currentTime >= endTime) {
      if (loop) {
        audio.currentTime = startTime;
      } else {
        audio.currentTime = startTime;
        audio.pause();
      }
    } else if (currentTime < startTime) {
      audio.currentTime = startTime;
    }
  }

  /**
   * Format seconds to readable time string
   */
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00.00';
    
    const dateObj = new Date(seconds * 1000);
    const minutes = dateObj.getUTCMinutes();
    const secondsFormatted = dateObj.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10).toString().padStart(2, '0');
    return `${minutes}:${secondsFormatted}.${milliseconds}`;
  }

  /**
   * Extract filename from path
   */
  extractFilename(filePath) {
    if (!filePath) return '';
    
    // Handle both Windows and Unix path separators
    const segments = filePath.split(/[\\/]/);
    return segments[segments.length - 1];
  }

  /**
   * Validate audio file type
   */
  isValidAudioFile(filename) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return audioExtensions.includes(extension);
  }

  /**
   * Initialize WaveSurfer (placeholder for future implementation)
   */
  initWaveSurfer(containerId, audioUrl, options = {}) {
    console.log('Initializing WaveSurfer for:', audioUrl);
    // TODO: Implement WaveSurfer integration when needed
    // This would handle waveform visualization
  }

  /**
   * Play audio with optional rate
   */
  async playAudio(audio, playbackRate = 1) {
    if (!audio) return;
    
    try {
      if (playbackRate !== 1) {
        audio.playbackRate = playbackRate;
      }
      await audio.play();
    } catch (error) {
      throw new Error(`Playback failed: ${error.message}`);
    }
  }

  /**
   * Pause audio
   */
  pauseAudio(audio) {
    if (audio && !audio.paused) {
      audio.pause();
    }
  }

  /**
   * Stop audio (pause and reset to start)
   */
  stopAudio(audio, startTime = 0) {
    if (audio) {
      audio.pause();
      audio.currentTime = startTime;
    }
  }

  /**
   * Get current playback state
   */
  getPlaybackState(audio) {
    if (!audio) {
      return {
        currentTime: 0,
        duration: 0,
        paused: true,
        ended: true,
        playbackRate: 1
      };
    }

    return {
      currentTime: audio.currentTime,
      duration: audio.duration,
      paused: audio.paused,
      ended: audio.ended,
      playbackRate: audio.playbackRate
    };
  }

  /**
   * Cleanup audio resources
   */
  cleanup() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
