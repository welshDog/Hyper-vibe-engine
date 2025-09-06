const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// API endpoint for MIDI files
app.get("/api/midi-files", (req, res) => {
  const midiDir = path.join(__dirname, "..");

  fs.readdir(midiDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read directory" });
    }

    const midiFiles = files
      .filter((file) => file.endsWith(".mid"))
      .map((file) => {
        const filePath = path.join(midiDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      })
      .sort((a, b) => b.created - a.created); // Sort by creation date, newest first

    res.json({ midiFiles });
  });
});

// API endpoint for image analysis and MIDI export
app.post("/api/analyze-image", (req, res) => {
  const {
    imagePath,
    tracks = ["melody", "harmony", "percussion", "bass"],
    bpm = 60,
    duration = 8,
    aiMode = false,
  } = req.body;

  if (!imagePath) {
    return res.status(400).json({ error: "Image path is required" });
  }

  // Build Python command for multi-track MIDI export
  const aiFlag = aiMode ? "--ai-mode" : "";
  const pythonCmd = `python python/midi_exporter.py "${imagePath}" -o "output.mid" -b ${bpm} -d ${duration} -t ${tracks.join(
    " "
  )} ${aiFlag}`;

  console.log("🎼 Executing MIDI export command:", pythonCmd);

  exec(pythonCmd, (error, stdout, stderr) => {
    if (error) {
      console.error("MIDI export error:", error);
      return res.status(500).json({
        error: "Failed to export MIDI",
        details: error.message,
      });
    }

    if (stderr) {
      console.warn("MIDI export warnings:", stderr);
    }

    console.log("MIDI export output:", stdout);

    res.json({
      message: aiMode
        ? "AI-enhanced multi-track MIDI exported successfully"
        : "Multi-track MIDI exported successfully",
      tracks: tracks,
      outputFile: "output.mid",
      bpm: bpm,
      duration: duration,
      aiMode: aiMode,
    });
  });
});

// Loot Vault API - Share and discover MIDI files
app.post("/api/loot-vault/share", (req, res) => {
  const { midiFile, title, description, tags = [], creator } = req.body;

  if (!midiFile || !title) {
    return res.status(400).json({ error: "MIDI file and title are required" });
  }

  // Create loot vault entry
  const lootEntry = {
    id: Date.now().toString(),
    midiFile,
    title,
    description: description || "",
    tags,
    creator: creator || "Anonymous",
    createdAt: new Date().toISOString(),
    downloads: 0,
    likes: 0,
  };

  // Save to a simple JSON file (in production, use a database)
  const vaultPath = path.join(__dirname, "loot-vault.json");
  let vault = [];

  try {
    if (fs.existsSync(vaultPath)) {
      vault = JSON.parse(fs.readFileSync(vaultPath, "utf8"));
    }
  } catch (error) {
    console.warn("Could not read loot vault file:", error);
  }

  vault.push(lootEntry);

  try {
    fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2));
    res.json({
      message: "MIDI file shared to loot vault successfully",
      lootId: lootEntry.id,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save to loot vault" });
  }
});

// Get loot vault contents
app.get("/api/loot-vault", (req, res) => {
  const vaultPath = path.join(__dirname, "loot-vault.json");

  try {
    if (fs.existsSync(vaultPath)) {
      const vault = JSON.parse(fs.readFileSync(vaultPath, "utf8"));
      res.json({ loot: vault });
    } else {
      res.json({ loot: [] });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to read loot vault" });
  }
});

// Download from loot vault
app.get("/api/loot-vault/download/:id", (req, res) => {
  const vaultPath = path.join(__dirname, "loot-vault.json");
  const lootId = req.params.id;

  try {
    if (fs.existsSync(vaultPath)) {
      const vault = JSON.parse(fs.readFileSync(vaultPath, "utf8"));
      const lootItem = vault.find((item) => item.id === lootId);

      if (lootItem && fs.existsSync(lootItem.midiFile)) {
        // Increment download count
        lootItem.downloads++;
        fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2));

        res.download(lootItem.midiFile);
      } else {
        res.status(404).json({ error: "Loot item not found" });
      }
    } else {
      res.status(404).json({ error: "Loot vault not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to download from loot vault" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// WebSocket connection handling for real-time collaboration
io.on("connection", (socket) => {
  console.log("👥 New collaborator connected:", socket.id);

  // Join a collaboration room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.id} joined room: ${roomId}`);

    // Notify others in the room
    socket.to(roomId).emit("user-joined", {
      userId: socket.id,
      message: "A new collaborator has joined the session!",
    });
  });

  // Handle real-time MIDI parameter changes
  socket.on("midi-param-change", (data) => {
    // Broadcast to all users in the same room
    socket.to(data.roomId).emit("midi-param-update", {
      userId: socket.id,
      param: data.param,
      value: data.value,
    });
  });

  // Handle chat messages
  socket.on("chat-message", (data) => {
    socket.to(data.roomId).emit("new-message", {
      userId: socket.id,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle image sharing
  socket.on("share-image", (data) => {
    socket.to(data.roomId).emit("image-shared", {
      userId: socket.id,
      imageData: data.imageData,
      analysis: data.analysis,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("👥 Collaborator disconnected:", socket.id);
  });
});

// Start server with WebSocket support
server.listen(PORT, () => {
  console.log(`🚀 Hyper Vibe Engine server running on port ${PORT}`);
  console.log(`🌐 Open your browser to: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎵 MIDI files API: http://localhost:${PORT}/api/midi-files`);
  console.log(`👥 Real-time collaboration enabled via WebSocket`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down Hyper Vibe Engine server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down Hyper Vibe Engine server...");
  process.exit(0);
});
