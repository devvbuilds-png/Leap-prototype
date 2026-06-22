"use client";

import { useState } from "react";
import { PathOption, ProfileData, SimulationData } from "../types";

interface Props {
  profile: ProfileData;
  selectedPath: PathOption;
  simData: SimulationData | null;
  onBack: () => void;
  onRestart: () => void;
}

/* ── Reusable action card ─────────────────────────────────── */
function ActionCard({
  icon,
  badge,
  title,
  description,
  ctaLabel,
  ctaVariant,
}: {
  icon: string;
  badge?: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaVariant: "filled" | "outline";
}) {
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    setTapped(true);
    setTimeout(() => setTapped(false), 1400);
  };

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-[20px] flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[15px]" style={{ color: "#1A1A1A" }}>
              {title}
            </p>
            {badge && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: "#EEEEF8", color: "#3B3BB5" }}
              >
                {badge}
              </span>
            )}
          </div>
          <p
            className="text-[13px] leading-relaxed mt-1"
            style={{ color: "#666666" }}
          >
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={handleTap}
        className="w-full font-semibold text-[14px] rounded-xl flex items-center justify-center active:scale-[0.98] transition-all"
        style={
          ctaVariant === "filled"
            ? { height: "44px", background: "#3B3BB5", color: "#FFFFFF" }
            : {
                height: "44px",
                background: "#FFFFFF",
                color: "#3B3BB5",
                border: "1.5px solid #3B3BB5",
              }
        }
      >
        {tapped ? "Coming in the full version ✓" : ctaLabel}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NextStepsScreen
══════════════════════════════════════════════════════════ */
export default function NextStepsScreen({
  selectedPath,
  simData,
  onBack,
  onRestart,
}: Props) {
  const breakeven = simData?.breakevenYear ?? selectedPath.breakevenYears;
  const investment = simData?.totalInvestmentINR ?? `$${selectedPath.costRangeUSD}`;
  const worthItScore = simData?.worthItScore;
  const gain = simData?.tenYearGainLPA;
  const firstCollege =
    selectedPath.exampleColleges?.[0] ?? selectedPath.country;

  return (
    <div className="flex flex-col pb-8 fade-in">
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
          <p className="font-bold text-[17px]" style={{ color: "#1A1A1A" }}>
            Your next steps
          </p>
          <p className="text-[12px] truncate" style={{ color: "#999999" }}>
            {selectedPath.course} · {selectedPath.country}
          </p>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {/* ── Hero ROI recap ── */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "#E8F5F0" }}>
          <p className="font-bold text-[15px]" style={{ color: "#2D7D5F" }}>
            Your analysis, in brief
          </p>
          <div className="flex gap-6">
            {worthItScore != null && (
              <div>
                <p className="leading-none" style={{ color: "#2D7D5F" }}>
                  <span className="text-[26px] font-bold">{worthItScore}</span>
                  <span className="text-[13px]">/10</span>
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "#2D7D5F", opacity: 0.7 }}
                >
                  worth-it score
                </p>
              </div>
            )}
            <div>
              <p className="leading-none" style={{ color: "#2D7D5F" }}>
                <span className="text-[26px] font-bold">{breakeven}</span>
                <span className="text-[13px]"> yrs</span>
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "#2D7D5F", opacity: 0.7 }}
              >
                to break even
              </p>
            </div>
            {gain && (
              <div>
                <p
                  className="text-[26px] font-bold leading-none"
                  style={{ color: "#2D7D5F" }}
                >
                  {gain}
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "#2D7D5F", opacity: 0.7 }}
                >
                  10-yr gain
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Card 1: Counselor (primary lead capture) ── */}
        <ActionCard
          icon="💬"
          title="Talk to a Leap advisor"
          description={`Get your questions answered by a counselor who's helped thousands of professionals navigate this decision — ${selectedPath.course} in ${selectedPath.country}.`}
          ctaLabel="Book a free session →"
          ctaVariant="filled"
        />

        {/* ── Card 2: Loan eligibility (LeapFinance) ── */}
        <ActionCard
          icon="💰"
          badge="LeapFinance"
          title="Check your loan eligibility"
          description={`You break even in ${breakeven} years. We can show you how to finance ${investment} so this is a calculated bet, not a gamble.`}
          ctaLabel="See loan options →"
          ctaVariant="outline"
        />

        {/* ── Card 3: Explore universities ── */}
        <ActionCard
          icon="🎓"
          title={`Explore ${firstCollege} and similar`}
          description={`Deadlines, visa acceptance rates, and admission chances for ${selectedPath.collegeTier} programs in ${selectedPath.country}.`}
          ctaLabel="Browse programs →"
          ctaVariant="outline"
        />

        {/* ── Card 4: Save/share + restart ── */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ border: "1px solid #E5E5E5" }}
        >
          <div className="flex items-start gap-3">
            <span className="text-[20px] flex-shrink-0 mt-0.5">📋</span>
            <div>
              <p className="font-bold text-[15px]" style={{ color: "#1A1A1A" }}>
                Save your analysis
              </p>
              <p
                className="text-[13px] leading-relaxed mt-1"
                style={{ color: "#666666" }}
              >
                Keep this report to revisit, share with family, or bring to
                your first counselor call.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 h-10 rounded-xl font-semibold text-[13px] active:scale-[0.98] transition-all"
              style={{ background: "#EEEEF8", color: "#3B3BB5" }}
            >
              Share report →
            </button>
            <button
              onClick={onRestart}
              className="flex-1 h-10 rounded-xl font-semibold text-[13px] active:scale-[0.98] transition-all"
              style={{ background: "#F5F5F5", color: "#999999" }}
            >
              Start over
            </button>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center text-[12px] pt-2 pb-4"
          style={{ color: "#CCCCCC" }}
        >
          Powered by{" "}
          <span className="font-bold" style={{ color: "#3B3BB5" }}>
            leap
          </span>
        </p>
      </div>
    </div>
  );
}
