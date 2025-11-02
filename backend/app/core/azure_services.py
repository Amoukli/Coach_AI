"""Azure services integration (Speech, OpenAI)"""

import asyncio
from typing import Optional, Dict, Any, List
import httpx
from openai import AzureOpenAI

from app.core.config import settings


class AzureSpeechService:
    """Azure Speech Services for text-to-speech using REST API"""

    def __init__(self):
        self.subscription_key = settings.AZURE_SPEECH_KEY
        self.region = settings.AZURE_SPEECH_REGION
        self.base_url = f"https://{self.region}.tts.speech.microsoft.com"

    def get_voice_for_profile(self, voice_profile: Dict[str, str]) -> str:
        """
        Get appropriate Azure voice based on patient profile

        Args:
            voice_profile: Dictionary with accent, gender, age info

        Returns:
            Voice name for Azure Speech
        """
        accent = voice_profile.get("accent", "British").lower()
        gender = voice_profile.get("gender", "male").lower()

        # Map voice profiles to Azure voices
        voice_map = {
            ("british", "male"): "en-GB-RyanNeural",
            ("british", "female"): "en-GB-SoniaNeural",
            ("scottish", "male"): "en-GB-ThomasNeural",
            ("scottish", "female"): "en-GB-SoniaNeural",
            ("irish", "male"): "en-IE-ConnorNeural",
            ("irish", "female"): "en-IE-EmilyNeural",
            ("american", "male"): "en-US-GuyNeural",
            ("american", "female"): "en-US-JennyNeural",
        }

        return voice_map.get((accent, gender), "en-GB-RyanNeural")

    async def synthesize_speech(
        self,
        text: str,
        voice_name: Optional[str] = None,
        emotional_style: str = "neutral"
    ) -> bytes:
        """
        Convert text to speech audio using REST API

        Args:
            text: Text to synthesize
            voice_name: Optional Azure voice name
            emotional_style: Emotional style (anxious, calm, neutral, etc.)

        Returns:
            Audio data as bytes (WAV format)
        """
        if not voice_name:
            voice_name = "en-GB-RyanNeural"

        # Build SSML with emotional style if supported
        ssml = self._build_ssml(text, voice_name, emotional_style)

        # Make REST API call
        url = f"{self.base_url}/cognitiveservices/v1"
        headers = {
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
            "User-Agent": "CoachAI"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, content=ssml)

            if response.status_code == 200:
                return response.content
            else:
                error_msg = f"Speech synthesis failed with status {response.status_code}: {response.text}"
                raise Exception(error_msg)

    def _build_ssml(self, text: str, voice_name: str, emotional_style: str) -> str:
        """Build SSML markup for speech synthesis"""
        # Map emotional states to Azure styles
        style_map = {
            "anxious": "worried",
            "calm": "calm",
            "neutral": "general",
            "distressed": "sad",
            "cheerful": "cheerful"
        }

        style = style_map.get(emotional_style, "general")

        ssml = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-GB">
    <voice name="{voice_name}">
        <mstts:express-as style="{style}">
            {text}
        </mstts:express-as>
    </voice>
</speak>"""

        return ssml

    async def recognize_speech(self, audio_data: bytes) -> str:
        """
        Convert speech audio to text using REST API

        Args:
            audio_data: Audio data (will be auto-detected and converted if needed)

        Returns:
            Transcribed text
        """
        import logging
        logger = logging.getLogger(__name__)

        # Default to simple audio format that Azure accepts better
        # Use simple format parameter instead of complex content-type
        content_type = "audio/wav"

        # Check for WebM format (common in Chrome) - header starts with 0x1A45DFA3
        if len(audio_data) >= 4 and audio_data[:4] == b'\x1a\x45\xdf\xa3':
            content_type = "audio/webm; codec=opus"
            logger.info("Detected WebM audio format")
        # Check for OGG format - header starts with "OggS"
        elif len(audio_data) >= 4 and audio_data[:4] == b'OggS':
            content_type = "audio/ogg; codec=opus"
            logger.info("Detected OGG audio format")
        # Check for WAV format - header starts with "RIFF"
        elif len(audio_data) >= 4 and audio_data[:4] == b'RIFF':
            content_type = "audio/wav"
            logger.info("Detected WAV audio format")
        else:
            # Unknown format - try as WebM since Chrome MediaRecorder often produces non-standard headers
            content_type = "audio/webm; codec=opus"
            logger.warning(f"Unknown audio format (header: {audio_data[:8].hex()}), trying as WebM")

        url = f"https://{self.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1"

        headers = {
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": content_type,
            "Accept": "application/json"
        }

        params = {
            "language": "en-GB",
            "format": "detailed"
        }

        logger.info(f"Sending {len(audio_data)} bytes to Azure Speech API")
        logger.info(f"Content-Type: {content_type}")
        logger.info(f"First 16 bytes: {audio_data[:16].hex()}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, params=params, content=audio_data)

            logger.info(f"Azure Speech API response status: {response.status_code}")
            logger.info(f"Azure Speech API response body: {response.text}")

            if response.status_code == 200:
                result = response.json()
                recognition_status = result.get("RecognitionStatus", "Unknown")

                if recognition_status == "Success":
                    recognized_text = result.get("DisplayText", "")
                    if recognized_text:
                        logger.info(f"Successfully recognized: '{recognized_text}'")
                        return recognized_text
                    else:
                        logger.warning("Recognition succeeded but DisplayText is empty - possible silence or unclear audio")
                        return ""
                else:
                    logger.error(f"Recognition failed with status: {recognition_status}, full response: {result}")
                    # Return empty string instead of raising exception for NoMatch/InitialSilenceTimeout
                    return ""
            else:
                error_msg = f"Speech recognition API returned status {response.status_code}: {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)


class AzureOpenAIService:
    """Azure OpenAI service for scenario adaptation and response generation"""

    def __init__(self):
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
        )
        self.deployment_name = settings.AZURE_OPENAI_DEPLOYMENT_NAME

    async def generate_patient_response(
        self,
        scenario_context: Dict[str, Any],
        student_message: str,
        conversation_history: List[Dict[str, str]]
    ) -> str:
        """
        Generate contextual patient response using GPT-4

        Args:
            scenario_context: Current scenario and patient information
            student_message: What the student just said/asked
            conversation_history: Previous conversation messages

        Returns:
            Patient's response text
        """
        system_prompt = self._build_system_prompt(scenario_context)
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history
        messages.extend(conversation_history[-6:])  # Last 6 messages for context

        # Add current student message
        messages.append({"role": "user", "content": student_message})

        # Run in executor to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                temperature=0.7,
                max_tokens=200
            )
        )

        return response.choices[0].message.content

    def _build_system_prompt(self, scenario_context: Dict[str, Any]) -> str:
        """Build system prompt for patient role-play"""
        patient = scenario_context.get("patient_profile", {})

        prompt = f"""You are roleplaying as a patient in a medical training scenario.

Patient Details:
- Age: {patient.get('age', 'unknown')}
- Gender: {patient.get('gender', 'unknown')}
- Presenting Complaint: {patient.get('presenting_complaint', 'unknown')}
- Emotional State: {patient.get('voice_profile', {}).get('emotional_state', 'neutral')}

Instructions:
1. Stay in character as the patient
2. Answer questions naturally based on the scenario
3. Don't volunteer information unless asked
4. Show appropriate emotion based on your state
5. Keep responses concise (1-3 sentences)
6. Use natural language, not medical jargon
7. If you don't know something, say you're not sure

Remember: You are helping train a medical student. Be realistic but supportive of their learning.
"""

        return prompt


# Create singleton instances
azure_speech_service = AzureSpeechService()
azure_openai_service = AzureOpenAIService()
