# 🤖 Hyper Vibe Discord Bot

> _"Share the myth. Spread the vibe. Join the ritual."_

A Discord bot that integrates with the **Hyper Vibe Engine** to share vibe screens, MIDI files, and mythic stories with your squad.

---

## 🎯 Features

- **📸 Vibe Sharing**: Post generated vibe screens with pixel-to-music conversion
- **🎼 MIDI Export**: Share MIDI files for DAW integration
- **📖 Story Integration**: Display current mythic narratives
- **🌐 Web API**: REST endpoints for external integrations
- **⚡ Real-time Updates**: Live vibe generation and sharing

---

## 🚀 Quick Setup

### **1. Create Discord Bot**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it "Hyper Vibe Bot"
3. Go to "Bot" section and click "Add Bot"
4. Copy the bot token (keep this secret!)

### **2. Environment Setup**
```bash
# Set your Discord bot token
$env:DISCORD_TOKEN = "your_bot_token_here"

# Or create a .env file
echo "DISCORD_TOKEN=your_bot_token_here" > .env
```

### **3. Install & Run**
```bash
cd discord-bot
npm install
node bot.js
```

### **4. Invite Bot to Server**
1. In Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Select scopes: `bot` and `applications.commands`
3. Select permissions: `Send Messages`, `Attach Files`, `Use Slash Commands`
4. Use the generated URL to invite the bot to your server

---

## 💬 Commands

### **Slash Commands**
- `/vibe` - Generate and share a new vibe screen
- `/midi` - Export and share MIDI file from current vibe
- `/story` - Display the current mythic narrative
- `/help` - Show available commands

### **Legacy Commands** (still supported)
- `!vibe` - Generate vibe screen
- `!midi` - Export MIDI file

---

## 🌐 Web API

The bot runs a local web server for integration with the main Hyper Vibe Engine:

### **Endpoints**
```
GET  /health         # Health check
GET  /vibe-data      # Current vibe JSON data
GET  /title-screen   # PNG image of title screen
POST /share-vibe     # Share vibe to Discord channel
```

### **Example Usage**
```bash
# Health check
curl http://localhost:3001/health

# Get vibe data
curl http://localhost:3001/vibe-data

# Download title screen
curl http://localhost:3001/title-screen -o vibe.png
```

---

## 🛠️ Development

### **Local Development**
```bash
cd discord-bot

# Install dependencies
npm install

# Run with auto-restart (development)
npm run dev

# Run production
npm start

# Lint code
npm run lint
```

### **Environment Variables**
```env
DISCORD_TOKEN=your_bot_token_here
NODE_ENV=development
PORT=3001
```

### **Bot Permissions**
The bot needs these Discord permissions:
- Send Messages
- Attach Files
- Use Slash Commands
- Embed Links
- Read Message History

---

## 🧩 Architecture

```
discord-bot/
├── bot.js           # Main bot logic and commands
├── package.json     # Dependencies and scripts
├── .env.example     # Environment template
└── README.md        # This file
```

### **Key Components**
- **Command Handler**: Processes Discord slash commands
- **File Generator**: Creates vibe screens and MIDI exports
- **Web Server**: Express.js API for external integration
- **Error Handler**: Graceful error handling and logging

---

## 🔧 Configuration

### **Bot Settings**
```javascript
const config = {
  token: process.env.DISCORD_TOKEN,
  port: process.env.PORT || 3001,
  prefix: '!',
  maxFileSize: 8 * 1024 * 1024, // 8MB
};
```

### **Integration Settings**
- **Main Engine URL**: `http://localhost:3000`
- **MIDI Export Path**: `./exports/`
- **Image Quality**: High (for crisp vibe screens)

---

## 🐛 Troubleshooting

### **Bot Not Responding**
- Check Discord token is correct
- Verify bot has proper permissions in server
- Check console for error messages

### **File Upload Issues**
- Ensure bot has "Attach Files" permission
- Check file size limits (Discord: 8MB)
- Verify export directory permissions

### **API Connection Issues**
- Check main engine is running on port 3000
- Verify network connectivity
- Check firewall settings

---

## 📊 Monitoring

- **Uptime**: Bot health checks every 5 minutes
- **Command Usage**: Track popular commands
- **Error Rate**: Monitor failed operations
- **File Generation**: Track export success rates

---

## 🔮 Future Features

- **🎵 Audio Playback**: Stream generated music in voice channels
- **🎨 Custom Themes**: User-selectable vibe styles
- **📊 Analytics**: Vibe generation statistics
- **🤖 AI Integration**: AI-powered story generation
- **🌍 Multi-server**: Support for multiple Discord servers

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

See main `CONTRIBUTING.md` for detailed guidelines.

---

## 📄 License

MIT License - See main project LICENSE file.

---

## 🎮 Ready to Bot?

> _"Your vibe awaits. Your squad is calling. PRESS START."_

Invite the bot to your server and start sharing some mythic vibes! ⚡
