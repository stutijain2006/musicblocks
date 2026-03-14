export const PracticeProblems = [
  {
    level: 1,
    title: "Hot Cross Buns – Discover the Form",
    description: `
      <p><b>Hot Cross Buns</b> has a simple musical form.</p>

      <p>Two musical chunks are already on the screen:</p>

      <ul>
        <li><b>A = HCB</b></li>
        <li><b>B = Penny</b></li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>Arrange the blocks under the <b>Start</b> block to recreate the melody.</li>
        <li>The melody structure is <b>A A B A</b>.</li>
        <li>You can use the <b>repeat block</b> to help build the pattern.</li>
        <li>Press <b>Play</b> to hear your melody.</li>
      </ol>

      <p><b>Once you recreate the correct pattern, explore further:</b></p>

      <ul>
        <li>Change octaves</li>
        <li>Change pitches</li>
        <li>Try <b>invert</b> or <b>transpose</b> blocks</li>
        <li>Make your own variations</li>
      </ul>
    `,
    expected: {
      pattern: ["A", "A", "B", "A"]
    },
    badgeGroup: "melody_basics"
  },

  {
    level: 2,
    title: "Hot Cross Buns – Complete Form",
    description: `
Now extend the melody by repeating patterns.

Your task:
• Use repetition to organize the melody
• The tune should sound structured
• Observe how musical form emerges
    `,
    image: "images/practice/hot_cross_buns_full.png",
    expected: {
      blocks: ["repeat"],
      minNotes: 6
    },
    badgeGroup: "melody_basics"
  },

  {
    level: 3,
    title: "Music + Motion",
    description: `
Music Blocks allows music and motion together.

Your task:
• Add a motion block inside a musical note
• Music and drawing should happen together
    `,
    image: "images/practice/music_and_motion.png",
    expected: {
      graphicsInsideNote: true
    },
    badgeGroup: "music_and_motion"
  }
];
