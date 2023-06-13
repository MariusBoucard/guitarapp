<template>
    <div>
        <ul>
            <li style="float:left" v-for="chord in this.selectedChords" :key = chord.idDrop>
                    <select class=""  @change="this.updateSelect(chord.idDrop,$event)">
                     <option v-for="accord in this.chords" :value="accord.id" :key="accord.id">{{ accord.note+accord.alteration }}</option>

    </select>
            </li>
        </ul>
    </div>
</template>

<script>
export default{
    data(){
        return {
             
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
            notes : [
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
            scaleTypes: [
                { name: 'Major', noteName: '', intervals: [0, 2, 4, 5, 7, 9, 11], notes: [] },
                { name: 'Natural Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 8, 10], notes: [] },
                { name: 'Harmonic Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 8, 11], notes: [] },
                { name: 'Melodic Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 9, 11], notes: [] },
                { name: 'Dorian', noteName: 'D', intervals: [0, 2, 3, 5, 7, 9, 10], notes: [] },
                { name: 'Phrygian', noteName: 'E', intervals: [0, 1, 3, 5, 7, 8, 10], notes: [] },
                { name: 'Hirojoshi', noteName: 'C', intervals: [0, 2, 3, 7, 8], notes: [] }
            ],
            alterations : ["m","M","7"],
            selectedChords : [
                { idDrop : "0" , note : null, alteration : null },
                { idDrop : "2" , note : null, alteration : null },
                { idDrop : "1" , note : null, alteration : null },
                { idDrop : "3" , note : null, alteration : null },
                { idDrop : "4" , note : null, alteration : null },
                { idDrop : "5" , note : null, alteration : null },
                { idDrop : "6" , note : null, alteration : null },
            ]
        }
    },
    computed : {
        chords() {
            var i =0
            var tmp = [{id : i,note : null , alteration : null}]
            this.alterations.forEach((alterations) => {
                    this.notes.forEach((notes)=> {
                        i++
                        tmp.push({id : i  ,note : notes.note, alteration : alterations})

                    })
            })
            return tmp
        }
    },
    methods : {
        updateSelect(id,evt){
            var found = this.selectedChords.find(c => c.idDrop === id)
            //TODO ICI UPDATE BIEN
            var selectedId = evt.target.value;
            console.log(selectedId)
            
            var selectedAccord = this.chords.find(accord => accord.id === parseInt(selectedId));
            found.note = selectedAccord.note;
            found.alteration = selectedAccord.alteration;
     
            this.calcScale()
        },
        calcScale(){
            var tmpchords = []
            this.selectedChords.forEach(chord => {
                if(chord.note !== null){
                    tmpchords.push(chord)
                }
            })
            //Get the id of the chords in notes
            var tmpchords2 = []
            tmpchords.forEach(cho => 
            {
                console.log(tmpchords)
               var found = this.notes.find(no => no.note === cho.note)
                tmpchords2.push({id : found.id, note : cho.note, alteration : cho.alteration })
            })
            //sort them
            tmpchords2.sort((a,b) => a.id-b.id)
            //Test des intervals :
            var possibleScale = this.intervalTest(tmpchords2)
            console.log(possibleScale)
            /*
            Takes all the chords choosed
            put them in id order modulo 12
            test toutes les différentes gammes pour lesquelles les fonda passent
            -> Premier jet de resultat avec les fondas affiché au cas ou tu veuilles ces notes mais osef de la modu
            -> Puis 2 eme filtre avec les alterations des accords de la gamme
            */
        },
        intervalTest(listchords){
            // var possibleScale = []
            var intervals = []
            listchords.forEach(
                accord =>
                {
                    //Generation de la liste d'interval a partir de l'accord en root
                    var root = accord.id
                    listchords.forEach(acc => {
                        if(acc.id>=root){
                            intervals.push(acc.id-root)
                        }else{
                            intervals.push((12-root)+acc.id+1)
                        }
                }
            )
        })
        console.log(intervals)
            //On a notre grille d'interval : lets la comparer avec les pretendants:
            //CHIE DANS LA COLLE
                // this.scaleTypes.forEach(scale =>
                // {

                //  if(intervals.every(elem => scale.intervals.includes(elem)))
                //  {
                //     possibleScale.push({scale : scale, root : root})
                //  }
                // })

                
        
        }
        //get the relation between intervals and chords
            //construire les accords a partir de la scale => Faire la translation de leur definition dans mm encodage
            //Compare avec les differentes gammes dans la place diatonique
            //rentrer ca dans les gammes possibles à utiliser si compatibilité

            //Have to do it pour tous les differents moyens
        
                //compare it and keep only the right

                //display it into an helpfull object

                //return
        }
    }



</script>