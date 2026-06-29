import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { getMe } from "@/lib/api";
import { buildBadges } from "@/lib/badges";

export default async function AchievementsPage() {
  const user = await getMe();
  if (!user) redirect("/login");
  if (user.role === "TEACHER") redirect("/admin");
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
