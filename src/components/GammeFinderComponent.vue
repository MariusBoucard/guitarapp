<template>
    <div style=" ; background-color: wheat;">
        <h1>Scales you could use : </h1>
        <ul>

            <li v-for="gammes in this.listeGammesFunc()" :key="gammes"  >
                <div v-if="gammes !== undefined">
                    <button class="buttonstyle" @click="this.setGamme(gammes.root, gammes.name)">{{gammes.root }} - {{ gammes.name }}</button>
                  
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
          
            var gamme = this.generateGammes(type,fonda)
          
            this.notesSelectionnees.forEach(n => n.enabled =false)
            gamme.notes.forEach(note => {
                var find = this.notesSelectionnees.find(notesel => notesel.note===note)
                find.enabled = true
            })

        },
        generatePopulation(nomGamme){
            var genScale = this.scaleTypes.find(gamme => gamme.name===nomGamme)
            var soluce = []
            this.listeNotes.forEach( note =>
            {
                var tabNotes = []
                genScale.intervals.forEach(
                    step => {
                        tabNotes.push(this.listeNotes.find(caca => caca.id===((step+note.id)%12)).note)
                    }
                )
                soluce.push({name: nomGamme,root : note.note, notes : tabNotes})
            })
            return soluce
        }



        ,

        generateScales(notes){
            const scalesfinal = [];
            notes.sort();
            for(let i = 0; i<this.scaleTypes.length;i++){
                
                var population = this.generatePopulation(this.scaleTypes[i].name)
                population.forEach(elem =>{
                        if(notes.every(val => elem.notes.includes(val))){
                            scalesfinal.push(elem)
                        }

                }
                 )
                //Generer l'ensemble des 12 m??mes gammes en fonction du type
                //check pour lesquelles nos notes sont dedans, et les garder
            }
            return scalesfinal


        },


         generateScalesChat(notes) {
  const scales = [];

  // trier les notes par ordre alphab??tique
  notes.sort();




  // pour chaque note dans le tableau de notes
  for (let i = 0; i < notes.length; i++) {
    // pour chaque type d'??chelle
    for (let j = 0; j < this.scaleTypes.length; j++) {
      const scale = [];

      // ajouter la note de d??part ?? l'??chelle
      const noteName = this.scaleTypes[j].noteName ? this.scaleTypes[j].noteName : notes[i];
      const scaleName = `${noteName} ${this.scaleTypes[j].name}`;
      scale.push(notes[i]);

      let currentIndex = i;

      // g??n??rer l'??chelle en fonction des intervalles du type
      for (let interval of this.scaleTypes[j].intervals) {
        currentIndex += interval;

        // ajouter un demi-ton si n??cessaire
        if (currentIndex < notes.length - 1 && interval < this.scaleTypes[j].intervals[this.scaleTypes[j].intervals.length - 1]) {
          currentIndex++;
        }

        // si l'indice d??passe la longueur du tableau de notes, revenir au d??but
        if (currentIndex >= notes.length) {
          currentIndex = currentIndex - notes.length;
        }

        // ajouter la note ?? l'??chelle
        scale.push(notes[currentIndex]);
      }

      // v??rifier si l'??chelle contient toutes les notes en entr??e
      if (notes.every(note => scale.includes(note))) {
        scales.push({name: scaleName, root: notes[i], notes: scale});
      }
    }
  }

  // retourner le tableau d'objets contenant le nom complet de l'??chelle, la note fondamentale et les notes de l'??chelle
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

        const scales = this.generateScales(notes);
        this.listeGammes = []
        scales.forEach(gamme => {
            this.listeGammes.push(gamme)
        })
            return this.listeGammes
        },
         generateGammes(type,rootnote){
           
           
            var genScale = this.scaleTypes.find(gamme => gamme.name===type)
            var soluce = {}
            var notefonda = this.listeNotes.find(n => n.note === rootnote)
           
                var tabNotes = []
                genScale.intervals.forEach(
                    step => {
                        tabNotes.push(this.listeNotes.find(caca => caca.id===((step+notefonda.id)%12)).note)
                    }
                )
                
            console.log("gamme generated "+soluce)
            return {notes : tabNotes, name : type, root : rootnote}

        }
    }


   
       





}


</script>