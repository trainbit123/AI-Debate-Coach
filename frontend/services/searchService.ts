import { SourceItem } from "@/lib/types/search";

interface SearchProviderResult {
  query: string;
  sources: SourceItem[];
}

/**
 * Searches Wikipedia's REST API for factual academic/encyclopedic source material
 */
async function searchWikipedia(query: string): Promise<SourceItem[]> {
  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&utf8=&format=json&origin=*`;

    const res = await fetch(endpoint, {
      headers: { "User-Agent": "DebateAI/1.0 (VoiceSearch; research@debateai.org)" },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const items = data?.query?.search || [];

    return items.slice(0, 4).map((item: any) => {
      const cleanSnippet = (item.snippet || "")
        .replace(/<span class="searchmatch">/g, "")
        .replace(/<\/span>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");

      return {
        title: item.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, "_"))}`,
        domain: "en.wikipedia.org",
        snippet: cleanSnippet || "Encyclopedic analysis and research documentation.",
      };
    });
  } catch (err) {
    console.warn("Wikipedia search error:", err);
    return [];
  }
}

/**
 * Searches DuckDuckGo's Instant Answer API for web topics
 */
async function searchDuckDuckGo(query: string): Promise<SourceItem[]> {
  try {
    const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&no_html=1&skip_disambig=1`;

    const res = await fetch(endpoint, {
      headers: { "User-Agent": "DebateAI/1.0" },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const sources: SourceItem[] = [];

    if (data.AbstractURL && data.AbstractText) {
      const domain = new URL(data.AbstractURL).hostname.replace(/^www\./, "");
      sources.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        domain,
        snippet: data.AbstractText,
      });
    }

    if (Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (topic.FirstURL && topic.Text && sources.length < 4) {
          try {
            const domain = new URL(topic.FirstURL).hostname.replace(/^www\./, "");
            sources.push({
              title: topic.Text.split(" - ")[0] || "Web Reference",
              url: topic.FirstURL,
              domain,
              snippet: topic.Text,
            });
          } catch (e) {
            // Ignore malformed URL
          }
        }
      }
    }

    return sources;
  } catch (err) {
    console.warn("DuckDuckGo search error:", err);
    return [];
  }
}

/**
 * Searches Tavily Search API if TAVILY_API_KEY is configured
 */
async function searchTavily(query: string, apiKey: string): Promise<SourceItem[]> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 5,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data.results)) return [];

    return data.results.map((r: any) => {
      let domain = "web";
      try {
        domain = new URL(r.url).hostname.replace(/^www\./, "");
      } catch (e) {}

      return {
        title: r.title || query,
        url: r.url,
        domain,
        snippet: r.content || r.snippet || "",
      };
    });
  } catch (err) {
    console.warn("Tavily search error:", err);
    return [];
  }
}

/**
 * Searches Serper Google API if SERPER_API_KEY is configured
 */
async function searchSerper(query: string, apiKey: string): Promise<SourceItem[]> {
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 5 }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const organic = data.organic || [];

    return organic.slice(0, 5).map((r: any) => {
      let domain = "google.com";
      try {
        domain = new URL(r.link).hostname.replace(/^www\./, "");
      } catch (e) {}

      return {
        title: r.title,
        url: r.link,
        domain,
        snippet: r.snippet || "",
      };
    });
  } catch (err) {
    console.warn("Serper search error:", err);
    return [];
  }
}

/**
 * Curated collegiate fallback sources for key debate categories if external APIs are unreachable
 */
function getCuratedDebateFallbackSources(query: string): SourceItem[] {
  const lower = query.toLowerCase();

  if (lower.includes("ai") || lower.includes("artificial intelligence") || lower.includes("regulation")) {
    return [
      {
        title: "Stanford Center for Research on Foundation Models (CRFM)",
        url: "https://crfm.stanford.edu/ecosystem-graphs/index.html",
        domain: "stanford.edu",
        snippet: "Longitudinal research on foundation model governance, open source benchmarks, and innovation metrics.",
      },
      {
        title: "Brookings Institution: Governance of Frontier AI",
        url: "https://www.brookings.edu/articles/the-emerging-governance-of-frontier-ai/",
        domain: "brookings.edu",
        snippet: "Policy analysis weighing geopolitical competition, export controls, and regulatory compliance costs.",
      },
      {
        title: "MIT Technology Review: The Economic Realities of AI Guardrails",
        url: "https://www.technologyreview.com/topic/artificial-intelligence/",
        domain: "technologyreview.com",
        snippet: "Empirical studies investigating how compliance burdens impact venture capital investment in early-stage AI startups.",
      },
    ];
  }

  if (lower.includes("nuclear") || lower.includes("energy") || lower.includes("climate")) {
    return [
      {
        title: "International Atomic Energy Agency (IAEA) - Climate Trends",
        url: "https://www.iaea.org/topics/nuclear-power-and-climate-change",
        domain: "iaea.org",
        snippet: "Quantitative assessments of lifecycle greenhouse gas emissions and clean baseload electrical grid reliability.",
      },
      {
        title: "MIT Energy Initiative: The Future of Nuclear Energy in a Carbon-Constrained World",
        url: "https://energy.mit.edu/research/future-nuclear-energy/",
        domain: "energy.mit.edu",
        snippet: "Capital cost analyses, advanced modular reactors, and economic viability alongside intermittent wind and solar.",
      },
    ];
  }

  return [
    {
      title: "Stanford Encyclopedia of Philosophy: Logic and Argumentation",
      url: "https://plato.stanford.edu/entries/logic-informal/",
      domain: "plato.stanford.edu",
      snippet: "Comprehensive philosophical reference on premise structure, informal fallacies, and dialectical burdens of proof.",
    },
    {
      title: "Pew Research Center: Public Policy and Social Trends",
      url: "https://www.pewresearch.org/",
      domain: "pewresearch.org",
      snippet: "Demographic surveys and evidence-based societal analysis on technology, economics, and civic institutions.",
    },
  ];
}

/**
 * Master search function coordinating all search providers
 */
export async function executeWebSearch(query: string): Promise<SearchProviderResult> {
  const cleanQuery = query.trim();
  const tavilyKey = process.env.TAVILY_API_KEY;
  const serperKey = process.env.SERPER_API_KEY;

  // 1. Check Tavily
  if (tavilyKey) {
    const results = await searchTavily(cleanQuery, tavilyKey);
    if (results.length > 0) {
      return { query: cleanQuery, sources: results };
    }
  }

  // 2. Check Serper
  if (serperKey) {
    const results = await searchSerper(cleanQuery, serperKey);
    if (results.length > 0) {
      return { query: cleanQuery, sources: results };
    }
  }

  // 3. Check Live Free Web APIs: Wikipedia & DuckDuckGo
  const [wikiResults, ddgResults] = await Promise.all([
    searchWikipedia(cleanQuery),
    searchDuckDuckGo(cleanQuery),
  ]);

  const combined = [...wikiResults, ...ddgResults];
  if (combined.length > 0) {
    // Remove duplicate URLs
    const seen = new Set<string>();
    const unique = combined.filter((s) => {
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });
    return { query: cleanQuery, sources: unique.slice(0, 5) };
  }

  // 4. Fallback to academic debate citations
  return {
    query: cleanQuery,
    sources: getCuratedDebateFallbackSources(cleanQuery),
  };
}
