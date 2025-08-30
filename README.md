# 🎮 Vibe Coding Music Story Engine

> _“Turn images into soundtracks. Turn stories into portals.”_

Welcome to the Hyperfocus Zone’s retro-mythic engine for transforming pictures into music and scrolling story intros. This project fuses pixel art, procedural sound, and RPG-style text overlays into immersive vibe capsules — perfect for onboarding rituals, sponsor showcases, and squad celebration loops.

---

## 🧙‍♂️ PRESS START

- 🎨 Drop an image (pixel art, photo, logo).
- 🎼 Engine maps pixels → music notes.
- 📜 Story scrolls across the screen like an RPG intro.
- 🕹️ Result: a living title screen with sound, visuals, and myth.

---

## 🧩 Modules & Tech Stack

| Module                | Description                                | Tech Stack             | Status       |
|----------------------|--------------------------------------------|------------------------|--------------|
| Title Screen Engine   | Displays image + retro text overlay        | `p5.js`, `HTML/CSS`    | ✅ Working    |
| Pixel → Music Mapper  | Converts image brightness to synth notes   | `Tone.js`, `WebAudio`  | ✅ Working    |
| Scrolling Story Text  | Mythic narrative overlay                   | `p5.js` text engine    | ✅ Working    |
| AI Music Companion    | Mood-based accompaniment                   | `Magenta.js`           | 🔜 Next phase |
| Python MIDI Exporter  | DAW-ready stems from image data            | `Pillow`, `pretty_midi`| 🧪 Planning   |

---

## 🚀 Quick Start (Web Version)

1. Clone the repo:
   ```bash
   git clone https://github.com/hyperfocus-zone/vibe-engine.git
   cd vibe-engine
   ```

2. Open `index.html` in your browser (use Live Server in VS Code).

3. Replace the image URL in `preload()`:
   ```js
   img = loadImage('assets/your-image.png');
   ```

4. Customize the story text:
   ```js
   let story = "THE BROSKI KNIGHT AWAKENS FROM HYPERSLEEP...";
   ```

5. Hit **Go Live** → instant title screen with music + myth.

---

## 🎶 Music Mapping Logic

- Brightness of vertical pixel slices → MIDI notes.
- Notes mapped to chiptune-style chords (e.g. C major triads).
- Synth loop plays in sync with scrolling story.
- Optional: AI-generated riffs layered via Magenta.js.

---

## 📦 Folder Structure

```
vibe-engine/
├── index.html              # Main web prototype
├── js/
│   ├── vibe-mapper.js      # Pixel → music logic
│   └── story-scroll.js     # Text animation engine
├── assets/
│   └── default-image.png   # Placeholder image
├── .vscode/
│   └── settings.json       # Squad-synced editor config
├── LICENSE                 # MIT License
└── README.md               # This scroll
```

---

## 🧠 Squad Rituals & Use Cases

- **Onboarding Spell**: Each new squad member gets a vibe screen.
- **Visibility Crew**: TikTok-ready intros with music + myth.
- **Sponsor Capsules**: Showcase tech with branded title screens.
- **Remix Challenges**: Squad members remix each other’s vibes.

---

## 🔮 Future Upgrades

- 🎛️ Synth customization UI (scale, effects, tempo).
- 🧠 Magenta.js integration for intelligent accompaniment.
- 🎥 Export to video/GIF for social sharing.
- 🎹 Python MIDI exporter for DAW production.

---

## 🧙‍♀️ Contributing

We welcome devs, artists, and sound wizards. To contribute:

1. Fork the repo
2. Create a feature branch
3. Add your vibe module (new synth, animation, story format)
4. Submit a pull request with a short mythic changelog

---

## 💬 Squad Credits

- 🧠 Concept: Lyndon & the Hyperfocus Zone
- 🎨 Visuals: Squad pixel artists
- 🎼 Sound: Tone.js + Magenta.js
- 🧪 Engineering: Mythic coders of the Zone

---

## 🗺️ License

MIT — remix, share, and celebrate freely.

---

## 🔥 Call to Action

> _“Choose your vibe. Drop your image. Let the engine awaken your soundtrack.”_

Ready to build your squad’s mythic intro? PRESS START.
