<template>
    <div>
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