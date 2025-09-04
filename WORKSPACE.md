# 🏗️ Hyper Vibe Engine Development Workspace

> _"Your mythic development portal. PRESS START."_

This workspace is optimized for developing the **Hyper Vibe Engine** — a creative tool that transforms images into music and mythic stories through pixel-to-synth conversion.

---

## 🎯 What's Included

### **Core Components**
- **🖥️ Web Interface**: p5.js arcade-style interface with real-time pixel-to-music conversion
- **🎼 Audio Engine**: Tone.js synthesizer with chiptune-style sound generation
- **🐍 Python MIDI Exporter**: Professional MIDI file generation for DAW workflows
- **🤖 Discord Bot**: Squad ritual sharing of vibe screens and MIDI files
- **🌐 Express Server**: REST API for file serving and MIDI processing

### **Tech Stack**
- **Frontend**: HTML5 Canvas, p5.js, Tone.js, Web Audio API
- **Backend**: Node.js 24.6.0, Express.js, REST API
- **Python**: Python 3.12, pretty_midi, Pillow, mypy
- **Bot**: discord.js for Discord integration
- **Dev Tools**: VS Code, Live Server, Prettier, Git

---

## 🚀 Quick Start

### **1. Environment Setup**
```bash
# Clone the repository
git clone https://github.com/welshDog/hyper-vibe-engine.git
cd hyper-vibe-engine

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r python/requirements.txt
```

### **2. Start Development Server**
```bash
# Start Express server (recommended)
npm run server

# Or use development mode with auto-restart
npm run dev
```

### **3. Open in Browser**
- Navigate to `http://localhost:3000`
- Upload an image to generate your vibe
- Export MIDI files for DAW integration

### **4. Test Python MIDI Export**
```bash
# Health check
python python/midi_exporter.py assets/default-image.png -o health_check.mid

# Export with custom settings
python python/midi_exporter.py your-image.png -i 56 -b 140 -o custom.mid
```

### **5. Discord Bot Setup** (Optional)
```bash
cd discord-bot
npm install
# Set DISCORD_TOKEN environment variable
node bot.js
```

---

## 🛠️ Development Workflow

### **Web Development**
1. **Edit Files**: Modify `js/vibe-mapper.js` for core logic
2. **Test Interface**: Use `index.html` or Express server
3. **Hot Reload**: Changes auto-refresh in browser
4. **Debug**: Use browser DevTools for Web Audio debugging

### **Python Development**
1. **Type Check**: `mypy python/midi_exporter.py`
2. **Test Export**: Run with sample images
3. **Debug**: Use Python debugger for MIDI generation issues

### **Server Development**
1. **API Testing**: Use Postman or curl for `/api/midi-files`
2. **File Serving**: Test static asset delivery
3. **Error Handling**: Check server logs for issues

### **Bot Development**
1. **Local Testing**: Use Discord Developer Portal for testing
2. **Commands**: Test `!vibe` and `!midi` commands
3. **Integration**: Verify file upload/sharing functionality

---

## 📁 Project Structure

```
hyper-vibe-engine/
├── server.js              # 🚀 Express.js web server
├── index.html             # 🎮 Main arcade interface
├── package.json           # 📦 Node.js dependencies & scripts
├── js/                    # 🎨 Web interface scripts
│   ├── vibe-mapper.js     # 🎼 Pixel-to-music conversion
│   ├── story-scroll.js    # 📖 Mythic story overlay
│   └── test.js            # 🧪 Testing utilities
├── python/                # 🐍 MIDI export tools
│   ├── midi_exporter.py   # 🎵 Professional MIDI export
│   └── requirements.txt   # 📦 Python dependencies
├── discord-bot/           # 🤖 Discord integration
│   └── bot.js             # 💬 Bot commands & logic
├── assets/                # 🎨 Sample images & resources
│   ├── default-image.png  # 🖼️ Default test image
│   └── hyperfocus-crest.png # 🏆 Project logo
├── pretty_midi/           # 📝 Custom type stubs
└── docs/                  # 📚 Documentation
```

---

## 🔧 VS Code Extensions

### **Recommended Extensions**
- **Live Server**: Hot-reload web development
- **Prettier**: Code formatting
- **Python**: Python language support
- **Pylance**: Python type checking
- **GitLens**: Advanced Git features
- **Auto Rename Tag**: HTML tag synchronization

### **Optional Extensions**
- **Discord Bot Maker**: Bot development tools
- **Web Audio Editor**: Audio debugging
- **Image Preview**: Asset management

---

## 🎯 Development Commands

### **Server Commands**
```bash
npm run server    # Start production server
npm run dev       # Development with auto-restart
npm test          # Run tests
```

### **Python Commands**
```bash
cd python
mypy midi_exporter.py              # Type checking
python midi_exporter.py --help     # Show usage
python midi_exporter.py image.png  # Export MIDI
```

### **Git Commands**
```bash
git checkout -b feature/my-feature  # Create feature branch
git add .                          # Stage changes
git commit -m "✨ Add feature"      # Commit with emoji
git push origin feature/my-feature # Push branch
```

---

## 🐛 Debugging & Troubleshooting

### **Web Interface Issues**
- Check browser console for Web Audio errors
- Verify p5.js canvas initialization
- Test Tone.js audio context

### **Python Issues**
- Run `mypy` for type errors
- Check PIL/Pillow installation
- Verify MIDI file generation

### **Server Issues**
- Check port 3000 availability
- Verify file permissions
- Test API endpoints with curl

### **Bot Issues**
- Verify Discord token configuration
- Check bot permissions in server
- Test commands in private messages

---

## 📊 Performance Monitoring

- **Web Vitals**: Monitor Core Web Vitals in browser
- **Audio Latency**: Test Web Audio API performance
- **MIDI Export**: Time Python script execution
- **Memory Usage**: Monitor browser memory for large images

---

## 🤝 Contributing

See `CONTRIBUTING.md` for detailed contribution guidelines and squad rituals.

---

## 🎮 Ready to Vibe?

> _"Code the myth. Ship the legend. Join the squad."_

Your development portal is ready. Start the engine and create some vibes! ⚡
