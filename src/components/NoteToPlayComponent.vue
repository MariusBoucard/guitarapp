<template>
    <div class="note-to-play-container">
        <div class="header">
            <h2>🎵 Note Training Game</h2>
        </div>
        
        <div class="controls-section">
            <div class="playback-controls">
                <button class="control-button play-button" @click="this.play()">
                    ▶️ Play
                </button>
                <button class="control-button stop-button" @click="this.stop()">
                    ⏹️ Stop
                </button>
            </div>
            
            <div class="cheat-section">
                <label class="checkbox-container">
                    <input type="checkbox" v-model="this.cheatEnabled" />
                    <span class="checkmark"></span>
                    <span class="checkbox-label">Only root note (cheat mode)</span>
                </label>
            </div>
        </div>

        <div class="settings-grid">
            <div class="setting-group">
                <label class="setting-label">🎼 Tempo</label>
                <select class="setting-select" v-model="this.tempo" @change="changeTempo($event)">
                    <option v-for="tempot in 200" :key="tempot">{{ tempot }}</option>
                </select>
            </div>

            <div class="setting-group">
                <label class="setting-label">🥁 Metronome</label>
                <div class="metronome-controls">
                    <select class="setting-select metronome-select" v-model="this.metronomeNumerateur" @change="changeNumerateur($event)">
                        <option v-for="rythme in 16" :key="rythme">{{ rythme }}</option>
                    </select>
                    <span class="metronome-divider">/</span>
                    <select class="setting-select metronome-select" v-model="this.metronomeDenominateur" @change="changeDenominateur($event)">
                        <option v-for="rythme in 16" :key="rythme">{{ rythme }}</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="game-display">
            <div class="note-display">
                <div class="current-note">
                    <h1 class="root-note">{{ this.rootNote }}</h1>
                    <p class="interval-text">{{ this.intervalText }}</p>
                </div>
                
                <div class="score-section">
                    <div class="score-display">
                        <span class="score-label">🏆 Score</span>
                        <span class="score-value">{{ this.score }}</span>
                    </div>
                </div>
            </div>
            
            <div class="user-feedback">
                <div class="played-note">
                    <span class="feedback-label">🎸 Note played</span>
                    <span class="feedback-value">{{ this.noteUser }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import coupFaible from '/src/assets/audio/coupFaible.mp3';
import coupFort from '/src/assets/audio/coupFort.mp3';

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
            cheatEnabled :false,
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
        ,
        cheatEnabled() {
            this.$emit('cheatchanged',this.cheatEnabled)
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
                    this.$emit('scorechanged',this.score)
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
                this.$emit('noteexpected',this.newNote.note)
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
                this.$emit('noteexpected',this.newNote.note)


            }
            this.playSound()
           

   



        }
        //Methode that play sound


    }
}
</script>

<style scoped>
/* Main Container */
.note-to-play-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  color: #2c3e50;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 400px;
  margin: 0 auto;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 25px;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 700;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Controls Section */
.controls-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.playback-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.control-button {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.play-button {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.stop-button {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.control-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Checkbox Section */
.cheat-section {
  display: flex;
  justify-content: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.checkbox-container:hover {
  background: rgba(102, 126, 234, 0.1);
}

.checkbox-container input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #e0e6ed;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.checkbox-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

/* Settings Grid */
.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.setting-group {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.setting-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1rem;
}

.setting-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
}

/* Metronome Controls */
.metronome-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metronome-select {
  flex: 1;
}

.metronome-divider {
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
  padding: 0 5px;
}

/* Game Display */
.game-display {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.note-display {
  margin-bottom: 25px;
}

.current-note {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.root-note {
  margin: 0;
  font-size: 3rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;
}

.interval-text {
  margin: 10px 0 0 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* Score Section */
.score-section {
  display: flex;
  justify-content: center;
}

.score-display {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  border-radius: 20px;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.score-label {
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* User Feedback */
.user-feedback {
  display: flex;
  justify-content: center;
}

.played-note {
  background: rgba(52, 152, 219, 0.1);
  border: 2px solid rgba(52, 152, 219, 0.3);
  border-radius: 15px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  justify-content: center;
}

.feedback-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.feedback-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #3498db;
  padding: 5px 12px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 8px;
  min-width: 40px;
  text-align: center;
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.current-note {
  animation: pulse 2s ease-in-out infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .note-to-play-container {
    padding: 20px;
    margin: 10px;
    max-width: none;
  }
  
  .playback-controls {
    flex-direction: column;
  }
  
  .control-button {
    width: 100%;
  }
  
  .metronome-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .metronome-select {
    width: 100%;
  }
  
  .root-note {
    font-size: 2.5rem;
  }
}

/* Hover Effects */
.setting-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.current-note:hover {
  animation-play-state: paused;
  transform: scale(1.02);
}

.score-display:hover {
  transform: scale(1.05);
}

.played-note:hover {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.15);
}
</style>