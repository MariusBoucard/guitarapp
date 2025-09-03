/**
 * Video Service - Handles all video-related operations
 * This is part of the Controller layer in MVC architecture
 */
export class VideoService {
  constructor(serviceManager = null) {
    this.serviceManager = serviceManager;
    this.currentVideo = null;
    this.currentBlobUrl = null;
  }

  /**
   * Load video file and return metadata
   */
  async loadVideoFile(filePath) {
    try {
      const video = document.createElement('video');
      
      return new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          resolve({
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            src: video.src,
            video: video
          });
        });
        
        video.addEventListener('error', (error) => {
          reject(new Error(`Failed to load video: ${error.message}`));
        });
        
        // Handle different file path types
        if (filePath.startsWith('blob:')) {
          video.src = filePath;
        } else {
          const sanitizedPath = this.sanitizeFilePath(filePath);
          video.src = `file://${sanitizedPath}`;
        }
      });
    } catch (error) {
      throw new Error(`Video loading failed: ${error.message}`);
    }
  }

  /**
   * Set video source using secure IPC loading for Electron
   */
  async setVideoSource(videoElement, filePath) {
    if (!videoElement) {
      throw new Error('Video element is required');
    }

    // Clean up previous blob URL if it exists
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    // For Electron, use IPC to load video securely
    if (window.electronAPI && window.electronAPI.loadVideoFile) {
      try {
        console.log('Loading video via IPC:', filePath);
        const result = await window.electronAPI.loadVideoFile(filePath);
        
        if (result.success) {
          // Convert base64 to blob URL
          const binaryString = atob(result.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: result.mimeType });
          this.currentBlobUrl = URL.createObjectURL(blob);
          videoElement.src = this.currentBlobUrl;
          
          console.log('Video loaded successfully via IPC');
          return this.currentBlobUrl;
        } else {
          throw new Error(result.error || 'Failed to load video file');
        }
      } catch (error) {
        console.error('IPC video loading failed:', error);
        throw new Error(`Failed to load video: ${error.message}`);
      }
    } else {
      // Fallback for web environments
      const sanitizedPath = this.sanitizeFilePath(filePath);
      videoElement.src = `file://${sanitizedPath}`;
      return videoElement.src;
    }
  }

  /**
   * Set video source from FileHandle ID
   */
  async setVideoSourceFromHandleId(videoElement, fileHandleId) {
    try {
      const fileService = this.serviceManager?.file;
      if (!fileService) {
        throw new Error('File service not available');
      }

      const fileHandle = fileService.getStoredFileHandle(fileHandleId);
      if (!fileHandle) {
        throw new Error(`FileHandle not found for ID: ${fileHandleId}`);
      }

      return await this.setVideoSourceFromHandle(videoElement, fileHandle);
    } catch (error) {
      throw new Error(`Failed to set video source from handle ID: ${error.message}`);
    }
  }

  /**
   * Set video source from FileHandle
   */
  async setVideoSourceFromHandle(videoElement, fileHandle) {
    try {
      if (!fileHandle) {
        throw new Error('FileHandle not provided');
      }
      
      const file = await fileHandle.getFile();
      const blobUrl = URL.createObjectURL(file);
      videoElement.src = blobUrl;
      
      // Clean up previous blob URL when new video loads
      videoElement.addEventListener('loadstart', () => {
        if (this.currentBlobUrl && this.currentBlobUrl !== blobUrl) {
          URL.revokeObjectURL(this.currentBlobUrl);
        }
        this.currentBlobUrl = blobUrl;
      }, { once: true });
      
      return blobUrl;
    } catch (error) {
      throw new Error(`Failed to set video source from handle: ${error.message}`);
    }
  }

  /**
   * Set playback rate
   */
  setPlaybackRate(video, rate) {
    if (video && typeof rate === 'number' && rate > 0) {
      video.playbackRate = rate / 100;
    }
  }

  /**
   * Set current time with bounds checking
   */
  setCurrentTime(video, time, startTime = 0, endTime = Infinity) {
    if (video && typeof time === 'number') {
      const constrainedTime = Math.max(startTime, Math.min(time, endTime));
      video.currentTime = constrainedTime;
    }
  }

  /**
   * Handle time update events (loop control, boundaries)
   */
  handleTimeUpdate(video, currentTime, startTime, endTime, loop) {
    if (!video) return;
    
    // Check if we've reached the end time
    if (endTime && currentTime >= endTime) {
      if (loop) {
        // Loop back to start time
        video.currentTime = startTime || 0;
      } else {
        // Pause at end time
        video.pause();
      }
    }
    
    // Check if we've gone before start time
    if (startTime && currentTime < startTime) {
      video.currentTime = startTime;
    }
  }

  /**
   * Play video with optional playback rate
   */
  async playVideo(video, playbackRate = 1) {
    if (!video) throw new Error('Video element required');
    
    if (playbackRate) {
      video.playbackRate = playbackRate;
    }
    
    try {
      await video.play();
    } catch (error) {
      throw new Error(`Failed to play video: ${error.message}`);
    }
  }

  /**
   * Pause video
   */
  pauseVideo(video) {
    if (video && !video.paused) {
      video.pause();
    }
  }

  /**
   * Stop video and reset to start time
   */
  stopVideo(video, startTime = 0) {
    if (video) {
      video.pause();
      video.currentTime = startTime;
    }
  }

  /**
   * Get current video metadata
   */
  getVideoMetadata(video) {
    if (!video) return null;
    
    return {
      duration: video.duration || 0,
      currentTime: video.currentTime || 0,
      playbackRate: video.playbackRate || 1,
      paused: video.paused,
      ended: video.ended,
      videoWidth: video.videoWidth || 0,
      videoHeight: video.videoHeight || 0,
      readyState: video.readyState,
      networkState: video.networkState
    };
  }

  /**
   * Sanitize file path for URL usage
   */
  sanitizeFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path provided');
    }
    
    // Replace backslashes with forward slashes for consistency
    let sanitized = filePath.replace(/\\/g, '/');
    
    // Remove any leading file:// protocol if present
    sanitized = sanitized.replace(/^file:\/\//, '');
    
    // Encode special characters but preserve directory separators
    const parts = sanitized.split('/');
    const encodedParts = parts.map(part => {
      // Don't encode empty parts (from leading slash or double slashes)
      if (part === '') return part;
      // Encode each path component separately
      return encodeURIComponent(part);
    });
    
    return encodedParts.join('/');
  }

  /**
   * Create video thumbnail
   */
  async createThumbnail(video, timeSeconds = 0) {
    return new Promise((resolve, reject) => {
      if (!video || video.readyState < 2) {
        reject(new Error('Video not ready for thumbnail creation'));
        return;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      
      const originalTime = video.currentTime;
      
      video.currentTime = timeSeconds;
      video.addEventListener('seeked', function onSeeked() {
        video.removeEventListener('seeked', onSeeked);
        
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          video.currentTime = originalTime;
          resolve(dataURL);
        } catch (error) {
          video.currentTime = originalTime;
          reject(error);
        }
      });
    });
  }

  /**
   * Get video file info
   */
  async getVideoFileInfo(filePath) {
    try {
      const video = document.createElement('video');
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video loading timeout'));
        }, 10000);
        
        video.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          resolve({
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            canPlay: video.readyState >= 3
          });
        });
        
        video.addEventListener('error', (error) => {
          clearTimeout(timeout);
          reject(new Error(`Video error: ${error.message}`));
        });
        
        video.src = filePath;
        video.load();
      });
    } catch (error) {
      throw new Error(`Failed to get video info: ${error.message}`);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.currentVideo = null;
  }

  /**
   * Check if video format is supported
   */
  isVideoFormatSupported(filePath) {
    const video = document.createElement('video');
    const extension = filePath.toLowerCase().split('.').pop();
    
    const mimeTypes = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'avi': 'video/avi',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      'mkv': 'video/x-matroska'
    };
    
    const mimeType = mimeTypes[extension];
    return mimeType ? video.canPlayType(mimeType) !== '' : false;
  }

  /**
   * Format time in seconds to MM:SS or HH:MM:SS format
   */
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Extract filename from file path
   */
  extractFilename(filePath) {
    if (!filePath) return 'Unknown';
    return filePath.split(/[\\\/]/).pop() || 'Unknown';
  }

  /**
   * Validate video file extension
   */
  isValidVideoFile(filePath) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    const extension = filePath.toLowerCase().split('.').pop();
    return videoExtensions.includes(`.${extension}`);
  }
}
