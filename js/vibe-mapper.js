let img
let synth
let notes = []
let colIndex = 0

// let rnn
// let vae
// let aiNotes = []
let crest
let uploadInput
let isAudioStarted = false
let particles = []

function userStartAudio() {
  return Tone.start();
}

function preload() {
  console.log('preload start')
  img = loadImage('assets/default-image.png') // Replace with your own image later
  // Optional: Load crest image
  crest = loadImage('assets/hyperfocus-crest.png')
  console.log('preload end')
}

async function setup() {
  console.log('setup start')

  // Create canvas to fit inside arcade cabinet screen
  const cabinetScreen = document.querySelector('.cabinet-screen')
  const canvas = createCanvas(500, 300)
  canvas.parent(cabinetScreen)

  imageMode(CENTER)

  synth = new Tone.PolySynth(Tone.Synth).toDestination()
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination()
  synth.connect(reverb)

  extractNotesFromImage()

  // Load Magenta models
  // rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn')
  // vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2')
  // await rnn.initialize()
  // await vae.initialize()

  // Generate AI accompaniment
  // await generateAIAccompaniment()

  Tone.Transport.bpm.value = 60
  Tone.Transport.loop = true
  Tone.Transport.loopEnd = '8m'

  new Tone.Loop((time) => {
    if (notes.length === 0) return
    const n = notes[colIndex % notes.length]
    synth.triggerAttackRelease(n.notes, '8n', time)
    // Play AI notes if available
    // if (aiNotes.length > 0) {
    //   const aiNote = aiNotes[colIndex % aiNotes.length]
    //   synth.triggerAttackRelease(aiNote, '8n', time + 0.25) // Slight delay for layering
    // }
    colIndex++
  }, '8n').start(0)

  // Setup arcade controls
  setupArcadeControls()

  // Create 8-bit particles
  createParticles()

  console.log('setup end')
}

function setupArcadeControls() {
  // PRESS START banner click
  const pressStartBanner = select('#pressStartBanner')
  pressStartBanner.mousePressed(() => {
    userStartAudio().then(() => {
      isAudioStarted = true
      Tone.Transport.start()
      pressStartBanner.hide()
      // Start sound
      synth.triggerAttackRelease('G4', '4n');
    })
  })

  // Joystick interaction
  const joystick = select('#joystick')
  joystick.mousePressed(() => {
    if (isAudioStarted) {
      // Joystick sound effect
      synth.triggerAttackRelease('C4', '8n');
    }
  })

  // Arcade buttons
  const redBtn = select('#redBtn')
  const blueBtn = select('#blueBtn')
  const yellowBtn = select('#yellowBtn')
  const greenBtn = select('#greenBtn')

  redBtn.mousePressed(() => {
    if (isAudioStarted) {
      synth.triggerAttackRelease('E4', '8n');
      // Could trigger different effects
    }
  })

  blueBtn.mousePressed(() => {
    if (isAudioStarted) {
      synth.triggerAttackRelease('G4', '8n');
      // Could trigger different effects
    }
  })

  yellowBtn.mousePressed(() => {
    if (isAudioStarted) {
      synth.triggerAttackRelease('A4', '8n');
      // Could trigger different effects
    }
  })

  greenBtn.mousePressed(() => {
    if (isAudioStarted) {
      synth.triggerAttackRelease('C5', '8n');
      // Could trigger different effects
    }
  })

  // Hidden UI panel (for advanced controls)
  let uploadInput = select('#imageUpload')
  uploadInput.changed(handleFile)

  let playBtn = select('#playBtn')
  playBtn.mousePressed(() => {
    userStartAudio().then(() => {
      isAudioStarted = true
      Tone.Transport.start()
      select('#ui').hide()
      synth.triggerAttackRelease('G4', '4n');
    })
  })

  let pauseBtn = select('#pauseBtn')
  pauseBtn.mousePressed(() => {
    Tone.Transport.pause()
    if (isAudioStarted) synth.triggerAttackRelease('A3', '4n');
  })

  let testBtn = select('#testBtn')
  testBtn.mousePressed(() => {
    runTests();
  })
}

function createParticles() {
  const particlesContainer = document.getElementById('particles')

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    particle.style.left = Math.random() * 100 + '%'
    particle.style.top = Math.random() * 100 + '%'
    particle.style.animationDelay = Math.random() * 3 + 's'
    particlesContainer.appendChild(particle)
  }
}

function draw() {
  // Clear background with solid black
  background(0, 0, 0); // Pure black background

  // Draw the image in the center
  push()
  translate(width / 2, height / 2)
  const s = min(200 / img.width, 200 / img.height)
  image(img, 0, 0, img.width * s, img.height * s)

  // Display crest
  if (crest) {
    image(crest, -100, -100, 40, 40)
  }
  pop()

  // Draw arcade-style UI elements
  drawArcadeUI()

  // Update particles
  updateParticles()
}

function drawNeonGrid() {
  // Disabled for solid black background
  // This function is no longer called to maintain pure black background
}

function drawArcadeUI() {
  // Draw some retro-style elements
  fill(0, 255, 0, 100)
  noStroke()
  textAlign(CENTER)
  textSize(12)
  text('HYPERFOCUS ZONE', width / 2, 30)

  // Draw corner brackets for retro feel
  stroke(0, 255, 0)
  strokeWeight(2)
  noFill()

  // Top-left corner
  line(10, 10, 30, 10)
  line(10, 10, 10, 30)

  // Top-right corner
  line(width - 30, 10, width - 10, 10)
  line(width - 10, 10, width - 10, 30)

  // Bottom-left corner
  line(10, height - 30, 10, height - 10)
  line(10, height - 10, 30, height - 10)

  // Bottom-right corner
  line(width - 30, height - 10, width - 10, height - 10)
  line(width - 10, height - 30, width - 10, height - 10)
}

function updateParticles() {
  // Particles are handled by CSS animations
}

function mousePressed() {
  userStartAudio().then(() => {
    if (!isAudioStarted) {
      Tone.Transport.start();
      isAudioStarted = true;
    }
  });
}

function handleFile() {
  let file = uploadInput.elt.files[0];
  if (file) {
    img = loadImage(URL.createObjectURL(file), () => {
      extractNotesFromImage();
      colIndex = 0; // Reset loop
      // Sound cue for upload
      if (isAudioStarted) synth.triggerAttackRelease('C5', '8n');
    });
  }
}

function extractNotesFromImage() {
  img.loadPixels()
  const w = img.width
  const h = img.height
  const N = 16

  notes = [] // Clear existing notes

  for (let i = 0; i < N; i++) {
    const x = Math.floor(map(i, 0, N - 1, 0, w - 1))
    let sum = 0
    for (let y = 0; y < h; y += 6) {
      const idx = 4 * (y * w + x)
      const r = img.pixels[idx]
      const g = img.pixels[idx + 1]
      const b = img.pixels[idx + 2]
      const bright = (r + g + b) / 3
      sum += bright
    }
    const avg = sum / (h / 6)
    const midi = Math.round(map(avg, 0, 255, 48, 84))
    const chord = [midi, midi + 4, midi + 7].map((m) => Tone.Midi(m).toFrequency())
    notes.push({ midi, notes: chord })
  }
}