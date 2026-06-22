import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `You are a senior education counselor at LeapScholar with 15 years advising Indian working professionals on studying abroad. You give brutally honest, ROI-driven advice — never aspirational fluff. You never suggest options out of reach for a profile. You match recommendations to the user's stated goal AND budget, not just salary potential. Never suggest Ivy League or top-5 global schools unless the profile clearly justifies it. Be conservative and realistic with all salary and cost numbers.`;

export async function POST(req: NextRequest) {
  const p = await req.json();

  const userPrompt = `Working professional's profile:
- Role: ${p.role}
- Experience: ${p.experience}
- Dream/goal: ${p.aspiration}
- In their words: ${p.aspirationDetail || "n/a"}
- Current salary: ${p.salary}
- Undergrad tier: ${p.collegeTier}
- Academics: ${p.cgpa}
- Budget: ${p.budget}
- Open to: ${Array.isArray(p.countries) ? p.countries.join(", ") : p.countries}
- Timeline: ${p.timeline}

Suggest exactly 3 realistic study-abroad paths for this profile and budget. For each, provide:
1. course (name + specialization)
2. country
3. collegeTier (e.g. "Top 100–200 globally")
4. exampleColleges (array of 2–3 specific, realistic institution names for this profile)
5. fitReason (2–3 sentences, specific to their numbers and goal)
6. costRangeUSD (full program, tuition + living, string like "45,000 - 65,000")
7. duration
8. fitLabel ("Strong Fit" | "Good Fit" | "Stretch" — be honest, give at least one Stretch if the profile warrants it)
9. headlineSalaryLPA (realistic post-degree salary range, string like "28 - 36 LPA")
10. breakevenYears (number, rough years to recover the investment from today)

Budget discipline:
- If budget is "Under 20 lakhs", prioritize public universities, lower-cost Europe/Germany options, scholarships, or shorter diplomas. Do not call an option "Strong Fit" if full cost clearly exceeds budget.
- If the user says they need a loan, options can exceed cash budget, but the fitReason must acknowledge financing dependence.
- If academics are below 7 CGPA or tier is Tier 3, avoid elite schools and be conservative with salary outcomes.
- At least one recommendation should be the financially safest realistic path, not simply the highest salary path.

Return ONLY a JSON array of 3 objects with exactly these keys: course, country, collegeTier, exampleColleges, fitReason, costRangeUSD, duration, fitLabel, headlineSalaryLPA, breakevenYears. No markdown, no other text.`;

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
        temperature: 0.7,
        max_tokens: 2000,
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

  let paths;
  try {
    paths = JSON.parse(content.trim());
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        paths = JSON.parse(match[0]);
      } catch {
        return NextResponse.json(
          { error: "Failed to parse response JSON" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "No JSON array in response" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ paths });
}
