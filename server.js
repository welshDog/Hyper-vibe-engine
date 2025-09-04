const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// API endpoint for MIDI files
app.get('/api/midi-files', (req, res) => {
  const midiDir = path.join(__dirname, '..');

  fs.readdir(midiDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }

    const midiFiles = files
      .filter(file => file.endsWith('.mid'))
      .map(file => {
        const filePath = path.join(midiDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created); // Sort by creation date, newest first

    res.json({ midiFiles });
  });
});

// API endpoint for image analysis
app.post('/api/analyze-image', (req, res) => {
  // This would integrate with the Python MIDI exporter
  // For now, return a placeholder response
  res.json({
    message: 'Image analysis endpoint ready',
    note: 'Integrate with Python MIDI exporter for full functionality'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hyper Vibe Engine server running on port ${PORT}`);
  console.log(`🌐 Open your browser to: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎵 MIDI files API: http://localhost:${PORT}/api/midi-files`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Hyper Vibe Engine server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Hyper Vibe Engine server...');
  process.exit(0);
});
