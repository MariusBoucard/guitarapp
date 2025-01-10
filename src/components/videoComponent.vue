<template>
  <div style="width:100%;height : 100%">
    <div class="two-columns">

      <div class="column-left">
        <div>
          <div v-for="(training, index) in niouTrainingList" :key="index">
      <h2 @click="toggleTraining(index)">{{ training.trainingType }}</h2>
      <div v-show="training.show">
        <div v-for="(item, subIndex) in training.trainings" :key="subIndex">
          <h3 @click="toggleItem(index, subIndex)">{{ item.name }}</h3>
          <ul v-show="item.show">
            <li v-for="(video, videoIndex) in item.videos || [item]" :key="videoIndex" @click="launchFile(video.url)">
              {{ video.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
            <input v-model="defaultPath" type="text" />
            <button @click="createTrainingList()">add</button>
        </div>
        
        
        
        
        <!-- niou above -->
        <div>
          <ul class="horizontal-list">
            <li v-for="training in trainingComputed" @click="selectTrain(training)" :class="backColor(training)" :key="training">
              <p>{{ training.name }}</p>
            </li>
          </ul>
        </div>
      <input v-model="currentName" type="text" />
      <div> 
        <button @click="addTraining()">add</button>
      <button @click="removeTraining()">remove</button>
      </div>


      <div>
        <ol class="ol-days">
          <li  v-for="item in this.videoPathComputed" :key="item" @click="this.launchFile(item)">
            {{ item.split("\\")[item.split("\\").length - 1] }}
            <button class="button-cross" @click="remove(item)"></button>
          </li>
        </ol>
         <div class="container">
        <div class="button-wrap">
          <label class="buttonbis" for="uploadVideo">Upload File</label>
          <input id="uploadVideo" type="file" @change="loadVideo">
        </div>
      </div>
      </div>
    </div>
 
   
    
    
    <div class="column-right">
      
      
      
      <video style="width:100%;height : 100%"  @timeupdate="handleTimeUpdate" ref="video" controls></video>
      <div>
        <button class="button" @click="play(this.speed)">play</button>
        <button class="button" @click="pause">pause</button>
        <button class="button" @click="stop">stop</button>
        
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
    
    <div style="text-align: center;">
      <h3 style="display: block;float: top">Playing rate</h3>
      <div class="slider" style="margin : auto">
        
        <input type="range" min="10" max="300" oninput="rangeValueVideo.innerText = this.value" v-model="this.speed">
        <p id="rangeValueVideo">100</p>
        
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
    this.videoPath.push(file.path.replace(/#/g, '%23'))
    const filePath = file.path.replace(/#/g, '%23');
    this.speed = 100;
    console.log(filePath)
    const videoURL = `file://${filePath}`;
    console.log("vid", videoURL)
    this.$refs.video.src = videoURL;
  this.$refs.video.addEventListener('loadedmetadata', () => {
    URL.revokeObjectURL(videoURL);
    this.endTime = this.$refs.video.duration

  });
  
      localStorage.setItem("videoSave",JSON.stringify(this.trainingList))


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
<style>
 .selectedTrain{
  background-color: rgb(96, 96, 96);
}
.unselectedTrain{
  background-color: rgb(0, 0, 0);
}
/*
.button-cross {
  display: inline-block;
  position: relative;
  margin-left: 1em;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  border: none;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.button-cross::before,
.button-cross::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 2px;
  background-color: #000;
}

.button-cross::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.button-cross::after {
  transform: translate(-50%, -50%) rotate(-45deg);
} */
.horizontal-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.horizontal-list li {
  display: inline-block;
  padding: 20px;
}

.horizontal-list li a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  padding: 10px;
  border-radius: 5px;
  background-color: #f2f2f2;
  transition: background-color 0.3s ease;
}

.horizontal-list li a:hover {
  background-color: #ccc;
}
.two-columns {
  display: flex; /* Use flexbox to create a two-column layout */
    flex-direction:row; /* Make the container and columns stack vertically */
}

.column-left {
  flex: 40%; /* Set the left column to take up 40% of the available space */
  padding: 20px; /* Add padding or other styling as needed */
  background-color: #33658A; /* Example background color */
}

.column-right {
  flex: 60%; /* Set the right column to take up 60% of the available space */
  padding: 20px; /* Add padding or other styling as needed */
  background-color: #F6AE2D; /* Example background color */
  height: fit-content;
height: max-content;
}

input[type="text"] {
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

button:hover {
  background-color: #3e8e41;
}
</style>