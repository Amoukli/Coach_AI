"""Azure services integration (Speech, OpenAI)"""

import asyncio
from typing import Optional, Dict, Any, List
import azure.cognitiveservices.speech as speechsdk
from openai import AzureOpenAI

from app.core.config import settings


class AzureSpeechService:
    """Azure Speech Services for text-to-speech"""

    def __init__(self):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_SPEECH_REGION
        )
        # Default to British English voice
        self.speech_config.speech_synthesis_voice_name = "en-GB-RyanNeural"

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
        Convert text to speech audio

        Args:
            text: Text to synthesize
            voice_name: Optional Azure voice name
            emotional_style: Emotional style (anxious, calm, neutral, etc.)

        Returns:
            Audio data as bytes (WAV format)
        """
        if voice_name:
            self.speech_config.speech_synthesis_voice_name = voice_name

        # Configure audio output to in-memory stream (None means audio data is returned)
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.speech_config,
            audio_config=None
        )

        # Build SSML with emotional style if supported
        ssml = self._build_ssml(text, voice_name or self.speech_config.speech_synthesis_voice_name, emotional_style)

        # Run synthesis in executor to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            synthesizer.speak_ssml,
            ssml
        )

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return result.audio_data
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation = result.cancellation_details
            raise Exception(f"Speech synthesis canceled: {cancellation.reason}")

        raise Exception("Speech synthesis failed")

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

        ssml = f"""
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
               xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-GB">
            <voice name="{voice_name}">
                <mstts:express-as style="{style}">
                    {text}
                </mstts:express-as>
            </voice>
        </speak>
        """

        return ssml.strip()


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
