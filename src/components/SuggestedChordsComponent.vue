<template>
    <div class="chords-container">
    <div class="columnchords">
        <p>Stacking Thirds</p>
        <ul>
            <li class="chordtext" v-for="chord in StackingThirdsChords" :key="chord">
                {{ chord.chord }}
            </li>
        </ul>
    </div>
    <div class="columnchords">
        <p>Diatonic Chords</p>
        <ul>
            <li class="chordtext" v-for="chord2 in DiatonicChords" :key="chord2">
                {{ chord2.chord }}
            </li>
        </ul>
    </div>
    <div class="columnchords">
        <p>Seventh Chords</p>
        <ul>
            <li class="chordtext" v-for="chord3 in SeventhChords" :key="chord3">
                {{ chord3.chord }}
            </li>
        </ul>
    </div>
</div>

</template>
<script>
export default {
    props: {
        selectedGamme: { required: true, type: String },
        selectedNotes: { required: true, type: [Object] },
        nbnotes: { required: true, type: [Object] }
    },
    data() {
        return {
            relativeKey: "",
            DiatonicChords: [],
            SeventhChords: [],
            HarmonicChords: [],
            BorrowedChords: [],
            StackingThirdsChords: [],
            
            Diatonics : [
            {
                quality: "Major",
                liste: [
                    { id: "0", quality: "Major" },
                    { id: "1", quality: "Minor" },
                    { id: "2", quality: "Minor" },
                    { id: "3", quality: "Major" },
                    { id: "4", quality: "Major" },
                    { id: "5", quality: "Minor" },
                    { id: "6", quality: "Diminished" },
                ],
            },
            {
                quality: "Natural Minor",
                liste: [
                    { "id": "0", "quality": "Minor" },
                    { "id": "1", "quality": "Diminished" },
                    { "id": "2", "quality": "Major" },
                    { "id": "3", "quality": "Minor" },
                    { "id": "4", "quality": "Minor" },
                    { "id": "5", "quality": "Major" },
                    { "id": "6", "quality": "Major" }
                ],
            },
            {
                quality: "Harmonic Minor",
                liste: [
                    { "id": "0", "quality": "Minor" },
                    { "id": "1", "quality": "Diminished" },
                    { "id": "2", "quality": "Augmented" },
                    { "id": "3", "quality": "Minor" },
                    { "id": "4", "quality": "Major" },
                    { "id": "5", "quality": "Major" },
                    { "id": "6", "quality": "Diminished" }
                ]
            },
            {
                quality: "Melodic Minor",
                liste: [
                    { "id": "0", "quality": "Minor" },
                    { "id": "1", "quality": "Minor" },
                    { "id": "2", "quality": "Augmented" },
                    { "id": "3", "quality": "Major" },
                    { "id": "4", "quality": "Major" },
                    { "id": "5", "quality": "Diminished" },
                    { "id": "6", "quality": "Diminished" }
                ]
            },
            {
                quality: "Dorian",
                liste: [
                    { "id": "0", "quality": "Minor" },
                    { "id": "1", "quality": "Minor" },
                    { "id": "2", "quality": "Augmented" },
                    { "id": "3", "quality": "Major" },
                    { "id": "4", "quality": "Minor" },
                    { "id": "5", "quality": "Diminished" },
                    { "id": "6", "quality": "Major" }
                ]
            },
            {
                quality: "Phrygian",
                liste: [
                    { "id": "0", "quality": "Minor" },
                    { "id": "1", "quality": "Major" },
                    { "id": "2", "quality": "Major" },
                    { "id": "3", "quality": "Minor" },
                    { "id": "4", "quality": "Diminished" },
                    { "id": "5", "quality": "Major" },
                    { "id": "6", "quality": "Minor" }
                ]
            },
            {
                quality: "Hirojoshi",
                liste: [
                    { "id": "0", "quality": "Minor" },
                    { "id": "1", "quality": "Major" },
                    { "id": "2", "quality": "Minor" },
                    { "id": "3", "quality": "Diminished" },
                    { "id": "4", "quality": "Major" },

                ]
            },

            ],
            
            Seventh : [
            {
                quality: "Major",
                liste: [
                    { id: "0", quality: "Major7" },
                    { id: "1", quality: "Minor7" },
                    { id: "2", quality: "Minor7" },
                    { id: "3", quality: "Major7" },
                    { id: "4", quality: "7" },
                    { id: "5", quality: "Minor7" },
                    { id: "6", quality: " Half-diminished 7th chord" },
                ],
            },
            {
                quality: "Natural Minor",
                liste: [
                    { "id": "0", "quality": "Minor7" },
                    { "id": "1", "quality": "half-diminished7" },
                    { "id": "2", "quality": "Major7" },
                    { "id": "3", "quality": "Minor7" },
                    { "id": "4", "quality": "Minor7" },
                    { "id": "5", "quality": "Major7" },
                    { "id": "6", "quality": "Dominant7" }
                ],
            },
            {
                quality: "Harmonic Minor",
                liste: [
                    { "id": "0", "quality": "Minor-maj7" },
                    { "id": "1", "quality": "Half-diminished7" },
                    { "id": "2", "quality": "augmented-major7" },
                    { "id": "3", "quality": "Minor7" },
                    { "id": "4", "quality": "Dominant7" },
                    { "id": "5", "quality": "Major7#5" },
                    { "id": "6", "quality": "Fully-Diminished7" }
                ]
            },
            {
                quality: "Melodic Minor",
                liste: [
                    { "id": "0", "quality": "minor7" },
                    { "id": "1", "quality": "minor7" },
                    { "id": "2", "quality": "augmented-major7" },
                    { "id": "3", "quality": "dominant7" },
                    { "id": "4", "quality": "dominant7" },
                    { "id": "5", "quality": "half-diminished7" },
                    { "id": "6", "quality": "fully-diminished7" }
                ]
            },
            {
                quality: "Dorian",
                liste: [
                    { "id": "0", "quality": "minor7" },
                    { "id": "1", "quality": "minor7" },
                    { "id": "2", "quality": "major7" },
                    { "id": "3", "quality": "dominant7" },
                    { "id": "4", "quality": "minor7" },
                    { "id": "5", "quality": "minor7" },
                    { "id": "6", "quality": "half-diminished7" }
                ]
            },
            {
                quality: "Phrygian",
                liste: [
                    { "id": "0", "quality": "Minor7" },
                    { "id": "1", "quality": "Major7" },
                    { "id": "2", "quality": "Augmented7" },
                    { "id": "3", "quality": "Minor7" },
                    { "id": "4", "quality": "Diminished7" },
                    { "id": "5", "quality": "Major7" },
                    { "id": "6", "quality": "Minor7" }
                ]
            },
            {
                quality: "Hirojoshi",
                liste: [
                    { "id": "0", "quality": "minor7" },
                    { "id": "1", "quality": "major7" },
                    { "id": "2", "quality": "minor7" },
                    { "id": "3", "quality": "dominant7" },
                    { "id": "4", "quality": "major7" },

                ]
            },],
            StackingThirds: [{
                quality: "Major",
                liste: [
                    { id: "0", quality: "Major" },
                    { id: "1", quality: "Minor" },
                    { id: "2", quality: "Minor" },
                    { id: "3", quality: "Major" },
                    { id: "4", quality: "Major" },
                    { id: "5", quality: "Minor" },
                    { id: "6", quality: "Diminished" },
                ],
            },
            {
                quality: "Natural Minor",
                liste: [
                    { "id": "0", "quality": "Minor" },
                    { "id": "1", "quality": "Diminished" },
                    { "id": "2", "quality": "Major" },
                    { "id": "3", "quality": "Minor" },
                    { "id": "4", "quality": "Minor" },
                    { "id": "5", "quality": "Major" },
                    { "id": "6", "quality": "Major" }
                ],
            },
            {
                quality: "Harmonic Minor",
                liste: [
                    { "id": "0", "quality": "Minor" },
                    { "id": "1", "quality": "Diminished" },
                    { "id": "2", "quality": "Augmented" },
                    { "id": "3", "quality": "Minor" },
                    { "id": "4", "quality": "Major" },
                    { "id": "5", "quality": "Major" },
                    { "id": "6", "quality": "Diminished" }
                ]
            },
            {
                quality: "Melodic Minor",
                liste: [
                    { "id": "0", "quality": "Minor" },
                    { "id": "1", "quality": "Minor" },
                    { "id": "2", "quality": "Augmented" },
                    { "id": "3", "quality": "Major" },
                    { "id": "4", "quality": "Major" },
                    { "id": "5", "quality": "Diminished" },
                    { "id": "6", "quality": "Diminished" }
                ]
            },
            {
                quality: 'Dorian',
                liste: [
                    { id: "0", quality: "Minor" },
                    { id: "1", quality: "Minor" },
                    { id: "2", quality: "Major" },
                    { id: "3", quality: "Major" },
                    { id: "4", quality: "Minor" },
                    { id: "5", quality: "Diminished" },
                    { id: "6", quality: "Major" },
                ]
            }, {
                quality: "Phrygian",
                liste:
                    [
                        { id: "0", quality: "Minor" },
                        { id: "1", quality: "Major" },
                        { id: "2", quality: "Major" },
                        { id: "3", quality: "Minor" },
                        { id: "4", quality: "Diminished" },
                        { id: "5", quality: "Major" },
                        { id: "6", quality: "Minor" }
                    ]
            },
             {
                quality : 'Hirojoshi',
                liste :  [{ "id": "0", "quality": "Minor" },
                { "id": "1", "quality": "Major" },
                { "id": "2", "quality": "Minor" },
                { "id": "3", "quality": "Diminished" },
                { "id": "4", "quality": "Major" }]
             }
            
            ],


        }
    },
    methods: {
        setRelativeScale(){

        },
        updateChords() {
            this.setRelativeScale()
            //on récupere la gamme selectionnée et en extrait la rootnote
            const gamme = this.selectedGamme
            var rootnote = gamme.split(" ").at(0);
            var quality = gamme.split(" ")
            quality = quality.slice(1, quality.length);
            quality = quality.join(" ")
            console.log(quality)
            //Extraction de la qualité
            //Prend le numero de la rootnote en A
            console.log("rootnote" + rootnote)
            var rootid = this.nbnotes.find(note => note.note === rootnote)
            var idNotes = []
            this.selectedNotes.forEach(note => {
                if (note.enabled) {
                    var noteid = this.nbnotes.find(notes => notes.note === note.note)
                    idNotes.push(noteid.id)
                }
            });
            idNotes = idNotes.sort((a, b) => a > b)
            console.log(idNotes + "Id notes should be sorted")
            //On recupere les id de toutes les notes selectionnées
            var rootpos = idNotes.indexOf(rootid.id)
            //On prend ce qu'il y a depuis la rootnote jusqu'a la fin
            var orderNbNotes = []
            if (rootpos != 0) {

                var deb = idNotes.slice(0, rootpos)
                var fin = idNotes.slice(rootpos, idNotes.length)
                //On prend ce qu'il Y a depuis le debut justqu'a la rootnote

                //On order lke this : rootnum, 1st num ... so [5,7,9,11,1,3] par exemple
                orderNbNotes = fin.concat(deb)
            }
            else {
                orderNbNotes = idNotes
            }
            console.log(orderNbNotes)

            this.DiatonicChords = []
            this.HarmonicChords = []
            this.BorrowedChords = []
            this.StackingThirdsChords = []
            //Possibly have to change order of loops

            for (var i = 0; i < orderNbNotes.length; i++) {
                var chordName = this.nbnotes.find(note => note.id === orderNbNotes.at(i))
                //essay avec une gamme
                var listeNotes = this.StackingThirds.find(thirds => thirds.quality === quality)
                var quall = listeNotes.liste.at(i)
                this.StackingThirdsChords.push({ quality: quality, chord: chordName.note + quall.quality })


            }

            for ( i = 0; i < orderNbNotes.length; i++) {
                var chordName3 = this.nbnotes.find(note => note.id === orderNbNotes.at(i))
                //essay avec une gamme
                var listeNotes3 = this.Diatonics.find(thirds => thirds.quality === quality)
                var quall3 = listeNotes3.liste.at(i)
                this.DiatonicChords.push({ quality: quality, chord: chordName3.note + quall3.quality })


            }
            this.SeventhChords = []

            for ( i = 0; i < orderNbNotes.length; i++) {
                var chordName4 = this.nbnotes.find(note => note.id === orderNbNotes.at(i))
                //essay avec une gamme
                var listeNotes4 = this.Seventh.find(thirds => thirds.quality === quality)
                var quall4 = listeNotes4.liste.at(i)
                this.SeventhChords.push({ quality: quality, chord: chordName4.note + quall4.quality })


            }




        }
    },

    watch: {
        selectedGamme: {
            handler() {
                if (this.selectedGamme !== "") {
                    console.log("yolo")
                    this.updateChords()
                }
            }
        }
    }
}
</script>

<style scoped>
.containerchords {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.columnchords {
  width: 30%;
  margin-bottom: 5px;
  padding: 1px;
}
.chordtext{
    color: white
}

.chords-container {
    background-color: rgba(51, 101, 138, 0.3);
    margin: 5px;
    border-radius: 5%;
    padding: 15px;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.columnchords {
    flex: 1;
    text-align: center;
}

.columnchords p {
    font-size: 20px;
    color: #F26419; /* Use specified color */
}

ul {
    list-style: none;
    padding: 0;
}

.chordtext {
    font-size: 16px;
    margin: 10px 0;
    color: #F6AE2D; /* Use specified color */
}
</style>