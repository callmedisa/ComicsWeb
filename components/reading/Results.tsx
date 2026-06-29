"use client";

import Link from "next/link";

function noteFor(score: number) {
  if (score >= 90) return "Amazing reading! 🌟";
  if (score >= 70) return "Great job! 🎉";
  if (score >= 50) return "Nice try — keep practicing!";
  return "Keep going, you'll get it!";
}

export function Results({
  avgScore,
  earnedXp,
  totalLines,
  newStreak,
  onReadAgain,
  comicId,
  backHref = "/dashboard",
}: {
  avgScore: number;
  earnedXp: number;
  totalLines: number;
  newStreak: number;
  onReadAgain: () => void;
  comicId: string;
  backHref?: string;
}) {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-card border border-border bg-white p-9 text-center shadow-raised animate-pop">
        <span className="font-comic text-stroke-ink rotate-[-3deg] text-3xl text-gold tracking-wide">
          COMIC COMPLETE!
        </span>

        <div
          className="flex h-[132px] w-[132px] items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#36C77C 0 ${avgScore}%, #E3F1EC ${avgScore}% 100%)`,
          }}
        >
          <div className="flex h-[102px] w-[102px] flex-col items-center justify-center rounded-full bg-white">
            <span className="font-display text-[42px] font-extrabold leading-none text-ink">
              {avgScore}
            </span>
            <span className="label-caps">Accuracy</span>
          </div>
        </div>

        <p className="font-display text-xl font-extrabold text-ink">
          {noteFor(avgScore)}
        </p>

        <div className="flex w-full gap-3">
          <div className="flex-1 rounded-panel bg-gold/15 p-4">
            <div className="font-display text-2xl font-extrabold text-gold-text">
              +{earnedXp}
            </div>
            <div className="label-caps">XP earned</div>
          </div>
          <div className="flex-1 rounded-panel bg-blue/10 p-4">
            <div className="font-display text-2xl font-extrabold text-blue-dark">
              {totalLines}
            </div>
            <div className="label-caps text-blue-dark">Lines spoken</div>
          </div>
          <div className="flex-1 rounded-panel bg-gold/15 p-4">
            <div className="font-display text-2xl font-extrabold text-gold-text">
              🔥 {newStreak}
            </div>
            <div className="label-caps">Day streak +1</div>
          </div>
        </div>

        <div className="mt-1 flex w-full gap-3">
          <button
            onClick={onReadAgain}
            className="btn-3d flex-1 border-2 border-primary-soft bg-white py-3.5 text-primary"
          >
            ↺ Read again
          </button>
          <Link
            href={backHref}
            className="btn-3d flex-[1.3] bg-primary py-3.5 text-white shadow-btn-primary active:shadow-btn-primary-active"
          >
            Back to home →
          </Link>
        </div>

        <Link
          href={`/read/${comicId}/view`}
          className="text-sm font-bold text-primary hover:underline"
        >
          📖 View as a manga page
        </Link>
      </div>
    </div>
  );
}
