<template>
<div style="display:flex; background-color: green;">
<p>Nombre de cordes de ton enorme instrument :</p>

<button @click="this.delCorde()"> - </button> <h1>{{ this.nbCordes }} </h1><button @click=this.addCorde()> + </button>


<ul >
    <li class="horizontalli" v-for="corde in tuningList" :key="corde.cordeId">

      <div>
            <label>{{corde.cordeId}} </label>
            <select name="cars" id="cars">  
              <option v-for="option in this.nbnotes" :value="option.note" :key="option.id">{{option}}</option>
               
            </select>


      </div>
   
   
   
    </li> 
  </ul>
</div>

</template>
<script>
export default {
    props : {
        cordesNumber : { required : true , type : Number },
        tuningList : { required : true , type :  [Object] },
        notesnumber : {required : true , type : [Object]}
    },
    methods: {
        addCorde(){
        
          this.listTuning.push({ cordeId : this.nbCordes , tuning : "A" })
          this.nbCordes ++
        },
        delCorde(){
          this.listTuning.pop()
          this.nbCordes --
        }

    },
    data () {
        return {
            nbnotes : this.notesnumber,
            nbCordes : this.cordesNumber,
            listTuning : this.tuningList,
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

.horizontalli {
  float: left;
  width: flex;
}

li a{
  display: block;
  color: white;
  text-align: center;
  
  text-decoration: none;
}

li:hover {
  background-color: #111111;
}
</style>