"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Building your profile...",
  "Finding the paths that fit you",
  "Crunching the numbers...",
  "Almost there...",
];

export default function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dotIdx, setDotIdx] = useState(0);

  useEffect(() => {
    const msg = setInterval(
      () => setMsgIdx((i) => Math.min(i + 1, MESSAGES.length - 1)),
      680
    );
    const dot = setInterval(() => setDotIdx((i) => (i + 1) % 3), 400);
    return () => {
      clearInterval(msg);
      clearInterval(dot);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen gap-8 px-8 fade-in">
      {/* Wordmark */}
      <span
        className="font-bold text-[22px] tracking-tight absolute top-14"
        style={{ color: "#3B3BB5" }}
      >
        leap
      </span>

      {/* Animated bars */}
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

      {/* Message */}
      <div className="text-center space-y-1">
        <p
          key={msgIdx}
          className="fade-in text-[17px] font-bold"
          style={{ color: "#1A1A1A" }}
        >
          {MESSAGES[msgIdx]}
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="w-44 h-1 rounded-full overflow-hidden"
        style={{ background: "#E5E5E5" }}
      >
        <div
          className="h-full rounded-full transition-all duration-600"
          style={{
            background: "#3B3BB5",
            width: `${((msgIdx + 1) / MESSAGES.length) * 100}%`,
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
