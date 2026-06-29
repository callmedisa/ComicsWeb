const linkColumns = [
  { title: "Product", links: ["How it works", "Characters", "Pricing"] },
  {
    title: "For grown-ups",
    links: ["For parents", "For teachers", "Safety & privacy"],
  },
  { title: "Company", links: ["About us", "Visit the center", "Contact"] },
];

export function Footer() {
  return (
    <footer className="bg-[#0E2826] px-10 py-14 text-[#A9CFCA]">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <span className="font-display text-lg font-extrabold text-white">
              ComicSpeak
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm font-bold">
            Learn English by making your own comics — one speaking streak at
            a time.
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            {["📘", "📸", "🐦"].map((icon) => (
              <span
                key={icon}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-base"
              >
                {icon}
              </span>
            ))}
          </div>
        </div>

        {linkColumns.map((col) => (
          <div key={col.title}>
            <div className="label-caps mb-3 text-white/60">{col.title}</div>
            <ul className="flex flex-col gap-2.5 text-sm font-bold">
              {col.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs font-bold sm:flex-row">
        <span>© 2026 ComicSpeak AI · made with comics &amp; courage</span>
        <div className="flex items-center gap-5">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Cookies</span>
        </div>
      </div>
    </footer>
  );
}
