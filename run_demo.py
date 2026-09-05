import sys
sys.stdout.reconfigure(encoding='utf-8')
from debate_engine import DebateSession
import fallacy_detector
import scoring_service

print("=" * 65)
print("   DEBATEAI — STREAMLIT ENGINE LIVE DEBATE RUN & OUTPUT")
print("=" * 65)

# Initialize Match
motion = "College education should be completely tuition-free"
session = DebateSession(
    motion=motion,
    user_position="Pro",
    difficulty="Intermediate",
    max_rounds=2
)

print(f"\n📌 MOTION: \"{session.motion}\"")
print(f"👤 YOUR POSITION: {session.user_position} (Affirmative)")
print(f"🤖 AI COACH POSITION: {session.ai_position} (Negative)")
print(f"⚙️ DIFFICULTY: {session.difficulty}")
print(f"🔄 MAX ROUNDS: {session.max_rounds}\n")

print("-" * 65)
print("🤖 AI COACH OPENING STATEMENT (Round 0):")
print("-" * 65)
print(session.ai_opening_statement)
print()

# --- ROUND 1 (Type Mode) ---
print("=" * 65)
print("🎯 ROUND 1: USER SUBMITS TYPED ARGUMENT [Option 1: Type]")
print("=" * 65)
user_arg_1 = "Tuition-free college is an essential public investment because it eliminates student debt burdens, boosts economic mobility for low-income students, and increases national tax revenues over the long term."
print(f"👤 You argued:\n\"{user_arg_1}\"\n")

turn_1 = session.process_turn(user_arg_1)

sc_1 = turn_1["score_data"]
print("📊 ROUND 1 REAL-TIME 4-METRIC SCORING:")
print(f"   • Clarity:     {sc_1['clarity']}/25")
print(f"   • Logic:       {sc_1['logic']}/25")
print(f"   • Evidence:    {sc_1['evidence']}/25")
print(f"   • Persuasion:  {sc_1['persuasion']}/25")
print(f"   ⭐ TOTAL SCORE: {sc_1['total_score']}/100")
print(f"   💡 Coach Tip:  {sc_1['coaching_tip']}\n")

print(f"🛡️ FALLACIES DETECTED: {len(turn_1['detected_fallacies'])} fallacies found.\n")

print("🤖 AI COACH COUNTERARGUMENT:")
print(turn_1["ai_counterargument"])
print()
if turn_1.get("ai_follow_up"):
    print(f"❓ Cross-Examination Challenge: {turn_1['ai_follow_up']}\n")

# --- ROUND 2 (Voice Mode Simulation) ---
print("=" * 65)
print("🎯 ROUND 2: USER SUBMITS SPOKEN ARGUMENT [Option 2: Speak via Mic]")
print("=" * 65)
user_arg_2 = "My opponent is completely clueless about economics. If we make college free, everyone will get rich and our country will immediately become a paradise with zero poverty."
print(f"🎙️ Spoken & Transcribed onto Input Field:\n\"{user_arg_2}\"\n")

turn_2 = session.process_turn(user_arg_2)

sc_2 = turn_2["score_data"]
print("📊 ROUND 2 REAL-TIME 4-METRIC SCORING:")
print(f"   • Clarity:     {sc_2['clarity']}/25")
print(f"   • Logic:       {sc_2['logic']}/25")
print(f"   • Evidence:    {sc_2['evidence']}/25")
print(f"   • Persuasion:  {sc_2['persuasion']}/25")
print(f"   ⭐ TOTAL SCORE: {sc_2['total_score']}/100")
print(f"   💡 Coach Tip:  {sc_2['coaching_tip']}\n")

print(f"🛡️ FALLACIES DETECTED ({len(turn_2['detected_fallacies'])}):")
for f in turn_2["detected_fallacies"]:
    print(f"   ⚠️ [{f['name']}]: \"{f['matched_text']}\"")
    print(f"      Description: {f['description']}")
    print(f"      Coach Advice: {f['tip']}\n")

print("🤖 AI COACH COUNTERARGUMENT:")
print(turn_2["ai_counterargument"])
print()

# --- FINAL ADJUDICATION REPORT ---
print("=" * 65)
print("🏆 FINAL DEBATE PERFORMANCE & COACHING REPORT")
print("=" * 65)
report = session.conclude_debate()
print(f"🏅 VERDICT: {report['verdict']}")
print(f"📈 AVERAGE SCORE: {report['average_score']}/100")
print(f"   • Avg Clarity:    {report['avg_clarity']}/25")
print(f"   • Avg Logic:      {report['avg_logic']}/25")
print(f"   • Avg Evidence:   {report['avg_evidence']}/25")
print(f"   • Avg Persuasion: {report['avg_persuasion']}/25")
print(f"\n📝 Coach Summary:\n{report['coach_summary']}\n")

print("✅ Key Strengths:")
for s in report["strengths"]:
    print(f"   + {s}")

print("\n🎯 Areas for Improvement:")
for imp in report["improvements"]:
    print(f"   - {imp}")
print("=" * 65)
