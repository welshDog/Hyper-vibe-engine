const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js')
const express = require('express')
const { createCanvas } = require('canvas')
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
  imagePath: path.join(__dirname, 'assets', 'default-image.png'),
}

// Generate title screen image
function generateTitleScreen() {
  const canvas = createCanvas(800, 600)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 800, 600)

  // Title
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 48px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText('HYPERFOCUS ZONE', 400, 150)
  ctx.fillText('VIBE ENGINE', 400, 220)

  // Story
  ctx.font = '20px Courier New'
  ctx.textAlign = 'left'
  ctx.fillText(mockVibeData.story, 50, 550)

  return canvas.toBuffer()
}

// Discord commands
client.on('messageCreate', async (message) => {
  if (message.author.bot) return

  if (message.content === '!vibe') {
    try {
      const imageBuffer = generateTitleScreen()
      const attachment = new AttachmentBuilder(imageBuffer, {
        name: 'vibe-title.png',
      })

      await message.reply({
        content:
          '🎮 **HYPER VIBE ENGINE ACTIVATED** 🎮\n*Pixel → Music → Myth*\n\n' +
          mockVibeData.story,
        files: [attachment],
      })
    } catch (error) {
      console.error(error)
      message.reply('Error generating vibe screen!')
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
