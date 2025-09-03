// Simple test suite for Hyperfocus Vibe Engine
// Run in browser console after page loads

function testExtractNotesFromImage() {
  console.log('Testing extractNotesFromImage...');
  // Mock img with pixels
  let mockImg = {
    width: 16,
    height: 10,
    pixels: new Uint8ClampedArray(16 * 10 * 4)
  };
  // Fill with some colors
  for (let i = 0; i < mockImg.pixels.length; i += 4) {
    mockImg.pixels[i] = Math.random() * 255; // R
    mockImg.pixels[i + 1] = Math.random() * 255; // G
    mockImg.pixels[i + 2] = Math.random() * 255; // B
    mockImg.pixels[i + 3] = 255; // A
  }
  mockImg.loadPixels = function() {}; // Mock
  // Temporarily replace img
  let originalImg = img;
  img = mockImg;
  extractNotesFromImage();
  console.log('Notes extracted:', notes.length);
  assert(notes.length === 16, 'Should extract 16 notes');
  img = originalImg;
  console.log('✅ extractNotesFromImage test passed');
}

function assert(condition, message) {
  if (!condition) {
    console.error('❌ Assertion failed:', message);
  } else {
    console.log('✅', message);
  }
}

function runTests() {
  console.log('🧪 Running Vibe Engine Tests...');
  testExtractNotesFromImage();
  console.log('🎉 All tests completed!');
}

// Call runTests() in console to run
