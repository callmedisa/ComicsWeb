import { redirect } from "next/navigation";
import { CourseMap } from "@/components/courses/CourseMap";
import { getCourses, getMe } from "@/lib/api";

export default async function CoursesPage() {
  const [user, courses] = await Promise.all([getMe(), getCourses()]);
  if (!user) return null;
  if (user.role === "TEACHER") redirect("/admin");

  return (
    <div>
      <h1 className="mb-7 font-display text-2xl font-extrabold text-ink">Courses</h1>
      <CourseMap courses={courses} />
    </div>
  );
}
