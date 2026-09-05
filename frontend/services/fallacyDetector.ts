import { DetectedFallacy, FallacyType } from "@/lib/types/debate";

interface FallacyRule {
  type: FallacyType;
  description: string;
  howToImprove: string;
  matcher: (text: string) => { detected: boolean; snippet?: string };
}

const FALLACY_RULES: FallacyRule[] = [
  {
    type: "Ad Hominem",
    description:
      "Attacking the person instead of addressing their idea.",
    howToImprove:
      "Focus directly on the facts and arguments instead of calling names or criticizing the speaker.",
    matcher: (text: string) => {
      const patterns = [
        /\b(you('re| are)?|they are|opponents? (are|is))\s+(stupid|idiots?|dumb|morons?|clueless|naive|corrupt|evil|greedy|insane|hypocrites?)\b/i,
        /\b(you don't know what you're talking about|you have no brain|shut up|only a fool would)\b/i,
        /\b(pathetic argument from a pathetic person|biased shill)\b/i,
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) {
          return { detected: true, snippet: match[0] };
        }
      }
      return { detected: false };
    },
  },
  {
    type: "Strawman",
    description:
      "Twisting or exaggerating what the other person said to make it easier to attack.",
    howToImprove:
      "State the other person's actual point fairly before explaining why you disagree with it.",
    matcher: (text: string) => {
      const patterns = [
        /\b(so you('re saying| believe| want)|you just want to|they simply want to)\s+(destroy|ban everything|eliminate all|ruin)\b/i,
        /\b(wants everyone to suffer|thinks we should do nothing at all|claims that nobody cares)\b/i,
        /\b(according to you we should just give up|you want to abolish all)\b/i,
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) {
          return { detected: true, snippet: match[0] };
        }
      }
      return { detected: false };
    },
  },
  {
    type: "Hasty Generalization",
    description:
      "Jumping to a huge conclusion from just one or two small examples.",
    howToImprove:
      "Use words like 'often' or 'studies suggest', and back up your point with real data rather than personal stories.",
    matcher: (text: string) => {
      const patterns = [
        /\b(everyone knows that|nobody ever|every single person|all of them always|never in history)\b/i,
        /\b(one time I saw|my friend had this happen so that proves|I know a guy and therefore all)\b/i,
        /\b(100% of the time|without any exception whatsoever)\b/i,
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) {
          return { detected: true, snippet: match[0] };
        }
      }
      return { detected: false };
    },
  },
  {
    type: "Slippery Slope",
    description:
      "Claiming that one small step will automatically lead to total disaster without proof.",
    howToImprove:
      "Explain step by step why each problem would actually happen instead of jumping straight to the worst case.",
    matcher: (text: string) => {
      const patterns = [
        /\b(if we (allow|do|give|accept)|once we start)\b.{1,80}\b(will inevitably lead to|will collapse society|will end in total disaster|soon everyone will be forced|the death of civilization)\b/i,
        /\b(this is the beginning of the end|it opens the floodgates to total catastrophe)\b/i,
        /\b(leads directly to tyranny and total annihilation)\b/i,
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) {
          return { detected: true, snippet: match[0] };
        }
      }
      return { detected: false };
    },
  },
  {
    type: "False Dilemma",
    description:
      "Pretending there are only two extreme choices when there is a sensible middle ground.",
    howToImprove:
      "Show that we can find compromise solutions rather than treating it as an all-or-nothing choice.",
    matcher: (text: string) => {
      const patterns = [
        /\b(either we\b.{1,50}\bor (we die|all is lost|society collapses|there is no future))\b/i,
        /\b(you are either with us or against us|there are only two options here|the only alternative is ruin)\b/i,
        /\b(we must choose between complete freedom or total slavery)\b/i,
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) {
          return { detected: true, snippet: match[0] };
        }
      }
      return { detected: false };
    },
  },
  {
    type: "Appeal to Authority",
    description:
      "Claiming something is true just because a famous person or influencer said so.",
    howToImprove:
      "Share actual research, facts, and reasons rather than just relying on a famous name.",
    matcher: (text: string) => {
      const patterns = [
        /\b(because (a famous actor|a celebrity|my favorite podcaster|an influencer|someone powerful) said so)\b/i,
        /\b(experts all say so without question|an authority figure said it so it must be true)\b/i,
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) {
          return { detected: true, snippet: match[0] };
        }
      }
      return { detected: false };
    },
  },
  {
    type: "Appeal to Emotion",
    description:
      "Using strong feelings like fear, pity, or anger to win an argument instead of real facts.",
    howToImprove:
      "Combine empathy with clear facts, costs, and logical reasons to convince your listeners.",
    matcher: (text: string) => {
      const patterns = [
        /\b(think of the innocent children|how can anyone with a heart|only heartless monsters would|blood on your hands)\b/i,
        /\b(it is sickening and disgusting that anyone could suggest|pure horror and sheer terror)\b/i,
        /\b(we should be ashamed and weep for our humanity)\b/i,
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) {
          return { detected: true, snippet: match[0] };
        }
      }
      return { detected: false };
    },
  },
  {
    type: "Circular Reasoning",
    description:
      "Repeating your point in different words without giving a real reason to prove it.",
    howToImprove:
      "Give an outside fact or practical proof that shows why your claim is true.",
    matcher: (text: string) => {
      const patterns = [
        /\b(is (right|true|correct) because it is (the truth|the right thing|correct))\b/i,
        /\b(we know it works because it is effective|it is illegal because it is against the law)\b/i,
        /\b(it's bad because it's wrong and it's wrong because it's bad)\b/i,
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) {
          return { detected: true, snippet: match[0] };
        }
      }
      return { detected: false };
    },
  },
  {
    type: "False Cause",
    description:
      "Assuming that because event A happened before event B, event A must have caused it.",
    howToImprove:
      "Explain the clear connection and provide proof showing how one thing directly caused the other.",
    matcher: (text: string) => {
      const patterns = [
        /\b(right after that happened,?\s+so (it must have caused|that proves it caused))\b/i,
        /\b(ever since X occurred, Y happened, proving X caused Y)\b/i,
        /\b(it happened immediately after so there is no other cause)\b/i,
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) {
          return { detected: true, snippet: match[0] };
        }
      }
      return { detected: false };
    },
  },
];

/**
 * Heuristic detector for fallacies from user argument text
 */
export function detectFallaciesHeuristic(text: string): DetectedFallacy[] {
  const detected: DetectedFallacy[] = [];
  for (const rule of FALLACY_RULES) {
    const result = rule.matcher(text);
    if (result.detected) {
      detected.push({
        name: rule.type,
        description: rule.description,
        snippet: result.snippet,
        howToImprove: rule.howToImprove,
      });
    }
  }
  return detected;
}

/**
 * Fallacy catalog metadata for UI explanations and educational tooltips
 */
export const FALLACY_CATALOG: Record<
  FallacyType,
  { name: FallacyType; summary: string; example: string; remedy: string }
> = {
  "Ad Hominem": {
    name: "Ad Hominem",
    summary: "Attacking the person rather than their argument.",
    example: "'My opponent's plan is bad because they are greedy and dishonest.'",
    remedy: "Talk about the idea and the facts, not the person who said it.",
  },
  Strawman: {
    name: "Strawman",
    summary: "Twisting or exaggerating the opposing view to make it look ridiculous.",
    example: "'You want cleaner energy? So you want us to live in the dark without electricity!'",
    remedy: "Respond to what your opponent actually said, not an exaggerated version.",
  },
  "Hasty Generalization": {
    name: "Hasty Generalization",
    summary: "Making a sweeping rule based on just one or two examples.",
    example: "'I bought one phone that broke, so this entire brand makes terrible products.'",
    remedy: "Use wider evidence and avoid words like 'everyone' or 'never'.",
  },
  "Slippery Slope": {
    name: "Slippery Slope",
    summary: "Claiming a small step will quickly snowball into total disaster.",
    example: "'If we allow flexible work hours, no one will ever work again and the business will collapse.'",
    remedy: "Prove each step of what will happen instead of jumping straight to disaster.",
  },
  "False Dilemma": {
    name: "False Dilemma",
    summary: "Pretending there are only two choices when there are good middle-ground options.",
    example: "'Either we ban cars completely, or pollution will destroy the planet tomorrow.'",
    remedy: "Show practical compromise options instead of all-or-nothing extremes.",
  },
  "Appeal to Authority": {
    name: "Appeal to Authority",
    summary: "Relying on a famous celebrity or influencer rather than real proof.",
    example: "'This energy drink cures tiredness forever because a movie star said so.'",
    remedy: "Share verified studies and facts rather than just relying on a big name.",
  },
  "Appeal to Emotion": {
    name: "Appeal to Emotion",
    summary: "Using strong emotions like fear or sadness instead of real evidence.",
    example: "'If you don't agree with me right now, you don't care about innocent people!'",
    remedy: "Back up your emotional concern with clear facts and logical solutions.",
  },
  "Circular Reasoning": {
    name: "Circular Reasoning",
    summary: "Repeating your statement as the proof instead of giving a real reason.",
    example: "'Our plan is the best plan because nothing else is as good as it.'",
    remedy: "Provide an independent fact or outside evidence to prove your claim.",
  },
  "False Cause": {
    name: "False Cause",
    summary: "Assuming that because B happened after A, A must have caused B.",
    example: "'I washed my car and it rained, so washing cars causes rain.'",
    remedy: "Show the real cause-and-effect proof connecting the two events.",
  },
};
