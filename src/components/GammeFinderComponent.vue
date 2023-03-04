<template>
    <div style=" ; background-color: wheat;">
        <h1>Scales you could use : </h1>
        <ul>

            <li v-for="gammes in this.listeGammesFunc()" :key="gammes"  >
                <div v-if="gammes !== undefined">
                    <button class="buttonstyle" @click="this.setGamme(gammes.fonda, gammes.type)">{{gammes.fonda }} - {{ gammes.type }}</button>
                  
                    <ul >
                        <li class="notesgammes" v-for="notes in gammes.notes" :key="notes">
                            <p>{{ notes }}</p>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
    </div>
</template>
<style>
.notesgammes{
    display: inline-block;
    padding: 10px;
    border-right: 1px solid black;
}
.buttonstyle{
    
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

<script>


export default {
    props: {
        //Peut etre qu'on peut definir un array de note ici
        notesSelected: { required: true, type: [Object] },
    },
    data() {
        return {
            notesSelectionnees: this.notesSelected,

            listeNotes: [
                { id: 0, note: "A" },
                { id: 1, note: "AS" },
                { id: 2, note: "B" },
                { id: 3, note: "C" },
                { id: 4, note: "CS" },
                { id: 5, note: "D" },
                { id: 6, note: "DS" },
                { id: 7, note: "E" },
                { id: 8, note: "F" },
                { id: 9, note: "FS" },
                { id: 10, note: "G" },
                { id: 11, note: "GS" },
            ],
            notesTab : ["A","AS","B","C","CS","D","DS","E","F","FS","G","GS"],
            listeGammes : [],
            scaleTypes : [
                {name: 'Major', noteName: '', intervals: [0, 2, 4, 5, 7, 9, 11], notes: []},
                {name: 'Natural Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 8, 10], notes: []},
                {name: 'Harmonic Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 8, 11], notes: []},
                {name: 'Melodic Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 9, 11], notes: []},
                {name: 'Dorian', noteName: 'D', intervals: [0, 2, 3, 5, 7, 9, 10], notes: []},
                {name: 'Phrygian', noteName: 'E', intervals: [0, 1, 3, 5, 7, 8, 10], notes: []},
                {name: 'Hirojoshi', noteName: 'C', intervals: [0, 2, 3, 7, 8], notes: []}
            ]
            
          
        }
    },
    methods : {
        setGamme(fonda,type){
            console.log("setgamme")
            var type2 = fonda+" "+type
            console.log(type2)
            var gamme = this.generateGammes(type2,fonda)
            console.log("gamme generee "+gamme)
            console.log(gamme)
            this.notesSelectionnees.forEach(n => n.enabled =false)
            gamme.notes.forEach(note => {
                var find = this.notesSelectionnees.find(notesel => notesel.note===note)
                find.enabled = true
            })

        },
     generateScales(notes) {
  const scales = [];


  // pour chaque note dans le tableau de notes
  for (let i = 0; i < notes.length; i++) {
    // pour chaque type d'échelle
    for (let j = 0; j < this.scaleTypes.length; j++) {
      const scale = [];

      // ajouter la note de départ à l'échelle
      const noteName = this.scaleTypes[j].noteName ? this.scaleTypes[j].noteName : notes[i];
      const scaleName = `${noteName} ${this.scaleTypes[j].name}`;
      scale.push(notes[i]);

      let currentIndex = i;

      // générer l'échelle en fonction des intervalles du type
      for (let interval of this.scaleTypes[j].intervals) {
        currentIndex += interval;

        // ajouter un demi-ton si nécessaire
        if (currentIndex < notes.length - 1 && interval < this.scaleTypes[j].intervals[this.scaleTypes[j].intervals.length - 1]) {
          currentIndex++;
        }

        // si l'indice dépasse la longueur du tableau de notes, revenir au début
        if (currentIndex >= notes.length) {
          currentIndex = currentIndex - notes.length;
        }

        // ajouter la note à l'échelle
        scale.push(notes[currentIndex]);
      }

      // ajouter les notes de l'échelle au type d'échelle
      this.scaleTypes[j].notes.push(scale);

      // vérifier si l'échelle contient toutes les notes en entrée
      if (notes.every(note => scale.includes(note))) {
        scales.push({name: scaleName, root: notes[i], notes: scale});
      }
    }
  }

  // retourner le tableau d'objets contenant le nom complet de l'échelle, la note fondamentale et les notes de l'échelle
  return scales;
}

,
listeGammesFunc(){
            var notes = []
        this.notesSelectionnees.forEach(element => {
            if(element.enabled){
                notes.push(element.note)
            }
        });
        console.log("yeah"+notes)
        const scales = this.generateScales(notes);
        console.log(scales)
        this.listeGammes = []
        scales.forEach(gamme => {
            this.listeGammes.push(this.generateGammes(gamme.name,gamme.root))
        })
            return this.listeGammes
        },
         generateGammes(type,rootnote){
           
                var find = this.scaleTypes.find(scale => scale.name== type.substr(type.indexOf(" ") + 1))
                var note = this.listeNotes.find(elem => rootnote === elem.note)
                var scale = {}
                scale.fonda = rootnote
                scale.type = type.substr(type.indexOf(" ") + 1)
                var tabNotes = []
                find.intervals.forEach(offset => tabNotes.push(this.notesTab[((note.id+offset)%12)]) )
                scale.notes = tabNotes
                return scale

        }
    }


   
       





}


</script>