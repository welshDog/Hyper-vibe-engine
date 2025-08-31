# Hyper Vibe Discord Bot

A Discord bot that integrates with the Hyper Vibe Engine to post title screens and share mythic vibes.

## Setup

1. Create a Discord bot at https://discord.com/developers/applications
2. Copy the bot token
3. Set environment variable: `DISCORD_TOKEN=your_token_here`
4. Install dependencies: `npm install`
5. Run: `npm start`

## Commands

- `!vibe` - Generates and posts a title screen with the current story

## Integration

The bot runs a web server that can be queried for vibe data:

- GET `/vibe-data` - JSON with current story and image info
- GET `/title-screen` - PNG image of the title screen

## Features

- Dynamic title screen generation
- Story sharing
- Web API for external integration
- Ready for expansion with music playback
