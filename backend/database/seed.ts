import { DebateSession } from "@/lib/types/debate";

export const INITIAL_SEED_DEBATES: DebateSession[] = [
  {
    id: "deb_seed_001",
    topic: "Artificial Intelligence development should be strictly regulated by international treaties",
    userPosition: "FOR",
    aiPosition: "AGAINST",
    difficulty: "intermediate",
    maxRounds: 3,
    currentRound: 3,
    isComplete: true,
    createdAt: "2026-08-28T14:30:00.000Z",
    updatedAt: "2026-08-28T14:45:00.000Z",
    aiOpeningStatement:
      "I stand resolutely opposed to sweeping international treaties on AI development. Heavy-handed global bureaucracy will stifle open-source innovation, empower authoritarian regimes that ignore international norms, and paralyze critical medical and scientific breakthroughs.",
    rounds: [
      {
        roundNumber: 1,
        userArgument:
          "Uncontrolled AI models pose catastrophic biosecurity and cyber warfare risks. Without binding global treaties similar to the IAEA for nuclear energy, private corporations will race recklessly without safety guardrails.",
        aiCounterargument:
          "Your analogy to nuclear material is fundamentally flawed because compute and software cannot be inspected or locked in physical silos like enriched uranium. Unilateral treaties simply hobble democratic nations while non-compliant adversaries race ahead underground.",
        aiFollowUpQuestion:
          "How can an international treaty practically inspect decentralized weights or prevent private actors from utilizing open-source models offline?",
        score: {
          logic: 82,
          evidence: 76,
          relevance: 90,
          clarity: 85,
          counterargumentHandling: 75,
          overall: 82,
          strongestPoint: "Compelling IAEA nuclear regulatory analogy.",
          weakestPoint: "Did not account for enforceability in non-signatory nations.",
          coachFeedback: "Strong opening premise. In round 2, directly address how verification mechanisms can work without intrusive state surveillance.",
        },
        fallacies: [],
        timestamp: "2026-08-28T14:35:00.000Z",
      },
      {
        roundNumber: 2,
        userArgument:
          "Treaties don't need to inspect every computer; they can track leading semiconductor chip fabrication foundries and megawatt-scale data centers through energy signatures and export controls.",
        aiCounterargument:
          "Targeting hardware only accelerates decentralized training algorithms and lightweight distillation techniques that achieve frontier capabilities on commodity consumer hardware within 18 months.",
        aiFollowUpQuestion:
          "What happens when algorithmic efficiency overcomes hardware constraints, rendering your data center tracking obsolete?",
        score: {
          logic: 86,
          evidence: 84,
          relevance: 94,
          clarity: 88,
          counterargumentHandling: 82,
          overall: 87,
          strongestPoint: "Realistic supply chain chokepoint focus on advanced semiconductor lithography.",
          weakestPoint: "Underestimated the speed of software optimization and model quantization.",
          coachFeedback: "Excellent rebuttal handling. Concrete evidence significantly strengthened your posture.",
        },
        fallacies: [],
        timestamp: "2026-08-28T14:40:00.000Z",
      },
      {
        roundNumber: 3,
        userArgument:
          "Even with quantization, frontier training runs still require billions in capital and specialized clusters. Responsible governance creates a safety floor, preventing reckless deployment while permitting monitored open research.",
        aiCounterargument:
          "While governance is desirable in principle, history demonstrates that regulatory capture entrenches incumbent monopolies, cementing Big Tech power rather than genuinely safeguarding citizens.",
        aiFollowUpQuestion:
          "How do you prevent regulatory capture from snuffing out the next generation of independent researchers?",
        score: {
          logic: 84,
          evidence: 80,
          relevance: 92,
          clarity: 86,
          counterargumentHandling: 85,
          overall: 85,
          strongestPoint: "Pragmatic distinction between frontier capital expenditures and open academic research.",
          weakestPoint: "Left the regulatory capture critique partially unaddressed.",
          coachFeedback: "Consistently disciplined rhetoric. Outstanding collegiate debate execution.",
        },
        fallacies: [],
        timestamp: "2026-08-28T14:45:00.000Z",
      },
    ],
    finalVerdict: {
      overallScore: 85,
      logicScore: 84,
      evidenceScore: 80,
      relevanceScore: 92,
      clarityScore: 86,
      rebuttalScore: 81,
      totalFallacies: 0,
      fallacyBreakdown: {},
      detectedFallacyList: [],
      strongestArgument: "Round 2: Semiconductor supply chain and foundry tracking.",
      weakestArgument: "Round 1: Initial enforceability mechanisms.",
      coachAdvice: [
        "Continue utilizing supply-chain and structural chokepoint data in technical policy motions.",
        "Prepare pre-emptive rebuttals for public-choice economics and regulatory capture arguments.",
      ],
      verdictTitle: "Decisive Victory for the User!",
      verdictSummary:
        "The affirmative successfully proved that international governance can leverage physical semiconductor supply chains, resisting the negative's defeatist claims about decentralized evasion.",
      ruling: "User Won",
    },
  },
  {
    id: "deb_seed_002",
    topic: "Universal Basic Income should replace the existing welfare system",
    userPosition: "AGAINST",
    aiPosition: "FOR",
    difficulty: "advanced",
    maxRounds: 2,
    currentRound: 2,
    isComplete: true,
    createdAt: "2026-08-29T10:15:00.000Z",
    updatedAt: "2026-08-29T10:28:00.000Z",
    aiOpeningStatement:
      "Universal Basic Income is the single most efficient, dignity-preserving, and non-paternalistic mechanism to guarantee an economic floor in an era of rapid workplace automation and structural displacement.",
    rounds: [
      {
        roundNumber: 1,
        userArgument:
          "Replacing targeted welfare with a flat check will dismantle essential healthcare and disability assistance for the most vulnerable citizens, who require far more support than a modest monthly sum.",
        aiCounterargument:
          "A properly designed UBI replaces only means-tested income traps and paternalistic bureaucracy while preserving categorical healthcare and severe disability aid.",
        aiFollowUpQuestion:
          "How do you justify maintaining welfare systems with 70% marginal tax clawback rates that trap recipients in chronic poverty?",
        score: {
          logic: 78,
          evidence: 72,
          relevance: 88,
          clarity: 82,
          counterargumentHandling: 74,
          overall: 79,
          strongestPoint: "Highlighted the disproportionate needs of disabled and medically vulnerable populations.",
          weakestPoint: "Attacked an absolute caricature of UBI instead of nuanced composite models.",
          coachFeedback: "Watch out for strawman characterizations of basic income models.",
        },
        fallacies: [
          {
            name: "Strawman",
            description: "Oversimplifying UBI proposals as completely eliminating disability and medical care.",
            snippet: "will dismantle essential healthcare and disability assistance",
            howToImprove: "Engage with proposals that retain catastrophic medical insurance alongside UBI.",
          },
        ],
        timestamp: "2026-08-29T10:20:00.000Z",
      },
      {
        roundNumber: 2,
        userArgument:
          "Financing a universal transfer of $1,000/month to 250 million adults requires roughly $3 trillion annually, precipitating either hyperinflation or crushing tax hikes that depress economic productivity.",
        aiCounterargument:
          "Net fiscal cost is a fraction of the gross cost because high earners pay back the benefit through progressive income and carbon dividend taxation, recycling purchasing power directly into local economies.",
        aiFollowUpQuestion:
          "Do you have evidence that cash transfers cause hyperinflation when funded through progressive taxation rather than unchecked monetary expansion?",
        score: {
          logic: 83,
          evidence: 81,
          relevance: 90,
          clarity: 85,
          counterargumentHandling: 80,
          overall: 84,
          strongestPoint: "Strong macroeconomic fiscal arithmetic highlighting gross budgetary requirements.",
          weakestPoint: "Conflated gross entitlement cost with net redistributive cost.",
          coachFeedback: "Good comeback with concrete numbers and fiscal trade-off analysis.",
        },
        fallacies: [],
        timestamp: "2026-08-29T10:28:00.000Z",
      },
    ],
    finalVerdict: {
      overallScore: 81,
      logicScore: 80,
      evidenceScore: 76,
      relevanceScore: 89,
      clarityScore: 83,
      rebuttalScore: 77,
      totalFallacies: 1,
      fallacyBreakdown: { Strawman: 1 },
      detectedFallacyList: [
        {
          name: "Strawman",
          description: "Oversimplifying UBI proposals as completely eliminating disability and medical care.",
          snippet: "will dismantle essential healthcare and disability assistance",
          howToImprove: "Engage with proposals that retain catastrophic medical insurance alongside UBI.",
        },
      ],
      strongestArgument: "Round 2: Fiscal mathematics and gross federal expenditure constraints.",
      weakestArgument: "Round 1: Total replacement assumption of medical assistance.",
      coachAdvice: [
        "Differentiate between gross program cost and net fiscal redistribution.",
        "Steel-man the affirmative's stance on marginal effective tax rate poverty traps.",
      ],
      verdictTitle: "Close Contest Adjudicated to the AI Opponent",
      verdictSummary:
        "The AI opponent effectively counter-attacked the user's fiscal calculations and highlighted the Strawman fallacy in Round 1, winning on argumentative economy.",
      ruling: "AI Opponent Won",
    },
  },
];
