"use client";

import Link from "next/link";

export function ComicIntro({
  title,
  genre,
  totalLines,
  streakDays,
  onStart,
  comicId,
  backHref = "/dashboard",
}: {
  title: string;
  genre: string;
  totalLines: number;
  streakDays: number;
  onStart: () => void;
  comicId: string;
  backHref?: string;
}) {
  const maxXp = totalLines * 30;
  const estMinutes = Math.max(1, Math.round(totalLines * 0.5));

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg overflow-hidden rounded-card border border-border bg-white shadow-raised">
        <div className="relative flex h-[190px] items-end justify-center bg-[repeating-linear-gradient(135deg,#E5F1FF_0px,#E5F1FF_16px,#D6E8FB_16px,#D6E8FB_32px)]">
          <span className="pb-3 font-mono text-[11px] text-muted">
            comic cover · {title.toLowerCase()}
          </span>
          <span className="font-comic text-stroke-ink absolute right-[18px] top-4 rotate-[8deg] text-3xl text-gold">
            LET&apos;S GO!
          </span>
        </div>

        <div className="flex flex-col gap-4 p-7">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-ink">
                {title}
              </h1>
              <p className="text-sm font-bold text-muted-2">
                {genre} · {totalLines} panels
              </p>
            </div>
            <span className="rounded-panel bg-gold/20 px-3 py-2 font-display text-sm font-bold text-gold-text">
              🔥 {streakDays} day streak
            </span>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 rounded-panel bg-page p-3.5 text-center">
              <div className="font-display text-xl font-extrabold text-primary">
                {totalLines}
              </div>
              <div className="label-caps">Lines to speak</div>
            </div>
            <div className="flex-1 rounded-panel bg-page p-3.5 text-center">
              <div className="font-display text-xl font-extrabold text-gold-text">
                +{maxXp}
              </div>
              <div className="label-caps">XP to earn</div>
            </div>
            <div className="flex-1 rounded-panel bg-page p-3.5 text-center">
              <div className="font-display text-xl font-extrabold text-blue-dark">
                ~{estMinutes}m
              </div>
              <div className="label-caps">To finish</div>
            </div>
          </div>

          <p className="text-center text-sm font-bold text-muted-2">
            Read each character&apos;s line out loud. Get a score, fix the
            tricky words, and finish the comic to bank your XP.
          </p>

          <button
            onClick={onStart}
            className="btn-3d w-full bg-primary py-4 text-lg text-white shadow-btn-primary active:shadow-btn-primary-active"
          >
            ▶ Start reading
          </button>
          <Link
            href={`/read/${comicId}/view`}
            className="text-center text-sm font-bold text-primary hover:underline"
          >
            👀 View as a manga page
          </Link>
          <Link
            href={backHref}
            className="text-center text-sm font-bold text-muted hover:text-primary"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
