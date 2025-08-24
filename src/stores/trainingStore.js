import { defineStore } from 'pinia'

export const useTrainingStore = defineStore('training', {
  state: () => ({
    // Training data
    trainingList: [],
    selectedTraining: 0,
    currentTrainingName: "",
    
    // Audio/Video paths
    audioPath: [],
    videoPath: [],
    songPath: [],
    
    // Current playing state
    currentSong: "",
    currentVideo: "",
    songLength: 0,
    
    // Playback settings
    startTime: 0,
    endTime: 0,
    speed: 100,
    pitch: 0,
    loop: false,
    
    // Directory settings
    defaultPath: "/media/marius/DISK GROS/",
    niouTrainingList: []
  }),
  
  getters: {
    currentTrainingData: (state) => 
      state.trainingList.find(training => training.id === state.selectedTraining),
    
    currentTrainingVideos: (state) => 
      state.currentTrainingData?.list || [],
    
    formattedSongLength: (state) => {
      const dateObj = new Date(state.songLength * 1000);
      const minutes = dateObj.getUTCMinutes();
      const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0');
      const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10).toString().padStart(2, '0');
      return `${minutes}:${seconds}.${milliseconds}`;
    }
  },
  
  actions: {
    // Training management
    addTraining(name) {
      this.trainingList.push({
        id: this.trainingList.length,
        name: name || this.currentTrainingName,
        list: []
      });
      this.reindexTrainings();
      this.saveTrainingsToStorage();
    },
    
    removeTraining(index = this.selectedTraining) {
      this.trainingList.splice(index, 1);
      this.reindexTrainings();
      this.saveTrainingsToStorage();
    },
    
    selectTraining(training) {
      this.selectedTraining = training.id;
      this.videoPath = this.currentTrainingVideos;
    },
    
    reindexTrainings() {
      this.trainingList.forEach((training, index) => {
        training.id = index;
      });
    },
    
    // File management
    addAudioFile(filePath, fileName) {
      this.audioPath.push(filePath);
      this.songPath.push(filePath);
      this.currentSong = fileName;
      this.saveAudioToStorage();
    },
    
    addVideoFile(filePath) {
      this.videoPath.push(filePath);
      this.saveVideosToStorage();
    },
    
    removeAudioFile(filePath) {
      const index = this.audioPath.indexOf(filePath);
      if (index > -1) {
        this.audioPath.splice(index, 1);
        this.songPath.splice(index, 1);
      }
      this.saveAudioToStorage();
    },
    
    removeVideoFile(filePath) {
      const index = this.videoPath.indexOf(filePath);
      if (index > -1) {
        this.videoPath.splice(index, 1);
      }
      this.saveVideosToStorage();
    },
    
    // Playback control
    setPlaybackSettings({ startTime, endTime, speed, pitch, loop }) {
      if (startTime !== undefined) this.startTime = startTime;
      if (endTime !== undefined) this.endTime = endTime;
      if (speed !== undefined) this.speed = speed;
      if (pitch !== undefined) this.pitch = pitch;
      if (loop !== undefined) this.loop = loop;
    },
    
    setSongLength(duration) {
      this.songLength = duration;
      this.endTime = duration;
    },
    
    // Storage methods
    saveTrainingsToStorage() {
      localStorage.setItem("songSave", JSON.stringify(this.trainingList));
      localStorage.setItem("videoSave", JSON.stringify(this.trainingList));
    },
    
    saveAudioToStorage() {
      localStorage.setItem("songLength", this.songPath.length);
      this.songPath.forEach((song, index) => {
        localStorage.setItem(`song${index}`, song);
      });
      this.saveTrainingsToStorage();
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
      }
      
      // Load niou trainings
      if (localStorage.getItem("Trainings")) {
        this.niouTrainingList = JSON.parse(localStorage.getItem("Trainings"));
      }
      
      // Load individual songs (legacy support)
      const songLength = localStorage.getItem("songLength");
      if (songLength) {
        for (let i = 0; i < parseInt(songLength); i++) {
          const song = localStorage.getItem(`song${i}`);
          if (song && !this.songPath.includes(song)) {
            this.songPath.push(song);
            this.audioPath.push(song);
          }
        }
      }
    }
  }
})
