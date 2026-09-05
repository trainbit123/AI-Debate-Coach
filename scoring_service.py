"""
DebateAI - Scoring Service (Python)
Evaluates debate arguments across 4 dimensions:
1. Clarity (0-25)
2. Logic (0-25)
3. Evidence (0-25)
4. Persuasion (0-25)
Total Score = 0 - 100
"""

import re
from typing import Dict, List

def evaluate_argument(argument_text: str, detected_fallacies: List[Dict], motion: str = "") -> Dict:
    """
    Evaluates a user's debate argument and produces a 4-dimensional score with feedback.
    """
    text = argument_text.strip()
    words = text.split()
    word_count = len(words)
    
    # 1. Clarity (0-25)
    # Rewards appropriate length, good structure, and readability
    clarity = 15.0
    if word_count >= 15:
        clarity += 3.0
    if word_count >= 35:
        clarity += 4.0
    if word_count >= 70:
        clarity += 3.0
    # Deduct if excessively short or single run-on sentence
    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    if len(sentences) >= 2:
        clarity += 2.0
    clarity = min(25.0, max(5.0, clarity))

    # 2. Logic (0-25)
    # Checks for causal transitions (because, therefore, thus, leads to, so)
    logic = 16.0
    connectors = ["because", "therefore", "since", "leads to", "results in", "consequently", "if", "then", "due to"]
    connectors_found = sum(1 for c in connectors if re.search(r'\b' + c + r'\b', text, re.IGNORECASE))
    logic += min(6.0, connectors_found * 2.0)
    
    # Deduct points for logical fallacies
    if detected_fallacies:
        logic -= min(10.0, len(detected_fallacies) * 4.0)
    logic = min(25.0, max(5.0, logic))

    # 3. Evidence (0-25)
    # Checks for numbers, stats, studies, examples, countries, research
    evidence = 12.0
    evidence_cues = ["for example", "for instance", "percent", "%", "study", "research", "data", "report", "according to", "evidence shows", "historically", "in fact"]
    cues_found = sum(1 for cue in evidence_cues if cue in text.lower())
    evidence += min(8.0, cues_found * 2.5)

    # Has numbers or statistics
    if re.search(r'\b\d+(\.\d+)?%?\b', text):
        evidence += 3.0
    evidence = min(25.0, max(4.0, evidence))

    # 4. Persuasion (0-25)
    # Measures impact, direct confrontation of motion, and persuasive tone
    persuasion = 16.0
    if word_count >= 40:
        persuasion += 4.0
    if any(term in text.lower() for term in ["crucial", "essential", "vital", "matter", "we must", "important", "clear that", "fundamental"]):
        persuasion += 3.0
    if detected_fallacies:
        persuasion -= min(5.0, len(detected_fallacies) * 2.0)
    persuasion = min(25.0, max(6.0, persuasion))

    total_score = round(clarity + logic + evidence + persuasion, 1)

    # Generate constructive coaching feedback
    strengths = []
    tips = []

    if clarity >= 20:
        strengths.append("Clear presentation and easy-to-follow phrasing.")
    else:
        tips.append("Try organizing your points into 2 distinct sentences for higher clarity.")

    if logic >= 20:
        strengths.append("Strong chain of reasoning connecting your premise to the conclusion.")
    elif detected_fallacies:
        tips.append(f"Watch out for {detected_fallacies[0]['name']} - {detected_fallacies[0]['tip']}")
    else:
        tips.append("Use causal words like 'therefore' and 'because' to make your logical chain undeniable.")

    if evidence >= 18:
        strengths.append("Concrete examples and factual support included.")
    else:
        tips.append("Include a specific number, real-world example, or study to elevate your evidence score.")

    if persuasion >= 20:
        strengths.append("Compelling and persuasive delivery that directly challenges the opponent.")

    if not strengths:
        strengths.append("Good initial effort putting your stance forward into the debate arena.")
    if not tips:
        tips.append("Keep up this strong level of argumentation in the upcoming rounds!")

    return {
        "total_score": total_score,
        "clarity": round(clarity, 1),
        "logic": round(logic, 1),
        "evidence": round(evidence, 1),
        "persuasion": round(persuasion, 1),
        "strengths": strengths,
        "coaching_tip": tips[0] if tips else "Keep your argument focused on the core motion."
    }
