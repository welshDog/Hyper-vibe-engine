let img;
let synth;
let notes = [];
let colIndex = 0;

// let rnn
// let vae
// let aiNotes = []
let crest;
let uploadInput;
let isAudioStarted = false;
let particles = [];
let imagesLoaded = false;

// Audio reactive variables
let analyser;
let audioLevel = 0;
let beatDetector;
let lastBeatTime = 0;

// Real-time preview variables
let isPlaying = false;
let currentVolume = 0.7;
let currentTempo = 60;
let visualizerCanvas;
let visualizerCtx;
let animationId;

function userStartAudio() {
  return Tone.start();
}

function loadImagesAfterUserGesture() {
  if (!imagesLoaded) {
    console.log("Loading images after user gesture...");
    img = loadImage("assets/default-image.png", () => {
      // Generate mythic story for the default image
      const imageAnalysis = analyzeImageForStory(img);
      const mythicStory = generateMythicStory(imageAnalysis);

      // Display the story in the lore div
      const loreDiv = select("#lore");
      if (loreDiv) {
        loreDiv.html(mythicStory);
        loreDiv.show(); // Make sure it's visible
      }

      console.log("Default image loaded and story generated");
    }); // Replace with your own image later
    // Optional: Load crest image
    crest = loadImage("assets/hyperfocus-crest.png");
    imagesLoaded = true;
    console.log("Images loaded successfully");
  }
}

// Image Analysis Engine for Dynamic Story Generation
function analyzeImageForStory(img) {
  // Create a temporary canvas to analyze the image
  const analysisCanvas = document.createElement("canvas");
  const ctx = analysisCanvas.getContext("2d");
  analysisCanvas.width = img.width;
  analysisCanvas.height = img.height;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  // Analyze dominant colors
  const colorCounts = {};
  const brightnessValues = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    brightnessValues.push(brightness);

    // Quantize colors for dominant color detection
    const quantized = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${
      Math.floor(b / 32) * 32
    }`;
    colorCounts[quantized] = (colorCounts[quantized] || 0) + 1;
  }

  // Find dominant colors
  const dominantColors = Object.entries(colorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([color]) => color.split(",").map(Number));

  // Calculate average brightness
  const avgBrightness =
    brightnessValues.reduce((a, b) => a + b, 0) / brightnessValues.length;

  // Detect patterns (simple edge detection)
  const edges = detectEdges(data, img.width, img.height);

  return {
    dominantColors,
    avgBrightness,
    edges,
    dimensions: { width: img.width, height: img.height },
    aspectRatio: img.width / img.height,
  };
}

function detectEdges(data, width, height) {
  let edgeCount = 0;
  const threshold = 30;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Check neighbors for edges
      const neighbors = [
        ((y - 1) * width + x) * 4,
        ((y + 1) * width + x) * 4,
        (y * width + (x - 1)) * 4,
        (y * width + (x + 1)) * 4,
      ];

      for (const nIdx of neighbors) {
        const nBrightness = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
        if (Math.abs(brightness - nBrightness) > threshold) {
          edgeCount++;
          break;
        }
      }
    }
  }

  return edgeCount / (width * height); // Edge density
}

// Mythic Story Generator
function generateMythicStory(imageAnalysis) {
  const { dominantColors, avgBrightness, edges, dimensions, aspectRatio } =
    imageAnalysis;

  // Story components based on image properties
  const themes = {
    brightness: {
      dark: ["shadowy", "mysterious", "forbidden", "ancient", "abyssal"],
      medium: ["balanced", "harmonious", "natural", "earthy", "balanced"],
      bright: ["radiant", "celestial", "divine", "luminous", "ethereal"],
    },
    colors: {
      red: ["crimson", "fiery", "bloody", "passionate", "warrior"],
      blue: ["azure", "deep", "mystical", "wise", "aquatic"],
      green: ["emerald", "natural", "growing", "healing", "forest"],
      yellow: ["golden", "sunny", "wise", "prosperous", "divine"],
      purple: ["royal", "mystical", "magical", "noble", "cosmic"],
      black: ["void", "infinite", "mysterious", "powerful", "ancient"],
      white: ["pure", "sacred", "holy", "innocent", "divine"],
    },
    patterns: {
      highContrast: ["sharp", "defined", "crystalline", "geometric", "precise"],
      lowContrast: ["soft", "dreamy", "flowing", "organic", "gentle"],
      complex: ["intricate", "detailed", "layered", "mysterious", "profound"],
    },
  };

  // Determine primary characteristics
  const brightness =
    avgBrightness < 85 ? "dark" : avgBrightness > 170 ? "bright" : "medium";
  const contrast =
    edges > 0.15 ? "highContrast" : edges > 0.05 ? "complex" : "lowContrast";

  // Get dominant color themes
  const colorThemes = dominantColors.map((color) => {
    const [r, g, b] = color;
    if (r > g && r > b) return "red";
    if (b > r && b > g) return "blue";
    if (g > r && g > b) return "green";
    if (r > 150 && g > 150 && b < 100) return "yellow";
    if (r > 100 && b > 100 && g < 100) return "purple";
    if (r < 50 && g < 50 && b < 50) return "black";
    if (r > 200 && g > 200 && b > 200) return "white";
    return "mystical";
  });

  // Generate story components
  const artifactType = getRandomElement([
    "crystal",
    "rune",
    "glyph",
    "sigil",
    "totem",
    "relic",
    "artifact",
    "icon",
    "symbol",
    "mark",
  ]);

  const powerWords = [
    ...themes.brightness[brightness],
    ...colorThemes.flatMap((color) => themes.colors[color] || ["mystical"]),
    ...themes.patterns[contrast],
  ].filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates

  const originWords = getRandomElement([
    "forgotten empire",
    "celestial realm",
    "abyssal depths",
    "ancient civilization",
    "parallel dimension",
    "lost civilization",
    "divine workshop",
    "cosmic forge",
  ]);

  const effectWords = getRandomElement([
    "awakens dormant synths",
    "summons harmonic spirits",
    "unleashes melodic storms",
    "channels rhythmic energies",
    "manifests sonic visions",
    "conjures audio apparitions",
  ]);

  // Construct the mythic story
  const story = `🏛️ **${artifactType.toUpperCase()} OF ${originWords.toUpperCase()}** 🏛️

This ${getRandomElement(
    powerWords
  )} ${artifactType} from the ${originWords} ${effectWords}.

${generateDescriptiveParagraph(powerWords, artifactType, originWords)}

${generatePowerDescription(powerWords, effectWords)}

${generateWarningOrProphecy(powerWords, brightness)}`;

  return story;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateDescriptiveParagraph(powerWords, artifactType, originWords) {
  const descriptors = powerWords.slice(0, 3);
  return `Forged in the ${originWords}, this ${artifactType} pulses with ${descriptors.join(
    ", "
  )} energy. Its ${getRandomElement([
    "surface",
    "core",
    "essence",
    "aura",
  ])} reveals secrets of ${getRandomElement([
    "harmonic convergence",
    "sonic alchemy",
    "rhythmic mysteries",
    "melodic enlightenment",
  ])}.`;
}

function generatePowerDescription(powerWords, effectWords) {
  return `When activated, it ${effectWords}, creating ${getRandomElement([
    "symphonies of power",
    "harmonies of destiny",
    "rhythms of fate",
    "melodies of creation",
  ])} that echo through the digital realms.`;
}

function generateWarningOrProphecy(powerWords, brightness) {
  if (brightness === "dark") {
    return `⚠️ **Ancient Warning:** Only the worthy may harness its ${getRandomElement(
      ["forbidden", "mysterious", "abyssal"]
    )} power.`;
  } else if (brightness === "bright") {
    return `✨ **Divine Prophecy:** This ${getRandomElement([
      "radiant",
      "celestial",
      "luminous",
    ])} artifact heralds a new era of sonic enlightenment.`;
  } else {
    return `🔮 **Balanced Wisdom:** In harmony lies true power. This artifact teaches the perfect balance of light and shadow.`;
  }
}

function preload() {
  console.log("preload start - skipping image load until user gesture");
  // Images will be loaded after user clicks PRESS START
  console.log("preload end");
}

async function setup() {
  console.log("setup start");

  // Create canvas (position it to not cover interface elements)
  const canvas = createCanvas(400, 250); // Smaller canvas
  canvas.style('position', 'absolute');
  canvas.style('top', '60%'); // Move it down to avoid covering buttons
  canvas.style('left', '50%');
  canvas.style('transform', 'translate(-50%, -50%)');
  canvas.style('z-index', '1');

  imageMode(CENTER);

  // Initialize audio system with analyser
  synth = new Tone.PolySynth(Tone.Synth).toDestination();
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
  synth.connect(reverb);

  // Create audio analyser for reactive effects
  analyser = new Tone.Analyser("fft", 256);
  synth.connect(analyser);

  // Initialize beat detector
  beatDetector = new Tone.Analyser("fft", 32);

  extractNotesFromImage();

  // Start audio reactive updates
  setInterval(updateAudioLevels, 16); // ~60fps updates

  // Load Magenta models
  // rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn')
  // vae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2')
  // await rnn.initialize()
  // await vae.initialize()

  // Generate AI accompaniment
  // await generateAIAccompaniment()

  Tone.Transport.bpm.value = 60;
  Tone.Transport.loop = true;
  Tone.Transport.loopEnd = "8m";

  new Tone.Loop((time) => {
    if (notes.length === 0) return;
    const n = notes[colIndex % notes.length];
    synth.triggerAttackRelease(n.notes, "8n", time);
    // Play AI notes if available
    // if (aiNotes.length > 0) {
    //   const aiNote = aiNotes[colIndex % aiNotes.length]
    //   synth.triggerAttackRelease(aiNote, '8n', time + 0.25) // Slight delay for layering
    // }
    colIndex++;
  }, "8n").start(0);

  // Start audio reactive updates
  setInterval(updateAudioLevels, 16); // ~60fps updates

  // Setup arcade controls
  setupArcadeControls();

  // Initialize collaboration features
  initCollaboration();

  // Initialize drag and drop functionality
  initDragAndDrop();

  // Initialize real-time preview controls
  initRealTimePreview();

  // Create 8-bit particles
  createParticles();

  console.log("setup end");
}

// Real-Time Preview Control Functions
function initRealTimePreview() {
  console.log("Initializing real-time preview controls...");

  // Get control elements
  const playBtn = document.getElementById('preview-play-btn');
  const pauseBtn = document.getElementById('preview-pause-btn');
  const stopBtn = document.getElementById('preview-stop-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const tempoSlider = document.getElementById('tempo-slider');
  const volumeValue = document.getElementById('volume-value');
  const tempoValue = document.getElementById('tempo-value');

  // Initialize visualizer
  visualizerCanvas = document.getElementById('visualizer-canvas');
  if (visualizerCanvas) {
    visualizerCtx = visualizerCanvas.getContext('2d');
  }

  // Play button
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isAudioStarted && !isPlaying) {
        Tone.Transport.start();
        isPlaying = true;
        playBtn.textContent = '⏸️ PAUSE';
        playBtn.style.background = 'radial-gradient(circle, #ffff00, #888800)';
        console.log('Preview started');
      }
    });
  }

  // Pause button
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (isPlaying) {
        Tone.Transport.pause();
        isPlaying = false;
        if (playBtn) {
          playBtn.textContent = '▶️ PLAY';
          playBtn.style.background = 'radial-gradient(circle, #00ff00, #008800)';
        }
        console.log('Preview paused');
      }
    });
  }

  // Stop button
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      Tone.Transport.stop();
      isPlaying = false;
      colIndex = 0; // Reset to beginning
      if (playBtn) {
        playBtn.textContent = '▶️ PLAY';
        playBtn.style.background = 'radial-gradient(circle, #00ff00, #008800)';
      }
      console.log('Preview stopped');
    });
  }

  // Volume control
  if (volumeSlider && volumeValue) {
    volumeSlider.addEventListener('input', (e) => {
      currentVolume = e.target.value / 100;
      Tone.Destination.volume.value = Tone.gainToDb(currentVolume);
      volumeValue.textContent = e.target.value;
    });
  }

  // Tempo control
  if (tempoSlider && tempoValue) {
    tempoSlider.addEventListener('input', (e) => {
      currentTempo = parseInt(e.target.value);
      Tone.Transport.bpm.value = currentTempo;
      tempoValue.textContent = currentTempo;
    });
  }

  // Start visualizer
  startVisualizer();
}

function startVisualizer() {
  if (!visualizerCtx || !analyser) return;

  function draw() {
    if (!isPlaying) {
      // Clear canvas when not playing
      visualizerCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      visualizerCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
      animationId = requestAnimationFrame(draw);
      return;
    }

    // Get frequency data
    const bufferLength = analyser.size;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    visualizerCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    visualizerCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    // Draw frequency bars
    const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * visualizerCanvas.height;

      // Create gradient based on frequency
      const gradient = visualizerCtx.createLinearGradient(0, visualizerCanvas.height - barHeight, 0, visualizerCanvas.height);
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(0.5, '#ffff00');
      gradient.addColorStop(1, '#ff0000');

      visualizerCtx.fillStyle = gradient;
      visualizerCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    animationId = requestAnimationFrame(draw);
  }

  draw();
}

function stopVisualizer() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
}

function setupArcadeControls() {
  // PRESS START banner click
  const pressStartBanner = select("#pressStartBanner");
  pressStartBanner.mousePressed(() => {
    userStartAudio().then(() => {
      isAudioStarted = true;
      Tone.Transport.start();
      pressStartBanner.hide();
      // Start sound
      synth.triggerAttackRelease("G4", "4n");
    });
  });

  // Joystick interaction
  const joystick = select("#joystick");
  joystick.mousePressed(() => {
    if (isAudioStarted) {
      // Joystick sound effect
      synth.triggerAttackRelease("C4", "8n");
    }
  });

  // Arcade buttons
  const redBtn = select("#redBtn");
  const blueBtn = select("#blueBtn");
  const yellowBtn = select("#yellowBtn");
  const greenBtn = select("#greenBtn");

  redBtn.mousePressed(() => {
    if (isAudioStarted) {
      synth.triggerAttackRelease("E4", "8n");
      // Could trigger different effects
    }
  });

  blueBtn.mousePressed(() => {
    if (isAudioStarted) {
      synth.triggerAttackRelease("G4", "8n");
      // Could trigger different effects
    }
  });

  yellowBtn.mousePressed(() => {
    if (isAudioStarted) {
      synth.triggerAttackRelease("A4", "8n");
      // Could trigger different effects
    }
  });

  greenBtn.mousePressed(() => {
    if (isAudioStarted) {
      synth.triggerAttackRelease("C5", "8n");
      // Could trigger different effects
    }
  });

  // Hidden UI panel (for advanced controls)
  let uploadInput = select("#imageUpload");
  uploadInput.changed(handleFile);

  let playBtn = select("#playBtn");
  playBtn.mousePressed(() => {
    userStartAudio().then(() => {
      isAudioStarted = true;
      Tone.Transport.start();
      select("#ui").hide();
      synth.triggerAttackRelease("G4", "4n");
    });
  });

  let pauseBtn = select("#pauseBtn");
  pauseBtn.mousePressed(() => {
    Tone.Transport.pause();
    if (isAudioStarted) synth.triggerAttackRelease("A3", "4n");
  });

  let testBtn = select("#testBtn");
  testBtn.mousePressed(() => {
    runTests();
  });

  // MIDI Export functionality
  const exportMidiBtn = select("#export-midi-btn");
  exportMidiBtn.mousePressed(() => {
    exportMultiTrackMidi();
  });
}

function exportMultiTrackMidi() {
  // Get selected tracks
  const tracks = [];
  if (select("#track-melody").elt.checked) tracks.push("melody");
  if (select("#track-harmony").elt.checked) tracks.push("harmony");
  if (select("#track-percussion").elt.checked) tracks.push("percussion");
  if (select("#track-bass").elt.checked) tracks.push("bass");

  if (tracks.length === 0) {
    alert("Please select at least one track!");
    return;
  }

  // Get parameters
  const bpm = parseInt(select("#midi-bpm").value());
  const duration = parseInt(select("#midi-duration").value());
  const aiMode = select("#ai-mode").elt.checked;

  // Get current image path (assuming it's the uploaded image or default)
  const imagePath = "assets/default-image.png"; // TODO: Get actual uploaded image path

  console.log("🎼 Exporting multi-track MIDI...");
  console.log("Tracks:", tracks);
  console.log("BPM:", bpm, "Duration:", duration);
  console.log("AI Mode:", aiMode);

  // Call the server API
  fetch("/api/analyze-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imagePath: imagePath,
      tracks: tracks,
      bpm: bpm,
      duration: duration,
      aiMode: aiMode,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error("MIDI export failed:", data.error);
        alert("MIDI export failed: " + data.error);
      } else {
        console.log("✅ MIDI exported successfully:", data);
        alert(
          `🎼 Multi-track MIDI exported!\nTracks: ${tracks.join(", ")}\nFile: ${
            data.outputFile
          }`
        );
      }
    })
    .catch((error) => {
      console.error("Network error:", error);
      alert("Network error during MIDI export");
    });
}

// Social Features - Real-time Collaboration
let socket;
let currentRoomId = null;
let isConnected = false;

function initCollaboration() {
  // Initialize Socket.IO connection
  socket = io();

  // Connection events
  socket.on("connect", () => {
    console.log("👥 Connected to collaboration server");
    isConnected = true;
  });

  socket.on("disconnect", () => {
    console.log("👥 Disconnected from collaboration server");
    isConnected = false;
    updateCollaborationUI(false);
  });

  // Collaboration events
  socket.on("user-joined", (data) => {
    addChatMessage(`👥 ${data.message}`, "system");
  });

  socket.on("midi-param-update", (data) => {
    // Update local MIDI parameters from remote user
    console.log("🎛️ Remote MIDI param update:", data);
    // Could update local controls here
  });

  socket.on("new-message", (data) => {
    addChatMessage(`${data.userId}: ${data.message}`, "user");
  });

  socket.on("image-shared", (data) => {
    addChatMessage(`🖼️ New image shared by ${data.userId}`, "system");
    console.log("📸 Shared image data:", data);
  });

  // Setup UI event listeners
  setupCollaborationUI();
}

function setupCollaborationUI() {
  const joinBtn = select("#join-session-btn");
  const leaveBtn = select("#leave-session-btn");
  const sessionInput = select("#session-id");
  const chatInput = select("#chat-input");
  const sendChatBtn = select("#send-chat-btn");
  const shareVaultBtn = select("#share-to-vault-btn");
  const browseVaultBtn = select("#browse-vault-btn");

  joinBtn.mousePressed(() => {
    const roomId = sessionInput.value().trim();
    if (roomId && isConnected) {
      joinCollaborationSession(roomId);
    } else {
      alert("Please enter a session ID and ensure connection");
    }
  });

  leaveBtn.mousePressed(() => {
    leaveCollaborationSession();
  });

  sendChatBtn.mousePressed(() => {
    sendChatMessage();
  });

  chatInput.elt.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  });

  shareVaultBtn.mousePressed(() => {
    shareToLootVault();
  });

  browseVaultBtn.mousePressed(() => {
    browseLootVault();
  });
}

function joinCollaborationSession(roomId) {
  currentRoomId = roomId;
  socket.emit("join-room", roomId);
  updateCollaborationUI(true);
  addChatMessage(`🔗 Joined collaboration session: ${roomId}`, "system");
}

function leaveCollaborationSession() {
  if (currentRoomId) {
    socket.emit("leave-room", currentRoomId);
    currentRoomId = null;
    updateCollaborationUI(false);
    addChatMessage("❌ Left collaboration session", "system");
  }
}

function updateCollaborationUI(connected) {
  const joinBtn = select("#join-session-btn");
  const leaveBtn = select("#leave-session-btn");
  const chatContainer = select(".chat-container");

  if (connected) {
    joinBtn.hide();
    leaveBtn.show();
    chatContainer.show();
  } else {
    joinBtn.show();
    leaveBtn.hide();
    chatContainer.hide();
  }
}

function sendChatMessage() {
  const chatInput = select("#chat-input");
  const message = chatInput.value().trim();

  if (message && currentRoomId) {
    socket.emit("chat-message", {
      roomId: currentRoomId,
      message: message,
    });
    addChatMessage(`You: ${message}`, "self");
    chatInput.value("");
  }
}

function addChatMessage(message, type = "user") {
  const chatMessages = select("#chat-messages");
  const messageDiv = createElement("div", message);

  if (type === "system") {
    messageDiv.style("color", "#00ff00");
    messageDiv.style("font-weight", "bold");
  } else if (type === "self") {
    messageDiv.style("color", "#ffaa00");
  }

  chatMessages.elt.appendChild(messageDiv.elt);
  chatMessages.elt.scrollTop = chatMessages.elt.scrollHeight;
}

function shareToLootVault() {
  const title = prompt("Enter a title for your MIDI creation:");
  const description = prompt("Enter a description (optional):");
  const tags = prompt("Enter tags (comma-separated, optional):")
    ?.split(",")
    .map((t) => t.trim()) || [];

  if (!title) {
    alert("Title is required!");
    return;
  }

  fetch("/api/loot-vault/share", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      midiFile: "output.mid",
      title: title,
      description: description,
      tags: tags,
      creator: "Hyper Vibe User",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Failed to share to loot vault: " + data.error);
      } else {
        alert("🎉 Successfully shared to loot vault!");
        addChatMessage(`🎁 Shared "${title}" to loot vault`, "system");
      }
    })
    .catch((error) => {
      console.error("Loot vault error:", error);
      alert("Network error sharing to loot vault");
    });
}

function browseLootVault() {
  fetch("/api/loot-vault")
    .then((response) => response.json())
    .then((data) => {
      if (data.loot && data.loot.length > 0) {
        let vaultContent = "🏆 LOOT VAULT TREASURES 🏆\n\n";
        data.loot.forEach((item) => {
          vaultContent += `🎵 ${item.title}\n`;
          vaultContent += `   By: ${item.creator}\n`;
          vaultContent += `   Downloads: ${item.downloads}\n`;
          if (item.tags.length > 0) {
            vaultContent += `   Tags: ${item.tags.join(", ")}\n`;
          }
          vaultContent += "\n";
        });
        alert(vaultContent);
      } else {
        alert("🏆 Loot vault is empty! Be the first to share your creation!");
      }
    })
    .catch((error) => {
      console.error("Loot vault error:", error);
      alert("Failed to browse loot vault");
    });
}
  const particlesContainer = document.getElementById("particles");

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 3 + "s";
    particlesContainer.appendChild(particle);
  }
}

// Audio reactive functions
function updateAudioLevels() {
  if (analyser && isAudioStarted) {
    // Get frequency data for visualization
    const freqData = analyser.getValue();
    audioLevel = 0;

    // Calculate average amplitude
    for (let i = 0; i < freqData.length; i++) {
      audioLevel += Math.abs(freqData[i]);
    }
    audioLevel = audioLevel / freqData.length;

    // Detect beats (simplified)
    const currentTime = millis();
    if (audioLevel > 0.3 && currentTime - lastBeatTime > 200) {
      lastBeatTime = currentTime;
      onBeatDetected();
    }

    // Update global audio level for bg-anim.js
    window.currentAudioLevel = audioLevel;
  }
}

function onBeatDetected() {
  // Trigger visual beat effects
  triggerBeatEffect();
}

function triggerBeatEffect() {
  // Add beat flash effect
  const body = document.body;
  body.style.filter = "brightness(1.3) saturate(1.2)";
  setTimeout(() => {
    body.style.filter = "none";
  }, 100);
}

function draw() {
  // Clear background with solid black
  background(0, 0, 0); // Pure black background

  // Draw the image in the center
  push();
  translate(width / 2, height / 2);
  const s = min(200 / img.width, 200 / img.height);
  image(img, 0, 0, img.width * s, img.height * s);

  // Display crest
  if (crest) {
    image(crest, -100, -100, 40, 40);
  }
  pop();

  // Draw arcade-style UI elements
  drawArcadeUI();

  // Update particles
  updateParticles();
}

function drawNeonGrid() {
  // Disabled for solid black background
  // This function is no longer called to maintain pure black background
}

function drawArcadeUI() {
  // Draw some retro-style elements
  fill(0, 255, 0, 100);
  noStroke();
  textAlign(CENTER);
  textSize(12);
  text("HYPERFOCUS ZONE", width / 2, 30);

  // Draw corner brackets for retro feel
  stroke(0, 255, 0);
  strokeWeight(2);
  noFill();

  // Top-left corner
  line(10, 10, 30, 10);
  line(10, 10, 10, 30);

  // Top-right corner
  line(width - 30, 10, width - 10, 10);
  line(width - 10, 10, width - 10, 30);

  // Bottom-left corner
  line(10, height - 30, 10, height - 10);
  line(10, height - 10, 30, height - 10);

  // Bottom-right corner
  line(width - 30, height - 10, width - 10, height - 10);
  line(width - 10, height - 30, width - 10, height - 10);
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
    processUploadedFile(file);
  }
}

// Enhanced file processing function
function processUploadedFile(file) {
  // Show loading spinner
  const uploadText = document.getElementById('upload-text');
  const loadingSpinner = document.getElementById('loading-spinner');

  if (uploadText) uploadText.style.display = 'none';
  if (loadingSpinner) loadingSpinner.style.display = 'block';

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file!');
    // Hide loading spinner
    if (uploadText) uploadText.style.display = 'block';
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    return;
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB!');
    // Hide loading spinner
    if (uploadText) uploadText.style.display = 'block';
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    return;
  }

  img = loadImage(URL.createObjectURL(file), () => {
    extractNotesFromImage();
    colIndex = 0; // Reset loop

    // Generate mythic story for the uploaded image
    const imageAnalysis = analyzeImageForStory(img);
    const mythicStory = generateMythicStory(imageAnalysis);

    // Display the story in the lore div
    const loreDiv = select("#lore");
    if (loreDiv) {
      loreDiv.html(mythicStory);
      loreDiv.show(); // Make sure it's visible
    }

    // Update upload zone with success message
    updateUploadZone(`✅ ${file.name} loaded successfully!`, 'success');

    // Sound cue for upload
    if (isAudioStarted) synth.triggerAttackRelease("C5", "8n");

    // Hide loading spinner
    if (uploadText) uploadText.style.display = 'block';
    if (loadingSpinner) loadingSpinner.style.display = 'none';
  }, () => {
    // Error loading image
    updateUploadZone('❌ Failed to load image. Please try another file.', 'error');

    // Hide loading spinner on error
    if (uploadText) uploadText.style.display = 'block';
    if (loadingSpinner) loadingSpinner.style.display = 'none');
  });
}

// Update upload zone appearance
function updateUploadZone(message, type = 'normal') {
  const uploadZone = document.getElementById('upload-zone');
  const uploadText = uploadZone.querySelector('.upload-text');
  
  if (uploadText) {
    uploadText.textContent = message;
    
    // Reset classes
    uploadZone.classList.remove('success', 'error');
    
    if (type !== 'normal') {
      uploadZone.classList.add(type);
    }
  }
}

// Initialize drag and drop functionality
function initDragAndDrop() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('imageUpload');
  
  if (!uploadZone || !fileInput) return;
  
  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  // Highlight drop zone when item is dragged over it
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, unhighlight, false);
  });
  
  // Handle dropped files
  uploadZone.addEventListener('drop', handleDrop, false);
  
  // Handle click to browse
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Handle file input change
  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processUploadedFile(files[0]);
    }
  });
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight(e) {
  const uploadZone = document.getElementById('upload-zone');
  uploadZone.classList.add('dragover');
}

function unhighlight(e) {
  const uploadZone = document.getElementById('upload-zone');
  uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length > 0) {
    processUploadedFile(files[0]);
  }
}

function extractNotesFromImage() {
  img.loadPixels();
  const w = img.width;
  const h = img.height;
  const N = 16;

  notes = []; // Clear existing notes

  for (let i = 0; i < N; i++) {
    const x = Math.floor(map(i, 0, N - 1, 0, w - 1));
    let sum = 0;
    for (let y = 0; y < h; y += 6) {
      const idx = 4 * (y * w + x);
      const r = img.pixels[idx];
      const g = img.pixels[idx + 1];
      const b = img.pixels[idx + 2];
      const bright = (r + g + b) / 3;
      sum += bright;
    }
    const avg = sum / (h / 6);
    const midi = Math.round(map(avg, 0, 255, 48, 84));
    const chord = [midi, midi + 4, midi + 7].map((m) =>
      Tone.Midi(m).toFrequency()
    );
    notes.push({ midi, notes: chord });
  }
}
