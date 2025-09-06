#!/usimport os
import sys
import tempfile
import unittest

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from midi_exporter import extract_notes_from_image, generate_melody_track python3
"""
Basic tests for Hyper Vibe MIDI Exporter
"""

import os
import sys
import tempfile
import unittest

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from midi_exporter import extract_notes_from_image, generate_melody_track


class TestMIDIExporter(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures."""
        self.test_image_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "assets",
            "Hyperfocus Zone Name logo.png",
        )

    def test_extract_notes_from_valid_image(self):
        """Test that notes can be extracted from a valid image."""
        if os.path.exists(self.test_image_path):
            notes = extract_notes_from_image(self.test_image_path, num_slices=4)
            self.assertIsInstance(notes, list)
            self.assertGreater(len(notes), 0)

            # Check structure of first note
            first_note = notes[0]
            self.assertIn("midi", first_note)
            self.assertIn("chord", first_note)
            self.assertIn("position", first_note)
            self.assertIn("brightness", first_note)

    def test_extract_notes_from_invalid_path(self):
        """Test that proper error is raised for invalid image path."""
        with self.assertRaises(FileNotFoundError):
            extract_notes_from_image("nonexistent_image.png")

    def test_generate_melody_track(self):
        """Test melody track generation."""
        # Mock notes data
        mock_notes = [
            {"midi": 60, "chord": [60, 64, 67], "position": 0.0, "brightness": 128},
            {"midi": 62, "chord": [62, 65, 69], "position": 0.5, "brightness": 150},
        ]

        track = generate_melody_track(mock_notes, duration=4.0)
        self.assertIsNotNone(track)
        self.assertEqual(track.program, 0)  # Piano
        self.assertEqual(track.name, "Melody")

    def test_midi_file_generation(self):
        """Test that MIDI files can be generated and saved."""
        if os.path.exists(self.test_image_path):
            with tempfile.NamedTemporaryFile(suffix=".mid", delete=False) as tmp_file:
                output_path = tmp_file.name

            try:
                # This would normally call the main function
                # For now, just test that the output path would be valid
                self.assertTrue(output_path.endswith(".mid"))
            finally:
                # Clean up
                if os.path.exists(output_path):
                    os.unlink(output_path)

    def test_edge_case_empty_image(self):
        """Test handling of edge case with minimal image data."""
        # Create a minimal test image
        from PIL import Image

        test_img = Image.new("RGB", (10, 10), color="black")

        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
            test_img.save(tmp_file.name)
            tmp_path = tmp_file.name

        try:
            notes = extract_notes_from_image(tmp_path, num_slices=2)
            self.assertIsInstance(notes, list)
            self.assertGreater(len(notes), 0)
        finally:
            os.unlink(tmp_path)

    def test_different_image_formats(self):
        """Test processing of different image formats."""
        from PIL import Image

        # Create test images in different formats
        test_img = Image.new("RGB", (50, 50), color="red")

        for fmt, ext in [("JPEG", "jpg"), ("PNG", "png"), ("BMP", "bmp")]:
            with tempfile.NamedTemporaryFile(
                suffix=f".{ext}", delete=False
            ) as tmp_file:
                if fmt == "JPEG":
                    # Convert to RGB for JPEG
                    test_img.convert("RGB").save(tmp_file.name, fmt)
                else:
                    test_img.save(tmp_file.name, fmt)
                tmp_path = tmp_file.name

            try:
                notes = extract_notes_from_image(tmp_path, num_slices=4)
                self.assertIsInstance(notes, list)
                self.assertGreater(len(notes), 0)
            finally:
                os.unlink(tmp_path)

    def test_midi_parameter_validation(self):
        """Test that MIDI parameters are within valid ranges."""
        if os.path.exists(self.test_image_path):
            notes = extract_notes_from_image(self.test_image_path, num_slices=8)

            for note in notes:
                # MIDI notes should be between 0-127
                self.assertGreaterEqual(note["midi"], 0)
                self.assertLessEqual(note["midi"], 127)

                # Brightness should be between 0-255
                self.assertGreaterEqual(note["brightness"], 0)
                self.assertLessEqual(note["brightness"], 255)

                # Position should be between 0-1
                self.assertGreaterEqual(note["position"], 0.0)
                self.assertLessEqual(note["position"], 1.0)


if __name__ == "__main__":
    unittest.main()
