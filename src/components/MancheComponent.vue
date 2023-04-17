<template>
    <div>
        <div style="width:100%;">
                <div class="row">
      <div class="columnb" style="text-align: center;">
        <div v-show="this.showgame">
            <h1>Ready to play ?</h1>
        </div>
        <div v-show="!this.showgame">
            -
        </div>



     

      </div>
      <div class="columnb">  <!-- <p>{{ this.tuningintra }}</p> -->
                    <h1>{{ this.notePlayed }}</h1>
                    <div class="circle" style="width:35px;height:35px"
                        :style="{ backgroundColor: (this.notePlayed ? calcBack(this.notePlayed.slice(0, this.notePlayed.length - 1)) : white) }">
                        {{ this.notePlayed.slice(0, this.notePlayed.length - 1) }}

                    </div>
                    <p>Activer le sapin de noel :</p>
                    <button class="button" style="border : 1px solid black" @click="allumerSapin()"
                        :style="{ backgroundColor: getStateButton() }">Sapinnnnn</button></div>
      <div class="columnb">
        <div v-show="this.showgame">
             <p>Easy version enabled : {{ this.cheat }}</p>
             <p v-show="this.cheat">Note to play then : </p>
             <h1>{{ this.noteToPlay }}</h1>
             <h2 style="color:white">Score : {{ this.score }}</h2>
        </div>
        <div v-show="!this.showgame">
            -
        </div>
      </div>
    </div> 
            
                  
               

        </div>

        <div width="300px">


            <ul  :class=" this.lefty ?  'ulmanche' :'' ">
                <li class="horizontalli ">
                    <ul>
                        <li style=" width: 40px" :style="{ height: calcHeight() }" v-for="note in this.tuningintra"
                            :key="note.cordeId">
                            <div class="circle" style="width:35px;height:35px"
                                :style="{ backgroundColor: calcBack2(note.tuning) }" v-if="isChoosedTune(note)">
                                {{ note.tuning.slice(0, note.tuning.length) }}

                            </div>
                            <div v-else>
                                {{ note.tuning.slice(0, note.tuning.length) }}

                            </div>

                        </li>

                    </ul>
                </li>


                <li class="horizontalli2 frette yolo" :style="{ width: calcWidth(index) }"
                    v-for="index in (this.nbfrettes - 1)" :key="index">
                    <div class="image-container">
                        <img class="background-image" src="../assets/frettebackground.jpeg">
                        <div class="content">

                            <ul>
                                <li class="lettre lithium" :style="{ height: calcHeight() }"
                                    v-for="note in this.tuningintra" :key="note.cordeId"
                                    v-on:click="chooseNote(note, index)">
                                    <div display="flex" class="cord" v-if="isChoosed(note, index)">
                                        <hr class="line" :style="{ width: calcWidth(index) }">
                                        <div class="circle"
                                            :style="{ height: heightCircle(index), width: heightCircle(index), backgroundColor: calcBackNote(note, index) }">
                                            <p>{{ renderChoosen(note, index) }}</p>
                                        </div>
                                    </div>
                                    <div display="flex" class="cord" v-else>
                                        <hr class="line" :style="{ width: calcWidth(index) }">

                                    </div>
                                </li>

                            </ul>
                        </div>
                    </div>
                    <p style="margin:0;padding:0;color : white"> {{ index }}</p>
                </li>
            </ul>
            <!-- {{ this.cordeListe   }} -->
            <!-- {{ this.allnotesc }} -->
        </div>
        <!-- <li  v-for="note in this.tuningintra" :key="note.cordeId">
           

              
                    <p>{{  note.tuning }}</p>
                    <p>{{ test() }}</p>
                <div> 
                
                 <div v-if="isChoosed(note,index)" >
                    <p>{{ renderChoosen(note,index) }}</p>

                </div>
                <div v-else>
                    <p>caca</p>
                </div>                    
            </li> 
            </div> -->
    </div>
</template>
<script>

export default {
    props: {
        //Peut etre qu'on peut definir un array de note ici
        lefty : {required : true, type:Boolean},
        tuning: { required: true, type: [Object] },
        notesSelected: { required: true, type: [Object] },
        colorNotes: { required: true, type: [Object] },
        nbFrettes: { required: true, type: Number },
        diap: { required: true, type: Number },
        notePlayed: { required: true, type: String },
        allnotes: { required: true, type: [Object] },
        allnotesc: { required: true, type: [Object] },
        gamePlay : {required : true, type: Boolean},
        score : {required : true, type : Number},
        noteToPlay : {required : true, type : String},
        cheat : { required : true, type : Boolean},
        showgame: { required : true, type :Boolean}

    },
    data() {
        return {
            nbfrettes: this.nbFrettes,
            tuningintra: this.tuning,
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
            nbCordes: 6,
            notesSelectedIntra2: this.notesSelected,
            couleursnotes: this.colorNotes,
            diapason: this.diap * 2.3,
            currentNote: this.notePlayed,
            sapinNoel: false,
            cheatEnabled : this.cheat,
            gameOn : this.gamePlay,
            

        }

    },
    methods: {
        isChoosedTune(note) {
            // console.log(note.tuning)
            var find = this.notesSelectedIntra.find(notes => notes.note === note.tuning.slice(0, note.tuning.length - 1))
            // console.log(find)
            return find.enabled
        },
        isChoosed(corde, index) {

            var note = this.listeNotes.find((notes) => notes.id === this.cordeListe[corde.cordeId][index])
            var enabledornot = this.notesSelectedIntra.find((notes) => notes.note === note.note);
            return enabledornot.enabled
            // var find = this.listeNotes.find((note) => note.id === frette )
            // // console.log(find)
            // var test = this.notesSelectedIntra.find((notes) => notes.note === find.note)
            // // console.log(test)
            // return test.enabled
        },
        chooseNote(corde, index) {

            var note = this.listeNotes.find((notes) => notes.id === this.cordeListe[corde.cordeId][index])
            var enabledornot = this.notesSelectedIntra.find((notes) => notes.note === note.note);
            this.$emit('unselectgamme')

            // console.log('caca')
            enabledornot.enabled = !enabledornot.enabled
            this.notesSelectedIntra2.forEach(
                col => {
                    localStorage.setItem(col.note + "Selected", col.enabled)
                    //  console.log(col.enabled)
                }
            )
        },
        renderChoosen(corde, index) {

            var note = this.listeNotes.find((notes) => notes.id === this.cordeListe[corde.cordeId][index])
            var enabledornot = this.notesSelectedIntra.find((notes) => notes.note === note.note);
            return enabledornot.note
        },
        test() {

            // console.log(this.nbfrettes)
        },
        getStateButton() {
            if (this.sapinNoel) {
                return "grey"
            }
            return "white"
        }
        ,
        allumerSapin() {
            this.sapinNoel = !this.sapinNoel
        }
        ,
        calcBack(lettre) {
            // console.log(lettre)
            //    console.log(lettre)
            // if(this.sapinNoel){
            //      if(lettre === this.notePlayed){
            //         console.log("caca")
            //         return 'red '
            //     }
            // }

            var couleur = this.couleursnotesComp.find((couleurs) => couleurs.note === lettre)
            return couleur.color
        },
        calcBack2(lettre) {
            // console.log(lettre)
            //    console.log(lettre)
            // if(this.sapinNoel){
            //      if(lettre === this.notePlayed){
            //         console.log("caca")
            //         return 'red '
            //     }
            // }
            // console.log(lettre,this.notePlayed)
            if (lettre === this.notePlayed.slice(0, this.notePlayed.length)) {
                return "white"
            }
            var couleur = this.couleursnotes.find((couleurs) => couleurs.note === lettre.slice(0, lettre.length - 1))
            return couleur.color
        },
        calcBackNote(corde, index) {
            var lettre = this.renderChoosen(corde, index)
            // console.log(lettre)
            // console.log(corde,index)
            //find the id of the root note of the cord and add the nb of index
            var find = this.allnotesc.find(note => note.note === corde.tuning)
            // console.log(find)
            //Calcul sur index attention §§§§ changement index c est nb decalage
            //il faut trouver de combien tu es décallé dans ce tab :
            // var findcordliste = this.cordeListe[corde.cordeId]
            // console.log('findcordeliste',findcordliste)
            // var indexsurcorde1 = findcordliste.indexOf(index)
            // console.log(indexsurcorde1)

            // var indexsurcorde2 = findcordliste.indexOf(index,2)

            //trouver les numeros ou il Y a qq chose

            var newindex = find.id + index

            // var newindex2 = find.id+indexsurcorde2

            //    console.log(lettre)
            if (this.sapinNoel) {
                var noteoncase = this.allnotesc.find(note => note.id === newindex)
                // console.log(noteoncase)
                if (noteoncase.note === this.notePlayed) {
                    console.log("caca")
                    return 'red '
                }
                // noteoncase = this.allnotesc.find(note => note.id === (newindex+12))
                // console.log(noteoncase)
                //  if(noteoncase.note === this.notePlayed){
                //     console.log("caca")
                //     return 'red '
                // }
            }

            var couleur = this.couleursnotesComp.find((couleurs) => couleurs.note === lettre)
            return couleur.color
        },
        calcWidth(index) {

            var diaprestant = this.diapason
            var taillecase = 0
            for (var i = 0; i < index; i++) {

                taillecase = diaprestant / 17.817
                diaprestant = diaprestant - taillecase
            }
            return Math.round(taillecase) + 'px'
        },
        calcHeight() {
            return Math.round(300 / this.nbCordes) + "px"
        },

        heightCircle(index) {
            var height = this.calcHeight()
            var width = this.calcWidth(index)
            var intWidth = width.substring(0, width.length - 2)
            var intHeight = height.substring(0, height.length - 2)
            // console.log("height"+Math.min(intWidth, intHeight))
            return Math.min(intWidth, intHeight) + "px"
        },

    },
    watch: {
        tuning : {
            handler(){
                this.tuningintra=this.tuning
                this.$forceUpdate()
            }
        },
        diap: {
            handler() {
                this.diapason = this.diap * 2.3
                this.$forceUpdate()
            }
        },
        colorNotes: {
            handler() {
                console.log("changed")
                this.$forceUpdate();
            }
        }
    },


    computed: {
        couleursnotesComp() {
            return this.colorNotes
        },
        notesSelectedIntra() {
            return this.notesSelectedIntra2
        },
        caca() {
            return this.currentNote
        },
        cordeListe() {
            var cordeListe = []
            for (var corde = 0; corde < this.tuningintra.length; corde++) {
                var notesCorde = []
                var note = this.tuningintra[corde].tuning
                var idnotedepart = this.allnotes.find((notes) => notes.note === note)
                for (var i = 0; i < 24; i++) {
                    if (idnotedepart)
                        notesCorde.push((i + idnotedepart.id) % 12)
                    else {
                        notesCorde.push((2) % 12)

                    }
                }
                cordeListe.push(notesCorde)
            }
            return cordeListe
        },
        

    },
}

</script>
<style>
:root {
    --mondiap: #ffffff;
}

.lettre {
    padding: 0;
    width: 100%;
    border-right: 5px solid rgb(255, 255, 255);

}

.circle {
    margin: 0 auto;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 99;
}

.case {
    width: 100%;
    height: 100px;
    align-items: center;
    justify-content: center;
}

.circle p {
    color: #fff;
    font-size: 24px;
    font-weight: bold;
}

.frette {
    background-image: url('/src/assets/frettebackground.png');
    border-right: 1px solid rgb(255, 255, 255);
    background-color: rgb(71, 47, 23);

}

.cord {
    position: flex;
}

.line {
    position: absolute;

    margin: 25px 0 0 0;
    /* width:  100%; */
    color: white;
}

.yolo {
    width: var(--mondiap);
}

.columnb {
    float: left;
    width: 33.33%;
}
.ulmanche {
  display: flex;
  flex-direction: row-reverse; /* add this line to reverse the order */
  justify-content: flex-end; /* add this line to align the items to the right */
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.horizontalli2 {
  display: inline-block;
  float: none;
}

.yolo {
  margin-right: auto;
  margin-left: 0;
  width: var(--mondiap);
}

/* Clear floats after the columns */
.row:after {
    content: "";
    display: table;
    clear: both;
}


</style>