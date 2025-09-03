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
  createCanvas(windowWidth, windowHeight)
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

  // UI elements
  let uploadInput = select('#imageUpload')
  uploadInput.changed(handleFile)

  let playBtn = select('#playBtn')
  playBtn.mousePressed(() => {
    userStartAudio().then(() => {
      isAudioStarted = true
      Tone.Transport.start()
      select('#ui').hide()
      // Start sound
      synth.triggerAttackRelease('G4', '4n');
    })
  })

  let pauseBtn = select('#pauseBtn')
  pauseBtn.mousePressed(() => {
    Tone.Transport.pause()
    // Pause sound
    synth.triggerAttackRelease('A3', '4n');
  })

  let testBtn = select('#testBtn')
  testBtn.mousePressed(() => {
    runTests();
  })

  // userStartAudio()
  // Tone.Transport.start()
  console.log('setup end')
}

function mousePressed() {
  userStartAudio().then(() => {
    Tone.Transport.start();
  });
}

function handleFile() {
  let file = uploadInput.elt.files[0];
  if (file) {
    img = loadImage(URL.createObjectURL(file), () => {
      extractNotesFromImage();
      colIndex = 0; // Reset loop
      // Sound cue for upload
      synth.triggerAttackRelease('C5', '8n');
    });
  }
}

function extractNotesFromImage() {
  img.loadPixels()
  const w = img.width
  const h = img.height
  const N = 16

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