import { UserProfile } from "@/lib/types";

export function TopBar({ user, title }: { user: UserProfile; title?: string }) {
  const xpPct = Math.round((user.xp / user.xpGoal) * 100);

  return (
    <div className="mb-7 flex items-center justify-between">
      <div>
        {title ? (
          <h1 className="font-display text-[26px] font-extrabold text-ink">
            {title}
          </h1>
        ) : (
          <h1 className="font-display text-[26px] font-extrabold text-ink">
            Hi, {user.name}! 👋
          </h1>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5 font-display font-bold text-gold-text">
          🔥 {user.streakDays}
        </div>
        <div className="flex items-center gap-1.5 font-display font-bold text-blue">
          💎 {user.gems}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-32 overflow-hidden rounded-pill bg-scoretrack">
            <div
              className="h-full rounded-pill bg-green"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-muted">{user.xp} XP</span>
        </div>
      </div>
    </div>
  );
}
