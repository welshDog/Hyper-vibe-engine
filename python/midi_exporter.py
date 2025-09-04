#!/usr/bin/env python3
"""
Hyper Vibe MIDI Exporter
Exports pixel-derived notes from images to MIDI files for DAW production.
"""

import argparse
import sys
import os
from typing import List, Dict, Any
from PIL import Image  # type: ignore
import pretty_midi
import numpy as np


def extract_notes_from_image(image_path: str, num_slices: int = 16,
                           max_width: int = 1000) -> List[Dict[str, Any]]:
    """
    Extract MIDI notes from image brightness with enhanced error handling and performance optimization.

    Args:
        image_path: Path to the input image file
        num_slices: Number of vertical slices to analyze (default: 16)
        max_width: Maximum width to resize large images for performance (default: 1000)

    Returns:
        List of note dictionaries with MIDI data

    Raises:
        FileNotFoundError: If image file doesn't exist
        ValueError: If image cannot be processed
        OSError: If image format is unsupported
    """
    try:
        # Validate input file
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")

        if not os.path.isfile(image_path):
            raise ValueError(f"Path is not a file: {image_path}")

        # Check file extension
        valid_extensions = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.gif'}
        file_ext = os.path.splitext(image_path)[1].lower()
        if file_ext not in valid_extensions:
            print(f"Warning: Unsupported file extension {file_ext}. Attempting to load anyway...")

        # Load and process image
        print(f"Loading image: {image_path}")
        img = Image.open(image_path)

        # Get original dimensions
        orig_width, orig_height = img.size
        print(f"Original dimensions: {orig_width}x{orig_height}")

        # Performance optimization: resize large images
        if orig_width > max_width:
            aspect_ratio = orig_height / orig_width
            new_width = max_width
            new_height = int(new_width * aspect_ratio)

            print(f"Resizing large image: {orig_width}x{orig_height} → {new_width}x{new_height}")
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            print(f"Resize completed. Processing optimized for performance.")

        # Convert to grayscale for brightness analysis
        img_gray = img.convert('L')

        # Get final dimensions
        width, height = img_gray.size

        # Validate image size
        if width < 10 or height < 10:
            raise ValueError(f"Image too small: {width}x{height}. Minimum size: 10x10")

        # Convert to numpy array for efficient processing
        pixels = np.array(img_gray)

        notes = []
        for i in range(num_slices):
            try:
                # Calculate column position
                x = int(np.interp(i, [0, num_slices - 1], [0, width - 1]))

                # Extract column and calculate average brightness
                column = pixels[:, x]
                avg_brightness = np.mean(column)

                # Convert brightness to MIDI note (C3 to C6 range)
                midi_note = int(np.interp(avg_brightness, [0, 255], [48, 84]))

                # Create chord (root, major third, perfect fifth)
                chord = [midi_note, midi_note + 4, midi_note + 7]

                # Ensure notes are within valid MIDI range
                chord = [max(0, min(127, note)) for note in chord]

                notes.append({
                    'midi': midi_note,
                    'chord': chord,
                    'position': i / num_slices,
                    'brightness': avg_brightness
                })

            except Exception as e:
                print(f"Warning: Error processing slice {i}: {e}")
                continue

        if len(notes) == 0:
            raise ValueError("No notes could be extracted from the image")

        print(f"Successfully extracted {len(notes)} note slices")
        return notes

    except FileNotFoundError:
        print(f"❌ Error: Image file not found: {image_path}")
        sys.exit(1)
    except ValueError as e:
        print(f"❌ Error: Invalid image data: {e}")
        sys.exit(1)
    except OSError as e:
        print(f"❌ Error: Cannot open image file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error during image processing: {e}")
        sys.exit(1)


def create_midi_from_notes(notes: List[Dict[str, Any]], output_path: str = 'output.mid',
                          bpm: int = 60, duration: int = 8, instrument_program: int = 0,
                          velocity_variation: bool = True) -> None:
    """
    Create a MIDI file from the extracted notes with enhanced features and error handling.

    Args:
        notes: List of note dictionaries from extract_notes_from_image
        output_path: Path to save the MIDI file
        bpm: Beats per minute for the tempo
        duration: Total duration in seconds
        instrument_program: MIDI instrument program number (0-127)
        velocity_variation: Whether to vary note velocities for dynamics

    Raises:
        ValueError: If parameters are invalid
        OSError: If MIDI file cannot be written
    """
    try:
        # Validate inputs
        if not notes:
            raise ValueError("No notes provided")

        if not (20 <= bpm <= 200):
            raise ValueError(f"BPM must be between 20-200, got {bpm}")

        if not (1 <= duration <= 300):
            raise ValueError(f"Duration must be between 1-300 seconds, got {duration}")

        if not (0 <= instrument_program <= 127):
            raise ValueError(f"Instrument program must be 0-127, got {instrument_program}")

        # Validate output path
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

        print(f"Creating MIDI file with {len(notes)} notes...")
        print(f"Settings: BPM={bpm}, Duration={duration}s, Instrument={instrument_program}")

        # Create MIDI objects
        midi = pretty_midi.PrettyMIDI(initial_tempo=bpm)
        instrument = pretty_midi.Instrument(program=instrument_program)

        # Calculate timing
        step_duration = duration / len(notes)
        print(".2f")

        # Generate notes
        for i, note_data in enumerate(notes):
            try:
                start_time = i * step_duration
                end_time = (i + 1) * step_duration

                # Add velocity variation for more dynamic playing
                base_velocity = 80
                if velocity_variation:
                    # Vary velocity based on note position for rhythmic interest
                    velocity = base_velocity + int(20 * np.sin(i * 0.5))
                    velocity = max(60, min(120, velocity))
                else:
                    velocity = base_velocity

                # Add each note in the chord
                for midi_note in note_data['chord']:
                    if 0 <= midi_note <= 127:  # Ensure valid MIDI range
                        note = pretty_midi.Note(
                            velocity=velocity,
                            pitch=midi_note,
                            start=start_time,
                            end=end_time
                        )
                        instrument.notes.append(note)

            except Exception as e:
                print(f"Warning: Error creating note {i}: {e}")
                continue

        if len(instrument.notes) == 0:
            raise ValueError("No valid notes could be created")

        midi.instruments.append(instrument)

        # Write MIDI file
        print(f"Saving to: {output_path}")
        midi.write(output_path)

        # Verify file was created
        if not os.path.exists(output_path):
            raise OSError(f"Failed to create MIDI file: {output_path}")

        file_size = os.path.getsize(output_path)
        print(f"✅ MIDI file saved successfully: {output_path}")
        print(f"   File size: {file_size} bytes")
        print(f"   Total notes: {len(instrument.notes)}")
        print(f"   Instrument: {instrument_program}")

    except ValueError as e:
        print(f"❌ Error: Invalid parameters: {e}")
        sys.exit(1)
    except OSError as e:
        print(f"❌ Error: Cannot write MIDI file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error during MIDI creation: {e}")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert images to MIDI files for DAW production"
    )
    parser.add_argument("image_path", help="Path to the input image")
    parser.add_argument("-o", "--output", default="output.mid",
                        help="Output MIDI file path (default: output.mid)")
    parser.add_argument("-b", "--bpm", type=int, default=60,
                        help="Tempo in BPM (default: 60)")
    parser.add_argument("-d", "--duration", type=int, default=8,
                        help="Total duration in seconds (default: 8)")
    parser.add_argument("-i", "--instrument", type=int, default=0,
                        choices=range(128),
                        help="MIDI instrument program (0-127, default: 0)")
    parser.add_argument("--no-velocity-variation", action="store_true",
                        help="Disable velocity variation")

    args = parser.parse_args()

    print("Extracting notes from image...")
    extracted_notes = extract_notes_from_image(args.image_path)
    print(f"Extracted {len(extracted_notes)} note slices")

    print("Creating MIDI file...")
    create_midi_from_notes(
        extracted_notes,
        args.output,
        args.bpm,
        args.duration,
        args.instrument,
        not args.no_velocity_variation
    )

    print("Done! Import the MIDI into your DAW for production.")
