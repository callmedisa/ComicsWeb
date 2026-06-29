import { redirect } from "next/navigation";
import { RosterTable } from "@/components/admin/RosterTable";
import { getAdminOverview, getMe, getStudents } from "@/lib/api";

export default async function AdminPage() {
  const user = await getMe();
  if (!user) redirect("/login");
  if (user.role !== "TEACHER") redirect("/dashboard");

  const [students, overview] = await Promise.all([getStudents(), getAdminOverview()]);

  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="font-display text-[27px] font-extrabold text-ink">Students</h1>
          <p className="text-sm font-bold text-muted">{overview.studentCount} students</p>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <StatCard label="Students" value={overview.studentCount} color="text-ink" />
        <StatCard label="Active today" value={overview.activeToday} color="text-green-dark" />
        <StatCard label="Comics this week" value={overview.comicsThisWeek} color="text-blue-dark" />
        <StatCard label="Avg accuracy" value={`${overview.classAvg}%`} color="text-gold-text" />
      </div>

      <RosterTable students={students} />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex-1 rounded-card border border-border bg-white p-[18px] shadow-card">
      <div className="text-xs font-extrabold text-muted-2">{label.toUpperCase()}</div>
      <div className={`font-display text-[30px] font-extrabold ${color}`}>{value}</div>
    </div>
  );
}
