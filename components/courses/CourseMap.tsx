import Link from "next/link";
import { CourseSummary } from "@/lib/types";

const statusIcon: Record<string, string> = { completed: "✓", available: "▶", locked: "🔒" };

export function CourseMap({ courses }: { courses: CourseSummary[] }) {
  return (
    <div className="mx-auto max-w-2xl">
      {courses.map((course) => (
        <div key={course.id} className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-pill bg-primary-soft px-2.5 py-1 text-xs font-extrabold uppercase text-primary">
              {course.level}
            </span>
            <h2 className="font-display text-xl font-extrabold text-ink">{course.title}</h2>
          </div>

          <div className="flex flex-col gap-3">
            {course.lessons.map((lesson) => {
              const locked = lesson.status === "locked";
              const completed = lesson.status === "completed";

              const card = (
                <div
                  className={`flex items-center gap-4 rounded-card border p-4 shadow-card transition-transform ${
                    locked ? "border-border bg-page opacity-60" : "border-border bg-white hover:-translate-y-0.5"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display font-bold ${
                      completed ? "bg-green text-white" : locked ? "bg-scoretrack text-muted" : "bg-primary text-white"
                    }`}
                  >
                    {statusIcon[lesson.status]}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-ink">{lesson.title}</p>
                    <p className="text-xs text-muted">
                      {completed ? `Score: ${lesson.score}%` : `+${lesson.xpReward} XP`}
                    </p>
                  </div>
                </div>
              );

              return locked ? (
                <div key={lesson.id}>{card}</div>
              ) : (
                <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                  {card}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
