"""Integration boundary between a future voice pipeline and Energy Tools.

This package deliberately has no Pipecat or provider dependency.  It can be
used by a Pipecat function handler once the voice transport is selected.
"""

from .energy_api import EnergyAPISettings, VoiceEnergyAdapter

__all__ = ["EnergyAPISettings", "VoiceEnergyAdapter"]
