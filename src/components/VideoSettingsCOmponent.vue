<template>
    <div>
        <!-- <input type="text" v-model="this.videoFolder" @change="save()"> -->
    </div>
</template>
<script>
export default{
    props :{
        videoFolderAll : {required : true, type : String}
    },
    data() {
        return {
            videoFolder : this.videoFolderAll
        }
    },
    methods : {
        save(){
            localStorage.setItem("videoFolder",this.videoFolder)
        }
    }
}

</script>