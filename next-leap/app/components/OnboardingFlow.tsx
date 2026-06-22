"use client";

import { useState, useEffect, useRef } from "react";
import { ProfileData } from "../types";

interface Props {
  onComplete: (data: ProfileData) => void;
  onBack: () => void;
}

const TOTAL_STEPS = 6;

/* ─── shared selection button ───────────────────────────── */
function SelBtn({
  label,
  selected,
  onClick,
  fullWidth = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl text-left transition-all duration-150 active:scale-[0.97] ${fullWidth ? "w-full" : ""}`}
      style={{
        padding: "14px 16px",
        background: selected ? "#EEEEF8" : "#FFFFFF",
        border: `1.5px solid ${selected ? "#3B3BB5" : "#E5E5E5"}`,
        color: selected ? "#3B3BB5" : "#1A1A1A",
        fontWeight: selected ? 600 : 400,
        fontSize: "15px",
        lineHeight: "1.4",
      }}
    >
      {label}
    </button>
  );
}

/* ─── text input ─────────────────────────────────────────── */
function TextInput({
  id,
  value,
  onChange,
  placeholder,
  onEnter,
  multiline = false,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  multiline?: boolean;
}) {
  const focused = value.trim().length > 0;
  const shared: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: `1.5px solid ${focused ? "#3B3BB5" : "#E5E5E5"}`,
    fontSize: "16px",
    color: "#1A1A1A",
    background: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
    resize: "none" as const,
    transition: "border-color 0.15s",
  };

  if (multiline) {
    return (
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={shared}
      />
    );
  }

  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={shared}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) onEnter();
      }}
    />
  );
}

/* ─── fixed bottom CTA ───────────────────────────────────── */
function BottomCTA({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pt-4 pb-8"
      style={{
        background: "linear-gradient(to top, #fff 72%, rgba(255,255,255,0))",
      }}
    >
      <button
        onClick={onClick}
        disabled={!enabled}
        className="w-full font-semibold text-[16px] rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
        style={{
          height: "52px",
          background: enabled ? "#3B3BB5" : "#E5E5E5",
          color: enabled ? "#FFFFFF" : "#AAAAAA",
        }}
      >
        {label}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════ */
export default function OnboardingFlow({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"right" | "left">("right");
  const [animKey, setAnimKey] = useState(0);

  const [profile, setProfile] = useState<ProfileData>({
    role: "",
    experience: "",
    aspiration: "",
    aspirationDetail: "",
    salary: "",
    collegeTier: "",
    cgpa: "",
    budget: "",
    countries: [],
    timeline: "",
  });

  const roleRef = useRef<HTMLInputElement | null>(null);
  const cgpaRef = useRef<HTMLInputElement | null>(null);

  /* focus first text input on step change */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 0) roleRef.current?.focus();
      if (step === 3) cgpaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  /* ── navigation helpers ── */
  const go = (nextStep: number) => {
    setDir(nextStep > step ? "right" : "left");
    setAnimKey((k) => k + 1);
    setStep(nextStep);
  };

  const advance = (updated?: ProfileData) => {
    const data = updated ?? profile;
    if (step === TOTAL_STEPS - 1) {
      onComplete(data);
    } else {
      go(step + 1);
    }
  };

  const back = () => {
    if (step === 0) onBack();
    else go(step - 1);
  };

  /* ── auto-advance for pure chip screens (Q3 salary, Q5 budget) ── */
  const autoAdvance = (field: keyof ProfileData, value: string) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    setTimeout(() => advance(updated), 260);
  };

  /* ── validation per step ── */
  const valid = (): boolean => {
    switch (step) {
      case 0:
        return profile.role.trim().length > 0 && profile.experience !== "";
      case 1:
        return profile.aspiration !== "";
      case 2:
        return profile.salary !== "";
      case 3:
        return profile.collegeTier !== "" && profile.cgpa.trim().length > 0;
      case 4:
        return profile.budget !== "";
      case 5:
        return profile.countries.length > 0 && profile.timeline !== "";
      default:
        return false;
    }
  };

  /* ── countries toggle ── */
  const toggleCountry = (val: string) => {
    if (val === "🌍 Open to all") {
      setProfile((p) => ({
        ...p,
        countries: p.countries.includes("🌍 Open to all")
          ? []
          : ["🌍 Open to all"],
      }));
    } else {
      setProfile((p) => ({
        ...p,
        countries: p.countries.includes(val)
          ? p.countries.filter((c) => c !== val)
          : [...p.countries.filter((c) => c !== "🌍 Open to all"), val],
      }));
    }
  };

  /* ─────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────── */
  const animClass = dir === "right" ? "slide-right" : "slide-left";

  /* progress: step 0 → 1 filled, step 5 → 6 filled */
  const filled = step + 1;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Progress bar — 6 segments */}
      <div className="flex gap-1 px-5 pt-3">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-400"
            style={{ background: i < filled ? "#3B3BB5" : "#E5E5E5" }}
          />
        ))}
      </div>

      {/* Back arrow */}
      <div className="px-5 pt-4 pb-0">
        <button
          onClick={back}
          className="text-[24px] leading-none transition-opacity active:opacity-40"
          style={{ color: "#1A1A1A" }}
          aria-label="Back"
        >
          ←
        </button>
      </div>

      {/* Animated step content */}
      <div
        key={animKey}
        className={`${animClass} flex-1 flex flex-col px-5 pt-4 pb-36 overflow-y-auto`}
      >
        {step === 0 && (
          <Q1
            profile={profile}
            setProfile={setProfile}
            roleRef={roleRef}
            onNext={() => advance()}
          />
        )}
        {step === 1 && <Q2 profile={profile} setProfile={setProfile} />}
        {step === 2 && (
          <Q3 profile={profile} onSelect={(v) => autoAdvance("salary", v)} />
        )}
        {step === 3 && (
          <Q4
            profile={profile}
            setProfile={setProfile}
            cgpaRef={cgpaRef}
            onNext={() => advance()}
          />
        )}
        {step === 4 && (
          <Q5 profile={profile} onSelect={(v) => autoAdvance("budget", v)} />
        )}
        {step === 5 && (
          <Q6 profile={profile} toggleCountry={toggleCountry} setProfile={setProfile} />
        )}
      </div>

      {/* Bottom CTA — shown for steps that need explicit Next */}
      {step === 0 && (
        <BottomCTA label="Next" enabled={valid()} onClick={() => advance()} />
      )}
      {step === 1 && (
        <BottomCTA label="Next" enabled={valid()} onClick={() => advance()} />
      )}
      {/* step 2 and 4 auto-advance — no CTA */}
      {step === 3 && (
        <BottomCTA label="Next" enabled={valid()} onClick={() => advance()} />
      )}
      {step === 5 && (
        <BottomCTA
          label="Find my path →"
          enabled={valid()}
          onClick={() => advance()}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Individual question screens
═════════════════════════════════════════════════════════════= */

/* Q1 — Role + Experience */
function Q1({
  profile,
  setProfile,
  roleRef,
  onNext,
}: {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  roleRef: React.MutableRefObject<HTMLInputElement | null>;
  onNext: () => void;
}) {
  const experiences = [
    "Less than 1 year",
    "1–2 years",
    "3–5 years",
    "6–10 years",
    "10+ years",
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "#BBBBBB" }}>
          1 of 6
        </p>
        <h2
          className="text-[22px] font-bold leading-snug"
          style={{ color: "#1A1A1A" }}
        >
          First up, what do you do?
        </h2>
      </div>

      <div className="space-y-2">
        <input
          ref={roleRef}
          id="role-input"
          type="text"
          value={profile.role}
          onChange={(e) =>
            setProfile((p) => ({ ...p, role: e.target.value }))
          }
          placeholder="e.g. Software Engineer at a startup, Marketing Lead..."
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            border: `1.5px solid ${profile.role.trim() ? "#3B3BB5" : "#E5E5E5"}`,
            fontSize: "16px",
            color: "#1A1A1A",
            background: "#FFFFFF",
            outline: "none",
            fontFamily: "inherit",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && profile.role.trim() && profile.experience)
              onNext();
          }}
        />
      </div>

      <div className="space-y-3">
        <p className="text-[13px] font-medium" style={{ color: "#666666" }}>
          And how long have you been working?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {experiences.map((exp) => (
            <SelBtn
              key={exp}
              label={exp}
              selected={profile.experience === exp}
              onClick={() =>
                setProfile((p) => ({ ...p, experience: exp }))
              }
              fullWidth
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Q2 — Aspiration */
function Q2({
  profile,
  setProfile,
}: {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
}) {
  const options = [
    "🚀 Break through a ceiling I've hit",
    "🔄 Switch into a completely different field",
    "🌍 Build a career abroad — maybe settle there",
    "📈 Move into leadership and bigger roles",
    "🔬 Go deep — become a specialist or researcher",
    "💰 Maximize what I earn",
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "#BBBBBB" }}>
          2 of 6
        </p>
        <h2
          className="text-[22px] font-bold leading-snug"
          style={{ color: "#1A1A1A" }}
        >
          If this all goes right, what&apos;s the dream?
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: "#666666" }}>
          This shapes everything we recommend
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <SelBtn
            key={opt}
            label={opt}
            selected={profile.aspiration === opt}
            onClick={() =>
              setProfile((p) => ({ ...p, aspiration: opt }))
            }
            fullWidth
          />
        ))}
      </div>

      <div className="space-y-1">
        <TextInput
          value={profile.aspirationDetail}
          onChange={(v) =>
            setProfile((p) => ({ ...p, aspirationDetail: v }))
          }
          placeholder="Anything else you want us to know? (optional)"
          multiline
        />
      </div>
    </div>
  );
}

/* Q3 — Salary (auto-advance) */
function Q3({
  profile,
  onSelect,
}: {
  profile: ProfileData;
  onSelect: (v: string) => void;
}) {
  const salaries = [
    "Under 6 LPA",
    "6–10 LPA",
    "10–15 LPA",
    "15–25 LPA",
    "25+ LPA",
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "#BBBBBB" }}>
          3 of 6
        </p>
        <h2
          className="text-[22px] font-bold leading-snug"
          style={{ color: "#1A1A1A" }}
        >
          What are you earning right now?
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: "#666666" }}>
          This is how we calculate whether a degree actually pays off for you
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {salaries.map((s) => (
          <SelBtn
            key={s}
            label={s}
            selected={profile.salary === s}
            onClick={() => onSelect(s)}
            fullWidth
          />
        ))}
      </div>
    </div>
  );
}

/* Q4 — College tier + CGPA */
function Q4({
  profile,
  setProfile,
  cgpaRef,
  onNext,
}: {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  cgpaRef: React.MutableRefObject<HTMLInputElement | null>;
  onNext: () => void;
}) {
  const tiers = [
    "IIT / IIM / Top-10 NIT",
    "Tier 2 college (state university, reputed private)",
    "Tier 3 / private college",
    "Foreign university",
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "#BBBBBB" }}>
          4 of 6
        </p>
        <h2
          className="text-[22px] font-bold leading-snug"
          style={{ color: "#1A1A1A" }}
        >
          How did your undergrad go?
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: "#666666" }}>
          This tells us what&apos;s realistically within reach
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {tiers.map((t) => (
          <SelBtn
            key={t}
            label={t}
            selected={profile.collegeTier === t}
            onClick={() => setProfile((p) => ({ ...p, collegeTier: t }))}
            fullWidth
          />
        ))}
      </div>

      <div className="space-y-1">
        <input
          ref={cgpaRef}
          type="text"
          value={profile.cgpa}
          onChange={(e) =>
            setProfile((p) => ({ ...p, cgpa: e.target.value }))
          }
          placeholder="Your CGPA or percentage"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            border: `1.5px solid ${profile.cgpa.trim() ? "#3B3BB5" : "#E5E5E5"}`,
            fontSize: "16px",
            color: "#1A1A1A",
            background: "#FFFFFF",
            outline: "none",
            fontFamily: "inherit",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && profile.collegeTier && profile.cgpa.trim())
              onNext();
          }}
        />
        <p className="text-xs pl-1" style={{ color: "#AAAAAA" }}>
          Approximate is fine
        </p>
      </div>
    </div>
  );
}

/* Q5 — Budget (auto-advance) */
function Q5({
  profile,
  onSelect,
}: {
  profile: ProfileData;
  onSelect: (v: string) => void;
}) {
  const budgets = [
    "Under 20 lakhs",
    "20–40 lakhs",
    "40–60 lakhs",
    "60 lakhs+",
    "I'll need a loan for most of it",
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "#BBBBBB" }}>
          5 of 6
        </p>
        <h2
          className="text-[22px] font-bold leading-snug"
          style={{ color: "#1A1A1A" }}
        >
          How much can you invest in this?
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: "#666666" }}>
          Be real — we&apos;ll only show options that actually make sense for
          your budget
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {budgets.map((b) => (
          <SelBtn
            key={b}
            label={b}
            selected={profile.budget === b}
            onClick={() => onSelect(b)}
            fullWidth
          />
        ))}
      </div>
    </div>
  );
}

/* Q6 — Countries + Timeline */
function Q6({
  profile,
  toggleCountry,
  setProfile,
}: {
  profile: ProfileData;
  toggleCountry: (v: string) => void;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
}) {
  const countries = [
    "🇺🇸 USA",
    "🇬🇧 UK",
    "🇨🇦 Canada",
    "🇪🇺 Europe",
    "🇦🇺 Australia",
    "🌍 Open to all",
  ];

  const timelines = [
    "Within 1 year",
    "1–2 years",
    "2+ years",
    "Just exploring",
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "#BBBBBB" }}>
          6 of 6
        </p>
        <h2
          className="text-[22px] font-bold leading-snug"
          style={{ color: "#1A1A1A" }}
        >
          Last one — where and when?
        </h2>
      </div>

      {/* Countries */}
      <div className="space-y-2">
        <p className="text-[13px] font-medium" style={{ color: "#666666" }}>
          Which countries are you open to?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {countries.map((c) => (
            <SelBtn
              key={c}
              label={c}
              selected={profile.countries.includes(c)}
              onClick={() => toggleCountry(c)}
              fullWidth
            />
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <p className="text-[13px] font-medium" style={{ color: "#666666" }}>
          What&apos;s your timeline?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {timelines.map((t) => (
            <SelBtn
              key={t}
              label={t}
              selected={profile.timeline === t}
              onClick={() => setProfile((p) => ({ ...p, timeline: t }))}
              fullWidth
            />
          ))}
        </div>
      </div>
    </div>
  );
}
