<template>
  <div class="video-main-container">
    <div class="two-columns">

      <div class="column-left">
        <!-- Training Section -->
        <div class="training-section">
          <ul class="horizontal-list">
            <li v-for="training in trainingComputed" @click="selectTrain(training)" :class="backColor(training)" :key="training">
              <p>{{ training.name }}</p>
            </li>
          </ul>
          
          <input v-model="currentName" type="text" placeholder="Training name" />
          
          <div class="training-controls"> 
            <button @click="addTraining()">Add</button>
            <button @click="removeTraining()">Remove</button>
          </div>
        </div>

        <!-- Video List Section -->
        <div class="video-list-section">
          <ol class="ol-days">
            <li v-for="item in this.videoPathComputed" :key="item" @click="this.launchFile(item)">
              {{ item.split("\\")[item.split("\\").length - 1] }}
              <button class="button-cross" @click="remove(item)"></button>
            </li>
          </ol>
          
          <div class="container">
            <div class="button-wrap">
              <button class="buttonbis" @click="selectVideoFileNative">Select Video File</button>
              <label class="buttonbis" for="uploadVideo">Upload File (Web)</label>
              <input id="uploadVideo" type="file" @change="loadVideo">
            </div>
          </div>
        </div>
      </div>
 
      <div class="column-right">
        <video @timeupdate="handleTimeUpdate" ref="video" controls></video>
        
        <div class="video-controls">
          <button class="button" @click="play(this.speed)">Play</button>
          <button class="button" @click="pause">Pause</button>
          <button class="button" @click="stop">Stop</button>
        </div>
      
      <div class="slider-parent">
        <div class="slider-container">
          <label for="startSlider" class="slider-label">Video Start</label>
          <input id="startSlider" type="range" v-model="startTime" :max="endTime" min="0" step="1">
          <p class="slider-value">{{ formatSeconds(startTime) }}</p>
        </div>
        
        <div class="slider-container">
          <label for="endSlider" class="slider-label">Video End</label>
          <input id="endSlider" type="range" v-model="endTime" :min="startTime" :max="videoDuration" step="1">
          <p class="slider-value">{{ formatSeconds(endTime) }}</p>
        </div>
      </div>
      
        <div class="loop-checkbox">
          <label for="loopCheckbox" class="checkbox-label">Loop:</label>
          <input id="loopCheckbox" type="checkbox" v-model="loop">
        </div>
        
        <div class="speed-control">
          <h3>Playing Rate</h3>
          <div class="slider">
            <input type="range" min="10" max="300" oninput="rangeValueVideo.innerText = this.value" v-model="this.speed">
            <p id="rangeValueVideo">{{ this.speed }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>

 //import { ipcRenderer } from 'electron'
//const path = require('path');
export default {
  data() {
    return {
      niouTrainingList: [],
      defaultPath : "/media/marius/DISK GROS/",


      startTime: 0,
      endTime: 0,
      videoDuration: 0,
      loop: false,
      currentName:"",
      selectedTraining:0,
      trainingList : [],
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
  computed : {
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
        this.directoryName = this.defaultPath+directoryHandle.name;

        const trainingList = await this.readDirectoryRecursive(directoryHandle);
        
        this.niouTrainingList = trainingList;
        console.log(trainingList);
      } catch (error) {
        console.error('Error reading directory:', error);
      }
    },
    async readDirectoryRecursive(directoryHandle) {
      const trainingList = [];
      console.log(directoryHandle)
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'directory') {
          const trainingType = entry.name;
          this.trainingdir = this.directoryName+"/" + trainingType
          const trainings = await this.readSubDirectory(entry);
          trainingList.push({ trainingType, trainings });
        }
      }

      return trainingList;
    },
    toggleTraining(index) {
      console.log(this.niouTrainingList[index])
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
          const videos = await this.readFiles(path,entry);
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
    async readFiles(path,directoryHandle) {
      let videos = [];

      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
          if(entry.name.includes(".mp4"))
          {
            videos.push({ name: entry.name, url: path + "/" + entry.name , show: false});
          }
        } else if (entry.kind === 'directory') {
          const name = entry.name;
          const newPath = path + "/" + name;
          const subVideos = await this.readFiles(newPath, entry);
          videos = videos.concat(subVideos); // Combine the lists
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
    } ,
    handleTimeUpdate() {
      const currentTime = this.$refs.video.currentTime;

      if (currentTime >= this.endTime && this.loop) {
        this.$refs.video.currentTime = this.startTime;
      } else if (currentTime >= this.endTime && ! this.loop){
        this.$refs.video.currentTime = this.startTime;
        this.$refs.video.pause()
      } else if (currentTime<this.startTime){
        this.$refs.video.currentTime = this.startTime;

      }
    },
    backColor(item){
      if(item.id===this.selectedTraining){
        return  "selectedTrain"
      }
      else return "unselectedTrain"
    },
    selectTrain(training){
      this.selectedTraining=training.id
      this.videoPath = this.trainingList.find(train => train.id === this.selectedTraining).list

    },
    addTraining(){
      this.trainingList.push({"id" : this.trainingList.length, "name": this.currentName, "list" : []})
      this.redoIdTrain()
      console.log(this.trainingList)
      localStorage.setItem("videoSave",JSON.stringify(this.trainingList))

    },
    removeTraining(){
      this.trainingList.splice(this.selectedTraining,1)
      this.redoIdTrain()
      localStorage.setItem("videoSave",JSON.stringify(this.trainingList))

    },
    redoIdTrain(){
    for(var i =0;i<this.trainingList.length;i++)   {
      this.trainingList.at(i).id = i
    }
    },
    remove(item){
      console.log("pute")
      var index = this.videoPath.indexOf(item)
      if(index>-1){
        console.log("great")

        this.videoPath.splice(index, 1);
      }
      localStorage.setItem("videoSave",JSON.stringify(this.trainingList))
      console.log(this.videoPath)
    },
    async launchFile(file) {
     file =  file.replace(/#/g, '%23');
    const filePath = file;
    this.speed = 100;
    
    const videoURL = `file://${filePath}`;
    console.log("vid", videoURL)
    this.$refs.video.src = videoURL;
    this.$refs.video.addEventListener('loadedmetadata', () => {
    URL.revokeObjectURL(videoURL);
    this.endTime = this.$refs.video.duration

  });
    },


    async loadVideo(event) {
      //  const { remote } = require('electron');
      //  console.log(remote)
      // const appDir = remote.getGlobal('appDir');
      const file = event.target.files[0];
      if (!file) return;

      let filePath;
      if (file.path) {
        // If file.path is available (older Electron versions)
        filePath = file.path.replace(/#/g, '%23');
      } else {
        // Use blob URL for newer security restrictions
        filePath = URL.createObjectURL(file);
      }

      this.videoPath.push(filePath);
      this.speed = 100;
      console.log(filePath);
      
      const videoURL = filePath.startsWith('blob:') ? filePath : `file://${filePath}`;
      console.log("vid", videoURL);
      this.$refs.video.src = videoURL;
      this.$refs.video.addEventListener('loadedmetadata', () => {
    URL.revokeObjectURL(videoURL);
    this.endTime = this.$refs.video.duration

  });
  
      localStorage.setItem("videoSave",JSON.stringify(this.trainingList))

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
          console.log("Native video selected:", videoURL);
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
    if(localStorage.getItem("videoSave")){

      this.trainingList = JSON.parse(localStorage.getItem("videoSave"))
    }
  }
}
</script>
<style scoped>
/* Main Container */
.video-main-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

/* Two Column Layout */
.two-columns {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 25px;
  height: calc(100vh - 40px);
  max-width: 1400px;
  margin: 0 auto;
}

/* Left Column - Controls */
.column-left {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.column-left::-webkit-scrollbar {
  width: 6px;
}

.column-left::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
}

.column-left::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

/* Right Column - Video Player */
.column-right {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Training Section */
.training-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.horizontal-list {
  list-style: none;
  padding: 0;
  margin: 0 0 15px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.horizontal-list li {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-weight: 500;
}

.selectedTrain {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.unselectedTrain {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  border: 2px solid #e0e6ed;
}

.unselectedTrain:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.horizontal-list li p {
  margin: 0;
  font-size: 0.9rem;
}

/* Input and Buttons */
input[type="text"] {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 25px;
  font-size: 0.9rem;
  margin-bottom: 15px;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
}

.training-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  flex: 1;
}

.training-controls button:first-child {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.training-controls button:first-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.training-controls button:last-child {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.training-controls button:last-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

/* Video List */
.video-list-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.ol-days {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ol-days li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #2c3e50;
}

.ol-days li:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  transform: translateX(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.button-cross {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.button-cross:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.button-cross::before {
  content: "✕";
}

/* File Upload Section */
.container {
  margin-top: 15px;
}

.button-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.buttonbis {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  text-align: center;
  text-decoration: none;
  display: block;
}

.buttonbis:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

input[type="file"] {
  display: none;
}

/* Video Player */
video {
  width: 100%;
  height: 60%;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  background: #000;
}

/* Video Controls */
.video-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
}

.button {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-width: 80px;
}

.button:nth-child(1) {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.button:nth-child(2) {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.button:nth-child(3) {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Slider Section */
.slider-parent {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slider-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.slider-container input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ecf0f1;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
}

.slider-container input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.slider-value {
  margin: 0;
  font-weight: 600;
  color: #667eea;
  text-align: center;
  background: rgba(102, 126, 234, 0.1);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
}

/* Loop Checkbox */
.loop-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.checkbox-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
  cursor: pointer;
}

/* Speed Control */
.speed-control {
  text-align: center;
  margin: 20px 0;
}

.speed-control h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

.slider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  max-width: 300px;
  margin: 0 auto;
}

.slider input[type="range"] {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #ecf0f1;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  transition: all 0.2s ease;
}

.slider input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

#rangeValueVideo {
  margin: 0;
  font-weight: 600;
  color: #FF9800;
  font-size: 1.1rem;
  min-width: 50px;
  background: rgba(255, 152, 0, 0.1);
  padding: 8px 12px;
  border-radius: 20px;
  border: 2px solid rgba(255, 152, 0, 0.2);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .two-columns {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .column-left {
    max-height: 400px;
  }
  
  .slider-parent {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .video-main-container {
    padding: 10px;
  }
  
  .column-left,
  .column-right {
    padding: 15px;
  }
  
  .button-wrap {
    flex-direction: column;
  }
  
  .video-controls {
    flex-direction: column;
  }
  
  .button {
    width: 100%;
  }
}
</style>