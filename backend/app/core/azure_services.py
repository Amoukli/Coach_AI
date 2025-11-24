"""Azure services integration (Speech, OpenAI)"""

import asyncio
import os
import tempfile
from typing import Any, Dict, List, Optional

import httpx
from openai import AzureOpenAI
from pydub import AudioSegment

from app.core.config import settings


class AzureSpeechService:
    """Azure Speech Services using REST API (no SDK required)"""

    def __init__(self):
        self.speech_key = settings.AZURE_SPEECH_KEY
        self.speech_region = settings.AZURE_SPEECH_REGION
        self.default_voice = "en-GB-RyanNeural"

        # REST API endpoints
        self.tts_endpoint = (
            f"https://{self.speech_region}.tts.speech.microsoft.com/cognitiveservices/v1"
        )
        self.stt_endpoint = f"https://{self.speech_region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1"

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
        self, text: str, voice_name: Optional[str] = None, emotional_style: str = "neutral"
    ) -> bytes:
        """
        Convert text to speech audio using Azure REST API

        Args:
            text: Text to synthesize
            voice_name: Optional Azure voice name
            emotional_style: Emotional style (anxious, calm, neutral, etc.)

        Returns:
            Audio data as bytes (WAV format)
        """
        voice = voice_name or self.default_voice
        ssml = self._build_ssml(text, voice, emotional_style)

        headers = {
            "Ocp-Apim-Subscription-Key": self.speech_key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "riff-16khz-16bit-mono-pcm",
            "User-Agent": "CoachAI",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.tts_endpoint, headers=headers, content=ssml)

            if response.status_code == 200:
                return response.content
            else:
                raise Exception(f"TTS failed with status {response.status_code}: {response.text}")

    def _build_ssml(self, text: str, voice_name: str, emotional_style: str) -> str:
        """Build SSML markup for speech synthesis"""
        # Map emotional states to Azure styles
        style_map = {
            "anxious": "worried",
            "calm": "calm",
            "neutral": "general",
            "distressed": "sad",
            "cheerful": "cheerful",
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

    async def recognize_speech_from_audio(self, audio_data: bytes) -> str:
        """
        Convert speech audio to text using Azure Speech REST API

        Args:
            audio_data: Audio data as bytes (WAV, WebM, or other supported format)

        Returns:
            Transcribed text
        """
        print(f"Received audio data: {len(audio_data)} bytes")

        # Convert audio to WAV format (16kHz, 16-bit, mono) for Azure
        wav_data = await self._convert_audio_to_wav(audio_data)

        # Azure STT REST API endpoint with language parameter
        stt_url = f"{self.stt_endpoint}?language=en-GB&format=detailed"

        headers = {
            "Ocp-Apim-Subscription-Key": self.speech_key,
            "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(stt_url, headers=headers, content=wav_data)

            if response.status_code == 200:
                result = response.json()

                # Check recognition status
                if result.get("RecognitionStatus") == "Success":
                    # Return the best transcript
                    return result.get("DisplayText", "")
                elif result.get("RecognitionStatus") == "NoMatch":
                    raise Exception("No speech could be recognized from the audio")
                else:
                    raise Exception(f"Recognition failed: {result.get('RecognitionStatus')}")
            else:
                raise Exception(f"STT failed with status {response.status_code}: {response.text}")

    async def _convert_audio_to_wav(self, audio_data: bytes) -> bytes:
        """
        Convert audio data to WAV format suitable for Azure STT

        Args:
            audio_data: Input audio bytes (WebM, MP3, OGG, etc.)

        Returns:
            WAV audio bytes (16kHz, 16-bit, mono)
        """
        loop = asyncio.get_event_loop()

        def convert():
            # Save input to temp file (no extension - pydub auto-detects format)
            with tempfile.NamedTemporaryFile(delete=False) as temp_input:
                temp_input.write(audio_data)
                temp_input_path = temp_input.name

            temp_output_path = None
            try:
                # Load audio - pydub/ffmpeg auto-detects format from content
                # This handles WebM, OGG, MP4, WAV, MP3, etc.
                audio_segment = AudioSegment.from_file(temp_input_path)

                print(
                    f"Audio loaded: {len(audio_segment)}ms, {audio_segment.channels} channels, {audio_segment.frame_rate}Hz"
                )

                # Convert to Azure-compatible format: 16kHz, 16-bit, mono
                audio_segment = (
                    audio_segment.set_frame_rate(16000).set_channels(1).set_sample_width(2)
                )

                # Export to WAV
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_output:
                    temp_output_path = temp_output.name

                audio_segment.export(temp_output_path, format="wav")

                # Read converted WAV
                with open(temp_output_path, "rb") as f:
                    wav_data = f.read()

                print(f"Audio converted successfully: {len(wav_data)} bytes WAV")
                return wav_data

            finally:
                # Clean up temp files
                if os.path.exists(temp_input_path):
                    os.unlink(temp_input_path)
                if temp_output_path and os.path.exists(temp_output_path):
                    os.unlink(temp_output_path)

        return await loop.run_in_executor(None, convert)


class AzureOpenAIService:
    """Azure OpenAI service for scenario adaptation and response generation"""

    def __init__(self):
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        )
        self.deployment_name = settings.AZURE_OPENAI_DEPLOYMENT_NAME

    async def generate_patient_response(
        self,
        scenario_context: Dict[str, Any],
        student_message: str,
        conversation_history: List[Dict[str, str]],
    ) -> Dict[str, str]:
        """
        Generate contextual patient response using GPT-4

        Returns:
            Dict with 'text' and 'emotion' keys
        """
        system_prompt = self._build_system_prompt(scenario_context)
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history
        # Filter out non-string content from history if needed, or ensure history is clean
        clean_history = []
        for msg in conversation_history[-6:]:
            content = msg.get("content")
            # If content is a dict (from previous turns), extract text
            if isinstance(content, dict):
                content = content.get("text", "")
            clean_history.append({"role": msg["role"], "content": content})

        messages.extend(clean_history)

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
                max_tokens=200,
                response_format={"type": "json_object"},  # Force JSON output
            ),
        )

        content = response.choices[0].message.content
        try:
            import json

            return json.loads(content)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {"text": content, "emotion": "neutral"}

    def _build_system_prompt(self, scenario_context: Dict[str, Any]) -> str:
        """Build system prompt for patient role-play"""
        patient = scenario_context.get("patient_profile", {})
        dialogue_tree = scenario_context.get("dialogue_tree", {})

        # Extract patient details
        patient_name = patient.get("name", "the patient")
        age = patient.get("age", "unknown")
        gender = patient.get("gender", "unknown")
        presenting_complaint = patient.get("presenting_complaint", "unknown")
        emotional_state = patient.get("voice_profile", {}).get("emotional_state", "neutral")
        occupation = patient.get("occupation", "unknown")

        # Extract all clinical facts recursively
        clinical_facts = self._extract_all_clinical_facts(dialogue_tree)

        # Build the comprehensive prompt
        prompt = f"""# Role: Virtual Patient Simulation
You are {patient_name}, a {age}-year-old {gender} patient in a clinical training scenario for medical students.

## Patient Profile
- **Name:** {patient_name}
- **Age:** {age}
- **Gender:** {gender}
- **Occupation:** {occupation}
- **Presenting Complaint:** "{presenting_complaint}"
- **Base Emotional State:** {emotional_state}

## Clinical Knowledge Base
Here are the specific facts about your condition. You MUST adhere to these facts if asked.
{clinical_facts}

## Interaction Guidelines
1. **Stay in Character:** You are a patient, not a doctor. Use layperson language.
2. **Natural Conversation:** Respond naturally to the student's questions.
3. **Information Disclosure:** Do not volunteer your entire history at once. Answer direct questions fully based on your Knowledge Base.
4. **Unknowns:** If asked a medical question you wouldn't know, say you don't know.

## Output Format
You MUST respond in JSON format with two fields:
1. `text`: Your spoken response to the student.
2. `emotion`: The emotional tone of this specific response. Choose from: [neutral, cheerful, sad, angry, fearful, shouting, whispering, hopeful, terrified, unfriendly].

Example:
{{
  "text": "It hurts so much when I breathe!",
  "emotion": "terrified"
}}
"""
        return prompt

    def _extract_all_clinical_facts(self, dialogue_tree: Dict[str, Any]) -> str:
        """
        Recursively extract all clinical facts from the dialogue tree.
        Returns a formatted string of bullet points.
        """
        facts = []

        def traverse(node_data: Any):
            if isinstance(node_data, dict):
                # Check if this is a node with 'patient_says'
                if "patient_says" in node_data:
                    response = node_data["patient_says"]
                    # Try to find a topic label
                    topic = node_data.get("id", "General")

                    # Avoid duplicates if possible
                    fact_str = f"- **{topic}**: {response}"
                    if fact_str not in facts:
                        facts.append(fact_str)

                # Recurse into all values
                for key, value in node_data.items():
                    if key == "branches" and isinstance(value, dict):
                        # Handle branches specifically to capture topic keys
                        for topic_key, branch_node in value.items():
                            # Add the topic key as context if useful
                            traverse(branch_node)
                    elif isinstance(value, (dict, list)):
                        traverse(value)

            elif isinstance(node_data, list):
                for item in node_data:
                    traverse(item)

        traverse(dialogue_tree)

        if not facts:
            return "No specific clinical facts provided. Improvisation allowed for all history."

        return "\n".join(facts)


# Create singleton instances
azure_speech_service = AzureSpeechService()
azure_openai_service = AzureOpenAIService()
