import { defineStore } from 'pinia'

export const useVideoStore = defineStore('video', {
  state: () => ({
    // Video data
    videoList: [],
    selectedVideo: 0,
    currentVideoName: "",
    
    // Video paths and directory management
    videoPath: [],
    rootDirectory: null, // DirectoryHandle for the root training directory
    rootDirectoryPath: "", // String path to the root directory
    currentDirectoryPath: "", // Current working directory path
    defaultPath: "/media/marius/DISK GROS/", // Default base path for directory selection
    
    // Current playing state
    currentVideo: "",
    videoLength: 0,
    
    // Playback settings
    startTime: 0,
    endTime: 0,
    speed: 100,
    loop: false,
    
    // Training structure (for videoComponentNew)
    niouTrainingList: [],
    trainingMetadata: {
      lastUpdated: null,
      totalVideos: 0,
      totalTrainings: 0,
      averageDuration: 0
    },
    
    // Directory management
    directoryStructure: {
      name: "",
      path: "",
      handle: null,
      lastScanned: null,
      totalSize: 0
    }
  }),
  
  getters: {
    currentVideoData: (state) => 
      state.videoList.find(video => video.id === state.selectedVideo),
    
    currentVideoFiles: (state) => 
      state.currentVideoData?.list || [],
    
    formattedVideoLength: (state) => {
      const dateObj = new Date(state.videoLength * 1000);
      const minutes = dateObj.getUTCMinutes();
      const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0');
      const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10).toString().padStart(2, '0');
      return `${minutes}:${seconds}.${milliseconds}`;
    },
    
    // Directory and path getters
    hasRootDirectory: (state) => state.rootDirectory !== null,
    
    effectiveBasePath: (state) => 
      state.rootDirectoryPath || state.defaultPath,
    
    totalTrainingsCount: (state) => state.niouTrainingList.length,
    
    totalVideosCount: (state) => 
      state.niouTrainingList.reduce((total, training) => {
        return total + training.trainings.reduce((trainingTotal, item) => {
          return trainingTotal + (item.videos ? item.videos.length : 1);
        }, 0);
      }, 0),
    
    trainingByIndex: (state) => (index) => state.niouTrainingList[index],
    
    directoryInfo: (state) => ({
      name: state.directoryStructure.name,
      path: state.directoryStructure.path,
      lastScanned: state.directoryStructure.lastScanned,
      totalVideos: state.trainingMetadata.totalVideos,
      totalTrainings: state.trainingMetadata.totalTrainings
    })
  },
  
  actions: {
    // Video training management
    addVideoTraining(name) {
      this.videoList.push({
        id: this.videoList.length,
        name: name || this.currentVideoName,
        list: []
      });
      this.reindexVideoTrainings();
      this.saveVideoTrainingsToStorage();
    },
    
    removeVideoTraining(index = this.selectedVideo) {
      this.videoList.splice(index, 1);
      this.reindexVideoTrainings();
      this.saveVideoTrainingsToStorage();
    },
    
    selectVideoTraining(training) {
      this.selectedVideo = training.id;
      this.videoPath = this.currentVideoFiles;
    },
    
    reindexVideoTrainings() {
      this.videoList.forEach((training, index) => {
        training.id = index;
      });
    },
    
    // File management
    addVideoFile(filePath) {
      this.videoPath.push(filePath);
      this.saveVideoToStorage();
    },
    
    removeVideoFile(filePath) {
      const index = this.videoPath.indexOf(filePath);
      if (index > -1) {
        this.videoPath.splice(index, 1);
      }
      this.saveVideoToStorage();
    },
    
    // Playback control
    setVideoPlaybackSettings({ startTime, endTime, speed, loop }) {
      if (startTime !== undefined) this.startTime = startTime;
      if (endTime !== undefined) this.endTime = endTime;
      if (speed !== undefined) this.speed = speed;
      if (loop !== undefined) this.loop = loop;
    },
    
    setVideoLength(duration) {
      this.videoLength = duration;
      this.endTime = duration;
    },
    
    // Niou training management (directory-based)
    setNiouTrainingList(trainingList) {
      this.niouTrainingList = trainingList;
      this.saveNiouTrainings();
    },
    
    toggleTrainingVisibility(index) {
      if (this.niouTrainingList[index]) {
        this.niouTrainingList[index].show = !this.niouTrainingList[index].show;
      }
    },
    
    toggleItemVisibility(trainingIndex, itemIndex) {
      if (this.niouTrainingList[trainingIndex]?.trainings?.[itemIndex]) {
        this.niouTrainingList[trainingIndex].trainings[itemIndex].show = 
          !this.niouTrainingList[trainingIndex].trainings[itemIndex].show;
      }
    },
    
    // Directory management actions
    setRootDirectory(directoryHandle, directoryPath) {
      this.rootDirectory = directoryHandle;
      this.rootDirectoryPath = directoryPath;
      this.directoryStructure.handle = directoryHandle;
      this.directoryStructure.name = directoryHandle?.name || '';
      this.directoryStructure.path = directoryPath;
      this.directoryStructure.lastScanned = new Date().toISOString();
      this.saveDirectoryInfo();
    },
    
    setCurrentDirectory(path) {
      this.currentDirectoryPath = path;
    },
    
    updateTrainingMetadata() {
      this.trainingMetadata.totalTrainings = this.niouTrainingList.length;
      this.trainingMetadata.totalVideos = this.niouTrainingList.reduce((total, training) => {
        return total + training.trainings.reduce((trainingTotal, item) => {
          return trainingTotal + (item.videos ? item.videos.length : 1);
        }, 0);
      }, 0);
      this.trainingMetadata.lastUpdated = new Date().toISOString();
    },
    
    setTrainingListWithMetadata(trainingList, directoryHandle = null, directoryPath = '') {
      this.niouTrainingList = trainingList;
      if (directoryHandle) {
        this.setRootDirectory(directoryHandle, directoryPath);
      }
      this.updateTrainingMetadata();
      this.saveNiouTrainings();
      this.saveTrainingMetadata();
    },
    
    clearDirectory() {
      this.rootDirectory = null;
      this.rootDirectoryPath = '';
      this.currentDirectoryPath = '';
      this.directoryStructure = {
        name: "",
        path: "",
        handle: null,
        lastScanned: null,
        totalSize: 0
      };
      this.removeDirectoryInfo();
    },
    
    // Storage methods
    saveDirectoryInfo() {
      const directoryInfo = {
        name: this.directoryStructure.name,
        path: this.directoryStructure.path,
        lastScanned: this.directoryStructure.lastScanned,
        rootDirectoryPath: this.rootDirectoryPath,
        defaultPath: this.defaultPath
      };
      localStorage.setItem("directoryInfo", JSON.stringify(directoryInfo));
    },
    
    saveTrainingMetadata() {
      localStorage.setItem("trainingMetadata", JSON.stringify(this.trainingMetadata));
    },
    
    removeDirectoryInfo() {
      localStorage.removeItem("directoryInfo");
    },
    
    // Storage methods
    saveVideoTrainingsToStorage() {
      localStorage.setItem("videoSave", JSON.stringify(this.videoList));
    },
    
    saveVideoToStorage() {
      this.saveVideoTrainingsToStorage();
    },
    
    saveNiouTrainings() {
      localStorage.setItem("Trainings", JSON.stringify(this.niouTrainingList));
    },
    
    // Load from storage
    loadFromStorage() {
      // Load video trainings
      if (localStorage.getItem("videoSave")) {
        this.videoList = JSON.parse(localStorage.getItem("videoSave"));
      }
      
      // Load niou trainings
      if (localStorage.getItem("Trainings")) {
        this.niouTrainingList = JSON.parse(localStorage.getItem("Trainings"));
      }
      
      // Load directory info
      if (localStorage.getItem("directoryInfo")) {
        const directoryInfo = JSON.parse(localStorage.getItem("directoryInfo"));
        this.directoryStructure.name = directoryInfo.name || '';
        this.directoryStructure.path = directoryInfo.path || '';
        this.directoryStructure.lastScanned = directoryInfo.lastScanned;
        this.rootDirectoryPath = directoryInfo.rootDirectoryPath || '';
        this.defaultPath = directoryInfo.defaultPath || this.defaultPath;
      }
      
      // Load training metadata
      if (localStorage.getItem("trainingMetadata")) {
        this.trainingMetadata = {
          ...this.trainingMetadata,
          ...JSON.parse(localStorage.getItem("trainingMetadata"))
        };
      }
      
      // Update metadata if we have training data but no metadata
      if (this.niouTrainingList.length > 0 && !this.trainingMetadata.lastUpdated) {
        this.updateTrainingMetadata();
      }
    },

    // Validate and clean FileHandle references
    validateFileHandles(fileService) {
      if (!fileService) {
        return true;
      }

      // Don't clear everything - just check if we need to refresh FileHandles
      if (this.niouTrainingList.length === 0) {
        return true;
      }

      // Check if any video has a handleId that no longer exists
      let hasInvalidHandles = false;
      
      for (const training of this.niouTrainingList) {
        for (const subTraining of training.trainings || []) {
          for (const video of subTraining.videos || []) {
            if (video.fileHandleId && !fileService.getFileHandle(video.fileHandleId)) {
              hasInvalidHandles = true;
              break;
            }
          }
          if (hasInvalidHandles) break;
        }
        if (hasInvalidHandles) break;
      }

      if (hasInvalidHandles) {
        console.log('Invalid FileHandle references detected - will need to refresh handles on directory access');
        return false;
      }

      return true;
    },

    // Refresh FileHandle references for existing video data
    async refreshFileHandles(fileService) {
      if (!this.rootDirectory || !fileService || this.niouTrainingList.length === 0) {
        return false;
      }

      try {
        console.log('Refreshing FileHandle references for existing videos');
        
        // Try to get fresh directory handle
        let directoryHandle = this.rootDirectory;
        
        // If we don't have a valid directory handle, we need user to select again
        if (!directoryHandle || !directoryHandle.values) {
          console.log('Directory handle invalid, need fresh directory access');
          return false;
        }

        // Create a map of file paths to FileHandle IDs
        const pathToHandleMap = new Map();
        
        // Recursively collect all video files and create new FileHandle references
        await this.collectFileHandles(directoryHandle, '', pathToHandleMap, fileService);
        
        // Update video objects with new FileHandle IDs
        for (const training of this.niouTrainingList) {
          for (const subTraining of training.trainings || []) {
            for (const video of subTraining.videos || []) {
              if (video.path) {
                const newHandleId = pathToHandleMap.get(video.path);
                if (newHandleId) {
                  video.fileHandleId = newHandleId;
                  console.log(`Updated FileHandle for ${video.name}: ${newHandleId}`);
                }
              }
            }
          }
        }
        
        // Save updated data
        this.saveNiouTrainings();
        return true;
        
      } catch (error) {
        console.error('Failed to refresh FileHandles:', error);
        return false;
      }
    },

    // Helper method to collect FileHandles recursively
    async collectFileHandles(directoryHandle, currentPath, pathToHandleMap, fileService) {
      try {
        for await (const entry of directoryHandle.values()) {
          const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
          
          if (entry.kind === 'file' && this.isVideoFile(entry.name)) {
            const handleId = fileService.storeFileHandle(entry);
            pathToHandleMap.set(entryPath, handleId);
          } else if (entry.kind === 'directory') {
            await this.collectFileHandles(entry, entryPath, pathToHandleMap, fileService);
          }
        }
      } catch (error) {
        console.warn('Error collecting FileHandles from directory:', error);
      }
    },

    // Helper method to check if file is a video
    isVideoFile(filename) {
      const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'];
      const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
      return videoExtensions.includes(ext);
    },

    // Auto-reload directory if we have stored directory info
    async autoReloadDirectory(fileService) {
      if (!this.directoryStructure.name || !fileService) {
        return false;
      }

      try {
        console.log('Attempting to auto-reload directory:', this.directoryStructure.name);
        
        // If we have existing video data, try to refresh FileHandles first
        if (this.niouTrainingList.length > 0) {
          console.log('Found existing video data, attempting to refresh FileHandles');
          const refreshed = await this.refreshFileHandles(fileService);
          if (refreshed) {
            console.log('Successfully refreshed FileHandles for existing videos');
            return true;
          }
        }
        
        // Clear existing training list since we need to re-scan
        this.niouTrainingList = [];
        
        // For Electron, try to get the last used directory
        if (window.electronAPI && window.electronAPI.getLastDirectory) {
          const lastDirectory = await window.electronAPI.getLastDirectory();
          if (lastDirectory && lastDirectory === this.rootDirectoryPath) {
            // Re-scan the directory using Electron
            const videos = await window.electronAPI.scanDirectory(this.rootDirectoryPath);
            if (videos && videos.length > 0) {
              this.niouTrainingList = this.convertElectronVideosToTrainingList(videos);
              this.updateTrainingMetadata();
              this.saveNiouTrainings();
              console.log('Auto-reloaded directory from Electron');
              return true;
            }
          }
        }
        
        // For web File System Access API, automatically request directory access
        if (window.showDirectoryPicker) {
          console.log('Web environment: Requesting directory access for auto-reload');
          try {
            // Auto-prompt for directory access
            const directoryHandle = await fileService.selectDirectory();
            if (directoryHandle) {
              const result = await fileService.readDirectoryRecursive(directoryHandle, this.defaultPath);
              
              // Use the enhanced store method with metadata
              this.setTrainingListWithMetadata(
                result.trainings, 
                directoryHandle, 
                result.metadata.basePath
              );
              
              // Force save to ensure new data overwrites old data
              this.saveNiouTrainings();
              this.saveDirectoryInfo();
              this.saveTrainingMetadata();
              
              console.log('Auto-reloaded directory from web File System Access API');
              console.log('New training list length:', this.niouTrainingList.length);
              return true;
            }
          } catch (error) {
            if (error.name === 'AbortError') {
              console.log('User cancelled directory selection');
            } else {
              console.error('Failed to auto-request directory access:', error);
            }
          }
        }
        
        return false;
      } catch (error) {
        console.error('Failed to auto-reload directory:', error);
        return false;
      }
    },

    // Convert Electron video list to training list format
    convertElectronVideosToTrainingList(videos) {
      const trainingMap = new Map();
      
      videos.forEach(video => {
        const pathParts = video.path.split(/[\\\/]/);
        const trainingType = pathParts[pathParts.length - 3] || 'General';
        const trainingName = pathParts[pathParts.length - 2] || 'Videos';
        
        if (!trainingMap.has(trainingType)) {
          trainingMap.set(trainingType, {
            trainingType,
            trainings: new Map(),
            show: false
          });
        }
        
        const training = trainingMap.get(trainingType);
        if (!training.trainings.has(trainingName)) {
          training.trainings.set(trainingName, {
            name: trainingName,
            videos: [],
            show: false
          });
        }
        
        training.trainings.get(trainingName).videos.push({
          name: video.name,
          url: video.path,
          path: video.path
        });
      });
      
      // Convert maps to arrays
      return Array.from(trainingMap.values()).map(training => ({
        ...training,
        trainings: Array.from(training.trainings.values())
      }));
    }
  }
})
