"""Voice generation API endpoints"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from app.core.security import get_current_user
from app.core.azure_services import azure_speech_service

router = APIRouter()


# Pydantic schemas
class TextToSpeechRequest(BaseModel):
    text: str
    voice_name: Optional[str] = None
    emotional_style: str = "neutral"


class VoiceProfileRequest(BaseModel):
    accent: str = "British"
    gender: str = "male"
    emotional_state: str = "neutral"


class SpeechRecognitionResponse(BaseModel):
    text: str


@router.post("/synthesize")
async def synthesize_speech(
    request: TextToSpeechRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Convert text to speech using Azure Speech Services

    Args:
        request: Text and voice parameters

    Returns:
        Audio data in WAV format
    """
    try:
        audio_data = await azure_speech_service.synthesize_speech(
            text=request.text,
            voice_name=request.voice_name,
            emotional_style=request.emotional_style
        )

        return Response(
            content=audio_data,
            media_type="audio/wav",
            headers={
                "Content-Disposition": 'attachment; filename="speech.wav"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis failed: {str(e)}"
        )


@router.post("/get-voice-for-profile")
async def get_voice_for_profile(
    profile: VoiceProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Get appropriate Azure voice name based on patient profile

    Args:
        profile: Patient voice profile

    Returns:
        Voice name and configuration
    """
    voice_name = azure_speech_service.get_voice_for_profile({
        "accent": profile.accent,
        "gender": profile.gender,
        "emotional_state": profile.emotional_state
    })

    return {
        "voice_name": voice_name,
        "accent": profile.accent,
        "gender": profile.gender,
        "emotional_state": profile.emotional_state
    }


@router.get("/voices/list")
async def list_available_voices():
    """List available voice options"""
    return {
        "british": {
            "male": ["en-GB-RyanNeural", "en-GB-ThomasNeural"],
            "female": ["en-GB-SoniaNeural", "en-GB-LibbyNeural"]
        },
        "scottish": {
            "male": ["en-GB-ThomasNeural"],
            "female": ["en-GB-SoniaNeural"]
        },
        "irish": {
            "male": ["en-IE-ConnorNeural"],
            "female": ["en-IE-EmilyNeural"]
        },
        "american": {
            "male": ["en-US-GuyNeural", "en-US-JasonNeural"],
            "female": ["en-US-JennyNeural", "en-US-AriaNeural"]
        }
    }


@router.post("/recognize", response_model=SpeechRecognitionResponse)
async def recognize_speech(
    audio_file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Convert speech audio to text using Azure Speech Services

    Args:
        audio_file: Audio file (WAV format)

    Returns:
        Recognized text
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        # Read audio data
        audio_data = await audio_file.read()

        logger.info(f"Received audio file: {audio_file.filename}, size: {len(audio_data)} bytes, content_type: {audio_file.content_type}")

        # Recognize speech
        text = await azure_speech_service.recognize_speech(audio_data)

        logger.info(f"Speech recognized successfully: '{text}'")

        return SpeechRecognitionResponse(text=text)

    except Exception as e:
        logger.error(f"Speech recognition error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech recognition failed: {str(e)}"
        )
