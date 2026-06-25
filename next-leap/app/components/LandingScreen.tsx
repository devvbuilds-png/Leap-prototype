"use client";

interface Props {
  onStart: () => void;
}

export default function LandingScreen({ onStart }: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-screen px-5 pt-14 pb-10 fade-in md:min-h-0">
      {/* Wordmark */}
      <div>
        <span
          className="font-bold text-[22px] tracking-tight"
          style={{ color: "#3B3BB5" }}
        >
          leap
        </span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center gap-7 py-10">
        <h1
          className="text-[38px] font-bold leading-[1.15] tracking-tight"
          style={{ color: "#1A1A1A" }}
        >
          Your next
          <br />
          career leap
          <br />
          is abroad.
        </h1>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "#666666", maxWidth: "310px" }}
        >
          Map the degree, salary jump, and breakeven point that make studying
          abroad a calculated career move.
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { icon: "📊", text: "Real ROI math" },
            { icon: "⚖️", text: "Stay vs. go" },
            { icon: "🎯", text: "Fits your budget" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "#EEEEF8", color: "#3B3BB5" }}
            >
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={onStart}
          className="w-full font-semibold text-[16px] rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
          style={{
            height: "52px",
            background: "#3B3BB5",
            color: "#FFFFFF",
          }}
        >
          Map my abroad future →
        </button>
        <p className="text-center text-xs" style={{ color: "#AAAAAA" }}>
          Free • 3 minutes • No sign-up
        </p>
      </div>
    </div>
  );
}
