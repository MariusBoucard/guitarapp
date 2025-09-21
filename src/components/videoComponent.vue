<template>
  <div class="video-container">
    <div class="two-columns">
      <div class="column-left">
        <!-- Training Section -->
        <div class="section-card">
          <ul class="list-unstyled list-horizontal">
            <li v-for="training in trainingComputed" 
                @click="selectTrain(training)" 
                :class="backColor(training)" 
                :key="training.id"
                class="list-item">
              <p>{{ training.name }}</p>
            </li>
          </ul>
          
          <input v-model="currentName" type="text" placeholder="Training name" class="form-input" />
          
          <div class="btn-group"> 
            <button @click="addTraining()" class="btn btn-success">Add</button>
            <button @click="removeTraining()" class="btn btn-danger-alt">Remove</button>
          </div>
        </div>

        <!-- Video List Section -->
        <div class="section-card">
          <ol class="list-unstyled list-scrollable">
            <li v-for="item in videoPathComputed" 
                :key="item" 
                @click="launchFile(item)"
                class="list-item-with-action">
              {{ item.split("\\")[item.split("\\").length - 1] }}
              <button class="btn btn-danger-alt btn-icon-round btn-small" @click="remove(item)"></button>
            </li>
          </ol>
          
          <div class="btn-group btn-group-vertical">
            <button class="btn btn-primary" @click="selectVideoFileNative">Select Video File</button>
            <label class="btn btn-primary" for="uploadVideo">Upload File (Web)</label>
            <input id="uploadVideo" type="file" @change="loadVideo" class="hidden">
          </div>
        </div>
      </div>
 
      <div class="column-right">
        <video @timeupdate="handleTimeUpdate" ref="video" controls class="video-player video-player-full-height"></video>
        
        <div class="btn-group btn-group-center">
          <button class="btn btn-success" @click="play(speed)">Play</button>
          <button class="btn btn-warning" @click="pause">Pause</button>
          <button class="btn btn-danger" @click="stop">Stop</button>
        </div>
      
        <div class="slider-section">
          <div class="slider-grid">
            <div class="slider-container slider-container-vertical">
              <label for="startSlider" class="slider-label">Video Start</label>
              <input id="startSlider" type="range" v-model="startTime" :max="endTime" min="0" step="1" class="range-input">
              <p class="slider-value">{{ formatSeconds(startTime) }}</p>
            </div>
            
            <div class="slider-container slider-container-vertical">
              <label for="endSlider" class="slider-label">Video End</label>
              <input id="endSlider" type="range" v-model="endTime" :min="startTime" :max="videoDuration" step="1" class="range-input">
              <p class="slider-value">{{ formatSeconds(endTime) }}</p>
            </div>
          </div>
        </div>
        
        <div class="checkbox-container">
          <label for="loopCheckbox" class="slider-label">Loop:</label>
          <input id="loopCheckbox" type="checkbox" v-model="loop" class="checkbox-input">
        </div>
        
        <div class="text-center">
          <h3 class="mb-medium slider-label">Playing Rate</h3>
          <div class="slider-container">
            <input type="range" min="10" max="300" v-model="speed" class="range-input range-input-thick">
            <p class="slider-value" id="rangeValueVideo">{{ speed }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import "../assets/css/global.css"
export default {
  data() {
    return {
      niouTrainingList: [],
      defaultPath: "/media/marius/DISK GROS/",
      startTime: 0,
      endTime: 0,
      videoDuration: 0,
      loop: false,
      currentName: "",
      selectedTraining: 0,
      trainingList: [],
      currentTime: 0,
      seekValue: 0,
      speed: 100,
      videoPath: [],
      videoPlaying: "",
      chunkSize: 10 * 1024 * 1024, // 10 MB
      file: null,
      sourceBuffer: null,
      mediaSource: null,
      chunks: [],
      currentChunkIndex: 0,
      isPlaying: false,
      playbackRate: 1.0
    };
  },
  watch: {
    speed(newValue) {
      this.setSpeed(newValue);
    },
  },
  computed: {
    trainingComputed() {
      return this.trainingList
    },
     
    videoPathComputed() {
      return this.videoPath
    }
  },
  methods: {
    async createTrainingList() {
      this.niouTrainingList = [];
      try {
        const directoryHandle = await window.showDirectoryPicker();
        this.directoryName = this.defaultPath + directoryHandle.name;

        const trainingList = await this.readDirectoryRecursive(directoryHandle);
        
        this.niouTrainingList = trainingList;
        console.log(trainingList);
      } catch (error) {
        console.error('Error reading directory:', error);
      }
    },

    async readDirectoryRecursive(directoryHandle) {
      const trainingList = [];
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'directory') {
          const trainingType = entry.name;
          this.trainingdir = this.directoryName + "/" + trainingType
          const trainings = await this.readSubDirectory(entry);
          trainingList.push({ trainingType, trainings });
        }
      }
      return trainingList;
    },

    toggleTraining(index) {
      this.niouTrainingList[index].show = !this.niouTrainingList[index].show;
    },

    toggleItem(trainingIndex, itemIndex) {
      this.niouTrainingList[trainingIndex].trainings[itemIndex].show = !this.niouTrainingList[trainingIndex].trainings[itemIndex].show;
    },

    async readSubDirectory(directoryHandle) {
      const trainings = [];
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'directory') {
          const name = entry.name;
          let path = this.trainingdir + "/" + name
          const videos = await this.readFiles(path, entry);
          trainings.push({ name, videos, show: false });
        }
        if (entry.kind === 'file') {
          const file = entry.name;
          let url = this.trainingdir + "/" + file
          trainings.push({ name: entry.name, url: url, show: false });
        }
      }
      return trainings;
    },

    async readFiles(path, directoryHandle) {
      let videos = [];
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
          if (entry.name.includes(".mp4")) {
            videos.push({ name: entry.name, url: path + "/" + entry.name, show: false });
          }
        } else if (entry.kind === 'directory') {
          const name = entry.name;
          const newPath = path + "/" + name;
          const subVideos = await this.readFiles(newPath, entry);
          videos = videos.concat(subVideos);
        }
      }
      return videos;
    },
  
    formatSeconds(seconds) {
      const dateObj = new Date(seconds * 1000);
      const minutes = dateObj.getUTCMinutes();
      const secondsFormatted = dateObj.getUTCSeconds().toString().padStart(2, '0');
      const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10).toString().padStart(2, '0');
      return `${minutes}:${secondsFormatted}.${milliseconds}`;
    },

    handleTimeUpdate() {
      const currentTime = this.$refs.video.currentTime;

      if (currentTime >= this.endTime && this.loop) {
        this.$refs.video.currentTime = this.startTime;
      } else if (currentTime >= this.endTime && !this.loop) {
        this.$refs.video.currentTime = this.startTime;
        this.$refs.video.pause()
      } else if (currentTime < this.startTime) {
        this.$refs.video.currentTime = this.startTime;
      }
    },

    backColor(item) {
      if (item.id === this.selectedTraining) {
        return "list-item-selected"
      }
      else return ""
    },

    selectTrain(training) {
      this.selectedTraining = training.id
      this.videoPath = this.trainingList.find(train => train.id === this.selectedTraining).list
    },

    addTraining() {
      this.trainingList.push({ "id": this.trainingList.length, "name": this.currentName, "list": [] })
      this.redoIdTrain()
      localStorage.setItem("videoSave", JSON.stringify(this.trainingList))
    },

    removeTraining() {
      this.trainingList.splice(this.selectedTraining, 1)
      this.redoIdTrain()
      localStorage.setItem("videoSave", JSON.stringify(this.trainingList))
    },

    redoIdTrain() {
      for (var i = 0; i < this.trainingList.length; i++) {
        this.trainingList.at(i).id = i
      }
    },

    remove(item) {
      var index = this.videoPath.indexOf(item)
      if (index > -1) {
        this.videoPath.splice(index, 1);
      }
      localStorage.setItem("videoSave", JSON.stringify(this.trainingList))
    },

    async launchFile(file) {
      file = file.replace(/#/g, '%23');
      const filePath = file;
      this.speed = 100;
      
      const videoURL = `file://${filePath}`;
      this.$refs.video.src = videoURL;
      this.$refs.video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(videoURL);
        this.endTime = this.$refs.video.duration
      });
    },

    async loadVideo(event) {
      const file = event.target.files[0];
      if (!file) return;

      let filePath;
      if (file.path) {
        filePath = file.path.replace(/#/g, '%23');
      } else {
        filePath = URL.createObjectURL(file);
      }

      this.videoPath.push(filePath);
      this.speed = 100;
      
      const videoURL = filePath.startsWith('blob:') ? filePath : `file://${filePath}`;
      this.$refs.video.src = videoURL;
      this.$refs.video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(videoURL);
        this.endTime = this.$refs.video.duration
      });
  
      localStorage.setItem("videoSave", JSON.stringify(this.trainingList))
    },

    async selectVideoFileNative() {
      try {
        if (!window.electronAPI?.selectVideoFile) {
          throw new Error('Native video file selection not available');
        }
        
        const filePath = await window.electronAPI.selectVideoFile();
        if (filePath) {
          const sanitizedPath = filePath.replace(/#/g, '%23');
          this.videoPath.push(sanitizedPath);
          this.speed = 100;
          
          const videoURL = `file://${sanitizedPath}`;
          this.$refs.video.src = videoURL;
          this.$refs.video.addEventListener('loadedmetadata', () => {
            this.endTime = this.$refs.video.duration;
          });
          
          localStorage.setItem("videoSave", JSON.stringify(this.trainingList));
        }
      } catch (error) {
        console.error('Error selecting video file:', error);
        alert('Native video selection failed. Please use the web file input instead.');
      }
    },

    play(playbackRate = 100) {
      this.$refs.video.playbackRate = playbackRate / 100;
      this.$refs.video.play();
    },

    pause() {
      this.$refs.video.pause();
    },

    stop() {
      const { video } = this.$refs;
      video.pause();
      video.currentTime = 0;
    },

    setSpeed(speed) {
      this.$refs.video.playbackRate = speed / 100;
    },
  },

  mounted() {
    this.$refs.video.addEventListener("loadedmetadata", () => {
      this.videoDuration = this.$refs.video.duration;
    });
    if (localStorage.getItem("videoSave")) {
      this.trainingList = JSON.parse(localStorage.getItem("videoSave"))
    }
  }
}
</script>

<style scoped>
/* Component-specific styles only */
#rangeValueVideo {
  color: var(--warning-gradient);
  background: rgba(255, 152, 0, 0.1);
  border: 2px solid rgba(255, 152, 0, 0.2);
  font-size: 1.1rem;
  border-radius: 20px;
}
</style>