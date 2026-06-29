"use client";

import Link from "next/link";
import { useState } from "react";
import { StudentSummary } from "@/lib/types";
import { resetStudentPassword } from "@/lib/api-client";
import { avatarFor } from "@/lib/avatar";

const GRID_COLS = "grid-cols-[1.9fr_1.4fr_1.3fr_0.7fr_0.8fr_0.8fr_1.3fr_0.7fr]";

export function RosterTable({ students }: { students: StudentSummary[] }) {
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ id: string; value: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(studentId: string) {
    setError(null);
    setResetFor(studentId);
    try {
      const { tempPassword } = await resetStudentPassword(studentId);
      setRevealed({ id: studentId, value: tempPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setResetFor(null);
    }
  }

  if (students.length === 0) {
    return <p className="text-muted">No students yet.</p>;
  }

  return (
    <div>
      <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
        <div
          className={`grid ${GRID_COLS} gap-3 border-b border-border-soft px-5 py-3.5`}
        >
          {["Student", "Username", "Password", "Level", "Streak", "Comics", "Avg score", ""].map(
            (h) => (
              <span key={h} className="label-caps">
                {h}
              </span>
            )
          )}
        </div>
        {students.map((s) => {
          const { emoji, bg } = avatarFor(s.id);
          const isRevealed = revealed?.id === s.id;
          return (
            <div
              key={s.id}
              className={`grid ${GRID_COLS} items-center gap-3 border-b border-border-soft px-5 py-3 last:border-0`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-lg"
                  style={{ background: bg }}
                >
                  {emoji}
                </span>
                <span className="truncate font-display font-bold text-ink">{s.name}</span>
              </div>
              <div className="font-body font-bold text-muted-2">@{s.username}</div>
              <div className="flex items-center gap-2">
                {isRevealed ? (
                  <code className="rounded-chip bg-wordok-bg px-2 py-1 font-mono text-xs font-bold text-wordok-text">
                    {revealed.value}
                  </code>
                ) : (
                  <span className="font-mono text-ink">••••••••</span>
                )}
                <button
                  onClick={() => handleReset(s.id)}
                  disabled={resetFor === s.id}
                  title="Reset & reveal a new password"
                  className="text-sm opacity-60 hover:opacity-100 disabled:cursor-not-allowed"
                >
                  {resetFor === s.id ? "…" : "🔄"}
                </button>
              </div>
              <div>
                <span className="rounded-chip bg-[#FFF1DF] px-2.5 py-1 font-display text-sm font-bold text-gold-text">
                  Lv {s.level}
                </span>
              </div>
              <div className="font-display font-bold text-ink">🔥 {s.streakDays}</div>
              <div className="font-body font-extrabold text-muted-2">{s.comicsDone}</div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-pill bg-scoretrack">
                  <div
                    className="h-full bg-green-dark"
                    style={{ width: `${s.avgScore}%` }}
                  />
                </div>
                <span className="font-display text-sm font-bold text-ink">{s.avgScore}</span>
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/admin/students/${s.id}`}
                  className="rounded-chip border border-primary-soft px-2.5 py-1.5 text-xs font-extrabold text-primary-shadow hover:bg-primary hover:text-white"
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm font-bold text-red-text">{error}</p>}
      <p className="mt-3.5 text-xs font-bold text-muted">
        🔒 Passwords are hashed and can&rsquo;t be viewed — tap 🔄 to generate a new one and
        show it once.
      </p>
    </div>
  );
}
