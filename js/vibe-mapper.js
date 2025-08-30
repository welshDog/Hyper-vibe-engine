let img
let synth
let notes = []
let colIndex = 0

let rnn
let vae
let aiNotes = []

function preload() {
  img = loadImage('assets/default-image.png') // Replace with your own image later
  // Load Magenta models
  rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn')
  vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2')
  rnn.initialize()
  vae.initialize()
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  imageMode(CENTER)

  synth = new Tone.PolySynth(Tone.Synth).toDestination()
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination()
  synth.connect(reverb)

  extractNotesFromImage()

  // Generate AI accompaniment
  generateAIAccompaniment()

  Tone.Transport.bpm.value = 60
  Tone.Transport.loop = true
  Tone.Transport.loopEnd = '8m'

  const loop = new Tone.Loop((time) => {
    if (notes.length === 0) return
    const n = notes[colIndex % notes.length]
    synth.triggerAttackRelease(n.notes, '8n', time)
    // Play AI notes if available
    if (aiNotes.length > 0) {
      const aiNote = aiNotes[colIndex % aiNotes.length]
      synth.triggerAttackRelease(aiNote, '8n', time + 0.25) // Slight delay for layering
    }
    colIndex++
  }, '8n').start(0)

  userStartAudio()
  Tone.Transport.start()
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

async function generateAIAccompaniment() {
  // Use pixel-derived notes as seed for AI generation
  const seed = notes.slice(0, 4).map(n => ({ pitch: n.midi, quantizedStartStep: 0, quantizedEndStep: 4 }))
  const aiSeq = await rnn.continueSequence(seed, 16, 1.0)
  aiNotes = aiSeq.notes.map(note => Tone.Midi(note.pitch).toFrequency())
}
