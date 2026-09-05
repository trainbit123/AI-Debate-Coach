"""
DebateAI - AI Debate Coach & Study Partner Chatbot
A full Python Streamlit platform for interactive debate practice,
real-time 4-metric scoring, 9-fallacy scanning, and adaptive counterarguments.
"""

import streamlit as st
import time
import json
import base64
import io
from streamlit_mic_recorder import speech_to_text
from debate_engine import DebateSession, PRESET_MOTIONS
import llm_service
import fallacy_detector
import scoring_service

@st.cache_data(show_spinner=False)
def generate_speech_audio(text: str) -> bytes:
    """Generates speech audio bytes using gTTS for spoken rebuttals."""
    try:
        from gtts import gTTS
        clean_text = text.replace("**", "").replace('"', '').strip()
        tts = gTTS(text=clean_text[:400], lang="en", tld="com")
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return fp.read()
    except Exception:
        return b""


# Page Configuration
st.set_page_config(
    page_title="DebateAI — AI Debate Coach & Study Partner",
    page_icon="🎙️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (Dark Debate Arena Theme)
st.markdown("""
<style>
    /* Main Background & Fonts */
    .stApp {
        background-color: #0b0f19;
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* Top Motion Card */
    .motion-container {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
        border: 1px solid rgba(59, 130, 246, 0.25);
        border-radius: 18px;
        padding: 22px 26px;
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .motion-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: #ffffff;
        margin-top: 8px;
        line-height: 1.4;
    }
    .badge-pill {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .badge-pro {
        background-color: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-con {
        background-color: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .badge-blue {
        background-color: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.3);
    }

    /* Score Card in Chat */
    .score-card {
        background-color: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(51, 65, 85, 0.8);
        border-radius: 12px;
        padding: 12px 16px;
        margin-top: 10px;
        font-size: 0.85rem;
    }
    .score-metric {
        font-weight: 700;
        color: #38bdf8;
    }
    
    /* Fallacy Alert Box */
    .fallacy-box {
        background-color: rgba(239, 68, 68, 0.1);
        border-left: 4px solid #ef4444;
        border-radius: 8px;
        padding: 10px 14px;
        margin-top: 8px;
        font-size: 0.83rem;
        color: #fca5a5;
    }

    /* Challenge Question Box */
    .question-box {
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 10px;
        padding: 12px 16px;
        margin-top: 12px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #e0e7ff;
    }

    /* Sidebar Clean styling */
    section[data-testid="stSidebar"] {
        background-color: #0f172a;
        border-right: 1px solid rgba(51, 65, 85, 0.5);
    }
</style>
""", unsafe_allow_html=True)

# Initialize Session State
if "debate_session" not in st.session_state:
    st.session_state.debate_session = None

if "show_final_report" not in st.session_state:
    st.session_state.show_final_report = False

if "final_report_data" not in st.session_state:
    st.session_state.final_report_data = None


# ----------------------------------------------------
# SIDEBAR: Setup & Controls
# ----------------------------------------------------
with st.sidebar:
    st.title("🎙️ DebateAI")
    st.caption("AI Debate Coach & Study Partner Chatbot")
    st.divider()

    st.subheader("⚙️ Debate Configuration")

    # Preset Motions Dropdown
    motion_options = [m["title"] for m in PRESET_MOTIONS] + ["✏️ Custom Motion..."]
    selected_motion_choice = st.selectbox(
        "Select Debate Motion:",
        options=motion_options,
        index=0,
        help="Choose a competitive debate topic or enter your own."
    )

    if selected_motion_choice == "✏️ Custom Motion...":
        active_motion = st.text_input(
            "Enter your debate motion:",
            placeholder="e.g., Space exploration should receive more government funding",
            value="College education should be completely tuition-free"
        )
    else:
        active_motion = selected_motion_choice

    # User Stance
    user_position = st.radio(
        "Your Stance:",
        options=["Pro (Affirmative)", "Con (Negative)"],
        index=0,
        horizontal=True
    )
    user_pos_clean = "Pro" if "Pro" in user_position else "Con"

    # Difficulty & Mode
    col_diff, col_rounds = st.columns(2)
    with col_diff:
        difficulty = st.selectbox("Difficulty:", ["Beginner", "Intermediate", "Advanced"], index=1)
    with col_rounds:
        rounds_choice = st.selectbox("Rounds:", ["Endless ∞", "3 Rounds", "5 Rounds"], index=0)

    max_rounds = 0 if "Endless" in rounds_choice else (3 if "3" in rounds_choice else 5)

    # Start / Restart Button
    if st.button("🚀 Start New Debate Practice", use_container_width=True, type="primary"):
        with st.spinner("Preparing debate motion and AI coach..."):
            st.session_state.debate_session = DebateSession(
                motion=active_motion,
                user_position=user_pos_clean,
                difficulty=difficulty,
                max_rounds=max_rounds
            )
            st.session_state.show_final_report = False
            st.session_state.final_report_data = None
            st.rerun()

    # Active Match Information
    if st.session_state.debate_session:
        session: DebateSession = st.session_state.debate_session
        st.divider()
        st.subheader("📊 Live Match Stats")
        
        c1, c2 = st.columns(2)
        with c1:
            st.metric("Round", f"{session.current_round}" if not session.is_complete else "Finished")
        with c2:
            st.metric("Avg Score", f"{session.get_average_score()}/100")

        st.metric("Fallacies Spotted", f"{session.fallacies_count}")
        st.caption(f"Engine: **{llm_service.get_active_provider()}**")

        st.divider()
        if not session.is_complete:
            if st.button("🏁 Conclude Debate & View Report", use_container_width=True):
                with st.spinner("Adjudicating full debate match..."):
                    report = session.conclude_debate()
                    st.session_state.final_report_data = report
                    st.session_state.show_final_report = True
                    st.rerun()


# ----------------------------------------------------
# MAIN ARENA DISPLAY
# ----------------------------------------------------

# If no active debate, show Welcome / Getting Started hero
if not st.session_state.debate_session:
    st.markdown("""
    <div style="text-align: center; padding: 40px 10px;">
        <h1 style="font-size: 2.6rem; font-weight: 900; color: #ffffff; margin-bottom: 12px;">
            Master Debate with an <span style="background: linear-gradient(90deg, #60a5fa, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">AI Debate Coach Chatbot</span>
        </h1>
        <p style="font-size: 1.15rem; color: #94a3b8; max-width: 720px; margin: 0 auto 30px auto; line-height: 1.6;">
            An interactive chatbot that acts as your personal debate coach and study partner.
            Practice competitive debate motions, receive instant counterarguments, spot logical fallacies in real-time,
            and sharpen your critical thinking.
        </p>
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)
    with col1:
        st.info("💬 **Interactive Chatbot**\n\nType arguments round-by-round and spar with an adaptive AI partner.")
    with col2:
        st.success("🎯 **Real-time 4D Scoring**\n\nObjective breakdown of Clarity, Logic, Evidence, and Persuasiveness.")
    with col3:
        st.warning("🛡️ **9-Fallacy Scanner**\n\nIdentifies Ad Hominem, Straw Man, Slippery Slope, and guides better reasoning.")

    st.markdown("<div style='height: 30px;'></div>", unsafe_allow_html=True)
    st.markdown("👈 **Configure your debate topic in the sidebar and click 'Start New Debate Practice' to begin!**")

    st.stop()


# ----------------------------------------------------
# ACTIVE DEBATE ARENA
# ----------------------------------------------------
session: DebateSession = st.session_state.debate_session

# Top Motion Banner
user_badge_class = "badge-pro" if session.user_position == "Pro" else "badge-con"
ai_badge_class = "badge-con" if session.user_position == "Pro" else "badge-pro"

st.markdown(f"""
<div class="motion-container">
    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
        <span class="badge-pill badge-blue">Live Debate Arena</span>
        <span class="badge-pill {user_badge_class}">You: {session.user_position}</span>
        <span class="badge-pill {ai_badge_class}">AI Coach: {session.ai_position}</span>
        <span class="badge-pill badge-blue">{session.difficulty} Level</span>
    </div>
    <div class="motion-title">&ldquo;{session.motion}&rdquo;</div>
</div>
""", unsafe_allow_html=True)


# ----------------------------------------------------
# FINAL REPORT SCREEN (if concluded)
# ----------------------------------------------------
if st.session_state.show_final_report and st.session_state.final_report_data:
    rep = st.session_state.final_report_data
    
    st.balloons()
    st.markdown("## 🏆 Debate Performance & Coaching Report")
    
    # Verdict Banner
    verdict = rep["verdict"]
    if "Victory" in verdict or "Win" in verdict:
        st.success(f"### Result: **{verdict}**")
    elif "Close" in verdict:
        st.info(f"### Result: **{verdict}**")
    else:
        st.warning(f"### Result: **{verdict}**")

    # Score Cards
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Overall Score", f"{rep['average_score']}/100")
    c2.metric("Clarity", f"{rep['avg_clarity']}/25")
    c3.metric("Logic", f"{rep['avg_logic']}/25")
    c4.metric("Evidence", f"{rep['avg_evidence']}/25")
    c5.metric("Persuasion", f"{rep['avg_persuasion']}/25")

    st.markdown(f"**Coach Summary:** {rep['coach_summary']}")

    col_str, col_imp = st.columns(2)
    with col_str:
        st.markdown("#### ✅ Key Strengths")
        for s in rep.get("strengths", []):
            st.markdown(f"- {s}")
    with col_imp:
        st.markdown("#### 🎯 Areas for Improvement")
        for imp in rep.get("improvements", []):
            st.markdown(f"- {imp}")

    st.divider()
    if st.button("🔄 Start Another Debate", type="primary"):
        st.session_state.debate_session = None
        st.session_state.show_final_report = False
        st.rerun()

    st.stop()


# ----------------------------------------------------
# CHAT CONVERSATION STREAM
# ----------------------------------------------------

# 1. AI Opening Statement (Round 0)
with st.chat_message("assistant", avatar="🤖"):
    st.markdown(f"**AI Debate Coach ({session.ai_position}):**")
    st.write(session.ai_opening_statement)
    
    # Audio Playback
    opening_audio = generate_speech_audio(session.ai_opening_statement)
    if opening_audio:
        st.audio(opening_audio, format="audio/mp3")
    st.caption("Floor is open for Round 1. Choose Option 1 (Type) or Option 2 (Speak) below!")

# 2. Render all past rounds
for r in session.rounds:
    # User's speech
    with st.chat_message("user", avatar="👤"):
        st.markdown(f"**Your Argument (Round {r['round_number']}):**")
        st.write(r["user_argument"])

        # Render Detected Fallacies if any
        if r["detected_fallacies"]:
            for f in r["detected_fallacies"]:
                st.markdown(f"""
                <div class="fallacy-box">
                    <strong>⚠️ Fallacy Detected: {f['name']}</strong><br/>
                    <em>&ldquo;{f['matched_text']}&rdquo;</em> — {f['description']}<br/>
                    <strong>Coach Tip:</strong> {f['tip']}
                </div>
                """, unsafe_allow_html=True)

        # Render Score Card
        sc = r["score_data"]
        st.markdown(f"""
        <div class="score-card">
            <span style="font-size: 0.95rem; font-weight: 800; color: #60a5fa;">Round {r['round_number']} Score: {sc['total_score']}/100</span> &bull; 
            Clarity: <span class="score-metric">{sc['clarity']}/25</span> | 
            Logic: <span class="score-metric">{sc['logic']}/25</span> | 
            Evidence: <span class="score-metric">{sc['evidence']}/25</span> | 
            Persuasion: <span class="score-metric">{sc['persuasion']}/25</span>
            <div style="margin-top: 5px; color: #cbd5e1;"><strong>Coach Tip:</strong> {sc['coaching_tip']}</div>
        </div>
        """, unsafe_allow_html=True)

    # AI Counterargument
    with st.chat_message("assistant", avatar="🤖"):
        st.markdown(f"**AI Debate Coach Counterargument (Round {r['round_number']}):**")
        st.write(r["ai_counterargument"])

        # Audio Playback for AI Counterargument
        counter_audio = generate_speech_audio(r["ai_counterargument"])
        if counter_audio:
            st.audio(counter_audio, format="audio/mp3")

        # Follow-up Question
        if r.get("ai_follow_up"):
            st.markdown(f"""
            <div class="question-box">
                ❓ Follow-Up Challenge Question: {r['ai_follow_up']}
            </div>
            """, unsafe_allow_html=True)


# ----------------------------------------------------
# USER ARGUMENT STATION: TWO OPTIONS (TYPE OR SPEAK)
# ----------------------------------------------------
if not session.is_complete:
    st.markdown("---")
    st.markdown(f"### 🎯 Round {session.current_round} — Deliver Your Argument")
    st.caption("You have two options: type your argument, or speak using your microphone (which transcribes into the field automatically):")

    # Draft key stored across interactions for this round
    draft_key = f"arg_draft_round_{session.current_round}"
    if draft_key not in st.session_state:
        st.session_state[draft_key] = ""

    # Two option tabs
    tab_type, tab_voice = st.tabs([
        "✍️ Option 1: Type Your Argument",
        "🎙️ Option 2: Speak Your Argument (Voice to Text)"
    ])

    # OPTION 1: TYPE ARGUMENT
    with tab_type:
        st.markdown("**Option 1: Type your argument directly:**")
        typed_text = st.text_area(
            label="Type your argument:",
            label_visibility="collapsed",
            value=st.session_state[draft_key],
            height=130,
            placeholder=f"Round {session.current_round}: Type your argument, cite your reasons/evidence, and counter the AI coach's stance...",
            key=f"input_typed_{session.current_round}"
        )
        if typed_text != st.session_state[draft_key]:
            st.session_state[draft_key] = typed_text

        col_t1, col_t2 = st.columns([3, 1])
        with col_t1:
            words = len(typed_text.split()) if typed_text else 0
            st.caption(f"📝 {words} words")
        with col_t2:
            if st.button("🚀 Submit Argument", type="primary", use_container_width=True, key=f"submit_type_btn_{session.current_round}"):
                if not typed_text.strip():
                    st.warning("⚠️ Please enter your argument before submitting!")
                else:
                    with st.spinner("AI Coach is analyzing your argument, scanning for fallacies, and preparing counterargument..."):
                        turn_result = session.process_turn(typed_text.strip())
                        st.session_state[draft_key] = ""
                        if session.is_complete:
                            st.session_state.final_report_data = session.conclude_debate()
                            st.session_state.show_final_report = True
                        st.rerun()

    # OPTION 2: SPEAK ARGUMENT (VOICE)
    with tab_voice:
        st.markdown("**Option 2: Speak your argument into your microphone:**")
        st.info("🎙️ Click the microphone button below to record your voice. Our app will transcribe it and place it directly into the input field below so you can review, edit, or submit it!")

        col_mic, col_info = st.columns([1, 2])
        with col_mic:
            spoken_text = speech_to_text(
                language="en",
                start_prompt="🎙️ Click to Speak Argument",
                stop_prompt="⏹️ Stop Recording",
                just_once=True,
                use_container_width=True,
                key=f"stt_btn_{session.current_round}"
            )
            if spoken_text:
                st.session_state[draft_key] = spoken_text
                st.rerun()

        with col_info:
            if st.session_state[draft_key]:
                st.success("✅ Voice transcribed & placed on input field! Review or edit below:")
            else:
                st.caption("Click the button, speak clearly into your mic, then click stop.")

        # Input field populated automatically with recorded speech
        voice_text = st.text_area(
            label="Your Spoken Argument (placed here automatically, edit anytime):",
            value=st.session_state[draft_key],
            height=130,
            placeholder="Your spoken words will appear here automatically. You can edit the text before submitting...",
            key=f"input_voice_{session.current_round}"
        )
        if voice_text != st.session_state[draft_key]:
            st.session_state[draft_key] = voice_text

        col_v1, col_v2 = st.columns([3, 1])
        with col_v1:
            if st.button("🚀 Submit Spoken Argument", type="primary", use_container_width=True, key=f"submit_voice_btn_{session.current_round}"):
                if not voice_text.strip():
                    st.warning("⚠️ Please record or type an argument before submitting!")
                else:
                    with st.spinner("AI Coach is analyzing your argument, scanning for fallacies, and preparing counterargument..."):
                        turn_result = session.process_turn(voice_text.strip())
                        st.session_state[draft_key] = ""
                        if session.is_complete:
                            st.session_state.final_report_data = session.conclude_debate()
                            st.session_state.show_final_report = True
                        st.rerun()
        with col_v2:
            if st.button("🗑️ Clear", use_container_width=True, key=f"clear_voice_btn_{session.current_round}"):
                st.session_state[draft_key] = ""
                st.rerun()

else:
    st.info("Debate is complete. Click 'Conclude Debate & View Report' in the sidebar or start a new match!")
