#!/usr/bin/env python3
"""
Hyper Vibe MIDI Exporter
Exports pixel-derived notes from images to MIDI files for DAW production.
"""

import sys
from PIL import Image
import pretty_midi
import numpy as np

def extract_notes_from_image(image_path, num_slices=16):
    """
    Extract MIDI notes from image brightness.
    Similar to the JS version but for Python.
    """
    img = Image.open(image_path).convert('L')  # Grayscale
    width, height = img.size
    pixels = np.array(img)

    notes = []
    for i in range(num_slices):
        x = int(np.interp(i, [0, num_slices - 1], [0, width - 1]))
        column = pixels[:, x]
        avg_brightness = np.mean(column)
        midi_note = int(np.interp(avg_brightness, [0, 255], [48, 84]))
        chord = [midi_note, midi_note + 4, midi_note + 7]
        notes.append({
            'midi': midi_note,
            'chord': chord,
            'position': i / num_slices
        })

    return notes

def create_midi_from_notes(notes, output_path='output.mid', bpm=60, duration=8):
    """
    Create a MIDI file from the extracted notes.
    """
    midi = pretty_midi.PrettyMIDI(initial_tempo=bpm)
    piano = pretty_midi.Instrument(program=0)  # Piano

    step_duration = duration / len(notes)

    for i, note_data in enumerate(notes):
        start_time = i * step_duration
        end_time = (i + 1) * step_duration

        for midi_note in note_data['chord']:
            note = pretty_midi.Note(
                velocity=100,
                pitch=midi_note,
                start=start_time,
                end=end_time
            )
            piano.notes.append(note)

    midi.instruments.append(piano)
    midi.write(output_path)
    print(f"MIDI file saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python midi_exporter.py <image_path> [output.mid]")
        sys.exit(1)

    image_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else 'output.mid'

    print("Extracting notes from image...")
    notes = extract_notes_from_image(image_path)
    print(f"Extracted {len(notes)} note slices")

    print("Creating MIDI file...")
    create_midi_from_notes(notes, output_path)

    print("Done! Import the MIDI into your DAW for production.")
