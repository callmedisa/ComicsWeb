import { TopBar } from "@/components/layout/TopBar";
import { getMe } from "@/lib/api";

const badges = [
  { icon: "🔥", label: "12-day streak" },
  { icon: "🎯", label: "First perfect score" },
  { icon: "📚", label: "5 comics created" },
  { icon: "🎙️", label: "100 lines spoken" },
];

export default async function AchievementsPage() {
  const user = await getMe();

  return (
    <div>
      <TopBar user={user} title="Achievements" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {badges.map((b) => (
          <div
            key={b.label}
            className="flex flex-col items-center gap-2 rounded-card border border-border bg-white p-6 text-center shadow-card"
          >
            <span className="text-3xl">{b.icon}</span>
            <span className="text-sm font-bold text-muted-2">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
