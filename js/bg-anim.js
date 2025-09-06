// bg-anim.js
// Background animation: drifting stars + pulsing glows around joystick/buttons.
// Load this BEFORE your other p5 sketches so its canvas sits beneath the main canvas.

let stars = [];
const STAR_COUNT = 80; // tweak: more stars = denser field
let glowPoints = []; // percentage positions: {x:0..1, y:0..1, color: [r,g,b], sizePct}
let audioReactiveMode = false;
let beatFlashTime = 0;

function setup() {
  // create a canvas that doesn't cover the interface elements
  const cnv = createCanvas(800, 600); // Smaller canvas
  cnv.style("position", "absolute");
  cnv.style("left", "50%");
  cnv.style("top", "50%");
  cnv.style("transform", "translate(-50%, -50%)");
  cnv.style("z-index", "0"); // below other canvases
  cnv.style("pointer-events", "none"); // don't block mouse
  cnv.style("opacity", "0.3"); // Make it more transparent

  pixelDensity(1);
  initStars();
  initGlows();
  noStroke();
  clear(); // keep canvas transparent so body background shows through
}

function windowResized() {
  // Keep canvas size fixed to avoid covering interface elements
  // resizeCanvas(windowWidth, windowHeight)
  initStars();
}

// initialize star particles
function initStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      z: random(0.2, 1.2), // depth factor for parallax & brightness
      size: random(0.6, 3.2),
      vx: random(-0.03, 0.03),
      vy: random(0.02, 0.12), // drift slowly downward
    });
  }
}

// configure glow points - positions are percentages of width/height so they scale.
function initGlows() {
  glowPoints = [
    // approximate positions; tweak these to match your background
    // joystick (left)
    {
      xPct: 0.18,
      yPct: 0.78,
      color: [255, 60, 60],
      sizePct: 0.12,
      phase: random(TWO_PI),
    },
    // green button (top-left)
    {
      xPct: 0.55,
      yPct: 0.7,
      color: [40, 200, 100],
      sizePct: 0.09,
      phase: random(TWO_PI),
    },
    // yellow button (top-right)
    {
      xPct: 0.68,
      yPct: 0.7,
      color: [255, 190, 60],
      sizePct: 0.09,
      phase: random(TWO_PI),
    },
    // blue button (bottom-left)
    {
      xPct: 0.55,
      yPct: 0.83,
      color: [60, 140, 255],
      sizePct: 0.09,
      phase: random(TWO_PI),
    },
    // pink button (bottom-right)
    {
      xPct: 0.68,
      yPct: 0.83,
      color: [255, 80, 190],
      sizePct: 0.09,
      phase: random(TWO_PI),
    },
  ];
}

function draw() {
  // clear with transparent background to let body background image show
  clear();

  // Check for audio reactive mode
  if (window.currentAudioLevel !== undefined) {
    audioReactiveMode = true;
  }

  // Beat flash effect
  if (millis() - beatFlashTime < 200) {
    const flashIntensity = 1 - (millis() - beatFlashTime) / 200;
    background(255, 255, 255, flashIntensity * 50);
  }

  drawStars();
  drawGlows();
}

// star layer: subtle twinkle & drift
function drawStars() {
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    // parallax slow horizontal drifting (tiny)
    s.x += s.vx * s.z * 0.6;
    s.y += s.vy * s.z;

    // wrap around edges
    if (s.x < -10) s.x = width + 10;
    if (s.x > width + 10) s.x = -10;
    if (s.y > height + 10) s.y = -10;

    // twinkle factor
    const tw = (sin(frameCount * 0.02 + i) * 0.5 + 0.5) * 0.6 + 0.4;
    const alpha = map(s.z, 0.2, 1.2, 90, 220) * tw;

    fill(255, alpha);
    // small glow via multi-ellipse
    ellipse(s.x, s.y, s.size * 1.6);
    fill(255, alpha * 1.2);
    ellipse(s.x, s.y, s.size);
  }
}

// pulsing glows under buttons/joystick
function drawGlows() {
  push();
  blendMode(ADD); // additive glow for neon-like look
  for (let p of glowPoints) {
    const gx = p.xPct * width;
    const gy = p.yPct * height;

    // Audio-reactive intensity
    let baseIntensity = 1.0;
    if (audioReactiveMode && window.currentAudioLevel !== undefined) {
      baseIntensity = map(window.currentAudioLevel, 0, 0.5, 0.3, 2.0);
      baseIntensity = constrain(baseIntensity, 0.3, 2.0);
    }

    // base radius scaled by screen diagonal
    const baseR =
      p.sizePct * sqrt(width * width + height * height) * baseIntensity;
    // pulse between 0.85..1.25
    const pulse = 0.9 + 0.35 * (0.5 + 0.5 * sin(frameCount * 0.04 + p.phase));
    const radius = baseR * pulse;

    // draw concentric soft rings (simulate radial gradient)
    for (let r = radius; r > 0; r -= radius / 8) {
      const t = r / radius;
      const alpha = pow(t, 2.2) * 80 * baseIntensity; // stronger center
      fill(p.color[0], p.color[1], p.color[2], alpha);
      ellipse(gx, gy, r * 2);
    }
  }
  pop();
}

// Beat detection trigger from vibe-mapper.js
function triggerBeatEffect() {
  beatFlashTime = millis();
}
