<template>
  <div style="display: flex; ">
    <div style="display:block; width:20%">

      <p>Nombre de cordes de ton enorme instrument :</p>

      <button @click="this.delCorde()" class="cordeplus"> - </button>
      <h1>{{ this.nbCordes }} </h1><button class="cordeplus" @click=this.addCorde()> + </button>

    </div>
    <div style="display:block">

      <ul>
        <li class="horizontallicorde" v-for="corde in tuningList" :key="corde.cordeId">

          <div style="display: block;position: relative;">
            <label style="display: block;">{{ corde.cordeId }} </label>
            <select class="selectnote" :style="{ backgroundColor : colorFromNote(corde.tuning)}" @change="onChangeTune($event, corde.cordeId)">
              <option selected="selected">
                {{ corde.tuning }}
              </option>

              <option v-for="option in this.nbnotes" :value="option.note" :key="option.id">{{ option.note }}</option>

            </select>


          </div>



        </li>
      </ul>
    </div>
      <div style="display:block; width:20%">

      <p>Diapason de ton énorme manche : </p>

      <button @click="this.diapasonMoins()" class="cordeplus"> - </button>
      <h1>{{ this.diap }} </h1><button class="cordeplus" @click=this.diapasonPlus()> + </button>

    </div>
  </div>
</template>
<script>
export default {
  props: {
    cordesNumber: { required: true, type: Number },
    diapason : { required: true, type: Number },
    tuningList: { required: true, type: [Object] },
    notesnumber: { required: true, type: [Object] },
    notesColor : { required : true, type : [Object]}
  },
  methods: {
    addCorde() {

      this.listTuning.push({ cordeId: this.nbCordes, tuning: "A" })
      this.nbCordes++
    },
    delCorde() {
      this.listTuning.pop()
      this.nbCordes--
    },
    onChangeTune(event, corde) {

      var found = this.listTuning.find((cor) => cor.cordeId === corde)
      found.tuning = event.target.value
    },
    colorFromNote(tuning){
      console.log(tuning)

      var find = this.couleurnoteliste.find((col) => col.note === tuning)
      return find.color
    },
    diapasonPlus(){
        this.diap +=10
        this.$emit('diap', this.diap);

    },
    diapasonMoins(){
      this.diap -=10
      console.log("diapmoins")
      
      console.log("Find das userc" + this.diap)
      this.$emit('diap', this.diap);
    }

  },
  data() {
    return {
      diap : this.diapason,
      nbnotes: this.notesnumber,
      nbCordes: this.cordesNumber,
      listTuning: this.tuningList,
      couleurnoteliste : this.notesColor
    };
  }

}

</script>

<style>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;

}

.horizontallicorde {
  float: left;
  width: flex;
  position: relative;
  margin: 20px 0;
  padding-left: 10px;
  padding-right: 10px;
  border-left: 1px solid white;
}

li a {
  display: block;
  color: white;
  text-align: center;

  text-decoration: none;
}

li:hover {
  background-color: #111111;
}

.cordeplus {
  background-color: aqua;
  width: 40px;
  height: 40px;
  color: white;
  border: none;


  text-align: center;
  display: inline-block;
  font-size: 16px;
  border-radius: 5px;
}
.selectnote{
  width: 60px;
  height: 40px;
  color: black;
  border: none;
  text-align: center;
  border-radius: 5px;



}
</style>