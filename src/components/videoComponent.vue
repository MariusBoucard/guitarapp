<template>
    <div style="width:100%;height : 100%">

        <div>
            <ol  class="ol-days" >
                <li v-for="item in this.videoPath" :key="item" @click="this.launchFile(item)">
                {{ item.name }}
                </li>
            </ol>

        </div>

        <div class="container">
          <div class="button-wrap">
            <label class="buttonbis" for="uploadVideo">Upload File</label>
            <input id="uploadVideo" type="file" @change="loadVideo">
          </div>
        </div>
     
      <video style="width:100%;height : 100%" ref="video" controls></video>
      <div>
      <button class="button" @click="play(this.speed)">play</button>
      <button class="button"  @click="pause">pause</button>
      <button class="button" @click="stop">stop</button>

    </div>
    <div style="text-align: center;">
      <h3 style="display: block;float: top">Playing rate</h3>
      <div class="slider" style="margin : auto">

    <input type="range" min="0" max="300" oninput="rangeValueVideo.innerText = this.value"  v-model="this.speed">
    <p id="rangeValueVideo">100</p>
    
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
        videoPath : [],
        videoPlaying : "",
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
    methods: {
        async launchFile(file){
            const videoURL = URL.createObjectURL(file);
            this.$refs.video.src = videoURL;
        this.$refs.video.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(videoURL);
        //   this.play();
        });
        },
      async loadVideo(event) {
        const file = event.target.files[0];
        const videoURL = URL.createObjectURL(file);
        this.videoPath.push(file)
        this.speed = 100

        this.$refs.video.src = videoURL;
        this.$refs.video.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(videoURL);
        //   this.play();
        });

        localStorage.setItem("videoLength",this.videoPath.length)
        for(var i=0;i<this.videoPath.length;i++){
          console.log(this.videoPath[i])
          localStorage.setItem("video"+i,this.videoPath[i].name)
        }
       
      },
      play(playbackRate = 100) {
      this.$refs.video.playbackRate = playbackRate/100;
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
        this.$refs.video.playbackRate = speed/100;
      },
    },
    mounted(){
      var lenVideo= localStorage.getItem("videoLength")
        for(var i=0;i<lenVideo;i++){
         var path=  localStorage.getItem("video"+i)
         this.videoFolder = localStorage.getItem("videoFolder")

         path = this.videoFolder+path
         console.log(path)
        //  const videoURL = URL.createObjectURL(path);
                  // this.$refs.video.src = path;

                  if (path) {
                    // Make a request to a server-side script to load the video file
                    const videoURL = `/loadvideo.php?path=${encodeURIComponent(path)}`;
                    fetch(videoURL)
                      .then(response => response.blob())
                      .then(blob => {
                        const videoBlobURL = URL.createObjectURL(blob);
                        this.$refs.video.src = videoBlobURL;
                        this.$refs.video.addEventListener('loadedmetadata', () => {
                          URL.revokeObjectURL(videoBlobURL);
                          // this.play();
                        });
                      });
                  }
        }
    }
  }
  </script>