/**
 * File Service - Handles all file operations
 * This is part of the Controller layer in MVC architecture
 */
export class FileService {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
  }

  /**
   * Select audio file using native dialog (Electron) or file input
   */
  async selectAudioFile() {
    if (this.isElectron && window.electronAPI.selectAudioFile) {
      try {
        const filePath = await window.electronAPI.selectAudioFile();
        if (filePath) {
          return {
            path: filePath,
            name: this.extractFilename(filePath),
            isNative: true
          };
        }
      } catch (error) {
        console.warn('Native file selection failed, falling back to web input:', error);
      }
    }
    
    // Fallback to web file input
    return this.selectFileWeb();
  }

  /**
   * Select file using web file input
   */
  async selectFileWeb() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          resolve({
            file: file,
            path: file.path || URL.createObjectURL(file),
            name: file.name,
            isNative: false,
            isBlob: !file.path
          });
        } else {
          reject(new Error('No file selected'));
        }
      };
      
      input.oncancel = () => {
        reject(new Error('File selection cancelled'));
      };
      
      input.click();
    });
  }

  /**
   * Select video file
   */
  async selectVideoFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          resolve({
            file: file,
            path: file.path || URL.createObjectURL(file),
            name: file.name,
            isNative: false,
            isBlob: !file.path
          });
        } else {
          reject(new Error('No file selected'));
        }
      };
      
      input.oncancel = () => {
        reject(new Error('File selection cancelled'));
      };
      
      input.click();
    });
  }

  /**
   * Select directory (for training folders)
   */
  async selectDirectory() {
    if (typeof window !== 'undefined' && window.showDirectoryPicker) {
      try {
        const directoryHandle = await window.showDirectoryPicker();
        return directoryHandle;
      } catch (error) {
        throw new Error(`Directory selection failed: ${error.message}`);
      }
    } else {
      throw new Error('Directory selection not supported in this environment');
    }
  }

  /**
   * Read directory recursively for training structure
   */
  async readDirectoryRecursive(directoryHandle, basePath = '') {
    const trainingList = [];
    
    try {
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'directory') {
          const trainingType = entry.name;
          const currentPath = basePath ? `${basePath}/${trainingType}` : trainingType;
          const trainings = await this.readSubDirectory(entry, currentPath);
          
          trainingList.push({ 
            trainingType, 
            trainings,
            show: false // For UI accordion state
          });
        }
      }
      
      // Sort alphabetically
      trainingList.sort((a, b) => a.trainingType.localeCompare(b.trainingType));
      return trainingList;
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`);
    }
  }

  /**
   * Read subdirectory for training items
   */
  async readSubDirectory(directoryHandle, path) {
    const trainings = [];
    
    try {
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'directory') {
          const name = entry.name;
          const subPath = `${path}/${name}`;
          const videos = await this.readFiles(subPath, entry);
          
          trainings.push({
            name,
            videos,
            show: false // For UI accordion state
          });
        }
      }
      
      // Sort alphabetically
      trainings.sort((a, b) => a.name.localeCompare(b.name));
      return trainings;
    } catch (error) {
      throw new Error(`Failed to read subdirectory: ${error.message}`);
    }
  }

  /**
   * Read files from directory
   */
  async readFiles(path, directoryHandle) {
    const files = [];
    
    try {
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          if (this.isVideoFile(file.name)) {
            files.push({
              name: file.name,
              url: `${path}/${file.name}`,
              size: file.size,
              lastModified: file.lastModified
            });
          }
        } else if (entry.kind === 'directory') {
          // Recursively read subdirectories
          const subFiles = await this.readFiles(`${path}/${entry.name}`, entry);
          files.push(...subFiles);
        }
      }
      
      // Sort alphabetically
      files.sort((a, b) => a.name.localeCompare(b.name));
      return files;
    } catch (error) {
      throw new Error(`Failed to read files: ${error.message}`);
    }
  }

  /**
   * Extract filename from path
   */
  extractFilename(filePath) {
    if (!filePath) return '';
    const segments = filePath.split(/[\\/]/);
    return segments[segments.length - 1];
  }

  /**
   * Check if file is a video file
   */
  isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return videoExtensions.includes(extension);
  }

  /**
   * Check if file is an audio file
   */
  isAudioFile(filename) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return audioExtensions.includes(extension);
  }

  /**
   * Sanitize file path for URL usage
   */
  sanitizeFilePath(filePath) {
    if (!filePath) return '';
    return filePath.replace(/#/g, '%23');
  }

  /**
   * Create file URL for different environments
   */
  createFileUrl(filePath, isBlob = false) {
    if (isBlob || filePath.startsWith('blob:')) {
      return filePath;
    }
    
    const sanitizedPath = this.sanitizeFilePath(filePath);
    return `file://${sanitizedPath}`;
  }

  /**
   * Load video file
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
            src: video.src
          });
        });
        
        video.addEventListener('error', (error) => {
          reject(new Error(`Failed to load video: ${error.message}`));
        });
        
        video.src = this.createFileUrl(filePath);
      });
    } catch (error) {
      throw new Error(`Video loading failed: ${error.message}`);
    }
  }

  /**
   * Validate file size
   */
  validateFileSize(file, maxSizeMB = 100) {
    if (!file) return false;
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Get file metadata
   */
  getFileMetadata(file) {
    if (!file) return null;
    
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified)
    };
  }
}
