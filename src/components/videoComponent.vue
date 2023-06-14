<template>
  <div style="width:100%;height : 100%">

    <div>


      <ul class="horizontal-list">
                <li v-for="training in trainingComputed" @click="selectTrain(training)" :class="backColor(training)" :key="training">
        <p>{{ training.name }}</p>
        </li>
      </ul>
      <input v-model="currentName" type="text" />
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
      
    </div>
 
    <div class="container">
      <div class="button-wrap">
        <label class="buttonbis" for="uploadVideo">Upload File</label>
        <input id="uploadVideo" type="file" @change="loadVideo">
      </div>
    </div>
    
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
</template>
  
<script>

// import { ipcRenderer } from 'electron'
const path = require('path');
export default {
  data() {
    return {
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
      localStorage.setItem("videoLength", this.videoPath.length)
      for (var i = 0; i < this.videoPath.length; i++) {
        localStorage.setItem("video" + i, this.videoPath[i])
      }
    },
    async launchFile(file) {

      //TODO
      const filePath = file;
      // const  filePath = file.path
        // this.videoPath.push(filePath);
  this.speed = 100;
  
  const videoURL = `file://${filePath}`;
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
  // const videoURL = URL.createObjectURL(file);
      // const file = event.target.files[0];
      // console.log("vid "+videoURL)
      // this.speed = 100

      // this.$refs.video.src = videoURL;
      // this.$refs.video.addEventListener('loadedmetadata', () => {
      //   URL.revokeObjectURL(videoURL);
      //   this.play();
      // });
      // const path = require('path');
      // const directoryPath = path.resolve(__dirname);
      // console.log(directoryPath)

      // const videoElement = this.$refs.video;
      // videoElement.src = '';
      // videoElement.srcObject = null;

      // Construct an absolute file path to the video file

      // const videoPath = path.relative('./', file.path);
      // videoElement.src = videoPath;

      // await videoElement.load();
      // const file = event.target.files[0]
      // ipcRenderer.send('load-video', file.path)
      // ipcRenderer.on('video-loaded', (event, videoURL) => {
      //   this.$refs.video.src = videoURL
      // })
      localStorage.setItem("videoSave",JSON.stringify(this.trainingList))

      localStorage.setItem("videoLength", this.trainingList.length)
      for (var i = 0; i < this.trainingList.length; i++) {
        localStorage.setItem("video" + i, this.trainingList[i])
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
    var lenVideo= localStorage.getItem("videoLength")
      for(var i=0;i<lenVideo;i++){
       var path2=  localStorage.getItem("video"+i)
      //  this.videoFolder = localStorage.getItem("videoFolder")

       console.log(path2)
      //  const videoURL = URL.createObjectURL(path);
                // this.$refs.video.src = path;

                if (path2) {
                  // Make a request to a server-side script to load the video file
                  const filePath = path.resolve(path2);
                        // this.videoPath.push(filePath);
                  this.speed = 100;
                  this.videoPath.push(path2)
                  
                  // const  filePath = file.path

                  const videoURL = `file://${filePath}`;
                  this.$refs.video.src = videoURL;
                  this.$refs.video.addEventListener('loadedmetadata', () => {
                    URL.revokeObjectURL(videoURL);
                  });

                }
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
}

</style>