import { notFound, redirect } from "next/navigation";
import { LessonFlow } from "@/components/lesson/LessonFlow";
import { getCourses } from "@/lib/api";

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const courses = await getCourses();
  const lesson = courses.flatMap((c) => c.lessons).find((l) => l.id === params.lessonId);
  if (!lesson) notFound();
  if (lesson.status === "locked") redirect("/courses");

  return <LessonFlow lesson={lesson} />;
}
