"""Guidelines API endpoints for Clare integration"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from app.services.clare_integration import clare_service

router = APIRouter()


class GuidelineInfo(BaseModel):
    """Guideline information returned from Clare"""

    guideline_id: str
    title: str
    source: str = "NICE"
    url: Optional[str] = None
    summary: str = ""


class GuidelinesSearchResponse(BaseModel):
    """Response for guidelines search"""

    condition: str
    guidelines: List[GuidelineInfo]
    count: int


@router.get("/search", response_model=GuidelinesSearchResponse)
async def search_guidelines(
    condition: str = Query(..., description="Clinical condition or diagnosis to search for"),
    specialty: Optional[str] = Query(None, description="Filter by medical specialty"),
):
    """
    Search for clinical guidelines relevant to a condition.

    This endpoint integrates with Clare to fetch NICE guidelines
    that are relevant to the student's suspected diagnosis.

    Args:
        condition: The clinical condition or diagnosis (e.g., "appendicitis", "chest pain")
        specialty: Optional specialty filter (e.g., "General Surgery", "Cardiology")

    Returns:
        List of relevant guidelines with summaries and links
    """
    try:
        guidelines = await clare_service.get_guidelines_for_scenario(
            diagnosis=condition, specialty=specialty or ""
        )

        # If Clare returns results, use them
        if guidelines:
            return GuidelinesSearchResponse(
                condition=condition,
                guidelines=[GuidelineInfo(**g) for g in guidelines],
                count=len(guidelines),
            )

        # Fall through to mock data if Clare returns empty
    except Exception:
        pass  # Fall through to mock data

    # Return mock data when Clare API is unavailable or returns empty
    mock_guidelines = _get_mock_guidelines(condition)
    return GuidelinesSearchResponse(
        condition=condition, guidelines=mock_guidelines, count=len(mock_guidelines)
    )


@router.get("/{guideline_id}")
async def get_guideline(guideline_id: str):
    """
    Get detailed information about a specific guideline.

    Args:
        guideline_id: The NICE guideline ID (e.g., "NG185", "CG95")

    Returns:
        Full guideline information including recommendations
    """
    try:
        guideline = await clare_service.fetch_guideline(guideline_id)

        if not guideline:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Guideline {guideline_id} not found",
            )

        return guideline

    except HTTPException:
        raise
    except Exception:
        # Return mock data for development
        return _get_mock_guideline_detail(guideline_id)


def _get_mock_guidelines(condition: str) -> List[GuidelineInfo]:
    """
    Return mock guidelines for development when Clare API is unavailable.
    Maps common conditions to relevant NICE guidelines.
    """
    condition_lower = condition.lower()

    # Mock guideline mappings for common conditions
    guidelines_map = {
        "appendicitis": [
            GuidelineInfo(
                guideline_id="NG185",
                title="Appendicitis: diagnosis and management",
                source="NICE",
                url="https://www.nice.org.uk/guidance/ng185",
                summary="Recommendations on diagnosing and managing appendicitis in children, "
                "young people and adults. It covers assessment, imaging, antibiotic treatment "
                "and surgery.",
            ),
        ],
        "chest pain": [
            GuidelineInfo(
                guideline_id="CG95",
                title="Chest pain of recent onset: assessment and diagnosis",
                source="NICE",
                url="https://www.nice.org.uk/guidance/cg95",
                summary="Recommendations for the assessment and diagnosis of chest pain of "
                "recent onset. Covers stable angina, acute coronary syndromes, and "
                "non-cardiac chest pain.",
            ),
            GuidelineInfo(
                guideline_id="NG185",
                title="Acute coronary syndromes",
                source="NICE",
                url="https://www.nice.org.uk/guidance/ng185",
                summary="Recommendations on early management of acute coronary syndromes "
                "in adults, including unstable angina, NSTEMI and STEMI.",
            ),
        ],
        "abdominal pain": [
            GuidelineInfo(
                guideline_id="NG185",
                title="Appendicitis: diagnosis and management",
                source="NICE",
                url="https://www.nice.org.uk/guidance/ng185",
                summary="Recommendations on diagnosing and managing appendicitis.",
            ),
            GuidelineInfo(
                guideline_id="CG184",
                title="Dyspepsia and gastro-oesophageal reflux disease",
                source="NICE",
                url="https://www.nice.org.uk/guidance/cg184",
                summary="Recommendations for investigation and management of dyspepsia and GORD.",
            ),
        ],
        "headache": [
            GuidelineInfo(
                guideline_id="CG150",
                title="Headaches in over 12s: diagnosis and management",
                source="NICE",
                url="https://www.nice.org.uk/guidance/cg150",
                summary="Recommendations for diagnosing and managing primary headaches "
                "(tension-type, migraine, cluster) and medication overuse headache.",
            ),
        ],
        "shortness of breath": [
            GuidelineInfo(
                guideline_id="NG115",
                title="Chronic obstructive pulmonary disease in over 16s",
                source="NICE",
                url="https://www.nice.org.uk/guidance/ng115",
                summary="Recommendations on diagnosing and managing COPD in people aged 16 and over.",
            ),
            GuidelineInfo(
                guideline_id="NG80",
                title="Asthma: diagnosis, monitoring and chronic asthma management",
                source="NICE",
                url="https://www.nice.org.uk/guidance/ng80",
                summary="Recommendations for the diagnosis and management of asthma.",
            ),
        ],
        "diabetes": [
            GuidelineInfo(
                guideline_id="NG28",
                title="Type 2 diabetes in adults: management",
                source="NICE",
                url="https://www.nice.org.uk/guidance/ng28",
                summary="Recommendations on managing type 2 diabetes in adults, covering "
                "education, dietary advice, drug treatments and monitoring.",
            ),
        ],
        "hypertension": [
            GuidelineInfo(
                guideline_id="NG136",
                title="Hypertension in adults: diagnosis and management",
                source="NICE",
                url="https://www.nice.org.uk/guidance/ng136",
                summary="Recommendations on identifying and treating primary hypertension "
                "in people aged 18 and over.",
            ),
        ],
    }

    # Find matching guidelines
    for key, guidelines in guidelines_map.items():
        if key in condition_lower:
            return guidelines

    # Default generic response
    return [
        GuidelineInfo(
            guideline_id="SEARCH",
            title=f"Search NICE guidelines for '{condition}'",
            source="NICE",
            url=f"https://www.nice.org.uk/search?q={condition.replace(' ', '+')}",
            summary=f"Search the NICE website for guidelines related to {condition}.",
        )
    ]


def _get_mock_guideline_detail(guideline_id: str) -> dict:
    """Return mock guideline detail for development"""
    return {
        "id": guideline_id,
        "title": f"NICE Guideline {guideline_id}",
        "source": "NICE",
        "url": f"https://www.nice.org.uk/guidance/{guideline_id.lower()}",
        "summary": "This is a mock guideline summary for development purposes.",
        "last_updated": "2024-01-01",
        "recommendations": [
            "Recommendation 1: Take a thorough history",
            "Recommendation 2: Perform appropriate examination",
            "Recommendation 3: Consider relevant investigations",
            "Recommendation 4: Discuss management options with patient",
        ],
    }
