  <template>
    <!-- <input
      type="range"
      min="0"
      max="100"
      step="1"
      v-model="seekValue"
      @change="onSeek"
    /> -->
    <div style="text-align: center;">
        <div>
            <ol  class="ol-days" >
                <li v-for="item in this.songPath" :key="item" @click="this.launchFile(item)">
                {{ item.split("\\")[item.split("\\").length - 1] }}
                <button class="button-cross" @click="remove(item)"></button>

                </li>
            </ol>

        </div>
        
        <div class="container">
          <div class="button-wrap">
            <label class="buttonbis" for="upload">Upload File</label>
            <input id="upload" type="file" @change="onFileChange">
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
</div>
  </template>
  
  <script>

  
  export default {
    data() {
      return {
        currentTime: 0,
        seekValue: 0,
        speed : 100,
        songPath : [],
        songPlaying : ""
      };
    },
    watch: {
    speed(newValue) {
      this.valueChangedHandler(newValue);
    },
  },
  computed : {
    oldPath () {
        return this.songPath
    }
  },
    methods: {
      remove(item){
      console.log("pute")
      var index = this.songPath.indexOf(item)
      if(index>-1){
        console.log("great")

        this.songPath.splice(index, 1);
      }
      console.log(this.songPath)
      localStorage.setItem("songLength", this.songPath.length)
      for (var i = 0; i < this.songPath.length; i++) {
        localStorage.setItem("songPath" + i, this.songPath[i])
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
        const reader = new FileReader();
        const filePath =file.path.replace(/#/g, '%23')
        this.songPath.push(filePath)
        this.saveSong()
        this.songPlaying = file.name

  
        reader.onload = () => {
          const audioPlayer = this.$refs.audioPlayer;
          const audioURL = `file://${filePath}`;
          audioPlayer.src = audioURL;

        };
  
         reader.readAsDataURL(file);
      },
    
      play() {
        this.$refs.audioPlayer.play();
      },
      pause() {
        this.$refs.audioPlayer.pause();
      },
      stop() {
        const { audioPlayer } = this.$refs;
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
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
      },
      onSeek() {
        const { audioPlayer } = this.$refs;
        const seekto = audioPlayer.duration * (this.seekValue / 100);
        audioPlayer.currentTime = seekto;
      },
    },
    mounted() {
      var lenVideo= localStorage.getItem("songLength")
      for(var i=0;i<lenVideo;i++){
       var path2=  localStorage.getItem("song"+i)
      //  this.videoFolder = localStorage.getItem("videoFolder")

       console.log(path2)
      //  const videoURL = URL.createObjectURL(path);
                // this.$refs.video.src = path;

                if (path2) {
                  // Make a request to a server-side script to load the video file
                  // const filePath = path.resolve(path2);
                        // this.videoPath.push(filePath);
                  this.speed = 100;
                  this.songPath.push(path2)
                  
                  // const  filePath = file.path                  

                }
      }
    }
  };
  
  </script>
  <style>
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