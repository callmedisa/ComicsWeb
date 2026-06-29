import Link from "next/link";
import { getComics, getMe, getTeachers } from "@/lib/api";
import { Reveal } from "@/components/landing/Reveal";
import { TeacherManager } from "@/components/landing/TeacherManager";
import { ComicMap } from "@/components/landing/ComicMap";
import { Footer } from "@/components/landing/Footer";

const starterFeatures: [string, boolean][] = [
  ["3 new comics / month", true],
  ["Basic pronunciation scoring", true],
  ["5 starter characters", true],
  ["Daily streaks & XP", true],
  ["Parent progress reports", false],
];

const proFeatures: [string, boolean][] = [
  ["Unlimited comics & stories", true],
  ["Advanced pronunciation feedback", true],
  ["All characters & art styles", true],
  ["Parent progress reports", true],
  ["Priority new lessons", true],
];

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
  const [comics, user, teachers] = await Promise.all([
    getComics().catch(() => []),
    getMe(),
    getTeachers().catch(() => []),
  ]);
  const demoComic = comics.find((c) => c.status === "done");
  const tryMicHref = demoComic ? `/read/${demoComic.id}` : "/dashboard";
  const accountHref = user?.role === "TEACHER" ? "/admin" : "/dashboard";
  const isAdmin = user?.role === "TEACHER";

  return (
    <div className="min-h-screen bg-page">
      <nav className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <span className="font-display text-lg font-extrabold text-ink">
            ComicSpeak
          </span>
        </div>
        {user ? (
          <Link
            href={accountHref}
            className="flex items-center gap-2.5 rounded-pill border border-border bg-white px-3 py-1.5 pr-4 font-body font-bold text-ink shadow-card"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display font-bold text-white">
              {user.name[0]}
            </span>
            {user.name}
          </Link>
        ) : (
          <Link
            href="/login"
            className="btn-3d bg-primary px-5 py-2.5 text-white shadow-btn-primary active:shadow-btn-primary-active"
          >
            Log in
          </Link>
        )}
      </nav>

      <section className="grid grid-cols-1 items-center gap-14 px-10 py-16 md:grid-cols-2">
        <div>
          <span className="label-caps mb-4 inline-block rounded-pill bg-primary-soft px-3 py-1.5 text-primary">
            🎙️ AI English speaking for kids
          </span>
          <h1 className="font-display text-[54px] font-extrabold leading-[1.03] text-ink">
            Learn English by making your own{" "}
            <span className="text-primary">comics.</span>
          </h1>
          <p className="mt-5 max-w-md text-[17px] text-muted-2">
            Type a story idea, watch AI draw it into a comic, then read the
            lines out loud. Kids get instant pronunciation scores and earn XP.
          </p>
          <div className="mt-7 flex items-center gap-4">
            <Link
              href="/login"
              className="btn-3d bg-primary px-6 py-3.5 text-white shadow-btn-primary active:shadow-btn-primary-active"
            >
              Try the demo →
            </Link>
            <Link
              href={tryMicHref}
              className="btn-3d border-2 border-border bg-white px-6 py-3.5 text-ink"
            >
              ▶ Try the mic
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-bold text-muted">
            ⭐⭐⭐⭐⭐ <span>4.9 · Loved by 30,000+ young readers</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md rotate-2">
          <div className="comic-panel relative p-4 shadow-frame">
            <div className="h-56 overflow-hidden rounded-panel border-[3px] border-ink bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-illustration.jpg"
                alt="Comic hero illustration"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="speech-bubble mt-5">
              <p className="font-body font-bold text-ink">
                Every hero starts with a single line of dialogue.
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

      <section className="px-10 py-16">
        <Reveal direction="up" className="mb-10 text-center">
          <span className="label-caps mb-4 inline-block rounded-pill bg-primary-soft px-3 py-1.5 text-primary">
            👋 The grown-ups behind the comics
          </span>
          <h2 className="font-display text-[34px] font-extrabold text-ink">
            Meet your teachers
          </h2>
        </Reveal>
        <TeacherManager teachers={teachers} isAdmin={isAdmin} />
      </section>

      <section className="bg-dots px-10 py-16">
        <Reveal direction="up" className="mb-10 text-center">
          <span className="label-caps mb-4 inline-block rounded-pill bg-primary-soft px-3 py-1.5 text-primary">
            💎 Simple, kid-friendly plans
          </span>
          <h2 className="font-display text-[34px] font-extrabold text-ink">
            Pick your plan
          </h2>
        </Reveal>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal direction="left">
            <div className="h-full rounded-card border border-border bg-white p-8 shadow-card">
              <div className="label-caps text-muted">Starter</div>
              <div className="mt-1 font-display text-3xl font-extrabold text-ink">
                $0{" "}
                <span className="text-base font-bold text-muted-2">
                  / forever
                </span>
              </div>
              <ul className="mt-6 flex flex-col gap-3 text-sm font-bold">
                {starterFeatures.map(([label, included]) => (
                  <li key={label} className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] ${
                        included
                          ? "bg-wordok-bg text-wordok-text"
                          : "bg-page text-muted"
                      }`}
                    >
                      {included ? "✓" : "✕"}
                    </span>
                    <span className={included ? "text-ink" : "text-muted"}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="btn-3d mt-7 w-full border-2 border-border bg-white py-3 text-ink"
              >
                Start for free
              </Link>
            </div>
          </Reveal>

          <Reveal direction="right">
            <div className="relative h-full rounded-card bg-ink p-8 shadow-frame">
              <span className="absolute -right-3 -top-3 rotate-[8deg] rounded-pill bg-gold px-3 py-1 font-comic text-sm text-ink shadow-card [text-shadow:0_1px_0_#fff]">
                BEST VALUE!
              </span>
              <div className="label-caps text-[#7FB8B1]">Hero Pro</div>
              <div className="mt-1 font-display text-3xl font-extrabold text-white">
                $7.99{" "}
                <span className="text-base font-bold text-[#A9CFCA]">
                  / month
                </span>
              </div>
              <ul className="mt-6 flex flex-col gap-3 text-sm font-bold">
                {proFeatures.map(([label]) => (
                  <li key={label} className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-green/20 text-[11px] text-green">
                      ✓
                    </span>
                    <span className="text-white">{label}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="btn-3d mt-7 w-full bg-primary py-3 text-white shadow-btn-primary active:shadow-btn-primary-active"
              >
                Go Pro →
              </Link>
              <p className="mt-3 text-center text-xs font-bold text-[#7FB8B1]">
                Cancel anytime · Family plan available
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-10 py-16">
        <Reveal direction="up" className="mb-10 text-center">
          <span className="label-caps mb-4 inline-block rounded-pill bg-primary-soft px-3 py-1.5 text-primary">
            📍 Drop by in person
          </span>
          <h2 className="font-display text-[34px] font-extrabold text-ink">
            Come say hi
          </h2>
        </Reveal>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal direction="left">
            <div className="h-full rounded-card border border-border bg-white p-8 shadow-card">
              <h3 className="font-display text-xl font-extrabold text-ink">
                Qadam School
              </h3>
              <p className="mt-3 text-sm font-bold text-muted-2">
                Бухар жырау көшесі, 19/1
                <br />
                Astana, Kazakhstan
              </p>
              <div className="mt-5 flex flex-col gap-2 text-sm font-bold text-muted-2">
                <span>🕘 Mon–Fri 8:00–17:30</span>
                <span>📞 (111) 111-1111</span>
                <span>✉️ hello@comicspeak.ai</span>
              </div>
              <Link
                href="https://go.2gis.com/Fewxu"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d mt-7 inline-flex bg-primary px-6 py-3 text-white shadow-btn-primary active:shadow-btn-primary-active"
              >
                Get directions →
              </Link>
            </div>
          </Reveal>
          <Reveal direction="right">
            <ComicMap />
          </Reveal>
        </div>
      </section>

      <Reveal direction="up">
        <Footer />
      </Reveal>
    </div>
  );
}
