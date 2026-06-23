import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { getMe, getComics } from "@/lib/api";

const statusStyles: Record<string, string> = {
  done: "bg-green/10 text-green-dark",
  generating: "bg-coral/10 text-coral",
};

export default async function DashboardPage() {
  const [user, comics] = await Promise.all([getMe(), getComics()]);
  if (!user) return null;
  const continueComic = comics.find((c) => c.status === "done" && c.panels.length > 0);
  const { dailyChallenge } = user;

  return (
    <div>
      <TopBar user={user} />

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr]">
        <div className="rounded-card bg-ink p-7 text-white shadow-raised">
          <span className="label-caps text-white/60">Continue your story</span>
          <h2 className="mt-2 font-display text-2xl font-extrabold">
            {continueComic?.title ?? "No comics yet"}
          </h2>
          <p className="mt-1 text-sm text-white/70">
            {continueComic
              ? `${continueComic.panelsTotal} panels to practice`
              : "Create your first AI comic to start speaking practice"}
          </p>
          <Link
            href={continueComic ? `/read/${continueComic.id}` : "/create"}
            className="btn-3d mt-6 bg-primary px-5 py-3 text-white shadow-btn-primary active:shadow-btn-primary-active"
          >
            {continueComic ? "▶ Resume" : "✨ Create a comic"}
          </Link>
        </div>

        <div className="rounded-card border border-border bg-white p-7 shadow-card">
          <span className="label-caps">Daily challenge</span>
          <h3 className="mt-2 font-display text-lg font-extrabold text-ink">
            Speak 5 lines today
          </h3>
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: dailyChallenge.goal }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 flex-1 rounded-pill ${
                  i < dailyChallenge.done ? "bg-green" : "bg-scoretrack"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm font-bold text-muted">
            {dailyChallenge.done}/{dailyChallenge.goal} ·{" "}
            <span className="text-gold-text">+{dailyChallenge.rewardXp} XP</span>
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-ink">
          My comics
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {comics.map((comic) => (
          <Link
            key={comic.id}
            href={`/read/${comic.id}`}
            className="rounded-card border border-border bg-white p-4 shadow-card transition-transform hover:-translate-y-1"
          >
            {comic.panels[0]?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={comic.panels[0].imageUrl}
                alt={comic.title}
                className="h-28 w-full rounded-panel object-cover"
              />
            ) : (
              <div className="placeholder-art h-28 rounded-panel">
                {comic.title.toLowerCase()}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display font-bold text-ink">
                {comic.title}
              </span>
              <span
                className={`rounded-chip px-2 py-1 text-[11px] font-extrabold uppercase ${statusStyles[comic.status]}`}
              >
                {comic.status === "done" ? "Done" : "In progress"}
              </span>
            </div>
          </Link>
        ))}
        <Link
          href="/create"
          className="flex h-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-border bg-white/50 py-10 text-muted transition-colors hover:border-primary hover:text-primary"
        >
          <span className="text-2xl">＋</span>
          <span className="font-display font-bold">New comic</span>
        </Link>
      </div>
    </div>
  );
}
