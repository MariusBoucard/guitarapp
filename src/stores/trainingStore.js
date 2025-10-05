import { defineStore } from 'pinia'

export const useTrainingStore = defineStore('training', {
  state: () => ({
    // Training data
    trainingList: [],
    selectedTraining: 0,
    currentTrainingName: "",
    
    // Video paths
    videoPath: [],
    
    // Current video state
    currentVideo: "",
    
    // Niou training list (legacy)
    niouTrainingList: []
  }),
  
  getters: {
    currentTrainingData: (state) => 
      state.trainingList.find(training => training.id === state.selectedTraining),
    
    currentTrainingVideos: (state) => 
      state.currentTrainingData?.list || [],
    
    currentTrainingAudioFiles: (state) => 
      state.currentTrainingData?.audioFiles || []
  },
  
  actions: {
    // Training management
    addTraining(name) {
      this.trainingList.push({
        id: this.trainingList.length,
        name: name || this.currentTrainingName,
        list: [],      // videos for this training
        audioFiles: [] // audio files for this training
      });
      this.reindexTrainings();
      this.saveTrainingsToStorage();
    },
    
    removeTraining(index = this.selectedTraining) {
      this.trainingList.splice(index, 1);
      this.reindexTrainings();
      this.saveTrainingsToStorage();
    },
    
    setSelectedTraining(trainingId) {
      this.selectedTraining = trainingId;
      this.videoPath = this.currentTrainingVideos;
    },
    
    selectTraining(training) {
      this.selectedTraining = training.id;
      this.videoPath = this.currentTrainingVideos;
    },

    // Video management for trainings
    addVideoToTraining(trainingId, videoData) {
      const training = this.trainingList.find(t => t.id === trainingId);
      if (training) {
        // Check if video already exists (by identifier)
        const identifier = typeof videoData === 'string' ? videoData : this.getVideoIdentifier(videoData);
        const exists = training.list.some(item => {
          const existingIdentifier = typeof item === 'string' ? item : this.getVideoIdentifier(item);
          return existingIdentifier === identifier;
        });
        
        if (!exists) {
          training.list.push(videoData);
          this.saveTrainingsToStorage();
        }
      }
    },

    removeVideoFromTraining(trainingId, videoData) {
      const training = this.trainingList.find(t => t.id === trainingId);
      if (training) {
        const identifier = typeof videoData === 'string' ? videoData : this.getVideoIdentifier(videoData);
        const index = training.list.findIndex(item => {
          const existingIdentifier = typeof item === 'string' ? item : this.getVideoIdentifier(item);
          return existingIdentifier === identifier;
        });
        
        if (index > -1) {
          training.list.splice(index, 1);
          this.saveTrainingsToStorage();
        }
      }
    },

    // Helper method to get video identifier
    getVideoIdentifier(videoData) {
      if (typeof videoData === 'string') return videoData;
      // For videos with absolutePath, use the relative path as identifier
      if (videoData.absolutePath && videoData.path) {
        return videoData.path; // Use relative path as identifier
      }
      return videoData.fileHandleId || videoData.identifier || videoData.url || videoData.path;
    },
    
    reindexTrainings() {
      this.trainingList.forEach((training, index) => {
        training.id = index;
      });
    },
    
    // File management
    addVideoFile(filePath) {
      this.videoPath.push(filePath);
      this.saveVideosToStorage();
    },
    
    removeVideoFile(filePath) {
      const index = this.videoPath.indexOf(filePath);
      if (index > -1) {
        this.videoPath.splice(index, 1);
      }
      this.saveVideosToStorage();
    },
    
    // Storage methods
    saveTrainingsToStorage() {
      localStorage.setItem("songSave", JSON.stringify(this.trainingList));
      localStorage.setItem("videoSave", JSON.stringify(this.trainingList));
    },
    
    saveVideosToStorage() {
      this.saveTrainingsToStorage();
    },
    
    saveNiouTrainings() {
      localStorage.setItem("Trainings", JSON.stringify(this.niouTrainingList));
    },
    
    // Load from storage
    loadFromStorage() {
      // Load trainings
      if (localStorage.getItem("songSave")) {
        this.trainingList = JSON.parse(localStorage.getItem("songSave"));
        // Ensure backward compatibility - add audioFiles array to existing trainings
        this.trainingList.forEach(training => {
          if (!training.audioFiles) {
            training.audioFiles = [];
          }
        });
      }
      
      // Load niou trainings
      if (localStorage.getItem("Trainings")) {
        this.niouTrainingList = JSON.parse(localStorage.getItem("Trainings"));
      }
    },

    loadTrainings() {
      // Load video trainings specifically
      if (localStorage.getItem("videoSave")) {
        this.trainingList = JSON.parse(localStorage.getItem("videoSave"));
        // Ensure backward compatibility - add audioFiles array to existing trainings
        this.trainingList.forEach(training => {
          if (!training.audioFiles) {
            training.audioFiles = [];
          }
        });
      }
      this.reindexTrainings();
    }
  }
})
