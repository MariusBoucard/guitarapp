<template>
    <div style="text-align: center;">
        <div>
            <ol  class="ol-days" >
                <li v-for="item in this.picturesPath" :key="item" @click="this.launchFile(item)">
                {{ item.name }}
                </li>
            </ol>

        </div>
        
        <div class="container">
          <div class="button-wrap">
            <label class="buttonbis" for="uploadpic">Upload File</label>
            <input id="uploadpic" type="file" @change="handleFileChange">

          </div>
        </div>
    <div >
      <p></p>
      <img :src="imageUrl" v-if="imageUrl" style="max-width:100%;max-height:100%">
    </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        imageUrl: '',
        picturesPath : [],

      };
    },
    methods: {
      launchFile(file){
        const reader = new FileReader();
    
  
        reader.onload = () => {
          this.imageUrl = reader.result;

        };
  
        reader.readAsDataURL(file);
        },
      handleFileChange(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
          return;
        }
        this.picturesPath.push(file)
        const reader = new FileReader();
        reader.onload = () => {
          this.imageUrl = reader.result;
        };
        reader.readAsDataURL(file);
      },
    },
  };
  </script>
  