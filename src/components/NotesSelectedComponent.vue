<template>
  <div style="display: flex;  padding-top: 40px;">
    <div display="block">
      <h1> Select the notes you want to display</h1>

    </div>
    <div display="block">

      <ul>
        <li class="horizontalli" v-for="note in this.localNoteList" :key="note.note">
          
          
          <!-- <label class="container">{{ note.note }}
            <input class="checkbox" @change="userChecked(note)" type="checkbox" :checked="isChecked(note.note)"/>
            <span class="checkmark"></span>
          </label> -->
          <button class="button" :style="{ backgroundColor : backGroundColor(note.note)}" type="button" @click=userChecked(note)>
            {{ note.note }}
          </button>
          
        </li>
      </ul>
    </div>
  </div>


</template>
<script>
export default {
  props: {
    listNotes: { required: true, type: [Object] },
    colorNotes : { required: true, type: [Object] }
  },
  data() {
    return {
      localNoteList: this.listNotes,
      colornoteList : this.colorNotes
    }
  },
  methods: {

    userChecked(note) {
      const find = this.listNotes.find((notes) => notes.note === note.note)
      find.enabled = !find.enabled
      var yolo = find
      console.log("Find das userc" + yolo)
      this.$emit('note-checked', yolo);

    }, isChecked(note) {
      const find = this.listNotes.find((notes) => notes.note === note)
      return find.enabled

    },
    backGroundColor(note){
      console.log(note + "back")
      const find = this.listNotes.find((notes) => notes.note === note)
      if (find.enabled){
        var couleur =  this.colornoteList.find((color) => color.note === find.note)
          return couleur.color
      }else{
        return "lightgrey"
      }
    }
  },
  compute: {

  }

}

</script>

<style>
/* Customize the label (the container) */
.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
}

/* On mouse-over, add a grey background color */
.container:hover input~.checkmark {
  background-color: #ccc;
}

/* When the checkbox is checked, add a blue background */
.container input:checked~.checkmark {
  background-color: #2196F3;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked~.checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

ul {
  list-style-type: none;

}

.horizontalli {
  float: left;
}

li a {
  display: block;
  color: white;
  text-align: center;
  padding: 16px;
  text-decoration: none;
}

li a:hover {
  background-color: #111111;
}


.button {
  background-color: #4CAF50; /* Green */
  border: none;
  padding: 15px 32px;
  margin : 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 5px;
}
</style>