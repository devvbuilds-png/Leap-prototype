import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `You are a financial modeling expert specializing in career ROI analysis for Indian professionals considering studying abroad. You produce accurate, conservative salary projections grounded in real market data. Your numbers are honest, never optimistic vanity projections. You account for income-zero study years, realistic post-degree ramp-up, budget pressure, admission realism, and Indian rupee purchasing power.`;

type Simulation = {
  chartData?: { year: number; stay: number; abroad: number }[];
  breakevenYear?: number;
  totalInvestmentINR?: string;
  salaryAtYear10Abroad?: number;
  salaryAtYear10Stay?: number;
  tenYearGainLPA?: string;
  worthItScore?: number;
  verdictHeadline?: string;
  verdictDetail?: string;
  calculationNotes?: string[];
  keyRisk?: string;
  keyOpportunity?: string;
};

function highestUsd(costRange: string | undefined) {
  const matches = String(costRange ?? "").match(/\d[\d,]*/g);
  if (!matches?.length) return 0;
  return Math.max(...matches.map((value) => Number(value.replace(/,/g, ""))));
}

function parseCgpa(cgpa: string | undefined) {
  const match = String(cgpa ?? "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 10;
}

function normalizeSimulation(
  simulation: Simulation,
  profile: Record<string, unknown>,
  path: Record<string, unknown>
) {
  const chartData = Array.isArray(simulation.chartData)
    ? simulation.chartData.slice(0, 10)
    : [];
  const year10 = chartData.find((point) => point.year === 10) ?? chartData[9];

  if (year10) {
    simulation.salaryAtYear10Abroad = Number(year10.abroad);
    simulation.salaryAtYear10Stay = Number(year10.stay);
    const gain = Number(year10.abroad) - Number(year10.stay);
    simulation.tenYearGainLPA = `${gain >= 0 ? "+" : ""}${Number(gain.toFixed(1))} LPA`;
  }

  const budget = String(profile.budget ?? "");
  const collegeTier = String(profile.collegeTier ?? "");
  const fitLabel = String(path.fitLabel ?? "");
  const costUpperUsd = highestUsd(String(path.costRangeUSD ?? ""));
  const cgpa = parseCgpa(String(profile.cgpa ?? ""));

  let scoreCap = 10;
  if (budget.includes("Under 20") && costUpperUsd > 24000) scoreCap = 4;
  if (budget.includes("Under 20") && costUpperUsd > 35000) scoreCap = 3;
  if (collegeTier.includes("Tier 3") && cgpa < 7) scoreCap = Math.min(scoreCap, 5);
  if (fitLabel === "Stretch") scoreCap = Math.min(scoreCap, 4);

  const originalScore = Number(simulation.worthItScore ?? 0);
  if (scoreCap < 10 && originalScore > scoreCap) {
    simulation.worthItScore = scoreCap;
    if (scoreCap <= 3) {
      simulation.verdictHeadline = "Financially risky unless the cost comes down";
    } else if (scoreCap <= 4) {
      simulation.verdictHeadline = "Possible, but only with tight cost control";
    } else {
      simulation.verdictHeadline = "Moderate case with clear tradeoffs";
    }
    simulation.verdictDetail = `${simulation.verdictDetail ?? ""} Given the budget, academic profile, and fit label, this should be treated as a cautious option unless scholarships, lower living costs, or a confirmed loan materially reduce the upfront pressure.`.trim();
    simulation.keyRisk = `${simulation.keyRisk ?? ""} The biggest financial risk is taking on an over-budget path before the post-degree salary uplift is secure.`.trim();
  }

  return simulation;
}

export async function POST(req: NextRequest) {
  const { profile, path } = await req.json();

  const userPrompt = `Profile:
- Current role: ${profile.role}
- Experience: ${profile.experience}
- Goal: ${profile.aspiration} (${profile.aspirationDetail || "n/a"})
- Current salary: ${profile.salary}
- Academic tier: ${profile.collegeTier}
- Academics: ${profile.cgpa}
- Budget: ${profile.budget}
- Target countries: ${Array.isArray(profile.countries) ? profile.countries.join(", ") : profile.countries}
- Timeline: ${profile.timeline}

Chosen study path:
- Course: ${path.course}
- Country: ${path.country}
- College tier: ${path.collegeTier}
- Example institutions: ${Array.isArray(path.exampleColleges) ? path.exampleColleges.join(", ") : "n/a"}
- Fit label: ${path.fitLabel}
- Estimated cost: $${path.costRangeUSD}
- Duration: ${path.duration}
- Headline outcome: ${path.headlineSalaryLPA}
- Projected breakeven from recommendation card: ${path.breakevenYears} years

Model 2 salary trajectories over 10 years in LPA (Indian rupees, lakhs per annum):

1. "If you STAY": stays in India on the current career path. Start from the midpoint of their current salary band and model realistic Indian market growth.
2. "If you GO ABROAD": for each study year, set abroad income to 0 unless a stipend is genuinely likely (max 2 LPA). After graduation, use a realistic first salary near the path's headlineSalaryLPA range, then model growth.

Rules:
- Return exactly 10 chartData points, years 1 through 10.
- Study-year abroad values must be 0 or max 2 LPA.
- First post-graduation salary should sit inside or near the provided headline outcome range. Do not jump straight to a generic high value.
- Year 10 abroad must be path-specific and profile-specific. It should not be the same number across unrelated fields, countries, costs, or fit labels.
- Stay trajectory must start from the midpoint of their salary band and grow realistically for their field and seniority.
- Breakeven year is when cumulative abroad earnings, minus total investment and lost study-year income, first overtake cumulative stay earnings.
- Worth-it score: 7-10 = financially strong case, 4-6 = moderate case with meaningful tradeoffs, 1-3 = weak financial case.
- If full program cost clearly exceeds budget and the user did not say they can finance it, cap worth-it score at 5 unless breakeven is unusually fast.
- For Tier 3, CGPA below 7, budget under 20 lakhs, or Stretch paths, be willing to return cautious or low scores. Honesty is the feature.
- If the chosen path is Stretch, the risk and verdict must reflect that; do not give every Stretch path a 7+ score.
- Be specific in verdict and notes. Reference the actual current salary band, investment, field, and budget constraints.

Return ONLY this JSON shape, with fresh values calculated for this exact profile and path. No markdown, no extra text:
{
  "chartData": [{"year": 1, "stay": 0, "abroad": 0}],
  "breakevenYear": 0,
  "totalInvestmentINR": "string",
  "salaryAtYear10Abroad": 0,
  "salaryAtYear10Stay": 0,
  "tenYearGainLPA": "string",
  "worthItScore": 0,
  "verdictHeadline": "string",
  "verdictDetail": "string",
  "calculationNotes": ["string", "string", "string", "string"],
  "keyRisk": "string",
  "keyOpportunity": "string"
}`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "paste-your-key-here") {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  let llmRes: Response;
  try {
    llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: 1600,
      }),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Network error: ${String(err)}` },
      { status: 500 }
    );
  }

  if (!llmRes.ok) {
    const body = await llmRes.text();
    return NextResponse.json(
      { error: `OpenAI returned ${llmRes.status}: ${body}` },
      { status: 500 }
    );
  }

  const data = await llmRes.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  let simulation;
  try {
    simulation = JSON.parse(content.trim());
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        simulation = JSON.parse(match[0]);
      } catch {
        return NextResponse.json(
          { error: "Failed to parse simulation JSON" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "No JSON object in response" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ simulation: normalizeSimulation(simulation, profile, path) });
}
