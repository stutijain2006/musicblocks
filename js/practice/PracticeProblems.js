export const PracticeProblems = {
    easy: [
        {
            id: "easy_1",
            title: "Play a Sound 🎵",
            image: "images/practice/easy_play_note.png",
            expected: {
                blocks: ["start", "note", "pitch"]
            }
        },
        {
            id: "easy_2",
            title: "Higher or Lower 🎶",
            image: "images/practice/easy_octave.png",
            expected: {
                blocks: ["start", "note", "pitch", "number"]
            }
        }
    ],

    medium: [
        {
            id: "medium_1",
            title: "Copy the Tune 🎧",
            image: "images/practice/medium_melody.png",
            expected: {
                minNotes: 3
            }
        },
        {
            id: "medium_2",
            title: "Change Instrument 🎹",
            image: "images/practice/medium_instrument.png",
            expected: {
                blocks: ["voicename"]
            }
        }
    ],

    hard: [
        {
            id: "hard_1",
            title: "Make a Pattern 🔁",
            image: "images/practice/hard_repeat.png",
            expected: {
                blocks: ["repeat"]
            }
        },
        {
            id: "hard_2",
            title: "Music + Drawing 🎨",
            image: "images/practice/hard_graphics.png",
            expected: {
                graphicsInsideNote: true
            }
        }
    ]
};
