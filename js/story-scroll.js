let scrollX
let story = 'IN THE HYPERFOCUS EMPIRE, YOUR ARTIFACT AWAKENS THE ANCIENT SYNTHS... PRESS START TO BEGIN YOUR MYTHIC JOURNEY'

function draw() {
  // Only draw if we're in the arcade context
  if (typeof img !== 'undefined' && img) {
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
