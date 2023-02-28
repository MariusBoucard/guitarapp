<template>
  <div>
    <!-- Iterate through the keys of the dict and affiche ? Ou affihce sa propre valeur de data -->
    <h1>Voila les couleurs associées avec les notes</h1>

    <ul>
      <li v-for="couleur in dictionnairecouleur" :key="couleur.note">
        <div class="row">
          <div class="columnhalf">
            {{ couleur.note }}
          </div>
          <div class="columnhalf">
            <div width="100%" height="100%" :style="{ backgroundColor: getColor(couleur) }"> {{ couleur.color}} </div>
          </div>
        </div>
      </li>
    </ul>
    <form 
         @submit.prevent="onSubmit" >
    
  
      <h1> {{ this.selectedforchange }}</h1>
      <h1> Note to change color</h1>
  
              <select class="selectnotechange" v-model=this.selectedforchange>
  
                <option v-for="option in this.dictionnairecouleur" :value="option.note" :key="option.note">{{ option.note }}</option>
  
              </select>
              <input
      type="text"
    
      autocomplete="off"
          v-model="label" />
          <!-- Thanks to v-label there's a 2 way binding with the data property -->
    <button type="submit">Change</button>
    </form>
      

  </div>
</template>
<script>
export default {
  props: {
    couleurdict: { required: true, type: [Object] }
  }
  ,
  data() {
    return {
      selectedforchange : 'A',
      dictionnairecouleur: this.couleurdict,
      label:""
    };
  },
  methods: {
    getColor(couleur) {
      return couleur.color
    },
    onSubmit(){
 
        var find = this.couleurdict.find((entree) => entree.note === this.selectedforchange)
        find.color = this.label
        this.label = ""

    }
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

.columnhalf {
  float: left;
  width: 50%;
}
.selectnotechange{
  width:80px;
  height: 40px;

  border: none;
  text-align: center;
  border-radius: 5px;

}
</style>