<template>
    <div style=" ; background-color: wheat;">
        <p>Scale in use {{ this.gammeSelected }}</p>
        <h1>Scales you could use : </h1>
        <input type="checkbox"  v-model="this.colorScaleBool" >
<label > TODO : color relatives to the position in the scale</label><br>
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
        color: { required: true, type: [Object] },
        nbnotes: { required: true, type: [Object] },


        gammeSelected : { required: true, type: String },
    },
    data() {
        return {
            colorScaleBool : false,
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
            colorIntra : this.color,
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
            ],


            colorScale : [
                { id : 0 , color : "red"},
                { id : 1 , color : "red"},
                { id : 2 , color : "red"},
                { id : 3 , color : "red"},
                { id : 4 , color : "red"},
                { id : 5 , color : "red"},
                { id : 6 , color : "red"},
                { id : 7 , color : "red"},
                { id : 8 , color : "red"},
                { id : 9 , color : "red"},
                { id : 10 , color : "blue"},
                { id : 11, color : "red"},
                { id : 12, color : "red"}
        ],
            colorSave : []
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
        generateColors(fonda,type){
            const colorsRender = []
            var scaleType = this.scaleTypes.find(scaleType => scaleType.name === type)
            var rootNote = this.nbnotes.find(note => note.note === fonda)
            //put as well the not in the interval number
            const nbinterval = [0,1,2,3,4,5,6,7,8,9,10,11]
            scaleType.intervals.forEach(numero => {
                var numnew = this.nbnotes.find(note => note.id === (rootNote.id+numero)%12)
                var colorSc = this.colorScale.find(inter => inter.id === numero)
                colorsRender.push({ note : numnew.note , color : colorSc.color })


                    const index = nbinterval.indexOf(numero);
                    if (index > -1) { // only splice array when item is found
                    nbinterval.splice(index, 1); // 2nd parameter means remove one item only
                    }

                    
            })
            console.log(nbinterval)

            nbinterval.forEach(numero => {
                var numnew = this.nbnotes.find(note => note.id === ((rootNote.id+numero)%12))
                console.log(numero)
                var colorSc2 = this.colorScale.find(inter => inter.id === numero)
                colorsRender.push({ note : numnew.note , color : colorSc2.color })
            })
            return colorsRender
        },
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
  },
  watch : {
    colorScaleBool : {
        handler(){
            // console.log(this.gammeSelected)
            var rootnote = this.gammeSelected.split(" ").at(0);
            var type = this.gammeSelected.split(" ")
            type = type.slice(1,type.length);
            type = type.join(" ")
            console.log("root")
            console.log("Rootnote gamme "+rootnote+type)
            if(this.colorScaleBool && rootnote !== "" && type !== ""){
                //Parse over the name to get the rootNote
                this.colorSave = this.color
                //get the intervals :

                this.colorIntra = this.generateColors(rootnote,type)
                console.log(this.colorIntra)
                this.$emit("colorgamme",this.colorIntra)
            }
            else{
                this.colorIntra = this.colorSave
                this.$emit("colorgamme",this.colorIntra)


            }
        }
    }
  }

}


// console.log(this.noteSlectedList)















</script>