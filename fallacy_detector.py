"""
DebateAI - Logical Fallacy Detector (Python)
Detects 9 common debate logical fallacies with simple English explanations & coaching tips.
"""

import re
from typing import List, Dict, Optional

FALLACY_DEFINITIONS = {
    "Ad Hominem": {
        "badge_color": "#ef4444",
        "description": "Attacking the opponent personally instead of addressing their argument.",
        "tip": "Focus on the facts and reasons of the topic, not the character or motives of the other person."
    },
    "Straw Man": {
        "badge_color": "#f97316",
        "description": "Exaggerating or twisting the other side's view to make it easier to attack.",
        "tip": "Deal with the actual claim your opponent made, not an exaggerated caricature of it."
    },
    "False Dilemma": {
        "badge_color": "#eab308",
        "description": "Presenting only two extreme choices when there are actually many middle options.",
        "tip": "Acknowledge that most real-world problems have balanced or phased solutions, not just either/or."
    },
    "Slippery Slope": {
        "badge_color": "#8b5cf6",
        "description": "Claiming that a small first step will definitely trigger an extreme disaster with no proof.",
        "tip": "Show real proof for each step in your chain of events rather than jumping to worst-case scenarios."
    },
    "Circular Reasoning": {
        "badge_color": "#ec4899",
        "description": "Restating your conclusion as the proof instead of giving new evidence.",
        "tip": "Give external facts or numbers that prove why your statement is true."
    },
    "Appeal to Authority": {
        "badge_color": "#06b6d4",
        "description": "Claiming something is true simply because a famous person or title said so, without real data.",
        "tip": "Cite the actual research, data, or logic behind the expert's conclusion, not just their name."
    },
    "Appeal to Emotion": {
        "badge_color": "#f43f5e",
        "description": "Using strong emotional words (fear, pity, outrage) to win an argument instead of logic.",
        "tip": "Keep passion, but back it up with sound logic and real evidence so judges can evaluate the facts."
    },
    "Red Herring": {
        "badge_color": "#64748b",
        "description": "Bringing up an unrelated topic to distract from the main question being debated.",
        "tip": "Stay focused on the core motion. Answer the specific question before introducing new angles."
    },
    "Hasty Generalization": {
        "badge_color": "#d97706",
        "description": "Making a sweeping broad claim about everyone based on just one or two isolated examples.",
        "tip": "Use words like 'many' or 'frequently' instead of 'all' or 'always', and cite broader statistical trends."
    }
}

# Regex pattern rules for detection
FALLACY_PATTERNS = [
    (
        "Ad Hominem",
        [
            r"\b(you are|you're) (stupid|dumb|ignorant|evil|corrupt|biased|clueless|blind|naive|selfish|hypocrite)\b",
            r"\b(only an idiot|no intelligent person|anyone with a brain)\b",
            r"\b(people like you|your kind|you don't know anything)\b",
            r"\b(how can you even think|you're clearly lying)\b"
        ]
    ),
    (
        "False Dilemma",
        [
            r"\b(either we|it's either)\b.+\b(or we will|or else|or nothing|or disaster)\b",
            r"\byou are either with us or against us\b",
            r"\b(there are only two choices|no other choice|the only other option is)\b",
            r"\b(it's all or nothing|black or white)\b"
        ]
    ),
    (
        "Slippery Slope",
        [
            r"\bif we (allow|let|do this|start)\b.+\b(eventually|inevitably|will lead to|will cause|collapse|destroy everything)\b",
            r"\bthis will inevitably lead to (disaster|ruin|chaos|total collapse)\b",
            r"\bnext thing you know\b",
            r"\bwhere does it stop\b"
        ]
    ),
    (
        "Hasty Generalization",
        [
            r"\b(everyone knows that|everybody agrees|no one ever|all people always|nobody does this)\b",
            r"\bi know one person who.+so (all|everyone)\b",
            r"\bevery single (person|company|government|country) (always|never)\b",
            r"\bit always happens like this\b"
        ]
    ),
    (
        "Appeal to Emotion",
        [
            r"\b(think of the children|innocent people are dying|heartless monster|blood on their hands)\b",
            r"\bhow can you sleep at night\b",
            r"\b(pure evil|truly disgusting|disgraceful to even suggest)\b",
            r"\bshame on anyone who\b"
        ]
    ),
    (
        "Circular Reasoning",
        [
            r"\bit is right because it is right\b",
            r"\bit's true because (i said so|it is the truth|everyone knows it's true)\b",
            r"\bbecause that's just the way it is\b",
            r"\bit's bad because it's harmful and it's harmful because it's bad\b"
        ]
    ),
    (
        "Straw Man",
        [
            r"\bso what you're saying is we should just\b",
            r"\byou want everyone to suffer\b",
            r"\byou're basically claiming that\b",
            r"\bso you want to destroy all\b"
        ]
    ),
    (
        "Appeal to Authority",
        [
            r"\b(a famous actor|celebrities|elon musk|influencers) said so therefore\b",
            r"\bbecause this celebrity believes it\b",
            r"\bthey are famous so they must be right\b"
        ]
    ),
    (
        "Red Herring",
        [
            r"\bwhat about when the other side did\b",
            r"\bwhy aren't we talking about something else\b",
            r"\bthat doesn't matter because what about\b"
        ]
    )
]

def scan_for_fallacies(argument_text: str) -> List[Dict]:
    """
    Scans an argument string for logical fallacies.
    Returns a list of detected fallacy dictionaries with explanation and tips.
    """
    detected = []
    seen = set()
    cleaned = argument_text.lower()

    for fallacy_name, patterns in FALLACY_PATTERNS:
        for pat in patterns:
            match = re.search(pat, cleaned, re.IGNORECASE)
            if match and fallacy_name not in seen:
                seen.add(fallacy_name)
                info = FALLACY_DEFINITIONS.get(fallacy_name, {})
                detected.append({
                    "name": fallacy_name,
                    "matched_text": match.group(0),
                    "description": info.get("description", "Potential reasoning flaw."),
                    "tip": info.get("tip", "Refine this point with factual support."),
                    "badge_color": info.get("badge_color", "#ef4444")
                })
                break

    return detected
