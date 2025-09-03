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
   * Set video source from FileHandle ID
   */
  async setVideoSourceFromHandleId(videoElement, fileHandleId) {
    if (!videoElement) {
      throw new Error('Video element is required');
    }

    try {
      const fileService = this.serviceManager.getService('file');
      const fileHandle = fileService.getFileHandle(fileHandleId);
      
      if (!fileHandle) {
        throw new Error(`FileHandle not found for ID: ${fileHandleId}`);
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
      throw new Error(`Failed to set video source from handle ID: ${error.message}`);
    }
  }

  /**
   * Set video source from FileHandle (legacy method for direct FileHandle)
   */
  async setVideoSourceFromHandle(videoElement, fileHandle) {
    if (!videoElement) {
      throw new Error('Video element is required');
    }

    try {
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
   * Set video source on video element (legacy method for file paths)
   */
  setVideoSource(videoElement, filePath) {
    if (!videoElement) {
      throw new Error('Video element is required');
    }

    // For Electron, use the file path directly without URL encoding
    if (window.electronAPI) {
      videoElement.src = `file://${filePath}`;
    } else {
      // For web environments, apply URL encoding
      const sanitizedPath = this.sanitizeFilePath(filePath);
      videoElement.src = `file://${sanitizedPath}`;
    }
    
    return videoElement.src;
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
    if (!video) return;
    
    const clampedTime = Math.max(startTime, Math.min(time, endTime));
    video.currentTime = clampedTime;
  }

  /**
   * Handle time update with loop logic
   */
  handleTimeUpdate(video, currentTime, startTime, endTime, loop = false) {
    if (!video) return;

    if (currentTime >= endTime) {
      if (loop) {
        video.currentTime = startTime;
      } else {
        video.currentTime = startTime;
        video.pause();
      }
    } else if (currentTime < startTime) {
      video.currentTime = startTime;
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
   * Sanitize file path for URL usage
   */
  sanitizeFilePath(filePath) {
    if (!filePath) return '';
    return filePath.replace(/#/g, '%23');
  }

  /**
   * Validate video file type
   */
  isValidVideoFile(filename) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return videoExtensions.includes(extension);
  }

  /**
   * Play video with optional rate
   */
  async playVideo(video, playbackRate = 1) {
    if (!video) return;
    
    try {
      if (playbackRate !== 1) {
        video.playbackRate = playbackRate;
      }
      await video.play();
    } catch (error) {
      throw new Error(`Video playback failed: ${error.message}`);
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
   * Stop video (pause and reset to start)
   */
  stopVideo(video, startTime = 0) {
    if (video) {
      video.pause();
      video.currentTime = startTime;
    }
  }

  /**
   * Get current playback state
   */
  getPlaybackState(video) {
    if (!video) {
      return {
        currentTime: 0,
        duration: 0,
        paused: true,
        ended: true,
        playbackRate: 1,
        videoWidth: 0,
        videoHeight: 0
      };
    }

    return {
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
      ended: video.ended,
      playbackRate: video.playbackRate,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    };
  }

  /**
   * Handle video loading with metadata
   */
  async handleVideoLoad(video, onLoadCallback) {
    return new Promise((resolve, reject) => {
      const handleLoad = () => {
        const metadata = {
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        };
        
        if (onLoadCallback) {
          onLoadCallback(metadata);
        }
        
        resolve(metadata);
      };

      const handleError = (error) => {
        reject(new Error(`Video load failed: ${error.message}`));
      };

      video.addEventListener('loadedmetadata', handleLoad, { once: true });
      video.addEventListener('error', handleError, { once: true });
    });
  }

  /**
   * Process video chunks for large files (placeholder for future implementation)
   */
  async processVideoChunks(file, chunkSize = 10 * 1024 * 1024) {
    // This would be used for streaming large video files
    // Currently a placeholder for future enhancement
    console.log('Video chunk processing not yet implemented');
    return null;
  }

  /**
   * Cleanup video resources
   */
  cleanup() {
    if (this.currentVideo) {
      this.currentVideo.pause();
      this.currentVideo.src = '';
      this.currentVideo = null;
    }
    
    // Clean up blob URL
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }
}
