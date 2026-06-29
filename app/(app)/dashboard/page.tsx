import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { getMe, getComics } from "@/lib/api";

const statusStyles: Record<string, string> = {
  done: "bg-green text-white",
  generating: "bg-coral text-white",
};

export default async function DashboardPage() {
  const [user, comics] = await Promise.all([getMe(), getComics()]);
  if (!user) return null;
  if (user.role === "TEACHER") redirect("/admin");
  const continueComic = comics.find((c) => c.status === "done" && c.panels.length > 0);
  const { dailyChallenge } = user;

  return (
    <div>
      <TopBar user={user} subtitle="Ready to make a story today?" />

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-[1.6fr_1fr]">
        <div className="relative flex items-center gap-[22px] overflow-hidden rounded-card bg-ink p-[26px] shadow-raised">
          <div className="bg-dots-overlay pointer-events-none absolute inset-0" />
          {continueComic?.panels[0]?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={continueComic.panels[0].imageUrl}
              alt={continueComic.title}
              className="relative z-10 h-[140px] w-[140px] flex-none rounded-panel border-[3px] border-[#2C5450] object-cover"
            />
          ) : (
            <div className="relative z-10 flex h-[140px] w-[140px] flex-none items-end justify-center rounded-panel border-[3px] border-[#2C5450] bg-[repeating-linear-gradient(135deg,#1d423f_0_14px,#234c48_14px_28px)] pb-2 font-mono text-[10px] text-[#7FB8B1]">
              cover art
            </div>
          )}
          <div className="relative z-10 flex-1">
            <div className="text-xs font-extrabold tracking-[.08em] text-[#5FD3C6]">
              CONTINUE YOUR STORY
            </div>
            <h2 className="my-1.5 font-display text-2xl font-extrabold text-white">
              {continueComic?.title ?? "No comics yet"}
            </h2>
            <p className="mb-3.5 text-[13px] font-bold text-[#A9CFCA]">
              {continueComic
                ? `${continueComic.panelsTotal} panels to practice`
                : "Create your first AI comic to start speaking practice"}
            </p>
            <div className="flex items-center gap-3.5">
              <Link
                href={continueComic ? `/read/${continueComic.id}` : "/create"}
                className="btn-3d bg-primary px-[22px] py-3 text-[15px] text-white shadow-btn-primary active:shadow-btn-primary-active"
              >
                {continueComic ? "▶ Resume" : "✨ Create a comic"}
              </Link>
              {continueComic && (
                <div className="h-[9px] flex-1 overflow-hidden rounded-pill bg-white/15">
                  <div
                    className="h-full bg-green"
                    style={{ width: `${continueComic.progressPct}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-card border border-border bg-white p-[22px] shadow-card">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#FFF1DF] text-xl">
              🎯
            </span>
            <span className="font-display text-lg font-bold text-ink">Daily challenge</span>
          </div>
          <p className="mb-3.5 text-sm font-bold leading-[1.45] text-muted">
            Speak {dailyChallenge.goal} lines today to win a bonus badge.
          </p>
          <div className="mb-3.5 flex gap-1.5">
            {Array.from({ length: dailyChallenge.goal }).map((_, i) => (
              <span
                key={i}
                className={`h-[9px] flex-1 rounded-pill ${
                  i < dailyChallenge.done ? "bg-green" : "bg-scoretrack"
                }`}
              />
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between">
            <span className="font-display text-sm font-bold text-ink">
              {dailyChallenge.done} / {dailyChallenge.goal} done
            </span>
            <span className="text-[13px] font-extrabold text-gold-text">
              +{dailyChallenge.rewardXp} XP 🎁
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-ink">My comics</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {comics.map((comic) => (
          <Link
            key={comic.id}
            href={`/read/${comic.id}`}
            className="overflow-hidden rounded-[18px] border border-border bg-white shadow-card transition-transform hover:-translate-y-0.5"
          >
            <div className="relative h-[108px]">
              {comic.panels[0]?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={comic.panels[0].imageUrl}
                  alt={comic.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="placeholder-art h-full">{comic.title.toLowerCase()}</div>
              )}
              <span
                className={`absolute left-2.5 top-2.5 rounded-[7px] px-2 py-1 text-[10px] font-extrabold uppercase ${statusStyles[comic.status]}`}
              >
                {comic.status === "done" ? "Done" : "In progress"}
              </span>
            </div>
            <div className="p-[13px]">
              <div className="font-display text-[15px] font-bold text-ink">{comic.title}</div>
              <div className="text-xs font-bold text-muted">
                {comic.genre ? `${comic.genre} · ` : ""}
                {comic.panelsTotal} panels
              </div>
            </div>
          </Link>
        ))}
        <Link
          href="/create"
          className="flex h-full flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-border bg-page/50 py-10 text-primary transition-colors hover:bg-primary-soft"
        >
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-primary text-2xl text-white shadow-btn-primary">
            +
          </span>
          <span className="font-display font-bold">New comic</span>
        </Link>
      </div>
    </div>
  );
}
