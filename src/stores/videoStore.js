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
    }
  }
})
