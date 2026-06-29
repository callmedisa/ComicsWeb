import Link from "next/link";
import { redirect } from "next/navigation";
import { StudentDetailView } from "@/components/admin/StudentDetailView";
import { getMe, getStudentDetail } from "@/lib/api";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const user = await getMe();
  if (!user) redirect("/login");
  if (user.role !== "TEACHER") redirect("/dashboard");

  const student = await getStudentDetail(params.id);

  return (
    <div>
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-muted hover:text-primary-shadow"
      >
        ← Back to roster
      </Link>
      <StudentDetailView student={student} />
    </div>
  );
}
