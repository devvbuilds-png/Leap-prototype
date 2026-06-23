"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  Label,
} from "recharts";
import { PathOption, ProfileData, RolesData, SimulationData } from "../types";

interface Props {
  profile: ProfileData;
  selectedPath: PathOption;
  allPaths: PathOption[];
  rolesData: RolesData | null;
  onRolesData: (data: RolesData) => void;
  onSimData: (data: SimulationData) => void;
  onBack: () => void;
  onNext: () => void;
}

/* ── Loading ──────────────────────────────────────────────── */
const SIM_MSGS = [
  "Simulating your two futures...",
  "Calculating the salary delta...",
  "Marking the breakeven...",
  "Almost there...",
];

function SimLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dotIdx, setDotIdx] = useState(0);

  useEffect(() => {
    const m = setInterval(
      () => setMsgIdx((i) => Math.min(i + 1, SIM_MSGS.length - 1)),
      950
    );
    const d = setInterval(() => setDotIdx((i) => (i + 1) % 3), 400);
    return () => {
      clearInterval(m);
      clearInterval(d);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen gap-8 px-8 fade-in">
      <span
        className="font-bold text-[22px] tracking-tight absolute top-14"
        style={{ color: "#3B3BB5" }}
      >
        leap
      </span>

      <div className="flex items-end gap-1.5" style={{ height: "36px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: "8px",
              height: dotIdx === i ? "36px" : dotIdx === (i + 1) % 3 ? "22px" : "10px",
              background: "#3B3BB5",
              opacity: dotIdx === i ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      <p
        key={msgIdx}
        className="fade-in text-[17px] font-bold text-center"
        style={{ color: "#1A1A1A" }}
      >
        {SIM_MSGS[msgIdx]}
      </p>

      <div
        className="w-44 h-1 rounded-full overflow-hidden"
        style={{ background: "#E5E5E5" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            background: "#3B3BB5",
            width: `${((msgIdx + 1) / SIM_MSGS.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Error state ──────────────────────────────────────────── */
function ErrorState({
  error,
  onBack,
  onRetry,
}: {
  error: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 fade-in">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: "#FFF0EE" }}
      >
        ⚠️
      </div>
      <div className="text-center space-y-2">
        <p className="font-bold text-[17px]" style={{ color: "#1A1A1A" }}>
          Simulation failed
        </p>
        <p className="text-[13px]" style={{ color: "#666666" }}>
          {error}
        </p>
        {error.includes("OPENAI_API_KEY") && (
          <p
            className="text-[12px] mt-2 px-4 py-3 rounded-xl"
            style={{ background: "#FFF0EE", color: "#D94F3A" }}
          >
            Add your key to <code>next-leap/.env.local</code> and restart the
            dev server.
          </p>
        )}
      </div>
      <button
        onClick={onRetry}
        className="px-6 py-3 rounded-xl font-semibold text-sm"
        style={{ background: "#3B3BB5", color: "#FFF" }}
      >
        Try again
      </button>
      <button onClick={onBack} className="text-sm" style={{ color: "#AAAAAA" }}>
        ← Back to paths
      </button>
    </div>
  );
}

/* ── Compare view ─────────────────────────────────────────── */
const PATH_COLORS = ["#3B3BB5", "#0D9488", "#7C3AED"];

function CompareView({
  compareResults,
  selectedPath,
}: {
  compareResults: { path: PathOption; sim: SimulationData }[];
  selectedPath: PathOption;
}) {
  const chartData = Array.from({ length: 10 }, (_, i) => {
    const point: Record<string, number> = { year: i + 1 };
    point.stay = compareResults[0]?.sim.chartData[i]?.stay ?? 0;
    compareResults.forEach((r, idx) => {
      point[`abroad_${idx}`] = r.sim.chartData[i]?.abroad ?? 0;
    });
    return point;
  });

  return (
    <div
      className="rounded-2xl p-4 space-y-4 fade-in"
      style={{ border: "1px solid #E5E5E5" }}
    >
      <p className="font-bold text-[16px]" style={{ color: "#1A1A1A" }}>
        All paths compared
      </p>

      <ResponsiveContainer width="100%" height={190}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -22, bottom: 5 }}
        >
          <XAxis
            dataKey="year"
            type="number"
            domain={[1, 10]}
            ticks={[1, 3, 5, 7, 10]}
            tick={{ fontSize: 10, fill: "#AAAAAA" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#AAAAAA" }}
            tickLine={false}
            axisLine={false}
            tickCount={5}
            domain={[0, "auto"]}
          />
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F0F0F0"
            vertical={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #E5E5E5",
              fontSize: "12px",
            }}
            labelFormatter={(l) => `Year ${l}`}
            formatter={(value) => [`${value} LPA`]}
          />
          <Line
            dataKey="stay"
            name="If you stay"
            stroke="#999999"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
          />
          {compareResults.map((r, idx) => (
            <Line
              key={idx}
              dataKey={`abroad_${idx}`}
              name={r.path.course.split(" ").slice(0, 3).join(" ")}
              stroke={PATH_COLORS[idx % PATH_COLORS.length]}
              strokeWidth={r.path.course === selectedPath.course ? 2.5 : 1.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="space-y-2">
        {compareResults.map((r, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background:
                r.path.course === selectedPath.course ? "#EEEEF8" : "#F9F9F9",
              border:
                r.path.course === selectedPath.course
                  ? "1px solid #3B3BB5"
                  : "1px solid transparent",
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: PATH_COLORS[idx % PATH_COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-[13px] leading-tight"
                style={{ color: "#1A1A1A" }}
              >
                {r.path.course}
                {r.path.course === selectedPath.course && (
                  <span
                    className="ml-1 text-[10px] font-normal"
                    style={{ color: "#3B3BB5" }}
                  >
                    (selected)
                  </span>
                )}
              </p>
              <p className="text-[11px]" style={{ color: "#999" }}>
                {r.path.country}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p
                className="font-bold text-[13px]"
                style={{ color: "#1A1A1A" }}
              >
                {r.sim.salaryAtYear10Abroad} LPA
              </p>
              <p className="text-[11px]" style={{ color: "#999" }}>
                yr10 · {r.sim.worthItScore}/10
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main SimulatorScreen
══════════════════════════════════════════════════════════ */
type ScreenState = "loading" | "results" | "error";
type CompareState = "idle" | "loading" | "done" | "error";

export default function SimulatorScreen({
  profile,
  selectedPath,
  allPaths,
  rolesData,
  onRolesData,
  onSimData,
  onBack,
  onNext,
}: Props) {
  const [state, setState] = useState<ScreenState>("loading");
  const [sim, setSim] = useState<SimulationData | null>(null);
  const [error, setError] = useState("");
  const [showCalcNotes, setShowCalcNotes] = useState(false);
  const [compareState, setCompareState] = useState<CompareState>("idle");
  const [compareResults, setCompareResults] = useState<
    { path: PathOption; sim: SimulationData }[]
  >([]);

  const prefetchRoles = () => {
    if (rolesData) return;
    fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, path: selectedPath }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.roles) onRolesData(data.roles); })
      .catch(() => {});
  };

  const loadSimulation = () => {
    fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, path: selectedPath }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSim(data.simulation);
        setState("results");
        onSimData(data.simulation);
        prefetchRoles();
      })
      .catch((err: Error) => {
        setError(err.message);
        setState("error");
      });
  };

  const runSimulation = () => {
    setState("loading");
    setError("");
    loadSimulation();
  };

  useEffect(() => {
    loadSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompare = async () => {
    setCompareState("loading");
    try {
      const results = await Promise.all(
        allPaths.map((path) =>
          fetch("/api/simulate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile, path }),
          })
            .then((r) => r.json())
            .then((d) => ({ path, sim: d.simulation as SimulationData }))
        )
      );
      setCompareResults(results);
      setCompareState("done");
    } catch {
      setCompareState("error");
    }
  };

  if (state === "loading") return <SimLoader />;
  if (state === "error")
    return (
      <ErrorState
        error={error}
        onBack={onBack}
        onRetry={runSimulation}
      />
    );
  if (!sim) return null;

  const scoreColor =
    sim.worthItScore >= 7
      ? "#3B3BB5"
      : sim.worthItScore >= 4
      ? "#F59E0B"
      : "#D94F3A";
  const verdictBg =
    sim.worthItScore >= 7
      ? "#E8F5F0"
      : sim.worthItScore >= 4
      ? "#EEEEF8"
      : "#FFF0EE";
  const verdictTextColor =
    sim.worthItScore >= 7
      ? "#2D7D5F"
      : sim.worthItScore >= 4
      ? "#3B3BB5"
      : "#D94F3A";

  const breakevenPoint = sim.chartData.find((d) => d.year === sim.breakevenYear);
  const showCompare = !selectedPath.isCustom && allPaths.length > 1;

  return (
    <>
      {/* Scrollable content */}
      <div className="flex flex-col pb-40 fade-in">
        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-5 pt-5 pb-3"
          style={{ background: "#FFFFFF", borderBottom: "1px solid #F5F5F5" }}
        >
          <button
            onClick={onBack}
            className="text-[22px] leading-none active:opacity-40"
            style={{ color: "#1A1A1A" }}
            aria-label="Back"
          >
            ←
          </button>
          <div className="min-w-0">
            <p
              className="font-bold text-[15px] truncate"
              style={{ color: "#1A1A1A" }}
            >
              {selectedPath.course}
            </p>
            <p className="text-[12px]" style={{ color: "#999999" }}>
              {selectedPath.country}
              {selectedPath.collegeTier ? ` · ${selectedPath.collegeTier}` : ""}
            </p>
          </div>
        </div>

        <div className="px-5 pt-4 space-y-4">
          {/* ── Section 1: Chart ── */}
          <div
            className="rounded-2xl p-4 space-y-2"
            style={{ border: "1px solid #E5E5E5" }}
          >
            <p className="font-bold text-[17px]" style={{ color: "#1A1A1A" }}>
              Two futures, 10 years
            </p>
            <p className="text-[12px]" style={{ color: "#AAAAAA" }}>
              Salary in LPA (lakhs per annum)
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={sim.chartData}
                margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
              >
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[1, 10]}
                  ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  tick={{ fontSize: 10, fill: "#AAAAAA" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#AAAAAA" }}
                  tickLine={false}
                  axisLine={false}
                  tickCount={5}
                  domain={[0, "auto"]}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F0F0F0"
                  vertical={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} LPA`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E5E5E5",
                    fontSize: "12px",
                  }}
                  labelFormatter={(l) => `Year ${l}`}
                />
                <Legend
                  iconType="line"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }}
                />
                <Line
                  dataKey="abroad"
                  name="If you go abroad"
                  stroke="#3B3BB5"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#3B3BB5" }}
                />
                <Line
                  dataKey="stay"
                  name="If you stay"
                  stroke="#999999"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                  activeDot={{ r: 4, fill: "#999999" }}
                />
                {breakevenPoint &&
                  sim.breakevenYear > 0 &&
                  sim.breakevenYear <= 10 && (
                    <ReferenceDot
                      x={sim.breakevenYear}
                      y={breakevenPoint.abroad}
                      r={5}
                      fill="#22C55E"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    >
                      <Label
                        value="Breaks even"
                        position="top"
                        fontSize={9}
                        fill="#22C55E"
                      />
                    </ReferenceDot>
                  )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── Section 2: 4 stat cards ── */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-4 flex flex-col gap-1"
              style={{ border: "1px solid #E5E5E5" }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "#AAAAAA" }}
              >
                Worth-it score
              </p>
              <div className="flex items-end gap-0.5">
                <span
                  className="text-[30px] font-bold leading-none"
                  style={{ color: scoreColor }}
                >
                  {sim.worthItScore}
                </span>
                <span
                  className="text-[13px] pb-1"
                  style={{ color: "#CCCCCC" }}
                >
                  /10
                </span>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 flex flex-col gap-1"
              style={{ border: "1px solid #E5E5E5" }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "#AAAAAA" }}
              >
                Total investment
              </p>
              <p
                className="text-[15px] font-bold leading-snug mt-1"
                style={{ color: "#1A1A1A" }}
              >
                {sim.totalInvestmentINR}
              </p>
            </div>

            <div
              className="rounded-2xl p-4 flex flex-col gap-1"
              style={{ border: "1px solid #E5E5E5" }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "#AAAAAA" }}
              >
                Breaks even
              </p>
              <div className="flex items-end gap-1">
                <span
                  className="text-[30px] font-bold leading-none"
                  style={{ color: "#1A1A1A" }}
                >
                  {sim.breakevenYear}
                </span>
                <span
                  className="text-[13px] pb-1"
                  style={{ color: "#999999" }}
                >
                  yrs
                </span>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 flex flex-col gap-1"
              style={{ border: "1px solid #E5E5E5" }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "#AAAAAA" }}
              >
                10-yr salary gain
              </p>
              <p
                className="text-[15px] font-bold leading-snug mt-1"
                style={{ color: "#22C55E" }}
              >
                {sim.tenYearGainLPA}
              </p>
            </div>
          </div>

          {/* ── Section 3: Verdict ── */}
          <div
            className="rounded-2xl p-4 space-y-2"
            style={{ background: verdictBg }}
          >
            <p
              className="font-bold text-[16px]"
              style={{ color: verdictTextColor }}
            >
              {sim.verdictHeadline}
            </p>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: verdictTextColor, opacity: 0.9 }}
            >
              {sim.verdictDetail}
            </p>
          </div>

          {/* ── Section 4: Transparency accordion ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid #E5E5E5" }}
          >
            <button
              onClick={() => setShowCalcNotes(!showCalcNotes)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <span>🔢</span>
                <span
                  className="font-semibold text-[15px]"
                  style={{ color: "#1A1A1A" }}
                >
                  How we calculated this
                </span>
              </div>
              <span
                style={{
                  color: "#999999",
                  display: "inline-block",
                  transition: "transform 0.2s",
                  transform: showCalcNotes ? "rotate(90deg)" : "rotate(0deg)",
                  fontSize: "20px",
                  lineHeight: 1,
                }}
              >
                ›
              </span>
            </button>
            {showCalcNotes && (
              <div
                className="px-4 pb-4 space-y-2 fade-in"
                style={{ borderTop: "1px solid #F0F0F0" }}
              >
                {sim.calculationNotes.map((note, i) => (
                  <div
                    key={i}
                    className="flex gap-2 text-[13px] pt-2"
                    style={{ color: "#666666" }}
                  >
                    <span style={{ color: "#CCCCCC", flexShrink: 0 }}>•</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section 5: Risk + Opportunity ── */}
          <div className="space-y-3">
            <div
              className="rounded-2xl p-4 space-y-1.5"
              style={{ background: "#FFF0EE" }}
            >
              <p
                className="font-semibold text-[13px]"
                style={{ color: "#D94F3A" }}
              >
                ⚠️ Key risk
              </p>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "#D94F3A", opacity: 0.85 }}
              >
                {sim.keyRisk}
              </p>
            </div>
            <div
              className="rounded-2xl p-4 space-y-1.5"
              style={{ background: "#E8F5F0" }}
            >
              <p
                className="font-semibold text-[13px]"
                style={{ color: "#2D7D5F" }}
              >
                ✦ Key opportunity
              </p>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "#2D7D5F", opacity: 0.85 }}
              >
                {sim.keyOpportunity}
              </p>
            </div>
          </div>

          {/* ── Section 6: Compare all paths ── */}
          {showCompare && (
            <div className="space-y-3 pb-2">
              {compareState === "idle" && (
                <button
                  onClick={handleCompare}
                  className="w-full font-semibold text-[15px] rounded-xl flex items-center justify-center active:scale-[0.98] transition-all"
                  style={{
                    height: "48px",
                    background: "#EEEEF8",
                    color: "#3B3BB5",
                  }}
                >
                  Compare all {allPaths.length} paths →
                </button>
              )}

              {compareState === "loading" && (
                <div
                  className="rounded-2xl p-5 flex items-center justify-center gap-3"
                  style={{ border: "1px solid #E5E5E5" }}
                >
                  <div className="flex items-end gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: 6,
                          height: 6 + i * 6,
                          background: "#3B3BB5",
                          opacity: 0.5 + i * 0.25,
                          animation: "dotPulse 1s ease-in-out infinite",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[13px]" style={{ color: "#666666" }}>
                    Simulating all paths...
                  </p>
                </div>
              )}

              {compareState === "done" && compareResults.length > 0 && (
                <CompareView
                  compareResults={compareResults}
                  selectedPath={selectedPath}
                />
              )}

              {compareState === "error" && (
                <p
                  className="text-[13px] text-center py-2"
                  style={{ color: "#D94F3A" }}
                >
                  Comparison failed. Try again.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom: teaser + CTA */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] flex justify-center z-20"
        style={{ background: "#FFFFFF", borderTop: "1px solid #E5E5E5" }}
      >
        <div className="w-full max-w-[390px] px-5 pt-4 pb-6">
          {/* Teaser strip */}
          <button
            onClick={onNext}
            className="hidden"
            style={{ background: "#EEEEF8" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0 text-[14px]">✨</span>
              <p
                className="text-[13px] font-semibold truncate"
                style={{ color: "#3B3BB5" }}
              >
                {rolesData?.unlockedRoles?.[0]?.title
                  ? `Unlock roles like ${rolesData.unlockedRoles[0].title} and more`
                  : "See the senior roles this unlocks →"}
              </p>
            </div>
            <span
              className="flex-shrink-0 ml-2 text-[18px] leading-none"
              style={{ color: "#3B3BB5" }}
            >
              ›
            </span>
          </button>
          {/* Primary CTA */}
          <button
            onClick={onNext}
            className="w-full font-semibold text-[15px] rounded-xl flex items-center justify-center active:scale-[0.98] transition-all"
            style={{ height: "52px", background: "#3B3BB5", color: "#FFFFFF" }}
          >
            See the roles you unlock →
          </button>
        </div>
      </div>
    </>
  );
}
