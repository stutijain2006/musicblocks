export const PracticeProblems = [
    {
        level: 1,
        title: "Hot Cross Buns - Discover the Form",
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
        title: "Sakura Sakura",
        description: `
      <p><b>Sakura Sakura - Discover the Melody</b></p>

      <p>
      "Sakura Sakura" is a famous traditional song from <b>Japan</b>.
      In this activity, you will recreate the melody using musical blocks.
      </p>

      <p><b>Following musical chunks are already on the screen:</b></p>

      <ul>
        <li><b>Sakura</b></li>
        <li><b>yayoi</b></li>
        <li><b>miwatasu</b></li>
        <li><b>miniyukan</b></li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>Arrange the blocks under the <b>Start</b> block.</li>
        <li>The melody structure is <b>Sakura yayoi miwatasu yayoi miwatasu Sakura miniyukan</b>, and repeat this melody 4 times.</li>
        <li>You may use the <b>repeat block</b> to help build the pattern.</li>
        <li>Press <b>Play</b> to hear your melody.</li>
      </ol>

      <p><b>After you complete the pattern, explore further:</b></p>

      <ul>
        <li>Change pitches</li>
        <li>Try different octaves</li>
        <li>Create your own variation of the melody</li>
      </ul>
    `,
        expected: {
            pattern: [
                "Sakura",
                "yayoi",
                "miwatasu",
                "yayoi",
                "miwatasu",
                "Sakura",
                "miniyukan",
                "Sakura",
                "yayoi",
                "miwatasu",
                "yayoi",
                "miwatasu",
                "Sakura",
                "miniyukan",
                "Sakura",
                "yayoi",
                "miwatasu",
                "yayoi",
                "miwatasu",
                "Sakura",
                "miniyukan",
                "Sakura",
                "yayoi",
                "miwatasu",
                "yayoi",
                "miwatasu",
                "Sakura",
                "miniyukan"
            ]
        },
        badgeGroup: "melody_basics"
    },

    {
        level: 3,
        title: "Beat and Rhythm with Rhythm Maker",
        description: `
      <p><b>Beat</b> is the steady pulse of music. <b>Rhythm</b> is the pattern of long and short sounds played on that beat.</p>

      <p>This level helps you move from arranging ready-made blocks to creating your own rhythm in Music Blocks.</p>

      <p><b>Your task:</b></p>

      <ol>
        <li>Open <b>Rhythm Maker</b>.</li>
        <li>Create a steady beat and try a few rhythm variations.</li>
        <li>Click <b>Save rhythms</b> to export your rhythm as an <b>action block</b>.</li>
        <li>Open the action palette and find your exported rhythm block under the <b>Actions</b> section.</li>
        <li>Use the exported action block under the <b>Start</b> block to make your composition.</li>
        <li>Press <b>Play</b> and listen to your result.</li>
      </ol>

      <p><b>Think about:</b></p>

      <ul>
        <li>Which part feels like the steady beat?</li>
        <li>Which part shows rhythm changes?</li>
        <li>How does the sound change when notes become shorter or longer?</li>
      </ul>
    `,
        expected: {
            rhythmMakerWorkflow: true
        },
        badgeGroup: "rhythm_basics"
    },

    {
        level: 5,
        title: "Geometry and Rhythm I - Build Basic Shapes",
        description: `
      <p>In this lesson, shapes help us understand rhythm. A circle is a whole turn of <b>360 degrees</b>, just like a whole note is one whole unit in rhythm.</p>

      <p>We will begin with simple shapes. Each shape uses the same idea:</p>

      <ul>
        <li>The <b>repeat</b> count tells how many sides the shape has.</li>
        <li>The turtle moves <b>forward</b> to draw each side.</li>
        <li>The turtle turns <b>right</b> by the correct angle each time.</li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>You will already see <b>Start</b>, <b>repeat</b>, <b>forward</b>, and <b>right</b> blocks on the screen for your first shape.</li>
        <li>Use them to make a <b>square</b>: repeat <b>4</b> times, go <b>forward 100</b>, and turn <b>right 90</b>.</li>
        <li>Now make a <b>triangle</b> by changing the square idea.</li>
        <li>Then make a <b>pentagon</b> too.</li>
        <li>Keep all three shape programs on the screen at the same time, each with its own <b>Start</b> block.</li>
      </ol>

      <p><b>Think about:</b></p>

      <ul>
        <li>If a square has 4 sides, what repeat number should a triangle use?</li>
        <li>What should happen to the turning angle when the number of sides changes?</li>
        <li>How can you use the same idea again for a pentagon?</li>
      </ul>

      <p><b>Hint:</b> if you want to make a new shape quickly, you can right-click the <b>Start</b> block for your square and choose <b>Duplicate</b>. Then change the numbers in the copied program.</p>

      <p><b>Level check:</b> your project should show three separate programs with three separate <b>Start</b> blocks: one for a square, one for a triangle, and one for a pentagon.</p>
    `,
        expected: {
            basicShapeSet: true
        },
        badgeGroup: "geometry_rhythm"
    },

    {
        level: 6,
        title: "Geometry and Rhythm II - Shapes with Box",
        description: `
      <p>Now we make the shape code more powerful. Instead of typing the same number again and again, we can store it in a <b>box</b>.</p>

      <p><b>What is box1?</b></p>

      <p><b>box1</b> is like a small number container. You put a number into it, and then other blocks can use that same number.</p>

      <p>For example, if <b>box1 = 4</b>:</p>

      <ul>
        <li>The <b>repeat</b> block can use <b>box1</b>, so the shape gets 4 sides.</li>
        <li>The turning angle can use <b>360 / box1</b>, which means <b>360 / 4 = 90</b>.</li>
        <li>If you change <b>box1</b> to 3, 5, or 8, the shape changes too.</li>
      </ul>

      <p><b>What is the divide block?</b></p>

      <p>The <b>divide</b> block helps us calculate the turning angle. When you connect <b>360</b> on top and <b>box1</b> below, the block works out the angle for the shape.</p>

      <p><b>You will already see these blocks on the screen:</b></p>

      <ul>
        <li><b>Start</b></li>
        <li><b>store in box1</b></li>
        <li><b>box1</b></li>
        <li><b>repeat</b></li>
        <li><b>forward</b></li>
        <li><b>right</b></li>
        <li><b>divide</b></li>
      </ul>

      <p><b>Your task:</b></p>

      <ol>
        <li>Look at the starter code and find where <b>box1</b> is used.</li>
        <li>Connect <b>box1</b> to the <b>repeat</b> block so it controls how many sides the shape has.</li>
        <li>Connect the <b>divide</b> block to the <b>right</b> block so the turn becomes <b>360 / box1</b>.</li>
        <li>Play with the number stored in <b>box1</b> and see how the shape changes.</li>
        <li>Then build a bigger program that makes several shapes by changing <b>box1</b> after each shape.</li>
      </ol>

      <p><b>Hint:</b> first make one shape work with <b>box1</b>. After that, you can repeat the idea and change the value in <b>box1</b> to create many different shapes.</p>

      <p><b>To complete this level, your code must do all of these things:</b></p>

      <ol>
        <li>Store a number in <b>box1</b>.</li>
        <li>Use <b>box1</b> as the repeat count for drawing a shape.</li>
        <li>Use <b>360 / box1</b> as the turning angle.</li>
        <li>Use another repeat to make several shapes automatically.</li>
        <li>Change <b>box1</b> after a shape is drawn so the next shape is different.</li>
      </ol>

      <p><b>Level check:</b> the level will complete only when your project shows a shape generator that uses <b>box1</b> and automatically makes multiple different shapes.</p>
    `,
        expected: {
            boxShapeAutomation: true
        },
        badgeGroup: "geometry_rhythm"
    },

    {
        level: 7,
        title: "Geometry and Rhythm III - Whole Note Circle",
        description: `
      <p>Now connect geometry to rhythm directly. Think of a whole note like a whole pizza or a whole circle. Dividing the note is like dividing the circle into equal parts.</p>

      <p>Instead of drawing straight-sided shapes, you will draw a circle over time.</p>

      <p><b>Your task:</b></p>

      <ol>
        <li>Use a <b>note value</b> block so the drawing happens over time.</li>
        <li>Use <b>box1</b> as the denominator for the note value.</li>
        <li>Inside the note, use a <b>drum</b> and an <b>arc</b> block.</li>
        <li>Make the arc angle use <b>360 / box1</b>.</li>
        <li>Repeat the note so the circle is divided into equal musical parts.</li>
      </ol>

      <p><b>Think about:</b></p>

      <ul>
        <li>How does changing <b>box1</b> change both the rhythm and the drawing?</li>
        <li>Which note values feel faster? Which feel slower?</li>
        <li>How does a whole circle relate to a whole note?</li>
      </ul>

      <p><b>Level check:</b> your project should connect note value and circle division by using <b>box1</b> in both the note value and the arc angle.</p>
    `,
        expected: {
            cyclicWholeNote: true
        },
        badgeGroup: "geometry_rhythm"
    }
];
