"""
DebateAI - LLM Service (Python)
Supports:
1. Groq Cloud (llama-3.3-70b-versatile / llama-3.1-8b-instant) - ultra fast (<500ms)
2. Google Gemini (gemini-1.5-flash)
3. Zero-key Built-in Collegiate Debate Heuristic Engine (offline fallback)
"""

import os
import re
import json
import random
import requests
from pathlib import Path

# Load environment variables from .env.local and .env
def load_local_env():
    for filename in [".env.local", ".env"]:
        env_path = Path(__file__).parent / filename
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'").strip('"')
                            if k not in os.environ and v:
                                os.environ[k] = v
            except Exception:
                pass

load_local_env()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

def get_active_provider() -> str:
    if GROQ_API_KEY:
        return "Groq (Llama-3.3-70B)"
    if GEMINI_API_KEY:
        return "Google Gemini"
    if OPENAI_API_KEY:
        return "OpenAI"
    return "Built-in Heuristic AI"

def call_groq(messages: list, temperature: float = 0.7) -> str:
    if not GROQ_API_KEY:
        raise ValueError("No Groq API Key found")
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Try active models in order
    models_to_try = ["groq/compound-mini", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]
    last_err = None
    for model in models_to_try:
        try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": 800
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                last_err = f"{resp.status_code}: {resp.text}"
        except Exception as e:
            last_err = str(e)
            continue
            
    raise RuntimeError(f"All Groq models failed. Last error: {last_err}")

def call_gemini(system_instruction: str, prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise ValueError("No Gemini API Key found")
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_instruction
    )
    response = model.generate_content(prompt)
    return response.text.strip()

def generate_opening_speech(motion: str, ai_position: str, difficulty: str = "intermediate") -> str:
    """Generates the opening statement from the AI opponent."""
    system_prompt = (
        f"You are a friendly yet formidable AI debate opponent in a collegiate debate practice. "
        f"The motion is: '{motion}'. "
        f"You are arguing the {ai_position.upper()} position. "
        f"Difficulty level: {difficulty}. "
        f"RULES: "
        f"1. Use simple, clear, conversational everyday English. Avoid complex jargon. "
        f"2. Present 2 clear arguments supporting your position. "
        f"3. Keep it punchy and engaging (between 80 and 130 words). "
        f"4. End by inviting the user to present their first round of arguments."
    )
    
    user_prompt = f"Please deliver your opening statement defending the {ai_position} position on: '{motion}'."

    # 1. Try Groq
    if GROQ_API_KEY:
        try:
            return call_groq([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ])
        except Exception as e:
            print(f"[LLM] Groq error: {e}")

    # 2. Try Gemini
    if GEMINI_API_KEY:
        try:
            return call_gemini(system_prompt, user_prompt)
        except Exception as e:
            print(f"[LLM] Gemini error: {e}")

    # 3. Fallback Heuristic Opening
    if ai_position.lower() in ["pro", "affirmative", "for"]:
        return (
            f"I am proud to stand in favor of the motion: \"{motion}\". "
            f"When we examine the practical reality, supporting this position leads to undeniable benefits. "
            f"First, it creates greater fairness and opportunities for everyone involved. "
            f"Second, refusing to make this change holds back progress and ignores serious real-world problems. "
            f"I look forward to hearing your perspective. The floor is yours for Round 1!"
        )
    else:
        return (
            f"I firmly oppose the motion: \"{motion}\". "
            f"While the intention behind this idea may sound good on paper, in practice it carries heavy risks. "
            f"First, the costs and unintended consequences far outweigh the promised advantages. "
            f"Second, there are much safer and more practical alternatives that solve the core issue without causing damage. "
            f"I invite you to present your opening argument. Let's see how strong your evidence is!"
        )

def generate_counterargument(
    motion: str,
    user_position: str,
    ai_position: str,
    user_argument: str,
    round_number: int,
    difficulty: str = "intermediate"
) -> dict:
    """
    Generates a direct rebuttal and a follow-up challenge question.
    Returns: {"counterargument": str, "follow_up_question": str}
    """
    system_prompt = (
        f"You are an AI Debate Coach and sparring partner in an interactive debate chatbot. "
        f"Motion: '{motion}'. "
        f"User stance: {user_position}. Your stance: {ai_position}. "
        f"Round: {round_number}. Difficulty: {difficulty}. "
        f"INSTRUCTIONS: "
        f"1. Use simple, natural, conversational everyday English. DO NOT use confusing academic words. "
        f"2. Directly address the user's points and explain clearly where their logic or evidence is weak. "
        f"3. Provide 1 or 2 concrete counter-points or real-world examples. "
        f"4. Keep the rebuttal between 90 and 150 words. "
        f"5. Provide exactly one sharp, direct follow-up question that challenges them to defend their point. "
        f"Return your answer strictly in valid JSON format: "
        f'{{"counterargument": "your rebuttal text here", "follow_up_question": "your question here"}}'
    )
    
    user_prompt = f"User's Round {round_number} Argument:\n\"{user_argument}\""

    # 1. Try Groq
    if GROQ_API_KEY:
        try:
            raw = call_groq([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ], temperature=0.6)
            
            # Clean JSON
            json_match = re.search(r"\{[\s\S]*\}", raw)
            if json_match:
                parsed = json.loads(json_match.group(0))
                if "counterargument" in parsed and "follow_up_question" in parsed:
                    return parsed
        except Exception as e:
            print(f"[LLM] Groq counterargument error: {e}")

    # 2. Try Gemini
    if GEMINI_API_KEY:
        try:
            raw = call_gemini(system_prompt, user_prompt)
            json_match = re.search(r"\{[\s\S]*\}", raw)
            if json_match:
                parsed = json.loads(json_match.group(0))
                if "counterargument" in parsed and "follow_up_question" in parsed:
                    return parsed
        except Exception as e:
            print(f"[LLM] Gemini counterargument error: {e}")

    # 3. Fallback Heuristic Counterargument
    words = user_argument.lower()
    topic_words = [w for w in re.findall(r'\b\w{4,}\b', words) if w not in [
        'this', 'that', 'with', 'from', 'have', 'more', 'will', 'they', 'their', 'because', 'should'
    ]]
    key_topic = topic_words[0] if topic_words else "your main claim"

    rebuttals = [
        f"You make an interesting point about {key_topic}, but your argument assumes things will always work out under ideal conditions. In the real world, human behavior, enforcement costs, and unintended side-effects quickly complicate this picture. If we only look at the upside without preparing for the downsides, the plan easily falls apart.",
        f"While I see your point regarding {key_topic}, your reasoning overlooks who actually bears the cost. When policies or ideas like this are put into place, they frequently create new barriers and unfair outcomes for the people they were meant to help.",
        f"Your argument centers heavily on {key_topic}, but you haven't shown solid proof that this is the best or only solution. Many countries and organizations have tried similar steps and found that practical hurdles created bigger headaches than the original problem."
    ]

    questions = [
        f"How would you address the unintended negative side-effects that this approach creates for everyday people?",
        f"What concrete evidence can you offer showing that the benefits of {key_topic} outweigh the heavy costs?",
        f"If the opposing side has a safer and cheaper alternative, why should judges prefer your route?"
    ]

    return {
        "counterargument": random.choice(rebuttals),
        "follow_up_question": random.choice(questions)
    }

def generate_final_verdict(
    motion: str,
    user_position: str,
    rounds_data: list,
    average_score: float
) -> dict:
    """Generates comprehensive final evaluation and coaching advice."""
    summary_text = "\n".join([
        f"Round {r.get('round_num', i+1)}: User Arg: {r.get('user_arg', '')[:100]}... Score: {r.get('score', 75)}"
        for i, r in enumerate(rounds_data)
    ])

    system_prompt = (
        f"You are an expert Chief Adjudicator and Debate Coach analyzing a student's debate match. "
        f"Motion: '{motion}'. User Stance: {user_position}. Average Score: {average_score:.1f}/100. "
        f"RULES: "
        f"1. Use simple, clear, supportive, and conversational English. "
        f"2. Give a clear verdict: 'User Victory', 'Close Contest', or 'Debate Coach Win'. "
        f"3. List 2 specific strengths. "
        f"4. List 2 concrete areas for improvement. "
        f"5. Provide a 2-sentence encouraging summary from the coach. "
        f"Return strictly in JSON format: "
        f'{{"verdict": "string", "strengths": ["str", "str"], "improvements": ["str", "str"], "coach_summary": "string"}}'
    )

    if GROQ_API_KEY:
        try:
            raw = call_groq([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": summary_text}
            ], temperature=0.5)
            json_match = re.search(r"\{[\s\S]*\}", raw)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception as e:
            print(f"[LLM] Final verdict Groq error: {e}")

    # Fallback verdict
    if average_score >= 82:
        verdict = "User Victory"
    elif average_score >= 70:
        verdict = "Close Contest (Strong Showing)"
    else:
        verdict = "AI Coach Advantage (Good Practice Round)"

    return {
        "verdict": verdict,
        "strengths": [
            "Consistent stance maintained across all rounds without contradicting earlier claims.",
            "Clear communication and willingness to engage directly with tough counter-arguments."
        ],
        "improvements": [
            "Support key claims with specific statistics, studies, or real-world examples.",
            "Anticipate the opponent's counterpoints before they bring them up."
        ],
        "coach_summary": (
            f"You delivered a competitive debate on '{motion}' with an average score of {average_score:.1f}/100. "
            f"Keep practicing to strengthen your evidence backing and sharpen your critical rebuttals!"
        )
    }
