let scrollX
let story = 'IN THE HYPERFOCUS EMPIRE, YOUR ARTIFACT AWAKENS THE ANCIENT SYNTHS... PRESS START TO BEGIN YOUR MYTHIC JOURNEY'
let dynamicStory = ''
let storyGenerated = false

// Image analysis data
let dominantColors = []
let brightness = 0
let contrast = 0
let imageMood = 'mysterious'

function analyzeImageForStory(img) {
  if (!img || storyGenerated) return

  console.log('Analyzing image for dynamic story generation...')

  // Check if image is loaded and has pixels available
  if (!img.width || !img.height) {
    console.log('Image not fully loaded yet, skipping analysis')
    return
  }

  try {
    // Load pixels for analysis
    img.loadPixels()

    // Analyze dominant colors
    dominantColors = analyzeDominantColors(img)

    // Analyze brightness and contrast
    const analysis = analyzeBrightnessContrast(img)
    brightness = analysis.brightness
  contrast = analysis.contrast

  // Determine mood based on analysis
  imageMood = determineMood(brightness, contrast, dominantColors)

  // Generate dynamic story
  dynamicStory = generateDynamicStory(imageMood, dominantColors, brightness, contrast)

  // Update the scrolling story
  story = dynamicStory.toUpperCase()

  storyGenerated = true
  console.log('Dynamic story generated:', story)
}

function analyzeDominantColors(img) {
  const colors = []
  const step = 20 // Sample every 20 pixels for performance

  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      const index = (x + y * img.width) * 4
      const r = img.pixels[index]
      const g = img.pixels[index + 1]
      const b = img.pixels[index + 2]

      colors.push([r, g, b])
    }
  }

  // Find most common color ranges
  return findDominantColorRanges(colors)
}

function analyzeBrightnessContrast(img) {
  let totalBrightness = 0
  let minBrightness = 255
  let maxBrightness = 0

  for (let i = 0; i < img.pixels.length; i += 4) {
    const brightness = (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3
    totalBrightness += brightness
    minBrightness = min(minBrightness, brightness)
    maxBrightness = max(maxBrightness, brightness)
  }

  const avgBrightness = totalBrightness / (img.pixels.length / 4)
  const contrast = maxBrightness - minBrightness

  return {
    brightness: avgBrightness / 255, // Normalize to 0-1
    contrast: contrast / 255
  }
}

function determineMood(brightness, contrast, colors) {
  if (brightness > 0.7 && contrast < 0.3) return 'bright'
  if (brightness < 0.3 && contrast > 0.5) return 'dark'
  if (contrast > 0.6) return 'dramatic'
  if (colors.some(c => c[0] > 200 && c[1] < 100 && c[2] < 100)) return 'fiery'
  if (colors.some(c => c[2] > 150)) return 'mystical'
  return 'balanced'
}

function generateDynamicStory(mood, colors, brightness, contrast) {
  const storyTemplates = {
    bright: [
      "A radiant artifact from the Crystal Realms awakens with blinding light...",
      "The artifact pulses with solar energy, illuminating forgotten melodies...",
      "Brilliant energies surge through the crystal matrix, composing symphonies of light..."
    ],
    dark: [
      "Shadows coil around this ancient artifact, whispering forbidden harmonies...",
      "The void artifact absorbs light, transforming darkness into haunting melodies...",
      "Dark energies awaken within the artifact, summoning spectral soundscapes..."
    ],
    dramatic: [
      "Contrasting forces battle within this artifact, creating thunderous compositions...",
      "The artifact's stark contrasts unleash a storm of musical fury...",
      "Dramatic energies clash and merge, forging epic musical sagas..."
    ],
    fiery: [
      "Crimson flames dance within this artifact, igniting passionate symphonies...",
      "The artifact burns with inner fire, melting reality into molten music...",
      "Fiery essences surge through the artifact, composing infernos of sound..."
    ],
    mystical: [
      "Azure mysteries swirl within this artifact, unveiling cosmic harmonies...",
      "The artifact channels mystical energies, revealing secrets of the synth realms...",
      "Enchanted forces weave through the artifact, crafting magical melodies..."
    ],
    balanced: [
      "Harmonious energies flow through this artifact, creating perfect compositions...",
      "The artifact maintains cosmic balance, orchestrating universal symphonies...",
      "Balanced forces unite within the artifact, producing masterful musical works..."
    ]
  }

  const templates = storyTemplates[mood] || storyTemplates.balanced
  return random(templates)
}

function findDominantColorRanges(colors) {
  // Simple color range detection
  const ranges = {
    red: colors.filter(c => c[0] > 150 && c[0] > c[1] && c[0] > c[2]).length,
    green: colors.filter(c => c[1] > 150 && c[1] > c[0] && c[1] > c[2]).length,
    blue: colors.filter(c => c[2] > 150 && c[2] > c[0] && c[2] > c[1]).length,
    neutral: colors.filter(c => Math.abs(c[0] - c[1]) < 30 && Math.abs(c[1] - c[2]) < 30).length
  }

  return Object.keys(ranges).filter(key => ranges[key] > colors.length * 0.1)
}

function draw() {
  // Only draw if we're in the arcade context
  if (typeof img !== 'undefined' && img) {
    // Analyze image for dynamic story if not done yet
    if (!storyGenerated) {
      analyzeImageForStory(img)
    }

    // Draw the scrolling story text at the bottom of the screen
    fill(0, 255, 0, 200)
    textAlign(LEFT)
    textSize(8)
    textFont('monospace')

    // Draw story text with scrolling effect
    text(story, scrollX, height - 20)
    scrollX -= 0.8

    if (scrollX < -textWidth(story)) {
      scrollX = width
    }

    // Draw some retro-style decorations
    drawRetroDecorations()

    // Draw mood indicator
    drawMoodIndicator()
  }
}

function drawMoodIndicator() {
  if (storyGenerated) {
    fill(255, 255, 0, 150)
    noStroke()
    textSize(6)
    textAlign(LEFT)
    text(`MOOD: ${imageMood.toUpperCase()}`, 20, 20)

    // Draw color indicators
    if (dominantColors.length > 0) {
      textAlign(LEFT)
      text('ESSENCES:', 20, 35)
      dominantColors.forEach((color, index) => {
        fill(color === 'red' ? [255, 100, 100] :
             color === 'green' ? [100, 255, 100] :
             color === 'blue' ? [100, 100, 255] : [200, 200, 200])
        rect(80 + index * 15, 28, 10, 10)
      })
    }
  }
}

function drawRetroDecorations() {
  // Draw some pixel-style borders
  stroke(0, 255, 0, 100)
  strokeWeight(1)
  noFill()

  // Corner pixels
  rect(5, 5, 10, 10)
  rect(width - 15, 5, 10, 10)
  rect(5, height - 15, 10, 10)
  rect(width - 15, height - 15, 10, 10)

  // Status indicators
  fill(255, 255, 0, 150)
  noStroke()
  textSize(6)
  textAlign(RIGHT)
  text('READY', width - 20, 20)
}

function windowResized() {
  // Reset scroll position when window resizes
  if (typeof width !== 'undefined') {
    scrollX = width
  }
}
