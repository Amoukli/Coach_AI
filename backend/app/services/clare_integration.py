"""Clare integration for fetching clinical guidelines"""

from typing import Dict, Any, List, Optional
import httpx
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class ClareIntegrationService:
    """
    Service to integrate with Clare for fetching clinical guidelines
    """

    def __init__(self):
        self.api_url = settings.CLARE_API_URL
        self.api_key = settings.CLARE_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def fetch_guideline(self, guideline_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a specific clinical guideline from Clare

        Args:
            guideline_id: Guideline ID (e.g., CG95, NG185)

        Returns:
            Guideline data or None
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/guidelines/{guideline_id}",
                    headers=self.headers,
                    timeout=30.0
                )

                response.raise_for_status()
                return response.json()

        except Exception as e:
            logger.error(f"Error fetching guideline {guideline_id} from Clare: {e}")
            return None

    async def fetch_guidelines_for_condition(
        self,
        condition: str
    ) -> List[Dict[str, Any]]:
        """
        Fetch relevant guidelines for a clinical condition

        Args:
            condition: Clinical condition or diagnosis

        Returns:
            List of relevant guidelines
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/guidelines/search",
                    headers=self.headers,
                    params={"condition": condition},
                    timeout=30.0
                )

                response.raise_for_status()
                return response.json()

        except Exception as e:
            logger.error(f"Error searching guidelines for {condition} from Clare: {e}")
            return []

    async def get_guideline_summary(self, guideline_id: str) -> Optional[str]:
        """
        Get a summary of a guideline

        Args:
            guideline_id: Guideline ID

        Returns:
            Summary text or None
        """
        guideline = await self.fetch_guideline(guideline_id)

        if guideline:
            return guideline.get("summary", "No summary available")

        return None

    async def get_guidelines_for_scenario(
        self,
        diagnosis: str,
        specialty: str
    ) -> List[Dict[str, Any]]:
        """
        Get relevant guidelines for a scenario

        Args:
            diagnosis: Primary diagnosis
            specialty: Medical specialty

        Returns:
            List of relevant guidelines with metadata
        """
        # Fetch guidelines for the diagnosis
        guidelines = await self.fetch_guidelines_for_condition(diagnosis)

        # Filter by specialty if available
        if specialty and guidelines:
            guidelines = [
                g for g in guidelines
                if specialty.lower() in g.get("specialties", [])
            ]

        # Return formatted guideline info
        return [
            {
                "guideline_id": g.get("id"),
                "title": g.get("title"),
                "source": g.get("source", "NICE"),
                "url": g.get("url"),
                "summary": g.get("summary", "")[:200]  # First 200 chars
            }
            for g in guidelines
        ]

    async def enrich_scenario_with_guidelines(
        self,
        scenario: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Enrich a scenario with relevant clinical guidelines

        Args:
            scenario: Scenario data

        Returns:
            Scenario with added guideline information
        """
        diagnosis = scenario.get("correct_diagnosis", "")
        specialty = scenario.get("specialty", "")

        if diagnosis:
            guidelines = await self.get_guidelines_for_scenario(diagnosis, specialty)

            scenario["clare_guidelines"] = [g["guideline_id"] for g in guidelines]
            scenario["clare_guideline_urls"] = [g["url"] for g in guidelines]
            scenario["guideline_summaries"] = guidelines

        return scenario


# Create singleton instance
clare_service = ClareIntegrationService()
