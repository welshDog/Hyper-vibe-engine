const { Client, GatewayIntentBits } = require('discord.js')
const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const TOKEN = process.env.DISCORD_TOKEN // Set your bot token in env
const PORT = process.env.PORT || 3000

// Mock vibe data (in real implementation, integrate with the web app)
const mockVibeData = {
  story: 'THE BROSKI KNIGHT AWAKENS FROM HYPERSLEEP...',
  imagePath: path.join(__dirname, '..', 'assets', 'default-image.png'),
}

// Generate title screen text (no canvas needed)
function generateTitleScreenText() {
  return `
🎮 **HYPERFOCUS ZONE** 🎮
⚔️ **VIBE ENGINE ACTIVATED** ⚔️

${mockVibeData.story}

🖼️ *Pixel → Music → Myth*
🎵 *Upload images to generate MIDI vibes*
  `.trim()
}

// Discord commands
client.on('messageCreate', async (message) => {
  if (message.author.bot) return

  if (message.content === '!vibe') {
    try {
      const titleScreen = generateTitleScreenText()

      await message.reply({
        content: titleScreen,
      })
    } catch (error) {
      console.error(error)
      message.reply('Error generating vibe screen!')
    }
  }

  if (message.content === '!midi') {
    try {
      // List available MIDI files
      const midiFiles = fs.readdirSync(path.join(__dirname, '..'))
        .filter(file => file.endsWith('.mid'))
        .slice(-5) // Get last 5 files

      const midiList = midiFiles.length > 0
        ? midiFiles.map(file => `🎵 ${file}`).join('\n')
        : 'No MIDI files found yet!'

      await message.reply({
        content: `🎼 **Latest MIDI Files:**\n${midiList}\n\nUse \`!vibe\` to generate new vibes!`,
      })
    } catch (error) {
      console.error(error)
      message.reply('Error listing MIDI files!')
    }
  }
})

// Web server for integration
app.get('/vibe-data', (req, res) => {
  res.json(mockVibeData)
})

app.get('/title-screen', (req, res) => {
  const imageBuffer = generateTitleScreen()
  res.set('Content-Type', 'image/png')
  res.send(imageBuffer)
})

client.once('ready', () => {
  console.log('Hyper Vibe Bot is online!')
})

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`)
})

client.login(TOKEN)
