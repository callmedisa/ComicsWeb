import Link from "next/link";
import { getComics } from "@/lib/api";

const features = [
  {
    icon: "✨",
    title: "Create",
    body: "Describe any story idea and watch an AI artist turn it into a comic in seconds.",
  },
  {
    icon: "🎙️",
    title: "Speak",
    body: "Read each character's lines out loud and get instant pronunciation feedback.",
  },
  {
    icon: "🏆",
    title: "Earn",
    body: "Collect XP, gems and badges as your speaking streak grows day after day.",
  },
];

export default async function LandingPage() {
  const comics = await getComics().catch(() => []);
  const demoComic = comics.find((c) => c.status === "done");
  const tryMicHref = demoComic ? `/read/${demoComic.id}` : "/dashboard";

  return (
    <div className="min-h-screen bg-page">
      <nav className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <span className="font-display text-lg font-extrabold text-ink">
            ComicSpeak
          </span>
        </div>
        <div className="hidden items-center gap-8 font-body font-bold text-muted-2 md:flex">
          <span>How it works</span>
          <span>Comics</span>
          <span>Pricing</span>
        </div>
        <Link
          href="/dashboard"
          className="btn-3d bg-primary px-5 py-2.5 text-white shadow-btn-primary active:shadow-btn-primary-active"
        >
          Start free
        </Link>
      </nav>

      <section className="grid grid-cols-1 items-center gap-14 px-10 py-16 md:grid-cols-2">
        <div>
          <span className="label-caps mb-4 inline-block rounded-pill bg-primary-soft px-3 py-1.5 text-primary">
            🎉 Free for kids learning English
          </span>
          <h1 className="font-display text-[54px] font-extrabold leading-[1.03] text-ink">
            Speak the story you{" "}
            <span className="text-primary">just created</span>
          </h1>
          <p className="mt-5 max-w-md text-[17px] text-muted-2">
            ComicSpeak AI turns your child&apos;s ideas into illustrated comics,
            then has them read every line out loud — with instant pronunciation
            scores and rewards.
          </p>
          <div className="mt-7 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="btn-3d bg-primary px-6 py-3.5 text-white shadow-btn-primary active:shadow-btn-primary-active"
            >
              Open the app
            </Link>
            <Link
              href={tryMicHref}
              className="btn-3d border-2 border-border bg-white px-6 py-3.5 text-ink"
            >
              Try the mic 🎙️
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-bold text-muted">
            ⭐⭐⭐⭐⭐ <span>4.9 from 30k+ families</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm rotate-2">
          <div className="comic-panel relative p-4 shadow-frame">
            <div className="placeholder-art h-44 rounded-panel">
              comic scene · hero + robot
            </div>
            <div className="speech-bubble mt-5">
              <p className="font-body font-bold text-ink">
                Hello! How are you today?
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="label-caps rounded-pill bg-red/10 px-3 py-1.5 text-red-text">
                🎙️ Speak
              </span>
              <div className="flex h-6 flex-1 items-end gap-0.5">
                {[6, 14, 9, 18, 11, 16, 8].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-primary"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -right-6 -top-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white shadow-raised">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-sm font-display font-extrabold text-green-dark"
              style={{
                background:
                  "conic-gradient(#36C77C 0 85%, #E3F1EC 85% 100%)",
              }}
            >
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white">
                85
              </span>
            </div>
          </div>
          <div className="absolute -bottom-4 left-6 rounded-pill bg-gold px-3 py-1 font-comic text-sm text-ink [text-shadow:0_1px_0_#fff]">
            NICE!
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 px-10 py-12 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-card border border-border bg-white p-7 shadow-card"
          >
            <div className="mb-4 text-3xl">{f.icon}</div>
            <h3 className="font-display text-lg font-extrabold text-ink">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-muted-2">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
