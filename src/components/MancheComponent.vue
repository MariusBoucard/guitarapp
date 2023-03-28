<template>
    <div>
    <h1>Guitar's neck</h1>
    <!-- <p>{{ this.tuningintra }}</p> -->
        <h1>{{ this.notePlayed}}</h1>
        <p>Activer le sapin de noel :</p>
        <button class="button" style="border : 1px solid black" @click="allumerSapin()" :style="{ backgroundColor : getStateButton()}">Sapinnnnn</button>
    <div>
</div>
<div width="300px">


    <ul>
        <li class="horizontalli ">
            <ul>
                <li style=" width: 40px" :style="{ height : calcHeight() }" v-for="note in this.tuningintra" :key="note.cordeId"> 
                    <div class="circle" style="width:35px;height:35px" :style="{backgroundColor : calcBack(note.tuning) }" v-if="isChoosedTune(note)">
                        {{note.tuning}}

                    </div>
                    <div v-else>
                        {{note.tuning}}

                    </div>
                   
                </li>
                
            </ul>
        </li>

        
        <li class="horizontalli frette yolo" :style="{  '--mondiap' : calcWidth(index) }" v-for="index in (this.nbfrettes - 1)" :key="index">
            
            <ul>
                <li class="lettre lithium" :style="{ height : calcHeight() }" v-for="note in this.tuningintra" :key="note.cordeId"  v-on:click="chooseNote(note,index)" >
                    <div display="flex" class="cord" v-if="isChoosed(note, index)">
                        <hr class="line" :style="{  width : calcWidth(index) }" >
                        <div class="circle" :style="{ height : heightCircle(index), width : heightCircle(index),  backgroundColor  :calcBack(renderChoosen(note, index)) }">
                            <p>{{ renderChoosen(note, index) }}</p>
                        </div>      
                    </div>
                    <div display="flex" class="cord"  v-else>
                        <hr class="line" :style="{  width : calcWidth(index) }">
                             
                    </div>
                </li>
                
            </ul>
            <p style="margin:0;padding:0;color : white"> {{ index }}</p>
        </li>
    </ul>
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
        tuning: { required: true, type: [Object] },
        notesSelected: { required: true, type: [Object] },
        colorNotes: { required: true, type: [Object] },
        nbFrettes: { required: true, type: Number },
        diap : { required : true, type : Number},
        notePlayed : { required : true, type : String}
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
            nbCordes : 6,
            notesSelectedIntra: this.notesSelected,
            couleursnotes: this.colorNotes,
            diapason : this.diap*2.3,
            currentNote : this.notePlayed,
            sapinNoel : false
        }

    },
    methods: {
        isChoosedTune(note){
            // console.log(note.tuning)
            var find = this.notesSelectedIntra.find(notes=> notes.note === note.tuning)
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
        chooseNote(corde,index){

            var note = this.listeNotes.find((notes) => notes.id === this.cordeListe[corde.cordeId][index])
            var enabledornot = this.notesSelectedIntra.find((notes) => notes.note === note.note);
            console.log('caca')
            enabledornot.enabled = !enabledornot.enabled
        },
        renderChoosen(corde, index) {
           
            var note = this.listeNotes.find((notes) => notes.id === this.cordeListe[corde.cordeId][index])
            var enabledornot = this.notesSelectedIntra.find((notes) => notes.note === note.note);
            return enabledornot.note
        },
        test() {

            // console.log(this.nbfrettes)
        },
        getStateButton(){
            if(this.sapinNoel){
                return "grey"
            }
            return "white"
        }
        ,
        allumerSapin(){
            this.sapinNoel = ! this.sapinNoel
        }
        ,
        calcBack(lettre){
        //    console.log(lettre)
        if(this.sapinNoel){
             if(lettre === this.notePlayed){
                console.log("caca")
                return 'red '
            }
        }
           
           var couleur =  this.couleursnotes.find((couleurs)=> couleurs.note === lettre)
            return couleur.color 
        },
        calcHeight(){
            return Math.round(300/this.nbCordes)+"px"
        },
        calcWidth(index){
            var diaprestant = this.diapason
            var taillecase =0
            for(var i =0; i<index;i++){

                taillecase = diaprestant/17.817
                diaprestant = diaprestant-taillecase
            }
            return Math.round(taillecase)+"px"
        },
        heightCircle(index){
                var height = this.calcHeight()
                var width = this.calcWidth(index)
                var intWidth = width.substring(0,width.length-2)
                var intHeight = height.substring(0,height.length-2)
                // console.log("height"+Math.min(intWidth, intHeight))
                return Math.min(intWidth, intHeight)+"px"
        },
       
    },


    computed: {
        caca() {
            return this.currentNote
        },
        cordeListe() {
            var cordeListe = []
            for (var corde = 0; corde < this.tuningintra.length; corde++) {
                var notesCorde = []
                var note = this.tuningintra[corde].tuning
                var idnotedepart = this.listeNotes.find((notes) => notes.note === note)
                for (var i = 0; i < 24; i++) {
                    notesCorde.push((i + idnotedepart.id ) % 12)
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
.lettre{
    padding:0;
    width: 100%;
    border-right: 5px solid rgb(255, 255, 255);

    }
.circle {
    margin: 0 auto;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position :relative;
  z-index: 99;
}
.case {
    width: 100%;
    height:100px;
  align-items: center;
  justify-content: center;
}
.circle p {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
}
.frette {
    background-image: url('../assets/frettebackground.jpeg');
    border-right: 1px solid rgb(255, 255, 255);
    background-color: rgb(71,47,23);

}
.cord{
    position: flex;
}
.line{
    position: absolute;
    
    margin: 25px 0 0 0;
    /* width:  100%; */
    color:white;
}
.yolo{
    width: var(--mondiap);
}
</style>