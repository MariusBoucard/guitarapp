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

      dictionnairecouleur: this.couleurdict,
    };
  },
  methods: {
    getColor(couleur) {
      return couleur.color
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
</style>