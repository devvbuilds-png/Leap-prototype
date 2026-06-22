# BUILD_PLAN.md — Leap: "Next Leap" Career Outcome Simulator

## How to use this file
Each phase below is a ready-to-paste prompt for Claude Code. Run phases in order.
Do not start Phase N+1 until Phase N works. After each phase, update CLAUDE.md
(status ✅ + decisions). Always read CLAUDE.md before starting any phase.

---

## Phase 1 — Project Setup + Profile Builder (6 questions)

```
Read CLAUDE.md fully before starting — especially the Strategic Wedge and Design System sections.

Set up a Next.js project with Tailwind CSS called "next-leap". Install recharts (needed in Phase 3).

Build Phase 1: the Profile Builder onboarding. This is NOT a form — it's a sharp counselor getting to know the user. 6 questions, ONE per screen, with a 6-segment progress bar near the top (one segment fills per question). Smooth slide transition between questions. Large warm question text, input below, Next button fixed at the bottom (disabled until the screen is answered).

Follow the Design System in CLAUDE.md exactly (indigo #3B3BB5, lavender #EEEEF8 selected state, #E5E5E5 borders, Inter font, radius 12px buttons / 16px cards, mobile-first ~390px).

LANDING SCREEN (before Q1):
- "leap" wordmark top-left in indigo, bold
- Large heading: "Should you actually study abroad?"
- Subheading: "See both futures — the honest math on what an abroad degree does for your career, before you spend ₹40 lakhs finding out."
- Primary CTA: "Get my free analysis →"
- Small text below: "Free • 3 minutes • No sign-up"

Q1 of 6 — "First up, what do you do?"
- Text input for role, placeholder: "e.g. Software Engineer at a startup, Marketing Lead..."
- Smaller label below: "And how long have you been working?" + chip selector:
  Less than 1 year | 1–2 years | 3–5 years | 6–10 years | 10+ years
- Next enabled when both filled
- (Role text lets the LLM infer field + seniority — no separate field dropdown needed.)

Q2 of 6 — "If this all goes right, what's the dream?"
- Subtext: "This shapes everything we recommend"
- Full-width single-column selectable options:
  🚀 Break through a ceiling I've hit
  🔄 Switch into a completely different field
  🌍 Build a career abroad — maybe settle there
  📈 Move into leadership and bigger roles
  🔬 Go deep — become a specialist or researcher
  💰 Maximize what I earn
- Optional text input below: "Anything else you want us to know? (optional)"
- Next enabled when one option selected (text optional)

Q3 of 6 — "What are you earning right now?"
- Subtext: "This is how we calculate whether a degree actually pays off for you"
- Chip selector: Under 6 LPA | 6–10 LPA | 10–15 LPA | 15–25 LPA | 25+ LPA

Q4 of 6 — "How did your undergrad go?"
- Subtext: "This tells us what's realistically within reach"
- College tier — full-width single-column buttons:
  IIT / IIM / Top-10 NIT
  Tier 2 college (state university, reputed private)
  Tier 3 / private college
  Foreign university
- Below: text input "Your CGPA or percentage", helper "Approximate is fine"
- Next enabled when tier selected + CGPA entered

Q5 of 6 — "How much can you invest in this?"
- Subtext: "Be real — we'll only show options that actually make sense for your budget"
- Chip selector (2-col or single col):
  Under 20 lakhs | 20–40 lakhs | 40–60 lakhs | 60 lakhs+ | I'll need a loan for most of it

Q6 of 6 — "Last one — where and when?"
- "Which countries are you open to?" — 2-column MULTI-select (multiple allowed):
  🇺🇸 USA | 🇬🇧 UK | 🇨🇦 Canada | 🇪🇺 Europe | 🇦🇺 Australia | 🌍 Open to all
- Below: "What's your timeline?" — chip selector:
  Within 1 year | 1–2 years | 2+ years | Just exploring
- Final button: "Find my path →"
- Enabled when at least one country + a timeline selected

After Q6 → full-screen loading state: indigo animated dots, "Building your profile..." / "Finding the paths that fit you". Hold ~2.5s, then go to Phase 2.

Store ALL answers in React state (role, experience, aspiration, aspirationDetail free-text, salary, collegeTier, cgpa, budget, countries[], timeline). The aspirationDetail and budget MUST be included in the data passed to the LLM in later phases.

After Phase 1 works end to end, update CLAUDE.md: mark Phase 1 ✅ Done + note decisions.
```

---

## Phase 2 — Path Options (recommendation fused with headline outcome)

```
Read CLAUDE.md fully. Phase 1 must be complete.

Build Phase 2: Path Options. This is where we go beyond Leap's existing recommender — every option is framed as a CAREER OUTCOME (expected salary + breakeven visible on the card), not just a college listing.

API: Next.js API route /api/recommend, server-side. Endpoint https://openrouter.ai/api/v1/chat/completions, model anthropic/claude-3.5-sonnet, key from process.env.OPENROUTER_API_KEY.

SYSTEM PROMPT:
"You are a senior education counselor at LeapScholar with 15 years advising Indian working professionals on studying abroad. You give brutally honest, ROI-driven advice — never aspirational fluff. You never suggest options out of reach for a profile. You match recommendations to the user's stated goal AND budget, not just salary potential. Never suggest Ivy League or top-5 global schools unless the profile clearly justifies it. Be conservative and realistic with all salary and cost numbers."

USER PROMPT (fill from profile state):
"Working professional's profile:
- Role: {role}
- Experience: {experience}
- Dream/goal: {aspiration}
- In their words: {aspirationDetail or 'n/a'}
- Current salary: {salary}
- Undergrad tier: {collegeTier}
- Academics: {cgpa}
- Budget: {budget}
- Open to: {countries}
- Timeline: {timeline}

Suggest exactly 3 realistic study-abroad paths for this profile and budget. For each, provide:
1. course (name + specialization)
2. country
3. collegeTier (e.g. 'Top 100–200 globally')
4. exampleColleges (array of 2–3 specific, realistic institution names for this profile)
5. fitReason (2–3 sentences, specific to their numbers and goal)
6. costRangeUSD (full program, tuition + living, string like '45,000 - 65,000')
7. duration
8. fitLabel ('Strong Fit' | 'Good Fit' | 'Stretch' — honest)
9. headlineSalaryLPA (realistic post-degree salary range, string like '28 - 36 LPA')
10. breakevenYears (number, rough years to recover the investment)

Return ONLY a JSON array of 3 objects with exactly these keys: course, country, collegeTier, exampleColleges, fitReason, costRangeUSD, duration, fitLabel, headlineSalaryLPA, breakevenYears. No markdown, no other text."

LOADING STATE: full screen, indigo pulsing dots, "Analyzing your profile..." / "Finding paths that fit you".

RESULTS DISPLAY:
Header: "← Your paths" (back arrow + bold title)
Subheading: "Based on {experience} in your field, aiming to {aspiration in lowercase}"

3 cards (Leap course-card style — white, radius 16, #E5E5E5 border, shadow, 16px padding):
- Top row: course name (bold 16px) on left, fitLabel pill on right (Strong=mint, Good=lavender, Stretch=coral)
- Country flag emoji + country, small grey
- exampleColleges listed in small grey text
- A highlighted outcome strip (light lavender bg, radius 10): "Expected: {headlineSalaryLPA}  •  Breaks even in ~{breakevenYears} yrs" — this is the key differentiator, make it visually prominent
- "Why this fits you:" + fitReason (italic #666)
- Metadata row: Total cost {costRangeUSD} | {duration}
- Full-width indigo button: "See my full trajectory →"

Below the 3 cards:
- "Don't see what you're looking for?" + link "Describe your own path →" → modal with two inputs (course, country) + confirm. A custom path skips headline numbers and goes straight to Phase 3 simulation.

On select → store chosen path, go to Phase 3.

After Phase 2 works, update CLAUDE.md: mark Phase 2 ✅ Done + note decisions.
```

---

## Phase 3 — The Career Simulator (HERO SCREEN: trajectory chart + comparison)

```
Read CLAUDE.md fully. Phases 1 & 2 must be complete. This is the most important screen in the product — the thing Leap does NOT currently have. Make it excellent.

API: Next.js API route /api/simulate, server-side, same endpoint/model/key as Phase 2.
SYSTEM PROMPT: same as Phase 2.

USER PROMPT (fill from profile + chosen path):
"Profile:
- Role: {role}
- Experience: {experience}
- Goal: {aspiration} ({aspirationDetail or 'n/a'})
- Current salary: {salary}
- Undergrad tier: {collegeTier}
- Academics: {cgpa}
- Budget: {budget}

Chosen path:
- Course: {course}
- Country: {country}
- College tier: {collegeTier}
- Example institutions: {exampleColleges}
- Cost: {costRangeUSD} USD
- Duration: {duration}

Produce an honest career outcome simulation. Return a JSON object with EXACTLY these keys:
- currentSalaryNumeric: number — their current salary in LPA (midpoint of their range)
- stayTrajectory: array of 10 numbers — projected salary in LPA for years 1–10 if they DON'T go abroad (steady realistic growth in their field)
- abroadTrajectory: array of 10 numbers — projected salary in LPA for years 1–10 if they DO take this path. Reflect the study period: during study years salary is low or near-0 (they've left their job), then a jump on graduation, then faster growth. Year 10 should reflect the long-term ceiling of this path.
- studyYears: number — how many years they're studying (no/low income)
- totalInvestmentINR: string e.g. '38 - 52 lakhs'
- breakevenYears: number — years from TODAY until cumulative earnings of the abroad path overtake the stay path (accounting for cost + lost income during study)
- tenYearDeltaLPA: number — difference in salary at year 10 (abroad minus stay)
- worthItScore: number 1–10 — honest ROI score for THIS profile
- verdictHeadline: string — one punchy honest sentence
- verdictDetail: string — 3–4 sentences, specific to their profile and budget, honest about tradeoffs
- howWeCalculated: string — 2–3 sentences explaining the basis of these numbers (for a transparency accordion)
- topRisk: string — biggest risk for this specific person, one sentence
- topOpportunity: string — biggest upside for this specific person, one sentence

Return only the JSON, no markdown, no other text."

LOADING STATE: full screen, indigo dots, "Simulating your two futures..." 

RESULTS — the simulator screen, top to bottom:

Header: "← Your trajectory"

SECTION 1 — THE CHART (centerpiece, build with recharts):
- Heading: "Two futures, ten years"
- A line chart, X-axis years 1–10, Y-axis salary (LPA):
  - Line A "If you go abroad" — indigo #3B3BB5, thicker. Plots abroadTrajectory (shows the dip during study years, then the surge).
  - Line B "If you stay" — grey #999, dashed. Plots stayTrajectory.
  - Mark the breakeven point with a green #22C55E dot + small label "Breaks even, yr {breakevenYears}".
  - Legend below. Clean, readable on 390px. Subtle gridlines. Tooltip on tap showing both values for that year.
- Caption under chart: "After year {breakevenYears}, the abroad path pulls ahead."

SECTION 2 — THE HEADLINE NUMBERS (3 stat tiles in a row or 2x2):
- worthItScore as "X/10" in a colored circle (indigo ≥6, orange 4–5, red ≤3)
- Total investment: {totalInvestmentINR}
- Breakeven: {breakevenYears} yrs
- 10-yr salary gain: +{tenYearDeltaLPA} LPA

SECTION 3 — THE VERDICT:
- {verdictHeadline} in bold
- {verdictDetail} below
- A mint or coral accent depending on score (mint if ≥6, coral if ≤3, neutral lavender 4–5)

SECTION 4 — TRANSPARENCY ACCORDION:
- "How we calculated this ⌄" — expands to show {howWeCalculated}
- Small line beneath: "In production, these estimates sharpen using Leap's real funded-student outcome data."
(This is the credibility move — surfaces the data-moat story right in the UI.)

SECTION 5 — RISK & OPPORTUNITY (two stacked cards):
- Key Risk: coral bg #FFF0EE, ⚠️, {topRisk}
- Key Opportunity: mint bg #E8F5F0, ✨, {topOpportunity}

SECTION 6 — COMPARE ALL PATHS (first-class feature):
- A button/toggle: "Compare all 3 paths →"
- When tapped, call /api/simulate (or a lighter /api/compare) for the OTHER recommended paths too, and show ONE chart with: the single grey "stay" line + each path's abroad trajectory in a distinct color, with a legend. Below the chart, a compact table: Path | 10-yr salary | Breakeven | Worth-it score.
- This is the Harvard-vs-UBC decision view: lets the user see that a cheaper path may break even faster while a pricier one has a higher ceiling.
- Keep it readable on mobile (max 4 lines on the chart, clear legend).

Bottom: fixed indigo CTA "See my next steps →" → Phase 4.

After Phase 3 works, update CLAUDE.md: mark Phase 3 ✅ Done + note decisions (especially any choices made on the compare-view data fetching).
```

---

## Phase 4 — Next Steps (ROI-aware lead capture) + Full Flow Polish

```
Read CLAUDE.md fully. Phases 1–3 must be complete.

Build Phase 4: the Next Steps screen + full-flow polish.

NEXT STEPS SCREEN:
Header: "Your next step"

Top summary card (indigo bg, white text):
- "{course}, {country}"
- Big stat: "Breaks even in {breakevenYears} years • +{tenYearDeltaLPA} LPA by year 10"
- "Worth-it score: {worthItScore}/10"

Three action cards (stacked):

Card 1 — PRIMARY (indigo 4px left border, most prominent):
- 📞 "Talk to a Leap counselor"
- "A free 30-min session with an expert who's seen your numbers."
- Indigo full-width button: "Book my session →"

Card 2 — ROI-AWARE LOAN (this is the LeapFinance bridge):
- 💰 "Finance it the smart way"
- "You break even in {breakevenYears} years. See how a Leap education loan covers {course} in {country}."
- Outline indigo button: "Check loan eligibility →"

Card 3:
- 🏫 "Explore partner universities"
- "Browse {collegeTier} institutions Leap works with."
- Outline indigo button: "Explore →"

Below:
- "📋 Save my report" — copies a clean text summary (profile + chosen path + key numbers) to clipboard, show a toast.
- "Start over" — small grey link → landing screen.

FULL FLOW POLISH (do all):
1. Landing screen sharp and on-brand
2. Smooth slide/fade transitions between every screen
3. Back button correct on every screen
4. Loading screens polished, not janky
5. Consistent type scale — bold headings, grey labels, no inconsistencies
6. Cards match the Leap design system (shadow/border/radius)
7. CTA always fixed at bottom with safe-area padding
8. Mobile responsive at 375 / 390 / 414px, no horizontal overflow
9. All colors match the exact Leap palette in CLAUDE.md
10. Chart renders cleanly on mobile

After Phase 4, do a full walkthrough and note anything still rough. Update CLAUDE.md: mark Phase 4 ✅ Done + decisions.
```

---

## Phase 5 — Final QA + Deploy

```
Read CLAUDE.md fully. All phases must be complete.

Final QA pass + deploy.

Test with 3 profiles end-to-end and sanity-check the LLM outputs are realistic:
- A: Software Engineer, 4 yrs, 12 LPA, Tier 2, 7.2 CGPA, goal "break through a ceiling", budget "need a loan", USA/Canada, 1–2 yrs. (Expect: positive ROI, decent breakeven.)
- B: Marketing professional, 6 yrs, 18 LPA, Tier 2, 6.8 CGPA, goal "switch fields", budget 20–40L, UK/Europe, 2+ yrs. (Expect: more cautious verdict, switching cost flagged.)
- C: Mechanical Engineer, 2 yrs, 7 LPA, Tier 3, 6.5 CGPA, goal "maximize earnings", budget under 20L, Open to all, within 1 yr. (Expect: an honest "this may not pay off / consider cheaper paths" — verify the tool is willing to give a low worth-it score. This honesty is a feature.)

Checklist:
1. Full journey works landing → next steps
2. Chart renders correctly for all 3, including the study-years dip and breakeven marker
3. Compare-all-paths view works and is readable
4. Numbers are realistic and internally consistent (breakeven aligns with the chart crossover)
5. All mobile viewports clean
6. Fix any visual or state bugs

Deploy to Vercel:
- Set OPENROUTER_API_KEY in Vercel env vars
- vercel deploy, note the URL

Update CLAUDE.md: mark Phase 5 ✅ Done, record the live URL + final changes.
```

---

## Notes for Claude Code
- Read CLAUDE.md before every phase. One phase at a time.
- The differentiator is the SIMULATOR (Phase 3), not the recommender — invest the most polish there.
- Design system is from real Leap screenshots — follow it precisely.
- LLM calls server-side via API routes; key in .env.local, never hardcoded.
- If a prompt detail is ambiguous, make a sensible call and note it in CLAUDE.md.
- The tool must be willing to tell a user a path is NOT worth it — honesty is a core feature, not a bug.
