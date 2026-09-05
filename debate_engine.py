"""
DebateAI - Debate Engine (Python)
Manages debate state, round orchestration, scoring, fallacy analysis, and final verdict.
"""

from typing import Dict, List, Optional
import fallacy_detector
import scoring_service
import llm_service

PRESET_MOTIONS = [
    {
        "id": "ai-education",
        "title": "Artificial Intelligence will improve student learning and school education",
        "category": "Technology & AI",
        "description": "Debate whether generative AI tools boost student comprehension or erode critical reasoning."
    },
    {
        "id": "social-media-age",
        "title": "Social media access should be restricted for teenagers under 16",
        "category": "Society & Youth",
        "description": "Debate the balance between youth mental health protection and digital freedom of expression."
    },
    {
        "id": "remote-work",
        "title": "Remote work is more productive and beneficial than working in an office",
        "category": "Workplace & Economy",
        "description": "Debate employee well-being and productivity vs in-person collaboration and company culture."
    },
    {
        "id": "renewable-energy",
        "title": "Governments should completely ban fossil fuel subsidies immediately",
        "category": "Environment & Policy",
        "description": "Debate accelerating clean energy vs managing short-term economic disruptions and fuel prices."
    },
    {
        "id": "universal-basic-income",
        "title": "Universal Basic Income is necessary to protect citizens against automation",
        "category": "Economics & Future",
        "description": "Debate poverty elimination vs fiscal cost and potential disincentives to work."
    }
]

class DebateSession:
    def __init__(
        self,
        motion: str,
        user_position: str = "Pro",
        difficulty: str = "Intermediate",
        max_rounds: int = 0  # 0 means endless / unlimited
    ):
        self.motion = motion
        self.user_position = user_position
        self.ai_position = "Con" if user_position.lower() in ["pro", "affirmative", "for"] else "Pro"
        self.difficulty = difficulty
        self.max_rounds = max_rounds
        self.current_round = 1
        self.is_complete = False
        self.rounds: List[Dict] = []
        self.fallacies_count = 0
        
        # Opening statement from AI
        self.ai_opening_statement = llm_service.generate_opening_speech(
            motion=self.motion,
            ai_position=self.ai_position,
            difficulty=self.difficulty
        )

    def process_turn(self, user_argument: str) -> Dict:
        """Processes one round of the user's argument."""
        # 1. Fallacy Detection
        detected_fallacies = fallacy_detector.scan_for_fallacies(user_argument)
        if detected_fallacies:
            self.fallacies_count += len(detected_fallacies)

        # 2. Argument Scoring
        score_data = scoring_service.evaluate_argument(
            argument_text=user_argument,
            detected_fallacies=detected_fallacies,
            motion=self.motion
        )

        # 3. AI Counterargument & Follow-up
        rebuttal_data = llm_service.generate_counterargument(
            motion=self.motion,
            user_position=self.user_position,
            ai_position=self.ai_position,
            user_argument=user_argument,
            round_number=self.current_round,
            difficulty=self.difficulty
        )

        round_record = {
            "round_number": self.current_round,
            "user_argument": user_argument,
            "detected_fallacies": detected_fallacies,
            "score_data": score_data,
            "ai_counterargument": rebuttal_data["counterargument"],
            "ai_follow_up": rebuttal_data["follow_up_question"]
        }

        self.rounds.append(round_record)
        self.current_round += 1

        # Check if fixed rounds reached
        if self.max_rounds > 0 and (self.current_round - 1) >= self.max_rounds:
            self.is_complete = True

        return round_record

    def get_average_score(self) -> float:
        if not self.rounds:
            return 0.0
        scores = [r["score_data"]["total_score"] for r in self.rounds]
        return round(sum(scores) / len(scores), 1)

    def conclude_debate(self) -> Dict:
        """Concludes debate and produces final adjudication report."""
        self.is_complete = True
        avg_score = self.get_average_score()
        
        rounds_summary = [
            {
                "round_num": r["round_number"],
                "user_arg": r["user_argument"],
                "score": r["score_data"]["total_score"]
            }
            for r in self.rounds
        ]

        final_analysis = llm_service.generate_final_verdict(
            motion=self.motion,
            user_position=self.user_position,
            rounds_data=rounds_summary,
            average_score=avg_score
        )

        # Calculate dimension averages
        if self.rounds:
            avg_clarity = round(sum(r["score_data"]["clarity"] for r in self.rounds) / len(self.rounds), 1)
            avg_logic = round(sum(r["score_data"]["logic"] for r in self.rounds) / len(self.rounds), 1)
            avg_evidence = round(sum(r["score_data"]["evidence"] for r in self.rounds) / len(self.rounds), 1)
            avg_persuasion = round(sum(r["score_data"]["persuasion"] for r in self.rounds) / len(self.rounds), 1)
        else:
            avg_clarity = avg_logic = avg_evidence = avg_persuasion = 0.0

        return {
            "motion": self.motion,
            "user_position": self.user_position,
            "ai_position": self.ai_position,
            "total_rounds": len(self.rounds),
            "average_score": avg_score,
            "avg_clarity": avg_clarity,
            "avg_logic": avg_logic,
            "avg_evidence": avg_evidence,
            "avg_persuasion": avg_persuasion,
            "total_fallacies": self.fallacies_count,
            "verdict": final_analysis.get("verdict", "Debate Concluded"),
            "strengths": final_analysis.get("strengths", []),
            "improvements": final_analysis.get("improvements", []),
            "coach_summary": final_analysis.get("coach_summary", "")
        }
