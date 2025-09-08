<template>
    <div>
        <div class="container">
    <div class="row">
        <div class="column" style="text-align: center;">
            <div v-show="showgame">
                <h1>Ready to play?</h1>
            </div>
            <div v-show="!showgame">
                -
            </div>
        </div>
        <div class="column">
            <h1>{{ notePlayed }}</h1>
            <div class="circle" :style="{ backgroundColor: notePlayed ? calcBack(notePlayed.slice(0, notePlayed.length - 1)) : 'white' }">
                <p class="note">{{ notePlayed ? notePlayed.slice(0, notePlayed.length - 1) : '' }}</p>
            </div>
            <p>Activer le sapin de noel:</p>
            <button class="button" @click="allumerSapin" :style="{ backgroundColor: getStateButton() }">Sapinnnnn</button>
        </div>
        <div class="column">
            <div v-show="showgame">
                <p>Easy version enabled: {{ cheat }}</p>
                <p v-show="cheat">Note to play then:</p>
                <h1>{{ noteToPlay }}</h1>
                <h2 class="score">Score: {{ score }}</h2>
            </div>
            <div v-show="!showgame">
                -
            </div>
        </div>
    </div>
</div>


        <div class="manche-container">
            <ul :class="this.lefty ? 'ulmanche' : ''">
                <li class="horizontalli">
                    <ul>
                        <li :style="{ height: calcHeight() }" v-for="note in this.tuningintra"
                            :key="note.cordeId">
                            <div class="circle"
                                :style="{ backgroundColor: calcBack2(note.tuning) }" v-if="isChoosedTune(note)">
                                <p class="pp"> {{ note.tuning.slice(0, note.tuning.length) }}
                                </p>
                            </div>
                            <div v-else class="tuning-note">
                                {{ note.tuning.slice(0, note.tuning.length) }}
                            </div>
                        </li>
                    </ul>
                </li>

                <li class="horizontalli2 frette" :style="{ width: calcWidth(index) }"
                    v-for="index in (this.nbfrettes - 1)" :key="index">
                    <div class="image-container">
                        <div class="content">
                            <ul>
                                <li class="lettre" :style="{ height: calcHeight() }"
                                    v-for="note in this.tuningintra" :key="note.cordeId"
                                    @click="chooseNote(note, index)">
                                    <div class="cord" v-if="isChoosed(note, index)">
                                        <hr class="line" :style="{ width: calcWidth(index) }">
                                        <div class="circle"
                                            :style="{ height: heightCircle(index), width: heightCircle(index), backgroundColor: calcBackNote(note, index) }">
                                            <p class="pp">{{ renderChoosen(note, index) }}</p>
                                        </div>
                                    </div>
                                    <div class="cord" v-else>
                                        <hr class="line" :style="{ width: calcWidth(index) }">
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <p class="fret-number">{{ index }}</p>
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
        lefty: { required: true, type: Boolean },
        tuning: { required: true, type: [Object] },
        notesSelected: { required: true, type: [Object] },
        colorNotes: { required: true, type: [Object] },
        nbFrettes: { required: true, type: Number },
        diap: { required: true, type: Number },
        notePlayed: { required: true, type: String },
        allnotes: { required: true, type: [Object] },
        allnotesc: { required: true, type: [Object] },
        gamePlay: { required: true, type: Boolean },
        score: { required: true, type: Number },
        noteToPlay: { required: true, type: String },
        cheat: { required: true, type: Boolean },
        showgame: { required: true, type: Boolean }

    },
    data() {
        return {
            nbfrettes: this.nbFrettes || 12,
            tuningintra: this.tuning || [],
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
            notesSelectedIntra2: this.notesSelected || [],
            couleursnotes: this.colorNotes || [],
            diapason: (this.diap || 25.5) * 2.3,
            currentNote: this.notePlayed || '',
            sapinNoel: false,
            cheatEnabled: this.cheat || false,
            gameOn: this.gamePlay || false,


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
                return "rgb(51, 101, 138)"
            }
            return "#86BBD8"
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
            return couleur ? couleur.color : 'white' // Return default color if couleur is undefined
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
            return couleur ? couleur.color : 'white' // Return default color if couleur is undefined
        },
        calcBackNote(corde, index) {
            var lettre = this.renderChoosen(corde, index)
            // console.log(lettre)
            // console.log(corde,index)
            //find the id of the root note of the cord and add the nb of index
            
            // Debug: Log the tuning we're looking for and available notes
       //     console.log('Looking for tuning:', corde.tuning);
        //    console.log('Available notes in allnotesc:', this.allnotesc.slice(0, 20).map(n => n.note)); // Show first 20 notes
          // TODO FIX THIS ISSUE  
            var find = this.allnotesc.find(note => note.note === corde.tuning)
            
            // Check if find is undefined to prevent error
            if (!find) {
                console.warn('Note not found for tuning:', corde.tuning)
                console.warn('AllNotesC length:', this.allnotesc.length)
                // Try to find similar notes for debugging
                const similarNotes = this.allnotesc.filter(note => note.note.startsWith(corde.tuning.charAt(0)))
                console.warn('Similar notes found:', similarNotes.slice(0, 10).map(n => n.note))
                return 'white' // Return default color
            }
            
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
                if (noteoncase && noteoncase.note === this.notePlayed) {
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
            return couleur ? couleur.color : 'white' // Return default color if couleur is undefined
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
        tuning: {
            handler() {
                this.tuningintra = this.tuning
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
<style scoped>
/* Manche Container */
.manche-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: var(--spacing-md);
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    margin: var(--spacing-md) 0;
    box-shadow: 0 4px 12px var(--shadow-light);
}

/* Tuning notes styling */
.tuning-note {
    color: var(--text-secondary);
    font-weight: var(--font-medium);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

/* Fret numbers */
.fret-number {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: var(--font-medium);
    margin: 0;
    padding: var(--spacing-xs);
    background: rgba(44, 62, 80, 0.8);
    border-radius: var(--radius-sm);
    min-width: 20px;
    text-align: center;
}

/* Manche Component - Beautiful Guitar Fretboard */

.container {
    width: 100%;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin: var(--spacing-md) 0;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px var(--shadow-medium);
}

.row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    gap: var(--spacing-md);
}

.column {
    flex: 1;
    padding: var(--spacing-lg);
    text-align: center;
    border-radius: var(--radius-md);
    background: rgba(52, 73, 94, 0.3);
    border: 1px solid var(--border-primary);
    color: var(--text-primary);
}

.column h1 {
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: var(--font-semibold);
    margin: 0 0 var(--spacing-md) 0;
}

.column p {
    color: var(--text-secondary);
    margin: var(--spacing-sm) 0;
}

.score {
    color: var(--accent-green);
    font-weight: var(--font-bold);
    font-size: 1.2rem;
}

/* Manche (Fretboard) Layout - Always Single Line */
.ulmanche {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
    align-items: stretch;
    list-style-type: none;
    padding: 0;
    margin: var(--spacing-lg) 0;
    min-height: 300px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    background: url('../assets/frettebackground.jpeg');
    background-size: cover;
    background-position: center;
    border-radius: var(--radius-lg);
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Default manche direction (left-handed reverses this) */
ul:not(.ulmanche) {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
    list-style-type: none;
    padding: 0;
    margin: var(--spacing-lg) 0;
    min-height: 300px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    background: url('../assets/frettebackground.jpeg');
    background-size: cover;
    background-position: center;
    border-radius: var(--radius-lg);
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Tuning pegs column */
.horizontalli {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 60px;
    max-width: 60px;
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    border-radius: var(--radius-md) 0 0 var(--radius-md);
    padding: var(--spacing-sm);
    border-right: 3px solid #fff;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.2);
}

.horizontalli ul {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
}

.horizontalli li {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    color: var(--text-primary);
    font-weight: var(--font-semibold);
    font-size: 0.9rem;
}

/* Fret columns */
.horizontalli2 {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    height: 100%;
    position: relative;
}

.frette {
    background: rgba(139, 69, 19, 0.8);
    border-right: 2px solid #fff;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    position: relative;
    overflow: hidden;
}

.image-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.content {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
}

.content ul {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
}

/* String/Note positions */
.lettre {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0;
    cursor: pointer;
    transition: all var(--transition-normal);
    position: relative;
}

.lettre:hover {
    background: rgba(52, 152, 219, 0.2);
}

/* String lines */
.cord {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.line {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 2px;
    background: linear-gradient(90deg, #C0C0C0 0%, #E5E5E5 50%, #C0C0C0 100%);
    margin: 0;
    border: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    z-index: 1;
    transform: translate(-50%, -50%);
}

/* Different string thicknesses for realism */
.lettre:nth-child(1) .line { height: 1px; } /* High E string - thinnest */
.lettre:nth-child(2) .line { height: 1.5px; } /* B string */
.lettre:nth-child(3) .line { height: 2px; } /* G string */
.lettre:nth-child(4) .line { height: 2.5px; } /* D string */
.lettre:nth-child(5) .line { height: 3px; } /* A string */
.lettre:nth-child(6) .line { height: 5.25px; } /* Low E string - 1.5x thicker (3.5 * 1.5) */

/* Note circles */
.circle {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 10;
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: all var(--transition-normal);
    cursor: pointer;
}

.circle:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.circle .pp,
.circle .note,
.circle p {
    color: var(--text-primary);
    font-size: 0.8rem;
    font-weight: var(--font-bold);
    margin: 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    mix-blend-mode: difference;
}

/* Buttons */
.button {
    background: var(--btn-primary);
    border: none;
    color: var(--text-primary);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 1rem;
    font-weight: var(--font-medium);
    transition: all var(--transition-normal);
    margin: var(--spacing-sm);
}

.button:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px var(--shadow-medium);
}

/* Responsive design */
@media (max-width: 768px) {
    .ulmanche,
    ul:not(.ulmanche) {
        min-height: 250px;
        overflow-x: scroll;
    }
    
    .circle {
        width: 28px;
        height: 28px;
    }
    
    .circle .pp,
    .circle .note,
    .circle p {
        font-size: 0.7rem;
    }
}

/* Scrollbar styling */
.ulmanche::-webkit-scrollbar,
ul:not(.ulmanche)::-webkit-scrollbar {
    height: 8px;
}

.ulmanche::-webkit-scrollbar-track,
ul:not(.ulmanche)::-webkit-scrollbar-track {
    background: var(--primary-dark);
    border-radius: var(--radius-sm);
}

.ulmanche::-webkit-scrollbar-thumb,
ul:not(.ulmanche)::-webkit-scrollbar-thumb {
    background: var(--primary-medium);
    border-radius: var(--radius-sm);
}

.ulmanche::-webkit-scrollbar-thumb:hover,
ul:not(.ulmanche)::-webkit-scrollbar-thumb:hover {
    background: var(--primary-accent);
}

/* Ensure no wrapping and proper spacing */
.ulmanche > *,
ul:not(.ulmanche) > * {
    flex-shrink: 0;
}

/* Animation for note selection */
@keyframes noteSelect {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.circle.selected {
    animation: noteSelect 0.3s ease-in-out;
}

/* CSS Custom Properties */
:root {
    --mondiap: 45px;
    --light: 80;
    --threshold: 60;
}
</style>