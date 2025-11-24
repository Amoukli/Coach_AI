"""Scenario dialogue engine"""

import logging
from typing import Any, Dict, List, Optional, Tuple

from app.core.azure_services import azure_openai_service

logger = logging.getLogger(__name__)


class ScenarioEngine:
    """
    Manages the dialogue flow and branching logic for clinical scenarios.
    Each scenario has multiple paths based on student choices.
    """

    def __init__(self, scenario: Dict[str, Any]):
        """
        Initialize scenario engine

        Args:
            scenario: Complete scenario data including dialogue tree
        """
        self.scenario = scenario
        self.dialogue_tree = scenario.get("dialogue_tree", {})
        self.current_node_id = "root"
        self.conversation_history: List[Dict[str, str]] = []
        self.topics_covered: List[str] = []
        self.red_flags_identified: List[str] = []
        self.questions_asked = 0
        self.relevant_questions = 0

    def get_current_node(self) -> Optional[Dict[str, Any]]:
        """Get the current dialogue node"""
        node = self.dialogue_tree.get(self.current_node_id)
        return node

    def get_initial_patient_message(self) -> str:
        """Get the initial patient greeting/complaint"""
        root_node = self.dialogue_tree.get("root", {})
        return root_node.get("patient_says", "Hello, doctor.")

    async def process_student_input(
        self, student_message: str, session_context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Process student input and generate appropriate patient response

        Args:
            student_message: What the student said/asked
            session_context: Additional session context

        Returns:
            Tuple of (patient_response, metadata)
        """
        self.questions_asked += 1

        # Analyze student input
        analysis = self._analyze_student_input(student_message)

        # Update topics covered
        for topic in analysis["topics"]:
            if topic not in self.topics_covered:
                self.topics_covered.append(topic)

        # Check for red flags
        for red_flag in analysis["red_flags"]:
            if red_flag not in self.red_flags_identified:
                self.red_flags_identified.append(red_flag)

        # Determine if question is relevant
        if analysis["is_relevant"]:
            self.relevant_questions += 1

        # Get patient response using AI
        response_data = await self._generate_patient_response(student_message, analysis)

        # Handle both string (legacy/fallback) and dict (new) responses
        if isinstance(response_data, dict):
            patient_text = response_data.get("text", "")
            emotion = response_data.get("emotion", "neutral")
        else:
            patient_text = str(response_data)
            emotion = "neutral"

        # Add to conversation history
        self.conversation_history.append({"role": "student", "content": student_message})
        self.conversation_history.append(
            {
                "role": "patient",
                "content": patient_text,
                "emotion": emotion,  # Store emotion in history
            }
        )

        # Prepare metadata
        metadata = {
            "topics_covered": self.topics_covered,
            "red_flags_identified": self.red_flags_identified,
            "questions_asked": self.questions_asked,
            "relevant_questions": self.relevant_questions,
            "analysis": analysis,
            "emotion": emotion,  # Pass emotion to frontend
        }

        return patient_text, metadata

    def _analyze_student_input(self, student_message: str) -> Dict[str, Any]:
        """
        Analyze student input to extract topics, red flags, and relevance

        Args:
            student_message: Student's message

        Returns:
            Analysis results
        """
        message_lower = student_message.lower()

        # Get expected topics from current node
        current_node = self.get_current_node() or {}
        expected_topics = current_node.get("expected_topics", [])

        # Simple keyword matching for topics (can be enhanced with NLP)
        topics_found = []
        topic_keywords = {
            "pain_quality": ["sharp", "dull", "aching", "stabbing", "crushing", "pressure"],
            "pain_location": ["chest", "arm", "jaw", "back", "shoulder"],
            "pain_severity": ["severe", "mild", "moderate", "scale", "out of 10"],
            "pain_duration": ["how long", "when did", "duration", "started"],
            "radiation": ["spread", "radiate", "move", "travel"],
            "associated_symptoms": ["nausea", "vomiting", "sweating", "breathless", "dizzy"],
            "past_medical_history": ["medical history", "conditions", "diagnosed", "previous"],
            "medications": ["medication", "tablets", "drugs", "taking"],
            "allergies": ["allergies", "allergic", "allergy"],
            "social_history": ["smoke", "alcohol", "drink", "occupation", "job"],
            "family_history": ["family", "mother", "father", "siblings"],
        }

        for topic, keywords in topic_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                topics_found.append(topic)

        # Check for red flags
        red_flags = []
        red_flag_keywords = {
            "crushing_pain": ["crushing", "heavy", "pressure", "tight"],
            "radiation_to_arm": ["arm", "jaw", "shoulder"],
            "sweating": ["sweating", "clammy", "perspiring"],
            "breathlessness": ["breathless", "breath", "breathing"],
            "duration_over_15min": ["hour", "hours"],
        }

        for red_flag, keywords in red_flag_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                red_flags.append(red_flag)

        # Determine if question is relevant (overlaps with expected topics)
        is_relevant = len(set(topics_found) & set(expected_topics)) > 0 or len(topics_found) > 0

        return {
            "topics": topics_found,
            "red_flags": red_flags,
            "is_relevant": is_relevant,
            "expected_topics_covered": len(set(topics_found) & set(expected_topics)),
        }

    async def _generate_patient_response(
        self, student_message: str, analysis: Dict[str, Any]
    ) -> Any:  # Returns Dict[str, str] or str (fallback)
        """
        Generate contextual patient response using Azure OpenAI

        Args:
            student_message: Student's message
            analysis: Analysis of student input

        Returns:
            Patient's response
        """
        try:
            response = await azure_openai_service.generate_patient_response(
                scenario_context=self.scenario,
                student_message=student_message,
                conversation_history=self.conversation_history[-6:],  # Last 3 exchanges
            )

            return response

        except Exception as e:
            logger.error(f"Error generating patient response: {e}")
            # Fallback response
            return "I'm not sure I understand. Could you rephrase that?"

    def get_assessment_data(self) -> Dict[str, Any]:
        """
        Get data for assessment calculation

        Returns:
            Assessment data dictionary
        """
        rubric = self.scenario.get("assessment_rubric", {})

        # Calculate coverage of must-ask questions
        must_ask = rubric.get("must_ask", [])
        must_ask_covered = len(set(self.topics_covered) & set(must_ask))
        must_ask_percentage = (must_ask_covered / len(must_ask) * 100) if must_ask else 0

        # Calculate red flag identification
        expected_red_flags = rubric.get("red_flags", [])
        red_flags_missed = len(set(expected_red_flags) - set(self.red_flags_identified))

        return {
            "topics_covered": self.topics_covered,
            "must_ask_percentage": must_ask_percentage,
            "red_flags_caught": self.red_flags_identified,
            "red_flags_missed_count": red_flags_missed,
            "questions_asked": self.questions_asked,
            "relevant_questions": self.relevant_questions,
            "relevance_percentage": (
                self.relevant_questions / self.questions_asked * 100
                if self.questions_asked > 0
                else 0
            ),
            "conversation_history": self.conversation_history,
        }
