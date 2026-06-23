import { TopBar } from "@/components/layout/TopBar";
import { getMe } from "@/lib/api";
import { UserProfile } from "@/lib/types";

function buildBadges(user: UserProfile) {
  return [
    {
      icon: "🔥",
      label: "12-day streak",
      earned: user.streakDays >= 12,
      progress: `${Math.min(user.streakDays, 12)}/12 days`,
    },
    {
      icon: "🎯",
      label: "First perfect score",
      earned: user.stats.perfectScores > 0,
      progress: user.stats.perfectScores > 0 ? "Unlocked" : "Score 100 on a line",
    },
    {
      icon: "📚",
      label: "5 comics created",
      earned: user.stats.comicsCreated >= 5,
      progress: `${Math.min(user.stats.comicsCreated, 5)}/5 comics`,
    },
    {
      icon: "🎙️",
      label: "100 lines spoken",
      earned: user.stats.linesSpoken >= 100,
      progress: `${Math.min(user.stats.linesSpoken, 100)}/100 lines`,
    },
  ];
}

export default async function AchievementsPage() {
  const user = (await getMe())!;
  const badges = buildBadges(user);

  return (
    <div>
      <TopBar user={user} title="Achievements" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {badges.map((b) => (
          <div
            key={b.label}
            className={`flex flex-col items-center gap-2 rounded-card border p-6 text-center shadow-card ${
              b.earned ? "border-border bg-white" : "border-border bg-white opacity-50"
            }`}
          >
            <span className="text-3xl">{b.icon}</span>
            <span className="text-sm font-bold text-muted-2">{b.label}</span>
            <span
              className={`text-xs font-bold ${b.earned ? "text-green-dark" : "text-muted"}`}
            >
              {b.earned ? "✓ Unlocked" : b.progress}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
