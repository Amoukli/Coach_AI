"""Assessment and scoring engine"""

from typing import Dict, Any, List, Tuple
import logging

logger = logging.getLogger(__name__)


class AssessmentEngine:
    """
    Calculates scores and generates feedback for student performance
    """

    def __init__(self, scenario: Dict[str, Any], session_data: Dict[str, Any]):
        """
        Initialize assessment engine

        Args:
            scenario: Scenario data with rubric
            session_data: Session data with student performance
        """
        self.scenario = scenario
        self.session_data = session_data
        self.rubric = scenario.get("assessment_rubric", {})

    def calculate_assessment(self) -> Dict[str, Any]:
        """
        Calculate comprehensive assessment

        Returns:
            Complete assessment data with scores and feedback
        """
        # Calculate individual skill scores
        history_score = self._calculate_history_taking_score()
        reasoning_score = self._calculate_clinical_reasoning_score()
        management_score = self._calculate_management_score()
        communication_score = self._calculate_communication_score()
        efficiency_score = self._calculate_efficiency_score()

        # Calculate overall score (weighted average)
        overall_score = int(
            history_score * 0.30 +
            reasoning_score * 0.25 +
            management_score * 0.20 +
            communication_score * 0.15 +
            efficiency_score * 0.10
        )

        # Generate feedback
        feedback_summary = self._generate_feedback_summary(
            history_score,
            reasoning_score,
            management_score,
            communication_score,
            efficiency_score
        )

        strengths = self._identify_strengths({
            "history_taking": history_score,
            "clinical_reasoning": reasoning_score,
            "management": management_score,
            "communication": communication_score,
            "efficiency": efficiency_score
        })

        areas_for_improvement = self._identify_areas_for_improvement({
            "history_taking": history_score,
            "clinical_reasoning": reasoning_score,
            "management": management_score,
            "communication": communication_score,
            "efficiency": efficiency_score
        })

        return {
            "overall_score": overall_score,
            "history_taking_score": history_score,
            "clinical_reasoning_score": reasoning_score,
            "management_score": management_score,
            "communication_score": communication_score,
            "efficiency_score": efficiency_score,
            "skills_breakdown": {
                "history_taking": {
                    "score": history_score,
                    "details": self._get_history_taking_details()
                },
                "clinical_reasoning": {
                    "score": reasoning_score,
                    "details": self._get_clinical_reasoning_details()
                },
                "management": {
                    "score": management_score,
                    "details": self._get_management_details()
                },
                "communication": {
                    "score": communication_score,
                    "details": self._get_communication_details()
                },
                "efficiency": {
                    "score": efficiency_score,
                    "details": self._get_efficiency_details()
                }
            },
            "metrics": self.session_data,
            "feedback_summary": feedback_summary,
            "strengths": strengths,
            "areas_for_improvement": areas_for_improvement
        }

    def _calculate_history_taking_score(self) -> int:
        """Calculate history taking score (0-100)"""
        must_ask = self.rubric.get("must_ask", [])
        topics_covered = self.session_data.get("topics_covered", [])

        if not must_ask:
            return 75  # Default if no rubric

        # Calculate coverage
        covered = len(set(topics_covered) & set(must_ask))
        coverage_percentage = (covered / len(must_ask)) * 100

        # Factor in question relevance
        relevance = self.session_data.get("relevance_percentage", 50)

        # Weighted score
        score = int(coverage_percentage * 0.7 + relevance * 0.3)

        return max(0, min(100, score))

    def _calculate_clinical_reasoning_score(self) -> int:
        """Calculate clinical reasoning score (0-100)"""
        # Check red flag identification
        expected_red_flags = self.rubric.get("red_flags", [])
        identified_red_flags = self.session_data.get("red_flags_caught", [])

        if not expected_red_flags:
            red_flag_score = 75
        else:
            caught = len(set(identified_red_flags) & set(expected_red_flags))
            red_flag_score = (caught / len(expected_red_flags)) * 100

        # Check diagnosis accuracy
        diagnosis_correct = self.session_data.get("diagnosis_correct", False)
        diagnosis_score = 100 if diagnosis_correct else 30

        # Weighted score
        score = int(red_flag_score * 0.4 + diagnosis_score * 0.6)

        return max(0, min(100, score))

    def _calculate_management_score(self) -> int:
        """Calculate management score (0-100)"""
        # This would check if student suggested appropriate management steps
        # Simplified for now
        management_steps = self.rubric.get("management_steps", [])

        # Check if diagnosis was correct (good management follows correct diagnosis)
        diagnosis_correct = self.session_data.get("diagnosis_correct", False)

        base_score = 80 if diagnosis_correct else 50

        return base_score

    def _calculate_communication_score(self) -> int:
        """Calculate communication score (0-100)"""
        # Assess communication quality
        questions_asked = self.session_data.get("questions_asked", 0)
        relevant_questions = self.session_data.get("relevant_questions", 0)

        # Good communication means asking relevant, clear questions
        if questions_asked == 0:
            return 50

        relevance_ratio = relevant_questions / questions_asked
        score = int(relevance_ratio * 100)

        # Penalize if too few or too many questions
        if questions_asked < 5:
            score -= 20
        elif questions_asked > 30:
            score -= 10

        return max(0, min(100, score))

    def _calculate_efficiency_score(self) -> int:
        """Calculate efficiency score (0-100)"""
        # Check time taken vs expected time
        time_limit = self.rubric.get("time_limit", 15) * 60  # Convert to seconds
        duration = self.session_data.get("duration", 0)

        if duration == 0:
            return 70

        # Optimal time is 70-90% of time limit
        optimal_min = time_limit * 0.5
        optimal_max = time_limit * 0.9

        if optimal_min <= duration <= optimal_max:
            score = 100
        elif duration < optimal_min:
            # Too fast - might have missed things
            score = 70
        elif duration <= time_limit:
            # Slightly over optimal but within limit
            score = 85
        else:
            # Over time limit
            over_percentage = ((duration - time_limit) / time_limit) * 100
            score = max(50, 100 - int(over_percentage))

        # Also factor in number of questions (efficiency)
        questions_asked = self.session_data.get("questions_asked", 0)
        if questions_asked > 0:
            if questions_asked < 8:
                score -= 10  # Too few questions
            elif questions_asked > 25:
                score -= 15  # Too many questions, inefficient

        return max(0, min(100, score))

    def _get_history_taking_details(self) -> str:
        """Get detailed feedback for history taking"""
        must_ask = self.rubric.get("must_ask", [])
        topics_covered = self.session_data.get("topics_covered", [])

        covered = set(topics_covered) & set(must_ask)
        missed = set(must_ask) - set(topics_covered)

        details = f"Covered {len(covered)}/{len(must_ask)} essential topics. "
        if missed:
            details += f"Missed: {', '.join(missed)}."

        return details

    def _get_clinical_reasoning_details(self) -> str:
        """Get detailed feedback for clinical reasoning"""
        diagnosis_correct = self.session_data.get("diagnosis_correct", False)
        red_flags = self.session_data.get("red_flags_caught", [])

        details = "Diagnosis: " + ("Correct" if diagnosis_correct else "Incorrect") + ". "
        details += f"Identified {len(red_flags)} red flag(s)."

        return details

    def _get_management_details(self) -> str:
        """Get detailed feedback for management"""
        return "Management plan assessment based on diagnosis accuracy."

    def _get_communication_details(self) -> str:
        """Get detailed feedback for communication"""
        questions_asked = self.session_data.get("questions_asked", 0)
        relevant = self.session_data.get("relevant_questions", 0)

        return f"Asked {questions_asked} questions, {relevant} were relevant."

    def _get_efficiency_details(self) -> str:
        """Get detailed feedback for efficiency"""
        duration = self.session_data.get("duration", 0) // 60  # Convert to minutes
        time_limit = self.rubric.get("time_limit", 15)

        return f"Completed in {duration} minutes (target: {time_limit} minutes)."

    def _generate_feedback_summary(
        self,
        history: int,
        reasoning: int,
        management: int,
        communication: int,
        efficiency: int
    ) -> str:
        """Generate overall feedback summary"""
        overall = int((history + reasoning + management + communication + efficiency) / 5)

        if overall >= 85:
            summary = "Excellent performance! "
        elif overall >= 70:
            summary = "Good work! "
        elif overall >= 50:
            summary = "Satisfactory performance. "
        else:
            summary = "Needs improvement. "

        # Add specific feedback
        if history < 60:
            summary += "Focus on taking a more comprehensive history. "
        if reasoning < 60:
            summary += "Work on identifying key clinical features and red flags. "
        if communication < 60:
            summary += "Improve your communication and questioning technique. "

        return summary

    def _identify_strengths(self, scores: Dict[str, int]) -> List[str]:
        """Identify student's strengths"""
        strengths = []

        for skill, score in scores.items():
            if score >= 80:
                strengths.append(f"Strong {skill.replace('_', ' ')}")

        if not strengths:
            strengths.append("Completed the scenario")

        return strengths

    def _identify_areas_for_improvement(self, scores: Dict[str, int]) -> List[str]:
        """Identify areas for improvement"""
        areas = []

        for skill, score in scores.items():
            if score < 70:
                areas.append(f"Improve {skill.replace('_', ' ')}")

        return areas
