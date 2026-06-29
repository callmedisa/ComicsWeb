import { UserProfile } from "@/lib/types";

export function TopBar({
  user,
  title,
  subtitle,
}: {
  user: UserProfile;
  title?: string;
  subtitle?: string;
}) {
  const xpPct = Math.round((user.xp / user.xpGoal) * 100);

  return (
    <div className="mb-7 flex items-center justify-between">
      <div>
        <h1 className="font-display text-[28px] font-extrabold text-ink">
          {title ?? `Hi, ${user.name}! 👋`}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm font-bold text-muted">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-[13px] bg-[#FFF1DF] px-3.5 py-2.5 font-display font-bold text-gold-text">
          🔥 {user.streakDays}
        </div>
        <div className="flex items-center gap-1.5 rounded-[13px] bg-[#E5F1FF] px-3.5 py-2.5 font-display font-bold text-blue-dark">
          💎 {user.gems}
        </div>
        <div className="flex items-center gap-2.5 rounded-[13px] border border-border bg-white px-3.5 py-2.5">
          <span className="text-[13px] font-extrabold text-muted">XP</span>
          <div className="h-[11px] w-[120px] overflow-hidden rounded-pill bg-scoretrack">
            <div
              className="h-full rounded-pill bg-green"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <span className="font-display text-sm font-bold text-ink">{user.xp}</span>
        </div>
      </div>
    </div>
  );
}
