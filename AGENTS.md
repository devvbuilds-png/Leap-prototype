# AGENTS.md — Leap: "Next Leap" Career Outcome Simulator

## Project Overview

**What we're building:**
A feature prototype for LeapScholar — a **career outcome simulator** for working professionals. It answers the one question Leap's current product does NOT: *"If I study abroad, what actually happens to my career and salary — and is it worth it for someone like me?"*

**Product Name:** Next Leap

**Core Value Prop:**
"See both futures before you spend ₹40 lakhs finding out. The honest math on studying abroad — for your specific career."

This is NOT another college recommender. Recommendations are the setup. The hero is the **outcome prediction**: a side-by-side view of where you land if you stay vs if you go, the breakeven point, and a straight verdict.

---

## The Strategic Wedge (read this first — it's the whole point)

**What LeapScholar ALREADY has** (confirmed from real app screenshots):
- Profile-based course recommendations ("Recommended Courses")
- Fit/competitiveness assessment ("Ambitious: admits are competitive")
- "Why this was recommended" reasoning
- Eligibility checks ("You are eligible for this course")
- Budget matching ("This course is under your budget")

**What LeapScholar does NOT have (the gap we fill):**
- **Career outcome prediction** — no "this degree gets you X salary in Y years"
- **A stay-vs-go comparison** — no view of the counterfactual (what if you DON'T go)
- **ROI / breakeven math** — no "worth it for your profile" verdict
- **A working-professional lens** — current UI is student-shaped (10th/12th/Bachelor's)

**Why this wins for Leap's business:**
- Captures working professionals EARLIER in the funnel — at the "should I even do this?" stage, before they're comparing colleges
- The ROI proof is the **LeapFinance conversion engine**: once someone sees a 3-year breakeven, the education loan becomes a rational yes, not a leap of faith
- Higher-LTV segment (professionals with income) than fresh undergrads

**The data-moat answer** (for "where do the numbers come from?"):
LLM synthesis of public salary/placement data for the prototype. In production, the engine sharpens on Leap's **proprietary outcome data** — as a lender, Leap knows what its funded students actually earn and repay. No competitor has that dataset. This is a defensible moat, not a hand-wave.

---

## Target User

**Hero persona:** Working professional, 3–7 years experience, 8–20 LPA, hit a ceiling or wants to pivot. Doing career math, not just college shopping. Wants an honest answer on whether abroad education changes their trajectory enough to justify the cost.

**All profiles supported** (engineer → MS/MBA, early-career tier-jumper, career switcher, research-track). The LLM handles any field via free-text input. Goals vary — salary maximization is NOT assumed.

---

## Product Flow (4 build phases)

### Phase 1 — Profile Builder (6 smart questions, one per screen)
Not a form. A sharp advisor getting to know you. Captures everything the engine needs to research AND to compute ROI:
1. Current role (text) + experience (chips) — identity & seniority
2. The aspiration — what they actually want + optional free text (the real signal)
3. Current salary — the ROI baseline
4. Academic background — tier + CGPA (gates what's realistic)
5. **Budget** — how much they can invest, incl. "need a loan" (NEW; critical for ROI + a direct LeapFinance signal)
6. Geography + timeline — hard constraints

### Phase 2 — Path Options (recommendation + headline outcome fused)
LLM returns 2–3 realistic paths. Each card shows not just the college, but the **headline outcome already visible**: expected post-degree salary + rough breakeven + fit label. This is what makes it more than Leap's existing recommender — every option is framed as a career outcome, not a course listing. User taps one to simulate in depth. Custom-path option available.

### Phase 3 — The Career Simulator (THE HERO SCREEN)
For the chosen path:
- **Trajectory chart** — two salary lines over 10 years: "If you stay" vs "If you go abroad" (with the study-years dip then post-grad surge). Breakeven point marked. This is the demo centerpiece.
- Total investment, breakeven years, 10-year salary delta
- Honest verdict + worth-it score, with expandable reasoning (transparency = credibility)
- Key risk + key opportunity, specific to this profile
- **Compare all paths** toggle — all recommended paths' trajectories on one chart (this is the Harvard-vs-UBC decision view)

### Phase 4 — Next Steps (lead capture, ROI-aware)
- Talk to a Leap counselor (primary lead capture)
- Check loan eligibility — copy references their ROI ("You break even in 3 years — here's how to finance it") → LeapFinance
- Explore partner universities
- Save/share report

---

## Tech Stack
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Charts:** Recharts (for the trajectory line chart)
- **LLM:** OpenRouter API (model: anthropic/Codex-3.5-sonnet), called via Next.js API routes (server-side)
- **Deployment:** Vercel

---

## Design System — LEAP APP (extracted from real screenshots)

Every screen must feel native to LeapScholar — like Leap's own team built it.

### Colors
```
--leap-primary: #3B3BB5          /* Deep indigo — primary buttons, active states, links, "stay" not this — see chart */
--leap-primary-light: #EEEEF8    /* Lavender — selected card fill, active bg */
--leap-bg: #FFFFFF               /* Pure white background */
--leap-border: #E5E5E5           /* Light grey — card borders, dividers */
--leap-text-primary: #1A1A1A     /* Near-black — headings */
--leap-text-secondary: #666666   /* Grey — labels, metadata, helper text */
--leap-mint-bg: #E8F5F0          /* Mint — positive info banners */
--leap-mint-text: #2D7D5F        /* Teal — text in mint banners */
--leap-warning-bg: #FFF0EE       /* Light coral — competitive/risk tags */
--leap-warning-text: #D94F3A     /* Red-orange — warning text */
--leap-success: #22C55E          /* Green — checkmarks, positive */
```
Chart line colors: "If you go abroad" = indigo #3B3BB5 (the hero path); "If you stay" = grey #999999 (the dull baseline). Breakeven marker = green #22C55E.

### Typography
- Font: Inter (system sans fallback)
- Page headings: 22–24px / 700 / #1A1A1A
- Section headings: 17–18px / 700
- Body & labels: 14–15px / 400 / #666
- Small metadata: 12–13px / #999

### Components

**Progress bar (onboarding):** 6 segments now (was 3), full width near top. Filled indigo #3B3BB5, unfilled #E5E5E5, ~4px tall, slight radius. One segment fills per question.

**Selection buttons:** Default = white bg, #E5E5E5 border, #1A1A1A text, radius 12px, padding 14×16. Selected = #EEEEF8 bg, #3B3BB5 border+text, 600 weight. 2-col grid for short options, full-width for long ones.

**Primary CTA:** Full width, radius 12px, bg #3B3BB5, white text, ~52px tall, 600 weight. Disabled = #E5E5E5 bg / #999 text. Fixed at bottom with safe-area padding.

**Cards:** White bg, radius 16px, 1px #E5E5E5 border, subtle shadow, 16px padding. Match Leap's course-card structure (logo/title row, metadata row, action buttons).

**Info banners:** Mint #E8F5F0 with ⓘ + teal text for positives; coral #FFF0EE with red-orange for risks.

**"Why" accordion:** emoji icon + label + chevron, expandable rows with dividers. Used for transparency on how numbers are derived.

**Fit label pills:** Strong Fit = mint bg/teal text; Good Fit = lavender bg/indigo text; Stretch = coral bg/red-orange text.

**Bottom nav (optional shell):** Home / Explore / Shortlist / IELTS — indigo active, grey inactive.

### Layout
16–20px horizontal padding. 24–32px section spacing. Mobile-first, app shell max-width ~390px. Feels like a native mobile screen, not a website.

---

## Build Instructions for Codex
- Build phase by phase — don't advance until the current phase works and looks right
- After each phase: **update this file** — mark the phase ✅ Done and log decisions/changes/iterations
- Modular components — each phase is its own component(s)
- API keys via env vars (OPENROUTER_API_KEY), never hardcoded; LLM calls server-side via API routes
- Mobile-first, ~390px target, native-app feel
- Commit working state at end of each phase

---

## Phase Status Log

### Phase 1 — Profile Builder (6 questions)
Status: ✅ Done
Changes/decisions:
- Project: `next-leap`, Next.js 16.2.9 + React 19 + Tailwind v4 + recharts pre-installed.
- 6 screens per BUILD_PLAN: Q1 (role+experience), Q2 (aspiration+optional text), Q3 (salary), Q4 (tier+cgpa), Q5 (budget), Q6 (countries+timeline).
- Q3 (salary) and Q5 (budget) are pure chip-selects → auto-advance after 250ms. All other screens require explicit Next.
- Q6 countries: multi-select; "🌍 Open to all" clears all others (mutually exclusive). Timeline is single-select.
- Slide animation: forward = slide-right, back = slide-left; keyed on `animKey` state so subtree re-mounts per step.
- Profile fields: role, experience, aspiration, aspirationDetail, salary, collegeTier, cgpa, budget, countries[], timeline — all passed to Phase 2 via onComplete callback.
- Loading screen: animated bars + rolling messages + progress bar; transitions to Phase 2 placeholder after 2.6s.
- Full end-to-end flow verified, zero console errors.

### Phase 2 — Path Options (recommendation + headline outcome)
Status: ✅ Done
Changes/decisions:
- API route: POST /api/recommend → OpenRouter (anthropic/Codex-3.5-sonnet), returns JSON array of 3 PathOption objects.
- Removed the fake 2.5s LoadingScreen phase — PathsScreen handles its own loading state while the LLM responds.
- PathsScreen has 3 states: loading (animated bars + rolling messages), results (3 cards), error (with actionable message + retry).
- Error state detects missing OPENROUTER_API_KEY and shows specific instructions.
- Card layout: course + FitPill | country flag + tier | example colleges | lavender outcome strip (salary + breakeven) | fit reason (italic) | metadata | indigo CTA.
- FitPill colours: Strong Fit = mint, Good Fit = lavender, Stretch = coral.
- Custom path modal: bottom sheet overlay, two text inputs (course + country), goes straight to Phase 3 simulator.
- aspirationText strips emoji prefix for the subheading display.
- Requires OPENROUTER_API_KEY in next-leap/.env.local.

### Phase 3 — Career Simulator (trajectory chart + comparison)
Status: ✅ Done
Changes/decisions:
- API route: POST /api/simulate → OpenAI gpt-4o, returns SimulationData JSON (chartData[10], breakevenYear, totalInvestmentINR, salaryAtYear10Abroad, salaryAtYear10Stay, tenYearGainLPA, worthItScore, verdictHeadline, verdictDetail, calculationNotes[], keyRisk, keyOpportunity).
- SimulatorScreen: 6 sections — sticky header → recharts LineChart (abroad=indigo solid, stay=grey dashed, breakeven=green ReferenceDot) → 2×2 stat grid → verdict card (color varies by score) → transparency accordion → risk+opportunity banners → compare toggle.
- Compare all paths: calls /api/simulate for all allPaths in parallel (Promise.all), renders multi-line chart + compact ranked list.
- Worth-it score color: ≥7 indigo, 4–6 amber, ≤3 red. Verdict card bg: ≥7 mint, 4–6 lavender, ≤3 coral.
- Fixed bottom CTA "See my next steps →" advances to nextsteps phase (Phase 4 placeholder).
- SimulationData + YearPoint interfaces added to types.ts; AppPhase extended with "nextsteps".
- Recharts v3 (3.8.1) confirmed: all components exported (LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, Label).
- Full end-to-end flow verified: loading → chart renders with 0s during study years + surge post-grad → breakeven dot at yr 6 → all stats populated → screenshot confirmed.

### Phase 3.5 — Roles You Unlock
Status: ✅ Done
Changes/decisions:
- New screen sits between simulator (Phase 3) and next steps (Phase 4). AppPhase now includes "roles".
- API route: POST /api/roles → OpenAI gpt-4o. Returns { currentCeiling: RoleCard[], unlockedRoles: RoleCard[] } — RoleCard has title, salaryRangeLPA, note (ceiling) / whyQualify (unlocked).
- RolesData + RoleCard interfaces added to types.ts.
- Design: grey/muted before-cards (bg #F7F7F7, grey salary pill) mirror the grey stay-line; vibrant after-cards (white, mint salary pill) mirror the indigo abroad-line. "with this path ↓" lavender pill bridges the two sections.
- Roles API is pre-fetched in the background by SimulatorScreen immediately after the simulation resolves (silent, no loading state shown to user). Result stored in page.tsx via onRolesData callback so it persists across navigation.
- If user taps CTA before pre-fetch completes, RolesScreen fetches itself (fallback path).
- SimulatorScreen CTA changed from "See my next steps →" to "See the roles you unlock →". Teaser strip added above CTA showing first unlocked role title once data arrives, or generic fallback.
- rolesData cleared in page.tsx when user selects a different path (handleSelectPath sets it to null).
- Full flow verified: simulator teaser showed "Unlock roles like Software Engineer (Germany) and more" → roles screen rendered both sections + visual transition → "See my next steps →" navigated to Phase 4 placeholder.

### Phase 4 — Next Steps + Full Flow Polish
Status: ✅ Done
Changes/decisions:
- No new API route — purely lead-capture UI.
- `simData: SimulationData | null` state added to page.tsx; lifted from SimulatorScreen via new `onSimData` callback (same pattern as rolesData/onRolesData). Cleared on path re-selection.
- `handleRestart()` added to page.tsx — resets all state and returns to landing.
- NextStepsScreen receives: profile, selectedPath, simData, onBack, onRestart.
- Layout: sticky header → mint ROI recap strip (worth-it score + breakeven years + 10-yr gain from simData, falls back to selectedPath.breakevenYears if simData is null) → 4 action cards → footer.
- Card 1 "Talk to a Leap advisor" — filled indigo CTA (primary lead capture).
- Card 2 "Check your loan eligibility" — LeapFinance badge; ROI-aware description injects breakevenYear and totalInvestmentINR dynamically; outline CTA.
- Card 3 "Explore {firstCollege} and similar" — uses exampleColleges[0] from selected path; outline CTA.
- Card 4 "Save your analysis" — split row: "Share report →" (lavender) + "Start over" (grey, calls onRestart).
- Tapping any prototype CTA shows "Coming in the full version ✓" for 1.4 s then resets — gives demo feel without dead ends.
- Footer: "Powered by leap" in indigo.
- Full flow verified via React state injection: all 4 cards, ROI figures, LeapFinance badge, footer all rendered correctly.

### Phase 5 — Final QA + Deploy
Status: ✅ QA Done; deploy skipped per request
Changes/decisions:
- `npm run lint` and `npm run build` now pass.
- Fixed QA blockers: Recharts tooltip formatter typing in `SimulatorScreen`, React hook lint issues in `SimulatorScreen`/`RolesScreen`.
- Three-profile API QA completed for the Phase 5 personas. Outputs now match the intended behavior: profile A gets a positive ROI case, profile B gets cautious/moderate verdicts, and profile C gets cost-control / risky verdicts including a low-score stretch option.
- Tightened recommendation budget discipline for under-20L and lower-academic-profile cases.
- Rewrote `/api/simulate` prompt to remove sample numbers that were causing templated outputs; added server-side normalization for consistent `tenYearGainLPA` formatting and conservative score caps.
- Browser visual QA at 375 / 390 / 414px confirmed the landing screen has no horizontal overflow and renders rupee/arrow symbols correctly.
- Browser interaction QA was blocked in the in-app browser: the landing CTA rendered visible/enabled but did not advance state through Playwright/CUA clicks, with no console errors. API and static/mobile checks were completed; full click-through should be manually verified in a normal browser before deploy.
- Deployment intentionally not run.

---

## Key Decisions Log
- **Core reframe:** the differentiator is the career OUTCOME simulator, not the recommender (Leap already has the recommender — confirmed from screenshots). ROI/trajectory is the hero.
- Trajectory chart (stay vs go, 10 years, breakeven marked) is the demo centerpiece
- Path comparison is a first-class feature (maps to the original Harvard-vs-UBC example)
- Onboarding = 6 smart questions, one per screen; budget question added (also a LeapFinance signal); aspiration is a rich question with free text, not a generic dropdown
- Recommendation cards show headline outcomes (salary + breakeven), not just college listings
- Loan CTA is ROI-aware — references the user's breakeven to drive LeapFinance conversion
- Data-moat framing: prototype uses LLM synthesis; production sharpens on Leap's proprietary funded-student outcome data
- Design system extracted from 7 real LeapScholar screenshots
