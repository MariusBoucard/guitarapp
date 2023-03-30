<template>
    <div >
      <input type="file" @change="handleFileChange">
      <p></p>
      <img :src="imageUrl" v-if="imageUrl" style="max-width:100%;max-height:100%">
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        imageUrl: '',
      };
    },
    methods: {
      handleFileChange(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          this.imageUrl = reader.result;
        };
        reader.readAsDataURL(file);
      },
    },
  };
  </script>
  