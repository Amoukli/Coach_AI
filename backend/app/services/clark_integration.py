"""Clark integration for importing anonymized consultations"""

import logging
from datetime import datetime
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class ClarkIntegrationService:
    """
    Service to integrate with Clark for importing anonymized consultations.

    Uses Clark's external API with Bearer token authentication (JWT) to fetch
    anonymized consultation data for training scenario creation.

    Authentication flow:
    1. Admin logs in via /api/v1/auth/login with Clark admin credentials
    2. Token is stored and used for subsequent API calls
    3. Token expires after 24 hours, requiring re-authentication
    """

    def __init__(self):
        self.api_url = settings.CLARK_API_URL.rstrip("/")
        self._token: Optional[str] = None
        self._token_expires: Optional[datetime] = None
        self._username: Optional[str] = None

    def is_configured(self) -> bool:
        """Check if Clark API URL is configured."""
        return bool(self.api_url)

    def is_authenticated(self) -> bool:
        """Check if we have a valid authentication token."""
        if not self._token or not self._token_expires:
            return False
        return datetime.utcnow() < self._token_expires

    def get_auth_status(self) -> Dict[str, Any]:
        """Get current authentication status."""
        return {
            "authenticated": self.is_authenticated(),
            "username": self._username if self.is_authenticated() else None,
            "expires_at": self._token_expires.isoformat() if self._token_expires else None,
        }

    def _get_auth_headers(self) -> Dict[str, str]:
        """Get headers with Bearer token for authenticated requests."""
        if not self._token:
            raise ValueError("Not authenticated - call login() first")
        return {"Authorization": f"Bearer {self._token}", "Content-Type": "application/json"}

    async def login(self, username: str, password: str) -> Dict[str, Any]:
        """
        Authenticate with Clark API using admin credentials.

        Args:
            username: Clark admin username
            password: Clark admin password

        Returns:
            Dict with success status, error message if failed, or user info if successful

        Example:
            result = await clark_service.login("admin", "password")
            if result["success"]:
                print(f"Logged in as {result['user']['username']}")
        """
        if not self.is_configured():
            return {"success": False, "error": "Clark API URL not configured"}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_url}/api/v1/auth/login",
                    json={"username": username, "password": password},
                )

                data = response.json()

                if response.status_code == 200 and data.get("success"):
                    self._token = data.get("token")
                    self._username = data.get("user", {}).get("username")
                    # Parse expiration time
                    expires_str = data.get("expires_at", "")
                    if expires_str:
                        self._token_expires = datetime.fromisoformat(
                            expires_str.replace("Z", "+00:00")
                        ).replace(tzinfo=None)

                    logger.info(f"Successfully authenticated with Clark as {self._username}")
                    return {
                        "success": True,
                        "user": data.get("user"),
                        "expires_at": data.get("expires_at"),
                    }
                else:
                    error = data.get("error", "Authentication failed")
                    logger.warning(f"Clark login failed: {error}")
                    return {"success": False, "error": error, "code": data.get("code")}

        except httpx.TimeoutException:
            logger.error("Clark API timeout during login")
            return {"success": False, "error": "Connection timeout"}
        except Exception as e:
            logger.error(f"Error during Clark login: {e}")
            return {"success": False, "error": str(e)}

    def logout(self):
        """Clear authentication token."""
        self._token = None
        self._token_expires = None
        self._username = None
        logger.info("Logged out from Clark API")

    async def fetch_consultations(
        self, specialty: Optional[str] = None, limit: int = 10, offset: int = 0
    ) -> Dict[str, Any]:
        """
        Fetch anonymized consultations from Clark.

        Args:
            specialty: Filter by specialty (not yet implemented in Clark API)
            limit: Maximum number of consultations to fetch (max 50)
            offset: Number of consultations to skip for pagination

        Returns:
            Dict with consultations list or error information
        """
        if not self.is_authenticated():
            return {"success": False, "error": "Not authenticated", "code": "NOT_AUTHENTICATED"}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {
                    "limit": min(limit, 50),
                    "offset": offset,
                    "status": "all",  # Get all statuses, filter in UI if needed
                }

                response = await client.get(
                    f"{self.api_url}/api/v1/consultations/anonymized",
                    headers=self._get_auth_headers(),
                    params=params,
                )

                if response.status_code == 401:
                    self._token = None
                    return {"success": False, "error": "Session expired", "code": "TOKEN_EXPIRED"}

                response.raise_for_status()
                data = response.json()

                if data.get("success"):
                    return {
                        "success": True,
                        "consultations": data.get("consultations", []),
                        "count": data.get("count", 0),
                    }
                else:
                    return {"success": False, "error": data.get("error"), "code": data.get("code")}

        except httpx.HTTPStatusError as e:
            logger.error(f"Clark API HTTP error {e.response.status_code}")
            return {"success": False, "error": f"HTTP error {e.response.status_code}"}
        except httpx.TimeoutException:
            logger.error("Clark API timeout")
            return {"success": False, "error": "Connection timeout"}
        except Exception as e:
            logger.error(f"Error fetching consultations from Clark: {e}")
            return {"success": False, "error": str(e)}

    async def get_consultation(self, consultation_id: str) -> Dict[str, Any]:
        """
        Get a specific anonymized consultation by ID.

        Args:
            consultation_id: Consultation ID

        Returns:
            Dict with consultation data or error information
        """
        if not self.is_authenticated():
            return {"success": False, "error": "Not authenticated", "code": "NOT_AUTHENTICATED"}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.api_url}/api/v1/consultations/{consultation_id}/anonymized",
                    headers=self._get_auth_headers(),
                )

                if response.status_code == 401:
                    self._token = None
                    return {"success": False, "error": "Session expired", "code": "TOKEN_EXPIRED"}

                if response.status_code == 404:
                    return {
                        "success": False,
                        "error": "Consultation not found",
                        "code": "NOT_FOUND",
                    }

                response.raise_for_status()
                data = response.json()

                if data.get("success"):
                    return {"success": True, "consultation": data.get("consultation")}
                else:
                    return {"success": False, "error": data.get("error"), "code": data.get("code")}

        except httpx.HTTPStatusError as e:
            logger.error(f"Clark API HTTP error {e.response.status_code}")
            return {"success": False, "error": f"HTTP error {e.response.status_code}"}
        except httpx.TimeoutException:
            logger.error(f"Clark API timeout fetching consultation {consultation_id}")
            return {"success": False, "error": "Connection timeout"}
        except Exception as e:
            logger.error(f"Error fetching consultation {consultation_id} from Clark: {e}")
            return {"success": False, "error": str(e)}

    async def check_connection(self) -> bool:
        """
        Check if Clark API is accessible (health endpoint).

        Returns:
            True if connection is successful, False otherwise
        """
        if not self.is_configured():
            return False

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.api_url}/api/v1/health")
                return response.status_code == 200
        except Exception:
            return False

    def convert_to_scenario(self, consultation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert an anonymized Clark consultation to a Coach scenario.

        Args:
            consultation: Anonymized consultation data from Clark API
                Expected format:
                {
                    "metadata": {"consultation_id": "...", "date": "...", "status": "..."},
                    "structured_data": {"Presenting Complaint": "...", "Diagnosis": "...", ...},
                    "transcript": "..." (optional)
                }

        Returns:
            Scenario data structure ready for import into Coach
        """
        # Extract structured data
        structured = consultation.get("structured_data", {})
        metadata = consultation.get("metadata", {})

        # Get diagnosis from structured data
        diagnosis = (
            structured.get("Diagnosis") or structured.get("diagnosis") or "Unspecified condition"
        )

        # Get presenting complaint
        presenting_complaint = (
            structured.get("Presenting Complaint")
            or structured.get("presenting_complaint")
            or "Patient presenting for consultation"
        )

        # Build patient profile from structured data
        patient_profile = {
            "name": "Anonymous Patient",
            "age": 45,  # Default age since anonymized
            "gender": "unknown",
            "occupation": "Not specified",
            "presenting_complaint": presenting_complaint,
            "background": self._extract_background(structured),
            "voice_profile": {
                "accent": "British",
                "emotional_state": "neutral",
                "gender": "neutral",
            },
        }

        # Build dialogue tree from structured data
        dialogue_tree = self._build_dialogue_tree_from_structured(structured, presenting_complaint)

        # Build assessment rubric from structured data
        assessment_rubric = self._build_assessment_rubric_from_structured(structured)

        # Determine specialty from diagnosis/complaint (basic heuristic)
        specialty = self._infer_specialty(diagnosis, presenting_complaint)

        # Create scenario structure
        scenario = {
            "title": f"{diagnosis[:50]} case" if diagnosis else "Clinical Case",
            "description": "Clinical scenario based on anonymized real consultation",
            "specialty": specialty,
            "difficulty": "intermediate",
            "patient_profile": patient_profile,
            "dialogue_tree": dialogue_tree,
            "learning_objectives": [
                "Take comprehensive patient history",
                "Identify key clinical features",
                (
                    f"Recognize features of {diagnosis}"
                    if diagnosis
                    else "Form differential diagnosis"
                ),
                "Develop appropriate management plan",
            ],
            "correct_diagnosis": diagnosis,
            "differential_diagnoses": [],
            "assessment_rubric": assessment_rubric,
            "source_clark_consultation_id": metadata.get("consultation_id"),
        }

        return scenario

    def _extract_background(self, structured: Dict[str, Any]) -> str:
        """Extract patient background from structured data."""
        parts = []

        pmh = structured.get("Past Medical History") or structured.get("past_medical_history")
        if pmh and pmh != "Not mentioned":
            parts.append(f"PMH: {pmh}")

        meds = structured.get("Medications") or structured.get("medications")
        if meds and meds != "Not mentioned":
            parts.append(f"Medications: {meds}")

        allergies = structured.get("Allergies") or structured.get("allergies")
        if allergies and allergies not in ["Not mentioned", "No known drug allergies"]:
            parts.append(f"Allergies: {allergies}")

        social = structured.get("Social History") or structured.get("social_history")
        if social and social != "Not mentioned":
            parts.append(f"Social: {social}")

        return " | ".join(parts) if parts else "No significant background"

    def _build_dialogue_tree_from_structured(
        self, structured: Dict[str, Any], presenting_complaint: str
    ) -> Dict[str, Any]:
        """
        Build a dialogue tree from structured consultation data.

        Creates a root node with the presenting complaint and branches
        for different clinical topics covered in the consultation.
        """
        # Get history of presenting illness for opening statement
        hpi = (
            structured.get("History of Presenting Illness")
            or structured.get("history_of_presenting_illness")
            or presenting_complaint
        )

        root_node = {
            "id": "root",
            "patient_says": f"Hello doctor, {presenting_complaint.lower()}",
            "expected_topics": [
                "presenting_complaint",
                "duration",
                "severity",
                "associated_symptoms",
                "past_medical_history",
                "medications",
                "allergies",
            ],
            "branches": [],
            "clinical_info": {
                "history": hpi,
                "pmh": structured.get("Past Medical History")
                or structured.get("past_medical_history"),
                "medications": structured.get("Medications") or structured.get("medications"),
                "allergies": structured.get("Allergies") or structured.get("allergies"),
                "family_history": structured.get("Family History")
                or structured.get("family_history"),
                "social_history": structured.get("Social History")
                or structured.get("social_history"),
                "review_of_systems": structured.get("Review of Systems")
                or structured.get("review_of_systems"),
                "examination": structured.get("Physical Examination")
                or structured.get("physical_examination"),
            },
        }

        return {"root": root_node}

    def _build_assessment_rubric_from_structured(
        self, structured: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build assessment rubric from structured consultation data."""
        # Extract key clinical elements that should be asked about
        must_ask = ["presenting_complaint", "duration"]

        # Add topics based on what was documented
        if structured.get("Past Medical History") or structured.get("past_medical_history"):
            must_ask.append("past_medical_history")
        if structured.get("Medications") or structured.get("medications"):
            must_ask.append("medications")
        if structured.get("Allergies") or structured.get("allergies"):
            must_ask.append("allergies")
        if structured.get("Family History") or structured.get("family_history"):
            must_ask.append("family_history")
        if structured.get("Social History") or structured.get("social_history"):
            must_ask.append("social_history")

        # Extract management steps from plan
        plan = structured.get("Management Plan") or structured.get("management_plan") or ""
        management_steps = ["clinical_examination"]

        investigations = structured.get("Investigations/Tests Ordered") or structured.get(
            "investigations"
        )
        if investigations and investigations != "Not mentioned":
            management_steps.append("investigations")

        if plan and plan != "Not mentioned":
            management_steps.append("treatment_plan")

        referrals = structured.get("Referrals") or structured.get("referrals")
        if referrals and referrals != "Not mentioned":
            management_steps.append("referral_consideration")

        return {
            "must_ask": must_ask,
            "red_flags": [],
            "key_findings": [],
            "management_steps": management_steps,
            "time_limit": 15,
        }

    def _infer_specialty(self, diagnosis: str, presenting_complaint: str) -> str:
        """Infer medical specialty from diagnosis and presenting complaint."""
        text = f"{diagnosis} {presenting_complaint}".lower()

        specialty_keywords = {
            "Cardiology": [
                "chest pain",
                "palpitation",
                "heart",
                "cardiac",
                "angina",
                "hypertension",
            ],
            "Respiratory": ["cough", "breathless", "asthma", "copd", "pneumonia", "wheez"],
            "Gastroenterology": [
                "abdominal",
                "stomach",
                "bowel",
                "diarrh",
                "constipation",
                "nausea",
            ],
            "Neurology": ["headache", "dizz", "seizure", "stroke", "numbness", "weakness"],
            "Musculoskeletal": ["back pain", "joint", "arthritis", "muscle", "fracture"],
            "Dermatology": ["rash", "skin", "eczema", "psoriasis", "itch"],
            "Mental Health": ["anxiety", "depression", "mood", "sleep", "stress"],
            "ENT": ["ear", "throat", "nose", "sinus", "hearing", "tinnitus"],
        }

        for specialty, keywords in specialty_keywords.items():
            if any(kw in text for kw in keywords):
                return specialty

        return "General Practice"


# Create singleton instance
clark_service = ClarkIntegrationService()
