#!/usr/bin/env python3
"""
Hyper Vibe MIDI Exporter - Multi-Track Edition
Exports pixel-derived notes to multi-track MIDI files with melody, harmony, percussion, and bass.
"""

import argparse
import sys
import os
import random
from typing import List, Dict, Any
from PIL import Image  # type: ignore
import pretty_midi
import numpy as np

# Constants
DEFAULT_OUTPUT_FILE = "output.mid"


def extract_notes_from_image(
    image_path: str, num_slices: int = 16, max_width: int = 1000
) -> List[Dict[str, Any]]:
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
        valid_extensions = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".gif"}
        file_ext = os.path.splitext(image_path)[1].lower()
        if file_ext not in valid_extensions:
            print(
                f"Warning: Unsupported file extension {file_ext}. Attempting to load anyway..."
            )

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

            print(
                f"Resizing large image: {orig_width}x{orig_height} → {new_width}x{new_height}"
            )
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            print(f"Resize completed. Processing optimized for performance.")

        # Convert to grayscale for brightness analysis
        img_gray = img.convert("L")

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

                notes.append(
                    {
                        "midi": midi_note,
                        "chord": chord,
                        "position": i / num_slices,
                        "brightness": avg_brightness,
                    }
                )

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


def generate_melody_track(
    notes: List[Dict[str, Any]], duration: float
) -> pretty_midi.Instrument:
    """Generate a melodic lead track from the image notes."""
    instrument = pretty_midi.Instrument(program=0, name="Melody")  # Piano

    step_duration = duration / len(notes)

    for i, note_data in enumerate(notes):
        start_time = i * step_duration
        end_time = (i + 1) * step_duration

        # Create melody by picking the highest note from chord occasionally
        if random.random() < 0.7:  # 70% chance to play melody note
            melody_note = max(note_data["chord"]) + random.choice(
                [0, 7, 12]
            )  # Add octave variations
            melody_note = max(48, min(96, melody_note))  # Keep in reasonable range

            velocity = 90 + random.randint(-10, 10)
            note = pretty_midi.Note(
                velocity=velocity, pitch=melody_note, start=start_time, end=end_time
            )
            instrument.notes.append(note)

    return instrument


def generate_harmony_track(
    notes: List[Dict[str, Any]], duration: float
) -> pretty_midi.Instrument:
    """Generate a harmony track with sustained chords."""
    instrument = pretty_midi.Instrument(program=48, name="Harmony")  # Strings

    step_duration = duration / len(notes)

    for i, note_data in enumerate(notes):
        start_time = i * step_duration
        end_time = (i + 1) * step_duration

        # Play full chord with some variation
        chord_notes = note_data["chord"][:]
        if random.random() < 0.5:  # 50% chance to add 7th
            chord_notes.append(chord_notes[0] + 10)  # Add minor 7th

        for midi_note in chord_notes:
            if 0 <= midi_note <= 127:
                velocity = 60 + random.randint(-5, 5)
                note = pretty_midi.Note(
                    velocity=velocity, pitch=midi_note, start=start_time, end=end_time
                )
                instrument.notes.append(note)

    return instrument


def generate_percussion_track(
    notes: List[Dict[str, Any]], duration: float
) -> pretty_midi.Instrument:
    """Generate a percussion track with rhythmic patterns."""
    instrument = pretty_midi.Instrument(program=0, name="Percussion", is_drum=True)

    step_duration = duration / len(notes)

    for i, note_data in enumerate(notes):
        start_time = i * step_duration

        # Create rhythmic pattern based on note brightness
        brightness = note_data["brightness"]

        # Bass drum on beat
        if i % 4 == 0:
            note = pretty_midi.Note(
                velocity=int(np.interp(brightness, [0, 255], [80, 120])),
                pitch=36,  # Bass drum
                start=start_time,
                end=start_time + 0.1,
            )
            instrument.notes.append(note)

        # Snare on 2nd and 4th beats
        if i % 4 == 2:
            note = pretty_midi.Note(
                velocity=int(np.interp(brightness, [0, 255], [70, 100])),
                pitch=38,  # Snare
                start=start_time,
                end=start_time + 0.1,
            )
            instrument.notes.append(note)

        # Hi-hats based on brightness
        if brightness > 128:
            hat_pitch = 42 if random.random() < 0.7 else 46
            note = pretty_midi.Note(
                velocity=60, pitch=hat_pitch, start=start_time, end=start_time + 0.05
            )
            instrument.notes.append(note)

    return instrument


def generate_bass_track(
    notes: List[Dict[str, Any]], duration: float
) -> pretty_midi.Instrument:
    """Generate a bass track with walking bass lines."""
    instrument = pretty_midi.Instrument(program=32, name="Bass")  # Electric Bass

    step_duration = duration / len(notes)

    for i, note_data in enumerate(notes):
        start_time = i * step_duration
        end_time = (i + 1) * step_duration

        # Create bass note (octave below root)
        bass_note = note_data["midi"] - 12  # One octave down
        bass_note = max(24, min(48, bass_note))  # Keep in bass range

        velocity = 80 + random.randint(-10, 10)
        note = pretty_midi.Note(
            velocity=velocity, pitch=bass_note, start=start_time, end=end_time
        )
        instrument.notes.append(note)

    return instrument


def generate_ai_enhanced_track(
    notes: List[Dict[str, Any]], duration: float, track_type: str
) -> pretty_midi.Instrument:
    """Generate AI-enhanced tracks with intelligent music generation."""
    if track_type == "melody":
        return generate_ai_melody(notes, duration)
    elif track_type == "harmony":
        return generate_ai_harmony(notes, duration)
    elif track_type == "percussion":
        return generate_ai_percussion(notes, duration)
    elif track_type == "bass":
        return generate_ai_bass(notes, duration)
    else:
        # Fallback to regular generation
        return generate_melody_track(notes, duration)


def generate_ai_melody(
    notes: List[Dict[str, Any]], duration: float
) -> pretty_midi.Instrument:
    """Generate intelligent melody with AI-like patterns."""
    instrument = pretty_midi.Instrument(program=0, name="AI Melody")  # Piano

    step_duration = duration / len(notes)
    melody_sequence: List[int] = []

    # AI-like melody generation using Markov chain principles
    for i, note_data in enumerate(notes):
        start_time = i * step_duration
        end_time = (i + 1) * step_duration

        # Intelligent note selection based on previous notes
        if melody_sequence and random.random() < 0.7:
            # Continue melodic pattern
            last_note = melody_sequence[-1]
            # Create tension and release
            interval_options = [2, 4, 5, 7, -2, -4, -5]  # Scale degrees
            interval = random.choice(interval_options)
            new_note = last_note + interval
        else:
            # Start new melodic idea
            new_note = note_data["midi"] + random.choice([-12, -7, 0, 7, 12])

        # Ensure note is in playable range
        new_note = max(48, min(96, new_note))
        melody_sequence.append(new_note)

        # Add some rests for musicality
        if random.random() < 0.2:  # 20% chance of rest
            continue

        velocity = 85 + random.randint(-10, 15)
        note = pretty_midi.Note(
            velocity=velocity, pitch=new_note, start=start_time, end=end_time
        )
        instrument.notes.append(note)

    return instrument


def generate_ai_harmony(
    notes: List[Dict[str, Any]], duration: float
) -> pretty_midi.Instrument:
    """Generate intelligent harmony with AI chord progressions."""
    instrument = pretty_midi.Instrument(program=48, name="AI Harmony")  # Strings

    step_duration = duration / len(notes)

    # AI chord progression patterns
    chord_patterns = [
        [0, 2, 4],  # Major triad
        [0, 3, 5],  # Minor triad
        [0, 4, 7],  # Dominant 7th
        [0, 3, 6],  # Diminished
        [0, 2, 4, 6],  # 7th chord
    ]

    for i, note_data in enumerate(notes):
        start_time = i * step_duration
        end_time = (i + 1) * step_duration

        # Select chord pattern based on image brightness
        brightness = note_data["brightness"]
        pattern_index = int(
            np.interp(brightness, [0, 255], [0, len(chord_patterns) - 1])
        )
        chord_pattern = chord_patterns[pattern_index]

        # Apply pattern to root note
        root_note = note_data["midi"]

        for interval in chord_pattern:
            chord_note = root_note + interval
            chord_note = max(36, min(84, chord_note))  # Keep in reasonable range

            velocity = 65 + random.randint(-5, 10)
            note = pretty_midi.Note(
                velocity=velocity, pitch=chord_note, start=start_time, end=end_time
            )
            instrument.notes.append(note)

    return instrument


def generate_ai_percussion(
    notes: List[Dict[str, Any]], duration: float
) -> pretty_midi.Instrument:
    """Generate intelligent percussion with AI rhythmic patterns."""
    instrument = pretty_midi.Instrument(program=0, name="AI Percussion", is_drum=True)

    step_duration = duration / len(notes)

    # AI rhythmic patterns based on image analysis
    for i, note_data in enumerate(notes):
        start_time = i * step_duration
        brightness = note_data["brightness"]

        # Dynamic rhythm generation based on brightness
        if brightness > 200:  # Bright = complex rhythm
            pattern = [0, 0.25, 0.5, 0.75]  # 16th notes
        elif brightness > 128:  # Medium = standard rhythm
            pattern = [0, 0.5]  # 8th notes
        else:  # Dark = simple rhythm
            pattern = [0]  # Quarter notes

        for beat_offset in pattern:
            beat_time = start_time + (beat_offset * step_duration)

            # Select drum based on position and brightness
            if beat_offset == 0:  # Downbeat
                drum_pitch = 36  # Bass drum
            elif beat_offset == 0.5:  # Backbeat
                drum_pitch = 38  # Snare
            else:  # Off-beats
                drum_pitch = random.choice([42, 46])  # Hi-hats

            velocity = int(np.interp(brightness, [0, 255], [60, 110]))
            note = pretty_midi.Note(
                velocity=velocity,
                pitch=drum_pitch,
                start=beat_time,
                end=beat_time + 0.1,
            )
            instrument.notes.append(note)

    return instrument


def generate_ai_bass(
    notes: List[Dict[str, Any]], duration: float
) -> pretty_midi.Instrument:
    """Generate intelligent bass lines with AI walking patterns."""
    instrument = pretty_midi.Instrument(program=32, name="AI Bass")  # Electric Bass

    step_duration = duration / len(notes)

    for i, note_data in enumerate(notes):
        start_time = i * step_duration
        end_time = (i + 1) * step_duration

        # AI bass line generation
        root_note = note_data["midi"] - 12  # Octave below

        # Create walking bass pattern
        if i % 4 == 0:  # Root on downbeat
            bass_note = root_note
        elif i % 4 == 2:  # Fifth on backbeat
            bass_note = root_note + 7
        else:  # Chromatic approach or other notes
            bass_note = root_note + random.choice([2, 4, 9, 11])

        bass_note = max(24, min(48, bass_note))  # Keep in bass range

        velocity = 80 + random.randint(-10, 10)
        note = pretty_midi.Note(
            velocity=velocity, pitch=bass_note, start=start_time, end=end_time
        )
        instrument.notes.append(note)

    return instrument


def create_multi_track_midi_from_notes(
    notes: List[Dict[str, Any]],
    output_path: str = DEFAULT_OUTPUT_FILE,
    bpm: int = 60,
    duration: int = 8,
    tracks: List[str] = None,
) -> None:
    """
    Create a multi-track MIDI file from the extracted notes.

    Args:
        notes: List of note dictionaries from extract_notes_from_image
        output_path: Path to save the MIDI file
        bpm: Beats per minute for the tempo
        duration: Total duration in seconds
        tracks: List of tracks to include ['melody', 'harmony', 'percussion', 'bass']
    """
    if tracks is None:
        tracks = ["melody", "harmony", "percussion", "bass"]

    try:
        # Validate inputs
        if not notes:
            raise ValueError("No notes provided")

        if not (20 <= bpm <= 200):
            raise ValueError(f"BPM must be between 20-200, got {bpm}")

        if not (1 <= duration <= 300):
            raise ValueError(f"Duration must be between 1-300 seconds, got {duration}")

        # Validate output path
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

        print(f"🎼 Creating multi-track MIDI with {len(tracks)} tracks...")
        print(f"Settings: BPM={bpm}, Duration={duration}s, Tracks={tracks}")

        # Create MIDI object
        midi = pretty_midi.PrettyMIDI(initial_tempo=bpm)

        # Generate each track
        if "melody" in tracks:
            print("🎵 Generating melody track...")
            melody_track = generate_melody_track(notes, duration)
            midi.instruments.append(melody_track)

        if "harmony" in tracks:
            print("🎶 Generating harmony track...")
            harmony_track = generate_harmony_track(notes, duration)
            midi.instruments.append(harmony_track)

        if "percussion" in tracks:
            print("🥁 Generating percussion track...")
            percussion_track = generate_percussion_track(notes, duration)
            midi.instruments.append(percussion_track)

        if "bass" in tracks:
            print("🎸 Generating bass track...")
            bass_track = generate_bass_track(notes, duration)
            midi.instruments.append(bass_track)

        if len(midi.instruments) == 0:
            raise ValueError("No tracks were generated")

        # Write MIDI file
        print(f"💾 Saving to: {output_path}")
        midi.write(output_path)

        # Verify file was created
        if not os.path.exists(output_path):
            raise OSError(f"Failed to create MIDI file: {output_path}")

        file_size = os.path.getsize(output_path)
        total_notes = sum(len(inst.notes) for inst in midi.instruments)

        print(f"✅ Multi-track MIDI saved successfully: {output_path}")
        print(f"   File size: {file_size} bytes")
        print(f"   Total tracks: {len(midi.instruments)}")
        print(f"   Total notes: {total_notes}")
        print(f"   Tracks: {', '.join([inst.name for inst in midi.instruments])}")

    except ValueError as e:
        print(f"❌ Error: Invalid parameters: {e}")
        sys.exit(1)
    except OSError as e:
        print(f"❌ Error: Cannot write MIDI file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error during MIDI creation: {e}")
        sys.exit(1)


def create_midi_from_notes(
    notes: List[Dict[str, Any]],
    output_path: str = DEFAULT_OUTPUT_FILE,
    bpm: int = 60,
    duration: int = 8,
) -> None:

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
        valid_extensions = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".gif"}
        file_ext = os.path.splitext(image_path)[1].lower()
        if file_ext not in valid_extensions:
            print(
                f"Warning: Unsupported file extension {file_ext}. Attempting to load anyway..."
            )

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

            print(
                f"Resizing large image: {orig_width}x{orig_height} → {new_width}x{new_height}"
            )
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            print(f"Resize completed. Processing optimized for performance.")

        # Convert to grayscale for brightness analysis
        img_gray = img.convert("L")

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

                notes.append(
                    {
                        "midi": midi_note,
                        "chord": chord,
                        "position": i / num_slices,
                        "brightness": avg_brightness,
                    }
                )

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


def create_midi_from_notes(
    notes: List[Dict[str, Any]],
    output_path: str = DEFAULT_OUTPUT_FILE,
    bpm: int = 60,
    duration: int = 8,
) -> None:
    """
    Create a MIDI file from the extracted notes with enhanced features and error handling.
    (Legacy single-track function for backward compatibility)
    """
    tracks = ["melody"]  # Default to melody-only for backward compatibility
    create_multi_track_midi_from_notes(notes, output_path, bpm, duration, tracks)


def create_ai_multi_track_midi(
    notes: List[Dict[str, Any]],
    output_path: str,
    bpm: int,
    duration: int,
    tracks: List[str],
) -> None:
    """
    Create AI-enhanced multi-track MIDI file with intelligent music generation.

    Args:
        notes: List of note dictionaries from image analysis
        output_path: Path for the output MIDI file
        bpm: Tempo in beats per minute
        duration: Total duration in seconds
        tracks: List of track types to include
    """
    print("🎼 Creating AI-enhanced multi-track MIDI...")

    # Create PrettyMIDI object
    midi = pretty_midi.PrettyMIDI(initial_tempo=bpm)
    track_count = 0

    # Generate AI tracks based on selected tracks
    if "melody" in tracks:
        print("🎵 Generating AI melody...")
        melody_track = generate_ai_melody(notes, duration)
        if melody_track and melody_track.notes:
            midi.instruments.append(melody_track)
            track_count += 1

    if "harmony" in tracks:
        print("🎶 Generating AI harmony...")
        harmony_track = generate_ai_harmony(notes, duration)
        if harmony_track and harmony_track.notes:
            midi.instruments.append(harmony_track)
            track_count += 1

    if "bass" in tracks:
        print("🎸 Generating AI bass...")
        bass_track = generate_ai_bass(notes, duration)
        if bass_track and bass_track.notes:
            midi.instruments.append(bass_track)
            track_count += 1

    if "percussion" in tracks:
        print("🥁 Generating AI percussion...")
        percussion_track = generate_ai_percussion(notes, duration)
        if percussion_track and percussion_track.notes:
            midi.instruments.append(percussion_track)
            track_count += 1

    # Save the MIDI file
    midi.write(output_path)
    print(f"✅ AI-enhanced MIDI saved to {output_path} with {track_count} tracks")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert images to multi-track MIDI files for DAW production"
    )
    parser.add_argument("image_path", help="Path to the input image")
    parser.add_argument(
        "-o",
        "--output",
        default=DEFAULT_OUTPUT_FILE,
        help=f"Output MIDI file path (default: {DEFAULT_OUTPUT_FILE})",
    )
    parser.add_argument(
        "-b", "--bpm", type=int, default=60, help="Tempo in BPM (default: 60)"
    )
    parser.add_argument(
        "-d",
        "--duration",
        type=int,
        default=8,
        help="Total duration in seconds (default: 8)",
    )
    parser.add_argument(
        "-t",
        "--tracks",
        nargs="+",
        choices=["melody", "harmony", "percussion", "bass"],
        default=["melody", "harmony", "percussion", "bass"],
        help="Tracks to include (default: all tracks)",
    )
    parser.add_argument(
        "--legacy", action="store_true", help="Use legacy single-track mode"
    )
    parser.add_argument(
        "--ai-mode", action="store_true", help="Enable AI-enhanced music generation"
    )

    args = parser.parse_args()

    print("🎨 Extracting notes from image...")
    extracted_notes = extract_notes_from_image(args.image_path)
    print(f"📊 Extracted {len(extracted_notes)} note slices")

    if args.legacy:
        print("🎵 Creating legacy single-track MIDI file...")
        create_midi_from_notes(
            extracted_notes,
            args.output,
            args.bpm,
            args.duration
        )
    else:
        print("🎼 Creating multi-track MIDI file...")
        if args.ai_mode:
            print("🤖 AI-enhanced generation enabled!")
            create_ai_multi_track_midi(
                extracted_notes, args.output, args.bpm, args.duration, args.tracks
            )
        else:
            create_multi_track_midi_from_notes(
                extracted_notes, args.output, args.bpm, args.duration, args.tracks
            )

        print("🎉 Done! Import the MIDI into your DAW for production.")
