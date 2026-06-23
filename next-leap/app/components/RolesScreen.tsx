"use client";

import { useEffect, useState } from "react";
import { PathOption, ProfileData, RoleCard, RolesData } from "../types";

interface Props {
  profile: ProfileData;
  selectedPath: PathOption;
  rolesData: RolesData | null;
  onRolesData: (data: RolesData) => void;
  onBack: () => void;
  onNext: () => void;
}

/* ── Loading ──────────────────────────────────────────────── */
function RolesLoader() {
  const [dotIdx, setDotIdx] = useState(0);

  useEffect(() => {
    const d = setInterval(() => setDotIdx((i) => (i + 1) % 3), 400);
    return () => clearInterval(d);
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

      <p className="fade-in text-[17px] font-bold text-center" style={{ color: "#1A1A1A" }}>
        Mapping the roles you unlock...
      </p>
    </div>
  );
}

/* ── Before card (grey/muted) ─────────────────────────────── */
function CeilingCard({ role }: { role: RoleCard }) {
  return (
    <div
      className="rounded-2xl p-4 space-y-2"
      style={{ background: "#F7F7F7", border: "1px solid #EDEDED" }}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[15px] leading-snug"
          style={{ color: "#666666", fontWeight: 500 }}
        >
          {role.title}
        </p>
        <span
          className="text-[11px] font-semibold whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-lg"
          style={{ background: "#EBEBEB", color: "#999999" }}
        >
          {role.salaryRangeLPA}
        </span>
      </div>
      {role.note && (
        <p className="text-[12px] italic" style={{ color: "#AAAAAA" }}>
          {role.note}
        </p>
      )}
    </div>
  );
}

/* ── After card (indigo/vibrant) ──────────────────────────── */
function UnlockedCard({ role }: { role: RoleCard }) {
  return (
    <div
      className="rounded-2xl p-4 space-y-1.5"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className="font-bold text-[15px] leading-snug flex-1 min-w-0"
          style={{ color: "#1A1A1A" }}
        >
          {role.title}
        </p>
        <span
          className="text-[11px] font-semibold whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-lg"
          style={{ background: "#E8F5F0", color: "#2D7D5F" }}
        >
          {role.salaryRangeLPA}
        </span>
      </div>
      {role.whyQualify && (
        <p className="text-[13px] italic" style={{ color: "#666666" }}>
          {role.whyQualify}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main RolesScreen
══════════════════════════════════════════════════════════ */
export default function RolesScreen({
  profile,
  selectedPath,
  rolesData,
  onRolesData,
  onBack,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(!rolesData);
  const [error, setError] = useState("");

  useEffect(() => {
    if (rolesData) {
      return;
    }
    fetch("/api/roles", {
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
        onRolesData(data.roles);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <RolesLoader />;

  if (error || !rolesData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 fade-in">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "#FFF0EE" }}
        >
          ⚠️
        </div>
        <p className="font-bold text-[17px] text-center" style={{ color: "#1A1A1A" }}>
          Couldn&apos;t load role data
        </p>
        <p className="text-[13px] text-center" style={{ color: "#666666" }}>
          {error || "Unknown error"}
        </p>
        <button onClick={onBack} className="text-sm font-semibold" style={{ color: "#3B3BB5" }}>
          ← Back to trajectory
        </button>
      </div>
    );
  }

  const aspirationText = selectedPath.country
    ? `${selectedPath.course} from ${selectedPath.country}`
    : selectedPath.course;

  return (
    <>
      {/* Scrollable content */}
      <div className="flex flex-col pb-28 fade-in">
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
              Roles you unlock
            </p>
            <p className="text-[12px] truncate" style={{ color: "#999999" }}>
              With {aspirationText}
            </p>
          </div>
        </div>

        <div className="px-5 pt-5 space-y-3">
          {/* ── SECTION 1: BEFORE ── */}
          <div className="space-y-2">
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "#AAAAAA" }}
              >
                Where you&apos;d likely cap out
              </p>
              <p className="text-[12px]" style={{ color: "#CCCCCC" }}>
                if you stay on your current path
              </p>
            </div>
            {rolesData.currentCeiling.map((role, i) => (
              <CeilingCard key={i} role={role} />
            ))}
          </div>

          {/* ── VISUAL TRANSITION ── */}
          <div className="flex flex-col items-center py-1 gap-1">
            <div
              className="w-px"
              style={{ height: "18px", background: "#DDDDEE" }}
            />
            <span
              className="text-[12px] font-semibold px-3 py-1 rounded-full"
              style={{ background: "#EEEEF8", color: "#3B3BB5" }}
            >
              with this path ↓
            </span>
            <div
              className="w-px"
              style={{ height: "18px", background: "#DDDDEE" }}
            />
          </div>

          {/* ── SECTION 2: AFTER ── */}
          <div className="space-y-2">
            <p
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "#3B3BB5" }}
            >
              Roles this path opens up
            </p>
            {rolesData.unlockedRoles.map((role, i) => (
              <UnlockedCard key={i} role={role} />
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] flex justify-center z-20"
        style={{ background: "#FFFFFF", borderTop: "1px solid #E5E5E5" }}
      >
        <div className="w-full max-w-[390px] px-5 py-4 pb-6">
          <button
            onClick={onNext}
            className="w-full font-semibold text-[15px] rounded-xl flex items-center justify-center active:scale-[0.98] transition-all"
            style={{ height: "52px", background: "#3B3BB5", color: "#FFFFFF" }}
          >
            See my next steps →
          </button>
        </div>
      </div>
    </>
  );
}
