<template>
    <div style=" ; background-color: wheat;">
        <p>Scale in use {{ this.gammeSelected }}</p>
        <h1>Scales you could use : </h1>
        <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike">
<label for="vehicle1"> TODO : color relatives to the position in the scale</label><br>
        <ul>

            <li v-for="gammes in this.listeGammes" :key="gammes">
                <div v-if="gammes !== undefined">
                    <button class="buttonstyle" @click="this.setGamme(gammes.root, gammes.name)">{{ gammes.root }} - {{
                        gammes.name }}</button>

                    <ul>
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
.notesgammes {
    display: inline-block;
    padding: 10px;
    border-right: 1px solid black;
}

.buttonstyle {

    border: none;
    padding: 15px 32px;
    margin: 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    border-radius: 5px;

}
</style>

<script>

import * as myKey from '../../mydata.json';
// import  saveAs from 'file-saver';
export default {
    props: {
        //Peut etre qu'on peut definir un array de note ici
        notesSelected: { required: true, type: [Object] },
        gammeSelected : { required: true, type: String },
    },
    data() {
        return {
            notesSelectionnees: this.notesSelected,
            gammeSelectedIntra : this.gammeSelected,
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
            notesTab: ["A", "AS", "B", "C", "CS", "D", "DS", "E", "F", "FS", "G", "GS"],
            // listeGammes: [],
            scaleTypes: [
                { name: 'Major', noteName: '', intervals: [0, 2, 4, 5, 7, 9, 11], notes: [] },
                { name: 'Natural Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 8, 10], notes: [] },
                { name: 'Harmonic Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 8, 11], notes: [] },
                { name: 'Melodic Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 9, 11], notes: [] },
                { name: 'Dorian', noteName: 'D', intervals: [0, 2, 3, 5, 7, 9, 10], notes: [] },
                { name: 'Phrygian', noteName: 'E', intervals: [0, 1, 3, 5, 7, 8, 10], notes: [] },
                { name: 'Hirojoshi', noteName: 'C', intervals: [0, 2, 3, 7, 8], notes: [] }
            ]


        }
    },
    computed : {
        listeGammes(){
            var notes = []
            this.notesSelectionnees.forEach(element => {
                if (element.enabled) {
                    notes.push(element.note)
                }
            });

             const scales = this.generateScales(notes);
            //  console.log(scales)
           
            // scales.forEach(gamme => {
            //     listeGammes.push(gamme)
            // })
            return scales

        }

    },
    methods: {
        setGamme(fonda, type) {
            // console.log(fonda,type)
            var gamme = this.generateGammes(type, fonda)

            this.notesSelectionnees.forEach(n => n.enabled = false)
            gamme.notes.forEach(note => {
                var find = this.notesSelectionnees.find(notesel => notesel.note === note)
                find.enabled = true
            })
                this.$emit("newscale",fonda+" "+type)

        },
        generatePopulation(nomGamme) {
            // console.log(nomGamme)
            var genScale = this.scaleTypes.find(gamme => gamme.name === nomGamme)
            var soluce = []
            var i =0
            this.listeNotes.forEach(note => {
                var tabNotes = []
                genScale.intervals.forEach(
                    step => {
                        tabNotes.push(this.listeNotes.find(caca => caca.id === ((step + note.id) % 12)).note)
                    }
                )

                soluce.push({ id : i, name: nomGamme, root: note.note, notes: tabNotes })
                i+=1
            })
            return soluce
        }



        ,

        generateScales(notes) {
            const scalesfinal = [];
            notes.sort();
            // for (let i = 0; i < this.scaleTypes.length; i++) {

            //     var population = this.generatePopulation(this.scaleTypes[i].name)
                this.scalestot.forEach(elem => {
                    if (notes.every(val => elem.notes.includes(val))) {
                        scalesfinal.push(elem)
                    }

                 }
                )

                //Generer l'ensemble des 12 mêmes gammes en fonction du type
                //check pour lesquelles nos notes sont dedans, et les garder
            
            return scalesfinal


        },


       
        
        listeGammesFunc() {
            var notes = []
            this.notesSelectionnees.forEach(element => {
                if (element.enabled) {
                    notes.push(element.note)
                }
            });

             const scales = this.generateScales(notes);
            //  console.log(scales)
            this.listeGammes = scales
            scales.forEach(gamme => {
                this.listeGammes.push(gamme)
            })
            return this.listeGammes
        },
        generateGammes(type, rootnote) {

            var genScale = this.scaleTypes.find(gamme => gamme.name === type)
            // var soluce = {}
            var notefonda = this.listeNotes.find(n => n.note === rootnote)

            var tabNotes = []
            genScale.intervals.forEach(
                step => {
                    tabNotes.push(this.listeNotes.find(caca => caca.id === ((step + notefonda.id) % 12)).note)
                }
            )

            // console.log("gamme generated "+soluce)
            return { notes: tabNotes, name: type, root: rootnote }

        }
    }
    ,
    mounted() {
        
    },
    created() {
        // const fullgammes = []
        // this.scaleTypes.forEach(scale => {
        //     this.generatePopulation(scale.name).forEach(gamme => fullgammes.push(gamme))
        // })

        // // Then put fullgamme in a file
        // var blob = new Blob([JSON.stringify(fullgammes)], {type: "text/json"});
        // saveAs(blob, "mydata.json");



    this.scalestot = []
    for(var i=0;i<84;i++){
        this.scalestot.push(myKey[i])
        // console.log(myKey[i])

    }
  }

}


// console.log(this.noteSlectedList)















</script>