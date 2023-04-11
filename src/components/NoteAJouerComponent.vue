<template>
    <div style="background-color: rgba(128, 128, 128, 0.3); border-radius: 5%; padding-top: 20px; padding-bottom: 20px;   ">
        <button class="button" @click="this.play()">play</button>
        <button class="button"  @click="this.stop()">Stop play</button>
        <p>Dropdown tempo</p>
        <select class="button"  v-model="this.tempo" @change="changeTempo($event)">
            <option v-for="tempot in 200" :key=tempot>{{ tempot }}</option>
        </select>
        <p>double drop down metronome</p>
        <select class="button"   v-model="this.metronomeNumerateur" @change="changeNumerateur($event)" >
            <option v-for="rythme in 16" :key=rythme >{{ rythme }}</option>
            </select>
            <select  class="button"  v-model="this.metronomeDenominateur"  @change ="changeDenominateur($event)">
                <option v-for="rythme in 16" :key=rythme >{{ rythme }}</option>

            </select>

        <h1 color="white">{{ this.rootNote }}</h1>
        <h5 style="color:white">{{ this.intervalText }}</h5>
        <h5 style="color:white">Score : {{ this.score }}</h5>
        <p> Niveau</p>
       
        <p>Note jouée : {{ this.noteUser }}</p>
        <!-- <p>{{ this.index }}</p> -->

    </div>
</template>
<script>
import coupFaible from '/src/components/coupFaible.mp3';
import coupFort from '/src/components/coupFort.mp3';

export default{
    props: {
        //Peut etre qu'on peut definir un array de note ici
        notesSelected: { required: true, type: [Object] },
        ColotNotes : {requiered : true, type:  [Object]},
        noteTuner : {required : true,type : String},
        listeNote : {required : true, type: [Object]}

    },
    data(){
        return{
            index : 0,
            isPlaying : false,
            tempo : 30,
            metronomeNumerateur :4,
            metronomeDenominateur :4,
            rootNote : "A",
            oldNote : {
                "note" : "A",
                "expectedTime" : "000000"
            },
            newNote : {
                "note" : "A",
                "expectedTime" : "000000"
            },
            Interval : 3,
            score : 0,
            listeNoteTot : this.listeNote,
            noteUser : this.noteTuner,
            notesPlayed : [],
            intervalListe : [
                { id : 0 , nom : "R"},
                { id : 1 , nom : "b2"},
                { id : 2 , nom : "2"},
                { id : 3 , nom : "b3"},
                { id : 4 , nom : "3"},
                { id : 5 , nom : "4"},
                { id : 6 , nom : "b5"},
                { id : 7 , nom : "5"},
                { id : 9 , nom : "b6"},
                { id : 10 , nom : "6"},
                { id : 11, nom : "b7"},
                { id : 12, nom : "7"},
        ],
        intervalListeNom : [
                { id : 0 , nom : "Fondamentale"},
                { id : 1 , nom : "Seconde diminuée"},
                { id : 2 , nom : "Seconde"},
                { id : 3 , nom : "Tierce mineur"},
                { id : 4 , nom : "Tierce majeur"},
                { id : 5 , nom : "Quarte"},
                { id : 6 , nom : "Quinte diminuée"},
                { id : 7 , nom : "Quinte juste"},
                { id : 9 , nom : "Sixte mineur"},
                { id : 10 , nom : "Sixte majeur"},
                { id : 11, nom : "septième diminuée"},
                { id : 12, nom : "septième"},
        ]
        }



    },
    watch : {
        noteTuner() {
                this.noteUser = this.noteTuner
                var date = new Date()
                var note = { "note" : this.noteTuner.slice(0,this.noteTuner.length-1) , "time" : date.getMilliseconds()+date.getSeconds()*1000+date.getHours()*3600*1000}
                // console.log("pushed note",note)
                // console.log(note)
                if(this.notesPlayed.length<100){
                    // console.log(note+"-100")
                    this.notesPlayed.push(note)
                } else {
                    this.notesPlayed.shift();
                    this.notesPlayed.push(note)

                }
            }
        
    },
    computed : {
            intervalText(){
                var find = this.intervalListe.find(inter => inter.id === this.Interval)
                var find2 = this.intervalListeNom.find(inter => inter.id === this.Interval)
                return find.nom+" "+find2.nom
            }
    },
    methods : {
        changeTempo(event){
            // console.log(event.target)
            this.tempo =   event.target.value
            // console.log("New tempo "+ this.tempo)
        },
        changeNumerateur(event){
            // console.log(event.target)
            this.metronomeNumerateur =   event.target.value
            // console.log("New numerateur "+ this.metronomeNumerateur)
        },
        changeDenominateur(event){
            // console.log(event.target)
            this.metronomeDenominateur =   event.target.value
            // console.log("New denominateru "+ this.metronomeDenominateur)
        },
        stop(){
                this.index =0
                this.isPlaying = false
                console.log("stopp")
                clearInterval(this.fct);
                this.$emit("playchanged")
            },
        playSound(){
            if(this.index%this.metronomeNumerateur===0){
                const au = new Audio(coupFort );
            //    console.log(au)
               au.play()
            }
            else{
               const au = new Audio(coupFaible);
            //    console.log(au)
               au.play()
                console.log("coup faible")
            }
            this.index+=1
        },
        play(){
            var timeInterval = 60/this.tempo  
            timeInterval = 4*timeInterval/this.metronomeDenominateur
            this.fct = setInterval(() => this.calcNewNote(), timeInterval*1000);
            this.$emit("playchanged")

        },
        calcNote(){
               var find =  this.listeNoteTot.find(note => note.note === this.rootNote)
               var noteExpected = (find.id + this.Interval)%12
               var noteExp = this.listeNoteTot.find(note => note.id === noteExpected)
               return noteExp.note
        },
        generateNewNote(){
            var ran = Math.floor(Math.random() * 12);
            var find = this.listeNoteTot.find(note => note.id === ran)
            return {"note" : find.note}
        },
        generateNewRoot(){
            var ran = Math.floor(Math.random() * 12);
            var find = this.listeNoteTot.find(note => note.id === ran)
            return find.note
        },
        //Possibilité d inclure la gaussienne ici 
        //Warning
        bienJoue(){
            var plusprochenote = this.notesPlayed.shift()
             console.log(this.notesPlayed)

            this.notesPlayed.forEach( a => 
            {
                if(Math.abs(a.time-this.oldNote.expectedTime)<Math.abs(plusprochenote.time-this.oldNote.expectedTime)){
                        plusprochenote = a
                }
            })            
                
            
            if(plusprochenote === undefined){
                return false
            }
            // console.log(plusprochenote.note,this.oldNote)
            if(plusprochenote.note===this.oldNote.note){
                this.$emit('greatNote', true)
                console.log("bien joue")
                return true
            }
            else{
                this.$emit('greatNote', false)
                return false
            }

        },
        calcNewNote(){
            //Comparaison ici pour le score §§§§§
                     //Lancer le calcul après 0.5 timeinterval et regarder toutes les notes qui ont ete jouée depuis 1 timetinterval de temps
            //prendre la plus proche du centre qui equivaut au coup de metronome.
            // Par rapport à une guassiene centrée au temps de metronome, definir la precision par rapport à l'endroit où on tape.

            console.log("caluculus")
            if(this.bienJoue()){
                    this.score+=1
                    //Afficher un truc stympa
            }else{
                //afficher un truc pas cool
            }
            
            if(this.index%this.metronomeDenominateur===0){
                console.log("damn")
                // this.oldNote=this.newNote
                this.oldNote = this.newNote
                this.rootNote = this.generateNewRoot()
                this.Interval = Math.floor(Math.random() * 12);
                var date = new Date()
                var timeInterval = 60/this.tempo  
                  timeInterval = 4*timeInterval/this.metronomeDenominateur
                this.newNote = {
                    "note" : this.calcNote(),
                    "expectedTime" :  date.getMilliseconds()+date.getSeconds()*1000+date.getHours()*3600*1000 +timeInterval*1000
                }
            }
            else{
                this.oldNote = this.newNote
                this.Interval = Math.floor(Math.random() * 12);
                date = new Date()
                timeInterval = 60/this.tempo  
                timeInterval = 4*timeInterval/this.metronomeDenominateur
                this.newNote = {
                    "note" : this.calcNote(),
                    "expectedTime" :  date.getMilliseconds()+date.getSeconds()*1000+date.getHours()*3600*1000 +timeInterval*1000
                }

            }
            this.playSound()
           

   



        }
        //Methode that play sound


    }
}
</script>