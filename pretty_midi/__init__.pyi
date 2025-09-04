# Type stubs for pretty_midi
# Custom stubs created for Hyper Vibe Engine

from typing import List, Union

__version__: str = "0.2.10"

class PrettyMIDI:
    def __init__(self, initial_tempo: Union[float, int] = 120) -> None:
        """Create a PrettyMIDI object.

        Args:
            initial_tempo: Initial tempo in BPM
        """
        ...

    instruments: List['Instrument']

    def write(self, filename: str) -> None:
        """Write the MIDI data to a file.

        Args:
            filename: Path to the output MIDI file
        """
        ...

class Instrument:
    def __init__(self, program: int, is_drum: bool = False, name: str = "") -> None:
        """Create an Instrument object.

        Args:
            program: MIDI program number (0-127)
            is_drum: Whether this is a drum instrument
            name: Name of the instrument
        """
        ...

    program: int
    is_drum: bool
    name: str
    notes: List['Note']

class Note:
    def __init__(self, velocity: int, pitch: int, start: float, end: float) -> None:
        """Create a Note object.

        Args:
            velocity: Note velocity (0-127)
            pitch: MIDI pitch number (0-127)
            start: Start time in seconds
            end: End time in seconds
        """
        ...

    velocity: int
    pitch: int
    start: float
    end: float
