"""Clark integration for importing anonymized consultations"""

from typing import Dict, Any, List, Optional
import httpx
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class ClarkIntegrationService:
    """
    Service to integrate with Clark for importing anonymized consultations
    """

    def __init__(self):
        self.api_url = settings.CLARK_API_URL
        self.api_key = settings.CLARK_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def fetch_consultations(
        self,
        specialty: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Fetch anonymized consultations from Clark

        Args:
            specialty: Filter by specialty
            limit: Maximum number of consultations to fetch

        Returns:
            List of anonymized consultation data
        """
        try:
            async with httpx.AsyncClient() as client:
                params = {"limit": limit}
                if specialty:
                    params["specialty"] = specialty

                response = await client.get(
                    f"{self.api_url}/consultations/anonymized",
                    headers=self.headers,
                    params=params,
                    timeout=30.0
                )

                response.raise_for_status()
                return response.json()

        except Exception as e:
            logger.error(f"Error fetching consultations from Clark: {e}")
            return []

    async def get_consultation(self, consultation_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific consultation by ID

        Args:
            consultation_id: Consultation ID

        Returns:
            Consultation data or None
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/consultations/{consultation_id}",
                    headers=self.headers,
                    timeout=30.0
                )

                response.raise_for_status()
                return response.json()

        except Exception as e:
            logger.error(f"Error fetching consultation {consultation_id} from Clark: {e}")
            return None

    def convert_to_scenario(self, consultation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert a Clark consultation to a Coach scenario

        Args:
            consultation: Consultation data from Clark

        Returns:
            Scenario data structure
        """
        # Extract key information
        patient = consultation.get("patient", {})
        transcript = consultation.get("transcript", [])
        diagnosis = consultation.get("diagnosis", "")
        specialty = consultation.get("specialty", "General")

        # Build patient profile
        patient_profile = {
            "name": "Anonymous Patient",
            "age": patient.get("age", 50),
            "gender": patient.get("gender", "unknown"),
            "presenting_complaint": self._extract_presenting_complaint(transcript),
            "voice_profile": {
                "accent": "British",
                "emotional_state": "neutral",
                "gender": patient.get("gender", "male")
            }
        }

        # Build dialogue tree from transcript
        dialogue_tree = self._build_dialogue_tree(transcript)

        # Build assessment rubric
        assessment_rubric = self._build_assessment_rubric(consultation)

        # Create scenario structure
        scenario = {
            "title": f"{diagnosis} case",
            "description": f"Clinical scenario based on real consultation",
            "specialty": specialty,
            "difficulty": "intermediate",
            "patient_profile": patient_profile,
            "dialogue_tree": dialogue_tree,
            "learning_objectives": [
                "Take comprehensive patient history",
                "Identify key clinical features",
                "Make appropriate diagnosis",
                "Suggest management plan"
            ],
            "correct_diagnosis": diagnosis,
            "assessment_rubric": assessment_rubric,
            "source_clark_consultation_id": consultation.get("id")
        }

        return scenario

    def _extract_presenting_complaint(self, transcript: List[Dict[str, Any]]) -> str:
        """Extract the presenting complaint from transcript"""
        # Find the first patient message
        for message in transcript:
            if message.get("role") == "patient":
                return message.get("content", "")[:100]  # First 100 chars

        return "No presenting complaint found"

    def _build_dialogue_tree(self, transcript: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Build a dialogue tree from the consultation transcript

        Args:
            transcript: Consultation transcript

        Returns:
            Dialogue tree structure
        """
        # Simplified dialogue tree - in production this would be more sophisticated
        root_node = {
            "id": "root",
            "patient_says": "Hello doctor, I need to see you about something.",
            "expected_topics": [
                "presenting_complaint",
                "pain_quality",
                "duration",
                "associated_symptoms"
            ],
            "branches": []
        }

        return {"root": root_node}

    def _build_assessment_rubric(self, consultation: Dict[str, Any]) -> Dict[str, Any]:
        """Build assessment rubric from consultation data"""
        return {
            "must_ask": [
                "presenting_complaint",
                "pain_quality",
                "duration",
                "past_medical_history",
                "medications"
            ],
            "red_flags": [],
            "management_steps": [
                "examination",
                "investigations",
                "treatment"
            ],
            "time_limit": 15  # minutes
        }


# Create singleton instance
clark_service = ClarkIntegrationService()
