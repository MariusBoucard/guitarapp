<template>
<div>
c est le tuning du caca
<p>Nombre de cordes de ton enorme instrument : {{ this.nbCordes }}</p>
<ul >
    <li class="horizontalli" v-for="corde in tuningList" :key="corde.cordeId">
      {{corde.cordeId}} : {{ corde.tuning }}
    </li> 
  </ul>
</div>

</template>
<script>
export default {
    props : {
        cordesNumber : { required : true , type : Number },
        tuningList : { required : true , type :  [Object] }
    },
    methods: {
        
    },
    data () {
        return {
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