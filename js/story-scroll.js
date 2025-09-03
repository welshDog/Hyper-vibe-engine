let scrollX
let story = 'IN THE HYPERFOCUS EMPIRE, YOUR ARTIFACT AWAKENS THE ANCIENT SYNTHS... PRESS START TO BEGIN YOUR MYTHIC JOURNEY'

function draw() {
  background(10)

  push()
  translate(width / 2 - 150, height / 2 - 40)
  const s = min(400 / img.width, 400 / img.height)
  image(img, 0, 0, img.width * s, img.height * s)
  // Display crest
  if (crest) {
    image(crest, -50, -50, 50, 50)
  }
  pop()

  textAlign(CENTER)
  textSize(56)
  textStyle(BOLD)
  // text('HYPERFOCUS ZONE — VIBE ENGINE', width / 2 + 120, 120)

  textSize(20)
  textAlign(LEFT)
  text(story, scrollX, height - 60)
  scrollX -= 1.2
  if (scrollX < -textWidth(story)) scrollX = width
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  scrollX = width
}
