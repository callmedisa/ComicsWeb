"use client";

import { useEffect, useState } from "react";

export function Waveform({ active }: { active: boolean }) {
  const [bars, setBars] = useState<number[]>(Array(16).fill(6));

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setBars(Array.from({ length: 16 }, () => 4 + Math.round(Math.random() * 28)));
    }, 120);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="flex h-9 items-end gap-1">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full transition-all ${active ? "bg-red" : "bg-border"}`}
          style={{ height: `${active ? h : 6}px` }}
        />
      ))}
    </div>
  );
}
