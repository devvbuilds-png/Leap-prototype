import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `You are a senior education counselor at LeapScholar with 15 years advising Indian working professionals on studying abroad. You give brutally honest, ROI-driven advice — never aspirational fluff. You never suggest outcomes out of reach for a profile. Be realistic and specific to the person's background.`;

export async function POST(req: NextRequest) {
  const { profile, path } = await req.json();

  const userPrompt = `Profile:
- Role: ${profile.role}
- Experience: ${profile.experience}
- Goal: ${profile.aspiration} (${profile.aspirationDetail || "n/a"})
- Current salary: ${profile.salary}
- Undergrad tier: ${profile.collegeTier}
- Academics: ${profile.cgpa}

Chosen path: ${path.course}, ${path.country}, ${path.collegeTier}, ${path.duration}.

Return a JSON object with EXACTLY these keys:
- currentCeiling: array of 1-2 objects — the realistic roles this person caps out at if they DON'T do the degree. Each object: { title, salaryRangeLPA (string e.g. "18 - 22 LPA"), note (one short line on why this is the ceiling) }
- unlockedRoles: array of 3-4 objects — roles the chosen degree realistically opens up. Each object: { title, salaryRangeLPA (string e.g. "30 - 42 LPA"), whyQualify (one line on why this person would now qualify) }
Order unlockedRoles from most accessible to most ambitious. Be realistic to the profile — do not list roles that the specific degree + background wouldn't credibly reach.
Return only the JSON, no markdown, no other text.`;

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
        temperature: 0.6,
        max_tokens: 800,
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

  let roles;
  try {
    roles = JSON.parse(content.trim());
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        roles = JSON.parse(match[0]);
      } catch {
        return NextResponse.json(
          { error: "Failed to parse roles JSON" },
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

  return NextResponse.json({ roles });
}
