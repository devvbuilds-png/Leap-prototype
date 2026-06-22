"use client";

import { useEffect, useState } from "react";
import { PathOption, ProfileData } from "../types";

interface Props {
  profile: ProfileData;
  onSelectPath: (path: PathOption, allPaths: PathOption[]) => void;
  onBack: () => void;
}

/* ── Country flag lookup ──────────────────────────────────── */
const FLAGS: Record<string, string> = {
  USA: "🇺🇸",
  UK: "🇬🇧",
  Canada: "🇨🇦",
  Europe: "🇪🇺",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  Netherlands: "🇳🇱",
  France: "🇫🇷",
  Ireland: "🇮🇪",
  Singapore: "🇸🇬",
  Sweden: "🇸🇪",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  Finland: "🇫🇮",
  Denmark: "🇩🇰",
};
const flag = (c: string) => FLAGS[c] ?? "🌍";

/* ── Fit label pill ───────────────────────────────────────── */
function FitPill({ label }: { label: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    "Strong Fit": { bg: "#E8F5F0", color: "#2D7D5F" },
    "Good Fit": { bg: "#EEEEF8", color: "#3B3BB5" },
    Stretch: { bg: "#FFF0EE", color: "#D94F3A" },
  };
  const s = styles[label] ?? styles["Good Fit"];
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </span>
  );
}

/* ── Loading state (used while LLM responds) ─────────────── */
const LOAD_MSGS = [
  "Analyzing your profile...",
  "Finding paths that fit you",
  "Checking what's realistic...",
  "Almost there...",
];

function PathsLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dotIdx, setDotIdx] = useState(0);

  useEffect(() => {
    const m = setInterval(
      () => setMsgIdx((i) => Math.min(i + 1, LOAD_MSGS.length - 1)),
      900
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
        {LOAD_MSGS[msgIdx]}
      </p>

      <div
        className="w-44 h-1 rounded-full overflow-hidden"
        style={{ background: "#E5E5E5" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            background: "#3B3BB5",
            width: `${((msgIdx + 1) / LOAD_MSGS.length) * 100}%`,
          }}
        />
      </div>

      <p className="text-xs absolute bottom-10" style={{ color: "#CCCCCC" }}>
        Powered by{" "}
        <span className="font-semibold" style={{ color: "#3B3BB5" }}>
          leap
        </span>
      </p>
    </div>
  );
}

/* ── Individual path card ─────────────────────────────────── */
function PathCard({
  path,
  onSelect,
}: {
  path: PathOption;
  onSelect: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Top row: course + fit pill */}
      <div className="flex items-start justify-between gap-2">
        <p
          className="font-bold leading-snug"
          style={{ color: "#1A1A1A", fontSize: "16px" }}
        >
          {path.course}
        </p>
        <FitPill label={path.fitLabel} />
      </div>

      {/* Country + tier */}
      <p className="text-[13px]" style={{ color: "#999999" }}>
        {flag(path.country)} {path.country} &nbsp;·&nbsp; {path.collegeTier}
      </p>

      {/* Example colleges */}
      <p className="text-[13px]" style={{ color: "#AAAAAA" }}>
        {path.exampleColleges.join("  ·  ")}
      </p>

      {/* Headline outcome strip */}
      <div
        className="rounded-xl px-3 py-2.5"
        style={{ background: "#EEEEF8" }}
      >
        <p
          className="text-[13px] font-semibold"
          style={{ color: "#3B3BB5" }}
        >
          Expected: {path.headlineSalaryLPA}
          &nbsp;&nbsp;·&nbsp;&nbsp;Breaks even in ~{path.breakevenYears} yrs
        </p>
      </div>

      {/* Fit reason */}
      <div>
        <p
          className="text-[12px] font-semibold uppercase tracking-wide mb-1"
          style={{ color: "#AAAAAA" }}
        >
          Why this fits you
        </p>
        <p
          className="text-[13px] leading-relaxed italic"
          style={{ color: "#666666" }}
        >
          {path.fitReason}
        </p>
      </div>

      {/* Metadata */}
      <div
        className="flex items-center gap-2 pt-0.5 text-[12px]"
        style={{ color: "#AAAAAA" }}
      >
        <span>Total cost ${path.costRangeUSD}</span>
        <span style={{ color: "#E5E5E5" }}>|</span>
        <span>{path.duration}</span>
      </div>

      {/* CTA */}
      <button
        onClick={onSelect}
        className="w-full font-semibold text-[15px] rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
        style={{ height: "48px", background: "#3B3BB5", color: "#FFFFFF" }}
      >
        See my full trajectory →
      </button>
    </div>
  );
}

/* ── Custom path modal ────────────────────────────────────── */
function CustomModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (course: string, country: string) => void;
  onClose: () => void;
}) {
  const [course, setCourse] = useState("");
  const [country, setCountry] = useState("");
  const ok = course.trim().length > 0 && country.trim().length > 0;

  const inputStyle = (filled: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "13px 15px",
    borderRadius: "12px",
    border: `1.5px solid ${filled ? "#3B3BB5" : "#E5E5E5"}`,
    fontSize: "16px",
    color: "#1A1A1A",
    background: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-t-3xl p-6 pb-10 space-y-4 fade-in"
        style={{ background: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          className="w-10 h-1 rounded-full mx-auto mb-2"
          style={{ background: "#E5E5E5" }}
        />

        <h3
          className="font-bold text-[18px]"
          style={{ color: "#1A1A1A" }}
        >
          Describe your own path
        </h3>

        <input
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="e.g. MS in Data Science"
          style={inputStyle(course.trim().length > 0)}
          autoFocus
        />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g. Canada"
          style={inputStyle(country.trim().length > 0)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && ok) onConfirm(course.trim(), country.trim());
          }}
        />

        <button
          onClick={() => ok && onConfirm(course.trim(), country.trim())}
          disabled={!ok}
          className="w-full font-semibold text-[15px] rounded-xl flex items-center justify-center transition-all"
          style={{
            height: "50px",
            background: ok ? "#3B3BB5" : "#E5E5E5",
            color: ok ? "#FFFFFF" : "#AAAAAA",
          }}
        >
          Simulate this →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main PathsScreen
══════════════════════════════════════════════════════════ */
type ScreenState = "loading" | "results" | "error";

export default function PathsScreen({ profile, onSelectPath, onBack }: Props) {
  const [state, setState] = useState<ScreenState>("loading");
  const [paths, setPaths] = useState<PathOption[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setPaths(data.paths);
        setState("results");
      })
      .catch((err: Error) => {
        setError(err.message);
        setState("error");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── aspiration display text (strip emoji prefix) ── */
  const aspirationText = profile.aspiration.replace(/^\S+\s/, "");

  const handleCustomPath = (course: string, country: string) => {
    const custom: PathOption = {
      course,
      country,
      collegeTier: "Custom path",
      exampleColleges: [],
      fitReason: "",
      costRangeUSD: "—",
      duration: "—",
      fitLabel: "Good Fit",
      headlineSalaryLPA: "—",
      breakevenYears: 0,
      isCustom: true,
    };
    onSelectPath(custom, paths);
  };

  if (state === "loading") return <PathsLoader />;

  if (state === "error") {
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
            Something went wrong
          </p>
          <p className="text-[13px]" style={{ color: "#666666" }}>
            {error}
          </p>
          {error.includes("OPENAI_API_KEY") && (
            <p
              className="text-[12px] mt-2 px-4 py-3 rounded-xl"
              style={{ background: "#FFF0EE", color: "#D94F3A" }}
            >
              Add your key to <code>next-leap/.env.local</code> and restart the dev server.
            </p>
          )}
        </div>
        <button
          onClick={() => { setState("loading"); setError(""); }}
          className="px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ background: "#3B3BB5", color: "#FFF" }}
        >
          Try again
        </button>
        <button
          onClick={onBack}
          className="text-sm"
          style={{ color: "#AAAAAA" }}
        >
          ← Edit my profile
        </button>
      </div>
    );
  }

  /* ── Results ── */
  return (
    <>
      <div className="flex flex-col min-h-screen fade-in">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 pt-5 pb-3 sticky top-0 z-10"
          style={{ background: "#FFFFFF" }}
        >
          <button
            onClick={onBack}
            className="text-[22px] leading-none active:opacity-40"
            style={{ color: "#1A1A1A" }}
            aria-label="Back"
          >
            ←
          </button>
          <p className="font-bold text-[18px]" style={{ color: "#1A1A1A" }}>
            Your paths
          </p>
        </div>

        {/* Subheading */}
        <p
          className="px-5 pb-4 text-[13px]"
          style={{ color: "#666666" }}
        >
          Based on {profile.experience} in your field, aiming to{" "}
          {aspirationText.toLowerCase()}
        </p>

        {/* Cards */}
        <div className="flex flex-col gap-4 px-5 pb-10">
          {paths.map((path, i) => (
            <PathCard
              key={i}
              path={path}
              onSelect={() => onSelectPath(path, paths)}
            />
          ))}

          {/* Custom path */}
          <div className="text-center pt-2 pb-4 space-y-1">
            <p className="text-[13px]" style={{ color: "#999999" }}>
              Don&apos;t see what you&apos;re looking for?
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="text-[14px] font-semibold"
              style={{ color: "#3B3BB5" }}
            >
              Describe your own path →
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <CustomModal
          onConfirm={(course, country) => {
            setShowModal(false);
            handleCustomPath(course, country);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
