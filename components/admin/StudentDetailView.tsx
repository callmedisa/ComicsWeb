"use client";

import { useState } from "react";
import { StudentDetail } from "@/lib/types";
import { resetStudentPassword } from "@/lib/api-client";
import { avatarFor } from "@/lib/avatar";
import { buildBadges } from "@/lib/badges";

function relativeDate(iso: string | null): string {
  if (!iso) return "never";
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}

export function StudentDetailView({ student }: { student: StudentDetail }) {
  const { emoji, bg } = avatarFor(student.id);
  const [resetting, setResetting] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const badges = buildBadges(student);

  async function handleReset() {
    setError(null);
    setResetting(true);
    try {
      const { tempPassword } = await resetStudentPassword(student.id);
      setRevealed(tempPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <span
          className="flex h-16 w-16 flex-none items-center justify-center rounded-full text-[30px]"
          style={{ background: bg }}
        >
          {emoji}
        </span>
        <div className="flex-1">
          <div className="font-display text-2xl font-extrabold text-ink">{student.name}</div>
          <div className="text-sm font-bold text-muted">
            @{student.username} · Level {student.level} · Last active {relativeDate(student.lastActiveDate)}
          </div>
        </div>
        <div className="flex gap-3">
          <StatChip bg="#FFF1DF" color="text-gold-text" labelColor="text-[#B26412]" value={`🔥 ${student.streakDays}`} label="Day streak" />
          <StatChip bg="#E2F6EC" color="text-green-dark" labelColor="text-green-dark" value={`${student.avgScore}%`} label="Avg accuracy" />
          <StatChip bg="#E5F1FF" color="text-blue-dark" labelColor="text-blue-dark" value={student.xp} label="Total XP" />
        </div>
      </div>

      <div className="flex items-start gap-5">
        <div className="flex-[1.5] rounded-card border border-border bg-white p-[22px] shadow-card">
          <div className="mb-4 font-display text-lg font-bold text-ink">Recent activity</div>
          <div className="flex flex-col">
            {student.activity.length === 0 && (
              <p className="text-sm text-muted">No activity yet.</p>
            )}
            {student.activity.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 border-b border-border-soft py-3 last:border-0"
              >
                <span
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] text-lg"
                  style={{ background: a.type === "comic_created" ? "#E5F1FF" : "#E2F6EC" }}
                >
                  {a.type === "comic_created" ? "📚" : "🎙️"}
                </span>
                <div className="flex-1">
                  <div className="font-body text-sm font-extrabold text-ink">{a.title}</div>
                  <div className="text-xs font-bold text-muted">{relativeDate(a.when)}</div>
                </div>
                <div className="font-display text-[15px] font-bold text-ink">{a.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-[18px]">
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <div className="mb-3.5 font-display text-[17px] font-bold text-ink">Login details</div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs font-extrabold text-muted">USERNAME</span>
              <span className="font-mono text-sm font-semibold text-ink">@{student.username}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border-soft py-2.5">
              <span className="text-xs font-extrabold text-muted">PASSWORD</span>
              {revealed ? (
                <code className="rounded-chip bg-wordok-bg px-2 py-1 font-mono text-sm font-bold text-wordok-text">
                  {revealed}
                </code>
              ) : (
                <span className="font-mono text-sm font-semibold text-ink">••••••••</span>
              )}
            </div>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="mt-3 w-full rounded-[12px] border-2 border-primary-soft py-[11px] text-center text-sm font-extrabold text-primary-shadow hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetting ? "Resetting…" : "🔄 Reset password"}
            </button>
            {error && <p className="mt-2 text-xs font-bold text-red-text">{error}</p>}
          </div>

          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <div className="mb-3.5 font-display text-[17px] font-bold text-ink">Achievements</div>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => (
                <div
                  key={b.label}
                  className={`flex flex-col items-center rounded-panel border border-border-soft py-3 ${
                    b.earned ? "" : "opacity-40"
                  }`}
                >
                  <span className="text-[26px]">{b.icon}</span>
                  <span className="mt-1 text-center text-[10px] font-extrabold text-muted-2">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({
  bg,
  color,
  labelColor,
  value,
  label,
}: {
  bg: string;
  color: string;
  labelColor: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-[14px] px-[18px] py-3 text-center" style={{ background: bg }}>
      <div className={`font-display text-[22px] font-extrabold ${color}`}>{value}</div>
      <div className={`text-[10px] font-extrabold ${labelColor}`}>{label.toUpperCase()}</div>
    </div>
  );
}
