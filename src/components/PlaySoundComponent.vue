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
            <ul>
                <li v-for="item in this.songPath" :key="item" @click="this.launchFile(item)">
                {{ item.name }}
                </li>
            </ul>

        </div>
        <p>{{ this.songPlaying }}</p>

        <div class="container">
      <div class="button-wrap">
        <label class="buttonbis" for="upload">Upload File</label>
        <input id="upload" type="file" @change="onFileChange">
      </div>
    </div>
      <audio ref="audioPlayer" controls
    
      @timeupdate="onPlaying"
    >
      Your browser does not support the
      <code>audio</code> element.
    </audio>
  
    <div>
      <button @click="play">play</button>
      <button @click="pause">pause</button>
      <button @click="stop">stop</button>

    </div>
    <div style="display : flex; text-align: center;">

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
        launchFile(file){
        const reader = new FileReader();
        console.log(file)
        this.songPlaying = file.name
  
        reader.onload = (event) => {
          const audioPlayer = this.$refs.audioPlayer;
          audioPlayer.src = event.target.result;

        };
  
        reader.readAsDataURL(file);
        },
        valueChangedHandler(speedval){
                this.setSpeed(speedval/100)
        },
      onFileChange(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        this.songPath.push(file)
        this.songPlaying = file.name

  
        reader.onload = (event) => {
          const audioPlayer = this.$refs.audioPlayer;
          audioPlayer.src = event.target.result;

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
        justify-content: flex-start;
        width: 100%;
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
</style>