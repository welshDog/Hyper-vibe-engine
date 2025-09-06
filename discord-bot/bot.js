const { Client, GatewayIntentBits, SlashCommandBuilder, REST } = require('discord.js')
const { Routes } = require('discord-api-types/v9')
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
const CLIENT_ID = process.env.DISCORD_CLIENT_ID // Add this to env
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

// Register slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('vibe')
    .setDescription('Generate a mythic vibe screen'),

  new SlashCommandBuilder()
    .setName('vibe_generate')
    .setDescription('Generate MIDI from an image URL')
    .addStringOption(option =>
      option.setName('image_url')
        .setDescription('URL of the image to convert to MIDI')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('vibe_help')
    .setDescription('Show available vibe commands'),
]

// Register commands with Discord
const rest = new REST({ version: '9' }).setToken(TOKEN)

async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    )

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

// Discord slash command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  const { commandName } = interaction

  if (commandName === 'vibe') {
    try {
      const titleScreen = generateTitleScreenText()

      await interaction.reply({
        content: titleScreen,
      })
    } catch (error) {
      console.error(error)
      await interaction.reply('Error generating vibe screen!')
    }
  } else if (commandName === 'vibe_generate') {
    const imageUrl = interaction.options.getString('image_url')

    await interaction.reply(`🎵 Processing image from: ${imageUrl}\n*This feature is coming soon!*`)
  } else if (commandName === 'vibe_help') {
    const helpText = `
🎮 **Hyper Vibe Engine Commands** 🎮

**/vibe** - Generate a mythic vibe screen
**/vibe_generate** - Generate MIDI from an image URL
**/vibe_help** - Show this help message

*Upload images to the web interface at: http://localhost:3000*
    `.trim()

    await interaction.reply(helpText)
  }
})

// Legacy message handler for backward compatibility
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

client.once('ready', async () => {
  console.log('Hyper Vibe Bot is online!')
  await registerCommands()
})

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`)
})

client.login(TOKEN)
