let scrollX
let story = 'THE BROSKI KNIGHT AWAKENS FROM HYPERSLEEP... PRESS START'

function draw() {
  background(10)

  push()
  translate(width / 2 - 150, height / 2 - 40)
  const s = min(400 / img.width, 400 / img.height)
  image(img, 0, 0, img.width * s, img.height * s)
  pop()

  textAlign(CENTER)
  textSize(56)
  textStyle(BOLD)
  text('HYPERFOCUS ZONE — VIBE ENGINE', width / 2 + 120, 120)

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
