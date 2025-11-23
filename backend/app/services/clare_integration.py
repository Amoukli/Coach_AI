"""Clare integration for fetching clinical guidelines"""

import logging
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class ClareIntegrationService:
    """
    Service to integrate with Clare for fetching clinical guidelines.

    Clare API uses POST /search with X-API-Key header and JSON body {"query": "condition"}
    """

    def __init__(self):
        self.api_url = settings.CLARE_API_URL.rstrip("/")
        self.api_key = settings.CLARE_API_KEY
        self.headers = {"X-API-Key": self.api_key, "Content-Type": "application/json"}

    async def search_guidelines(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Search Clare for guidelines related to a clinical query.

        Args:
            query: Clinical condition, diagnosis, or question

        Returns:
            Clare response with answer and sources, or None on error
        """
        if not self.api_key:
            logger.warning("CLARE_API_KEY not configured")
            return None

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_url}/search",
                    headers=self.headers,
                    json={"query": query},
                )

                response.raise_for_status()
                return response.json()

        except httpx.TimeoutException:
            logger.error(f"Timeout searching Clare for: {query}")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(f"Clare API error {e.response.status_code}: {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Error searching Clare for {query}: {e}")
            return None

    async def fetch_guidelines_for_condition(self, condition: str) -> List[Dict[str, Any]]:
        """
        Fetch relevant guidelines for a clinical condition.

        Args:
            condition: Clinical condition or diagnosis

        Returns:
            List of guideline sources from Clare
        """
        result = await self.search_guidelines(condition)

        if not result:
            return []

        # Extract sources from Clare response
        sources = result.get("sources", [])
        return sources

    async def get_guidelines_for_scenario(
        self, diagnosis: str, specialty: str
    ) -> List[Dict[str, Any]]:
        """
        Get relevant guidelines for a scenario.

        Args:
            diagnosis: Primary diagnosis
            specialty: Medical specialty (currently unused, Clare handles relevance)

        Returns:
            List of relevant guidelines with metadata formatted for Coach AI
        """
        result = await self.search_guidelines(diagnosis)

        if not result:
            return []

        sources = result.get("sources", [])

        # Format guidelines for Coach AI frontend
        # Deduplicate by guideline title (same guideline may appear multiple times for different chapters)
        seen_titles = set()
        guidelines = []
        for source in sources:
            title = source.get("title", "Unknown")
            # Skip duplicates
            if title in seen_titles:
                continue
            seen_titles.add(title)

            guidelines.append(
                {
                    "guideline_id": title,
                    "title": f"{title} - {source.get('chapter', '')}".rstrip(" -"),
                    "source": source.get("type", "NICE"),
                    "url": source.get("url"),
                    "summary": source.get("excerpt", "")[:200],
                }
            )

        return guidelines

    async def get_full_answer(self, query: str) -> Optional[str]:
        """
        Get Clare's full synthesized answer for a clinical query.

        Args:
            query: Clinical question or condition

        Returns:
            Clare's answer text with citations, or None
        """
        result = await self.search_guidelines(query)

        if result:
            return result.get("answer")

        return None

    async def enrich_scenario_with_guidelines(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich a scenario with relevant clinical guidelines.

        Args:
            scenario: Scenario data

        Returns:
            Scenario with added guideline information
        """
        diagnosis = scenario.get("correct_diagnosis", "")

        if diagnosis:
            guidelines = await self.get_guidelines_for_scenario(diagnosis, "")

            scenario["clare_guidelines"] = [g["guideline_id"] for g in guidelines]
            scenario["clare_guideline_urls"] = [g["url"] for g in guidelines if g.get("url")]
            scenario["guideline_summaries"] = guidelines

        return scenario


# Create singleton instance
clare_service = ClareIntegrationService()
