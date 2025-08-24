  <template>
  <div class="play-sound-component">
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

    <div style="text-align: center;">

        <div class="slider-parent">
      <div class="slider-container">
        <label for="startSlider" class="slider-label">Song Start</label>
        <input id="startSlider" type="range" v-model="startTime" :max="endTime" min="0" step="1">
        <p class="slider-value">{{ formatSeconds(startTime) }}</p>
      </div>

      <div class="slider-container">
        <label for="endSlider" class="slider-label">Song End</label>
        <input id="endSlider" type="range" v-model="endTime" :min="startTime" :max="songLength" step="1">
        <p class="slider-value">{{ formatSeconds(endTime) }}</p>
      </div>
    </div>

    <div class="loop-checkbox">
      <label for="loopCheckbox" class="checkbox-label">Loop:</label>
      <input id="loopCheckbox" type="checkbox" v-model="loop">
    </div>
        
        <div class="container">
          <div class="button-wrap">
            <label class="buttonbis" for="upload">Upload File</label>
            <input id="upload" type="file" @change="onFileChange">
          </div>
          <div class="button-wrap">
            <button class="buttonbis" @click="selectAudioFileNative">Select Audio File (Native)</button>
          </div>
        </div>
        <p style="font-weight: 300;">Song playing : {{ this.songPlaying }}</p>
        <audio style=" width: 100%;" ref="audioPlayer" controls
        
        @timeupdate="onPlaying"
        >
        Your browser does not support the
        <code>audio</code> element.
      </audio>
  
    <div>
      <button class="button" @click="play">play</button>
      <button class="button"  @click="pause">pause</button>
      <button class="button" @click="stop">stop</button>

    </div>
    <div style="text-align: center;">
      <h3 style="display: block;float: top">Playing rate</h3>
      <div class="slider" style="margin : auto">

    <input type="range" min="0" max="300" oninput="rangeValue.innerText = this.value"  v-model="this.speed">
    <p id="rangeValue">100</p>
    </div>
    </div>

     <div style="text-align: center;">
      <h3 style="display: block;float: top">Pitch</h3>
      <div class="slider" style="margin : auto">

    <input type="range" min="-12" max="12" oninput="toneValue.innerText = this.value"  v-model="this.pitch">
    <p id="toneValue">0</p>
    </div>
    </div>
  </div>
  </div>
  </template>
  
  <script>

  export default {

    data() {
      return {
        currentName:"",
      selectedTraining:0,
      trainingList : [],
      videoPath :[],
      
      loop: false,
      startTime: 0,
      endTime: 0,
      songLength:0,
        currentTime: 0,
        seekValue: 0,
        speed : 100,
        songPath : [],
        songPlaying : "",

              pitch: 0, // 0 = normal, positive = up, negative = down
      audioCtx: null,
      sourceNode: null,
      soundtouchNode: null,
      };
    },
    watch: {
    speed(newValue) {
      this.valueChangedHandler(newValue);
    },
        pitch(newValue) {
      if (this.wavesurfer) {
        this.wavesurfer.setPitch(Number(newValue));
      }    }
  },
  computed : {
    trainingComputed() {
      return this.trainingList
    },
     
      videoPathComputed() {
        return this.videoPath
      },
    oldPath () {
        return this.songPath
    }
  },
    methods: {
      backColor(item){
      if(item.id===this.selectedTraining){
        return  "selectedTrain"
      }
      else return "unselectedTrain"
    },
      redoIdTrain(){
    for(var i =0;i<this.trainingList.length;i++)   {
      this.trainingList.at(i).id = i
    }
    },
      selectTrain(training){
      this.selectedTraining=training.id
      this.videoPath = this.trainingList.find(train => train.id === this.selectedTraining).list
      console.log(this.videoPath)

    },
      addTraining(){
      this.trainingList.push({"id" : this.trainingList.length, "name": this.currentName, "list" : []})
      this.redoIdTrain()
      console.log(this.trainingList)
      localStorage.setItem("songSave",JSON.stringify(this.trainingList))

    },

      async selectAudioFileNative() {
        try {
          if (window.electronAPI && window.electronAPI.selectAudioFile) {
            const filePath = await window.electronAPI.selectAudioFile();
            if (filePath) {
              // Extract filename from path
              const fileName = filePath.split(/[\\/]/).pop();
              
              // Use the native file path directly
              this.videoPath.push(filePath);
              this.songPath.push(filePath);
              this.saveSong();
              this.songPlaying = fileName;

              localStorage.setItem("songSave", JSON.stringify(this.trainingList));

              // Load the audio file
              const audioPlayer = this.$refs.audioPlayer;
              const audioURL = `file://${filePath}`;
              audioPlayer.addEventListener('loadedmetadata', () => {
                this.songLength = audioPlayer.duration;
                this.endTime = this.songLength;
                this.startTime = 0;
                console.log(this.songLength);
                this.initWaveSurfer(audioURL);
              });
              audioPlayer.src = audioURL;
            }
          } else {
            console.warn('Electron API not available, falling back to file input');
          }
        } catch (error) {
          console.error('Error selecting audio file:', error);
        }
      },

      removeTraining(){
      this.trainingList.splice(this.selectedTraining,1)
      this.redoIdTrain()
      localStorage.setItem("songSave",JSON.stringify(this.trainingList))

    },
      remove(item){
      console.log("pute")
      var index = this.videoPath.indexOf(item)
      if(index>-1){
        console.log("great")

        this.videoPath.splice(index, 1);
      }
      localStorage.setItem("songSave",JSON.stringify(this.trainingList))
      console.log(this.videoPath)
      localStorage.setItem("songLength", this.videoPath.length)
      for (var i = 0; i < this.videoPath.length; i++) {
        localStorage.setItem("song" + i, this.videoPath[i])
      }
    },
        launchFile(filePath){
        const reader = new FileReader();
        console.log(filePath)
        this.songPlaying = filePath.split("\\")[filePath.split("\\").length - 1]
        const file = new File([filePath], filePath, { type: "audio/*" });
        reader.onload = () => {
          const audioPlayer = this.$refs.audioPlayer;
          const audioURL = `file://${filePath}`;
          audioPlayer.addEventListener('loadedmetadata', () => {
      this.songLength = audioPlayer.duration;
      this.endTime = this.songLength;
      this.startTime =0;
      console.log(this.songLength);
    });
          audioPlayer.src = audioURL;
   
        };
        
        reader.readAsDataURL(file);
        },
        valueChangedHandler(speedval){
                this.setSpeed(speedval/100)
        },
        saveSong(){
          localStorage.setItem("songLength",this.songPath.length)
          for(var i=0;i<this.songPath.length;i++){
            localStorage.setItem("song"+i,this.songPath[i])

          }
        },
      onFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        // In Electron, we might not have access to file.path for security reasons
        // So we'll use the file name and create a blob URL instead
        let filePath;
        if (file.path) {
          // If file.path is available (older Electron versions)
          filePath = file.path.replace(/#/g, '%23');
        } else {
          // Use blob URL for newer security restrictions
          filePath = URL.createObjectURL(file);
        }
        
        this.videoPath.push(filePath);
        this.songPath.push(filePath);
        this.saveSong();
        this.songPlaying = file.name;

        localStorage.setItem("songSave", JSON.stringify(this.trainingList));

        reader.onload = () => {
          const audioPlayer = this.$refs.audioPlayer;
          const audioURL = filePath.startsWith('blob:') ? filePath : `file://${filePath}`;
          audioPlayer.addEventListener('loadedmetadata', () => {
            this.songLength = audioPlayer.duration;
            this.endTime = this.songLength;
      this.startTime =0;
      console.log(this.songLength);
         const file = event.target.files[0];
      const url = URL.createObjectURL(file);
      this.initWaveSurfer(url);
    });
          audioPlayer.src = audioURL;

        };
  
         reader.readAsDataURL(file);
      },
      initWaveSurfer(fileUrl) {
      if (this.wavesurfer) {
        this.wavesurfer.destroy();
      }
      console.log('Loading file:', fileUrl)
      // this.wavesurfer = WaveSurfer.create({
      //   container: '#waveform',
      //   waveColor: 'violet',
      //   progressColor: 'purple',
      //   plugins: [
      //     PitchPlugin.create()
      //   ]
      // });
      // this.wavesurfer.load(fileUrl);
    },
      play() {
          if (this.wavesurfer) this.wavesurfer.play();
  },
      pause() {
      if (this.wavesurfer) this.wavesurfer.pause();
      },
      stop() {
      if (this.wavesurfer) {
        this.wavesurfer.stop();
        this.wavesurfer.seekTo(0);
      }
      },
      setSpeed(speed) {
        this.$refs.audioPlayer.playbackRate = speed;
      },
      onPlaying() {
        const { audioPlayer } = this.$refs;
        if (!audioPlayer) {
          return;
        }
        this.currentTime = audioPlayer.currentTime;
        this.seekValue = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (!this.loop && this.currentTime >= this.endTime) {
        audioPlayer.pause();
        audioPlayer.currentTime = this.startTime;
        }
        if (this.currentTime <= this.startTime) {
        audioPlayer.currentTime = this.startTime;
        }
        if (this.loop && this.currentTime >= this.endTime) {
        audioPlayer.currentTime = this.startTime;
        }
      },
      onSeek() {
        const { audioPlayer } = this.$refs;
        const seekto = audioPlayer.duration * (this.seekValue / 100);
        audioPlayer.currentTime = seekto;
      },
      handleTimeUpdate() {
      
    },
    handleLooping() {
      if (this.$refs.audioPlayer.currentTime >= this.endTime) {
        this.$refs.audioPlayer.currentTime = this.startTime;
      }
    },
    formatSeconds(seconds) {
  const dateObj = new Date(seconds * 1000);
  const minutes = dateObj.getUTCMinutes();
  const secondsFormatted = dateObj.getUTCSeconds().toString().padStart(2, '0');
  const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10).toString().padStart(2, '0');
  return `${minutes}:${secondsFormatted}.${milliseconds}`;
}
    },
    
      mounted() {
        this.$refs.audioPlayer.addEventListener("loadedmetadata", () => {
      this.videoDuration = this.$refs.audioPlayer.duration;
    });
    if(localStorage.getItem("songSave")){

      this.trainingList = JSON.parse(localStorage.getItem("songSave"))
    } 
    console.log(this.trainingList)
    // var lenVideo= localStorage.getItem("songLength")
    //   for(var i=0;i<lenVideo;i++){
    //    var path2=  localStorage.getItem("song"+i)
    //   //  this.videoFolder = localStorage.getItem("videoFolder")

    //    console.log(path2)
    //   //  const videoURL = URL.createObjectURL(path);
    //             // this.$refs.video.src = path;

    //             if (path2) {
    //               // Make a request to a server-side script to load the video file
    //               const filePath = path.resolve(path2);
    //                     // this.videoPath.push(filePath);
    //               this.speed = 100;
    //               this.videoPath.push(path2)
                  
    //               // const  filePath = file.path

    //               const videoURL = `file://${filePath}`;
    //               this.$refs.audioPlayer.src = videoURL;
    //               this.$refs.audioPlayer.addEventListener('loadedmetadata', () => {
    //                 URL.revokeObjectURL(videoURL);
    //               });

    //             }
    //   }
  
  }
  };
  
  </script>
  <style>
  .slider-parent {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

  .slider-container {
  display: flex;
  width: 50%;
  flex-direction: column;
  align-items: center;
}

.slider-label {
  color: white;
  font-weight: bold;
}

.slider-value {
  color: white;
  margin-bottom: 1px;
}

.loop-checkbox {
  display: flex;
  align-items: center;
  justify-content: center; /* Added */
  margin-top: 20px;
  height: 30px; /* Added */
}

.checkbox-label {
  color: white;
  margin-right: 10px;
}
.slider {

width: 60%;
height : 60px;
padding: 30px;
padding-left: 40px;
background: #fcfcfc;
border-radius: 20px;
display: flex;
align-items: center;
box-shadow: 0px 15px 40px #7E6D5766;
}
.slider p {
font-size: 26px;
font-weight: 600;
font-family: Open Sans;
padding-left: 30px;
color: black;
}
.slider input[type="range"] {
width: 420px;
height: 2px;
background: black;
border: none;
outline: none;
}
.slider input[type="range"]::-webkit-slider-thumb {
-webkit-appearance: none !important;
width: 30px;
height:30px;
background: black;
border: 2px solid black;
border-radius: 50%;
cursor: pointer;
}
.slider input[type="range"]::-webkit-slider-thumb:hover {
background: black;
}

.container {
        align-items: center;
        width: 100%;
        margin-left: 0;
        padding: 0;
      }
      input[type="file"] {
        z-index: -1;
        top: 15px;
        left: 20px;
  margin-right: auto;
  margin-left: auto;
        font-size: 17px;
        color: #b8b8b8;
      }
      .button-wrap {
        position: relative;
        margin: 0;
        padding: 0;
      }
      .buttonbis {
        position: relative;
        display: inline-block;
        background-color: #1d6355;
        border-radius: 10px;
        border: 4px double #cccccc;
        color: #ffffff;
        text-align: center;
        font-size: 20px;
  margin-right: auto;
  margin-left: auto;
        width: 100px;
        transition: all 0.5s;
        cursor: pointer;
      }
      .buttonbis:hover {
        background-color: #00ab97;
      }

      audio::-webkit-media-controls-play-button{
background-color:rgb(255, 255, 255);}

audio:hover {transform: scale(1.1);filter: drop-shadow(2px 3px 3px #333);}
audio::-webkit-media-controls-panel{
  background-color: white;
  border-radius: 0%;
}
audio::-webkit-media-controls-mute-button
{
  background-color: white;
  color: black;
}
/*audio::-webkit-media-controls-play-button
audio::-webkit-media-controls-timeline-container
audio::-webkit-media-controls-current-time-display
audio::-webkit-media-controls-time-remaining-display
audio::-webkit-media-controls-timeline
audio::-webkit-media-controls-volume-slider-container
audio::-webkit-media-controls-volume-slider
audio::-webkit-media-controls-seek-back-button
audio::-webkit-media-controls-seek-forward-button
audio::-webkit-media-controls-fullscreen-button
audio::-webkit-media-controls-rewind-button
audio::-webkit-media-controls-return-to-realtime-button
audio::-webkit-media-controls-toggle-closed-captions-button */

.ol-days,
.ol-days * {
  font-size: medium;
	padding: 0;
	box-sizing: border-box;
}
.ol-days {
	width: 100%;
	max-width: 100%;
	margin-inline: auto;

	/* flex-direction: column; */
	gap: 0.25em;
	font-size: clamp(1rem, 5vw, 2rem);
	color: hsl(0, 0%, 90%);

	list-style: none;
	counter-reset: ol-days-counter;
}
.ol-days > li {
	counter-increment: ol-days-counter;
	padding-inline: 1em;
  width: 100%;
  margin: 0;
  padding: 0;
	display: grid;
  text-align: center;
	grid-template-columns: 80% min-content ;
	align-items: center;
	background: linear-gradient(
			hsla(0 0% 100% / 0.2),
			transparent 50%,
			hsla(0 0% 0% / 0.3)
		),
		var(--clr_bg);
	transition: transform 250ms ease;
  height: 70px;
	cursor: default;
	/* text-shadow: 0 0 5px hsla(0 0% 50% / 0.75); */
}
.ol-days > li:hover {
	transform: scale(1.05);
}

.ol-days > li::before,
.ol-days > li::after {
	display: grid;
  grid-template-columns: 10fr 1fr;
  width: 100%;
	align-items: center;
	grid-row: 1;
	text-align: center;
}
.ol-days > li::before {
	grid-column: 1;
  width: 50%;
	padding-inline-end: 0.25em;
}
.ol-days > li::after {
	content: counter(ol-days-counter, decimal-leading-zero);
	grid-column: 2;
  float: right;
	width: 1.75em;
	height: 3.5em;
	background-image: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0.3),
			rgba(0, 0, 0, 0) 25%
		),
		radial-gradient(
			circle at 0.125em center,
			var(--clr_accent) 1.25em,
			transparent calc(1.25em + 1px)
		);
	padding-inline-start: 0.1em;
  grid-template-columns: 10fr 1fr;

}
.ol-days > li:nth-child(even)::before {
	padding-inline-start: 1.25em;
}

.ol-days > li:nth-child(6n + 1) {
	--clr_bg: #2e2b3c;
	--clr_accent: #fb6767;
}
.ol-days > li:nth-child(6n + 2) {
	--clr_bg: #47505f;
	--clr_accent: #c14755;
}
.ol-days > li:nth-child(6n + 3) {
	--clr_bg: #37aa8d;
	--clr_accent: #a1cc6f;
}
.ol-days > li:nth-child(6n + 4) {
	--clr_bg: #8fb568;
	--clr_accent: #566574;
}
.ol-days > li:nth-child(6n + 5) {
	--clr_bg: #24b8b8;
	--clr_accent: #c4b36a;
}
.ol-days > li:nth-child(6n + 6) {
	--clr_bg: #fc6868;
	--clr_accent: #2e2b3c;
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