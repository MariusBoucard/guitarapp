<template>
  <div style="width:100%;height : 100%">
    <div class="two-columns">

      <div class="column-left">
        <div>
          <div v-for="(training, index) in niouTrainingList" :key="index">
            <h2 @click="toggleTraining(index)" class="trainingType">{{ training.trainingType }}</h2>
            <div v-show="training.show">
              <div v-for="(item, subIndex) in training.trainings" :key="subIndex">
                <h3 @click="toggleItem(index, subIndex)" class="training">{{ item.name }}</h3>
                <ul v-show="item.show">
                  <li v-for="(video, videoIndex) in item.videos || [item]" :key="videoIndex"
                    @click="launchFile(video.url)" class="video">
                    {{ video.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <input v-model="defaultPath" type="text" />
          <button @click="createTrainingList()">add</button>
        </div>

        </div>


        <!-- niou above -->

        <div class="column-right">

            <h1>{{ videoName }}</h1>

          <video style="width:100%;height : 100%" @timeupdate="handleTimeUpdate" ref="video" controls></video>
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

              <input type="range" min="10" max="300" oninput="rangeValueVideo.innerText = this.value"
                v-model="this.speed">
              <p id="rangeValueVideo">100</p>

            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>

export default {
  data() {
    return {
      niouTrainingList: [],
      defaultPath: "/media/marius/DISK GROS/",
      videoName: "",

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
        localStorage.setItem("Trainings", JSON.stringify(this.niouTrainingList))
        console.log("Trainings", this.niouTrainingList)
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
        return "selectedTrain"
      }
      else return "unselectedTrain"
    },
    selectTrain(training) {
      this.selectedTraining = training.id
      this.videoPath = this.trainingList.find(train => train.id === this.selectedTraining).list

    },
    async launchFile(file) {
      file = file.replace(/#/g, '%23');
      const filePath = file;
      this.speed = 100;

      const videoURL = `file://${filePath}`;
      console.log("vid", videoURL)
      this.$refs.video.src = videoURL;
      this.$refs.video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(videoURL);
        this.endTime = this.$refs.video.duration

      });
      this.videoName = file.split("/").pop()
    },
    async loadVideo(event) {
      const file = event.target.files[0];
      this.videoPath.push(file.path.replace(/#/g, '%23'))
      const filePath = file.path.replace(/#/g, '%23');
      this.speed = 100;
      const videoURL = `file://${filePath}`;
      this.$refs.video.src = videoURL;
      this.$refs.video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(videoURL);
        this.endTime = this.$refs.video.duration

      });
      localStorage.setItem("videoSave", JSON.stringify(this.trainingList))
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
    // TODO
    if (localStorage.getItem("Trainings")) {
      console.log("Trainings", JSON.parse(localStorage.getItem("Trainings")))
      this.niouTrainingList = JSON.parse(localStorage.getItem("Trainings"))
    }
  }
}
</script>
<style>
.trainingType {
  background-color: #f2f2f2;
  padding: 10px;

  border-radius: 5px;
  cursor: pointer;
}
.training {
  background-color: #2268ff;
  padding: 10px;
  border-radius: 5px;
  width:80%;
  cursor: pointer;
}
.video {
  background-color: #f2f2f2;
  padding: 10px;
  margin-top: -10px;
  border-radius: 5px;
  width:70%;
  cursor: pointer;
}

.selectedTrain {
  background-color: rgb(96, 96, 96);
}

.unselectedTrain {
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

.two-columns {
  display: flex;
  flex-direction: row;
}

.column-left {
  flex: 40%;
  padding: 20px;
  background-color: #33658A;
  align-items: right;
}

.column-right {
  flex: 60%;
  padding: 20px;
  background-color: #F6AE2D;
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