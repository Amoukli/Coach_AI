#!/usr/bin/env python3
"""Quick test script for Azure Speech Services"""

import asyncio
import os
from app.core.azure_services import azure_speech_service

async def test_voice_synthesis():
    """Test if Azure Speech Service credentials are working"""
    try:
        print("Testing Azure Speech Service...")
        print(f"Region: {os.getenv('AZURE_SPEECH_REGION')}")
        print(f"Key configured: {'Yes' if os.getenv('AZURE_SPEECH_KEY') else 'No'}")

        # Test synthesis
        print("\nSynthesizing test speech...")
        audio_data = await azure_speech_service.synthesize_speech(
            text="Hello doctor, I've been experiencing chest pain for the past three hours.",
            voice_name="en-GB-RyanNeural",
            emotional_style="anxious"
        )

        print(f"✅ Success! Generated {len(audio_data)} bytes of audio data")

        # Save to file for testing
        output_file = "/tmp/test_voice.wav"
        with open(output_file, "wb") as f:
            f.write(audio_data)
        print(f"Audio saved to: {output_file}")
        print("You can play it with: afplay /tmp/test_voice.wav")

        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    # Run test
    result = asyncio.run(test_voice_synthesis())
    exit(0 if result else 1)
