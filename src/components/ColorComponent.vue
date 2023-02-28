<template>
<div>
    <!-- Iterate through the keys of the dict and affiche ? Ou affihce sa propre valeur de data -->
    Color compoooo
    
    <ul >
    <li v-for="couleur in dictionnairecouleur" :key="couleur.note">
      {{couleur.note}} : {{ couleur.color }}
    </li> 
  </ul>
</div>
</template>
<script>
export default {
    props : {
         couleurdict : { required : true , type :  [Object] }
        }
    ,
    data(){
        return{

            dictionnairecouleur : this.couleurdict,
        };
    }
}
</script>

<style>

 .column {
  float: left;
  width: 80%;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}
</style>