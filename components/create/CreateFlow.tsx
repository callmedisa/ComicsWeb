"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArtStyle, Character, Comic, ComicLength } from "@/lib/types";
import { ideaChips } from "@/lib/mock-data";
import { createComic, fetchComic, regeneratePanelImage } from "@/lib/api-client";

const styles: ArtStyle[] = ["Cartoon", "Comic", "Pixel"];
const lengths: { label: ComicLength; panels: number }[] = [
  { label: "Short", panels: 4 },
  { label: "Medium", panels: 6 },
  { label: "Long", panels: 8 },
];

const POLL_INTERVAL_MS = 700;

export function CreateFlow({ characters }: { characters: Character[] }) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<ArtStyle>("Cartoon");
  const [length, setLength] = useState<ComicLength>("Medium");
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [comic, setComic] = useState<Comic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingPanelIds, setRegeneratingPanelIds] = useState<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPanels = lengths.find((l) => l.label === length)!.panels;

  // Topic/style/length/characters all live on one screen, so "steps" aren't
  // gated pages — they just mark progress: 1 (Topic) is current until you've
  // typed something, then 2/3 (Style/Characters) read as done since both
  // already have a valid value (style defaults, characters are optional),
  // and 4 (Generate) is current while ready/generating, done once finished.
  const currentStep = !topic.trim() ? 1 : comic?.status === "done" ? 4 : 4;
  const stepDone = (n: number) => n < currentStep || (n === 4 && comic?.status === "done");

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    []
  );

  function toggleCharacter(id: string) {
    setCharacterIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  }

  async function startGenerate() {
    if (!topic.trim()) return;
    setError(null);
    try {
      const created = await createComic({ topic, style, length, characterIds });
      setComic(created);
      pollRef.current = setInterval(async () => {
        try {
          const latest = await fetchComic(created.id);
          setComic(latest);
          if (latest.status !== "generating" && pollRef.current) {
            clearInterval(pollRef.current);
          }
        } catch {
          if (pollRef.current) clearInterval(pollRef.current);
          setError("Lost connection while drawing your comic.");
        }
      }, POLL_INTERVAL_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start generation.");
    }
  }

  function redo() {
    if (pollRef.current) clearInterval(pollRef.current);
    setComic(null);
    setError(null);
  }

  async function retryPanelImage(panelId: string) {
    if (!comic) return;
    setRegeneratingPanelIds((ids) => new Set(ids).add(panelId));
    try {
      const updated = await regeneratePanelImage(comic.id, panelId);
      setComic((c) =>
        c ? { ...c, panels: c.panels.map((p) => (p.id === panelId ? updated : p)) } : c
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't redraw that panel.");
    } finally {
      setRegeneratingPanelIds((ids) => {
        const next = new Set(ids);
        next.delete(panelId);
        return next;
      });
    }
  }

  return (
    <div>
      <div className="mb-7 flex items-center gap-3">
        {[
          { n: 1, label: "Topic" },
          { n: 2, label: "Style" },
          { n: 3, label: "Characters" },
          { n: 4, label: "Generate" },
        ].map((step) => {
          const done = stepDone(step.n);
          const active = !done && step.n === currentStep;
          return (
            <div key={step.n} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-bold ${
                  done
                    ? "bg-green text-white"
                    : active
                      ? "bg-primary text-white"
                      : "bg-scoretrack text-muted"
                }`}
              >
                {done ? "✓" : step.n}
              </div>
              <span
                className={`font-body font-bold ${
                  done || active ? "text-ink" : "text-muted"
                }`}
              >
                {step.label}
              </span>
              {step.n < 4 && <span className="mx-1 h-px w-8 bg-border" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        <div className="rounded-card border border-border bg-white p-7 shadow-card">
          <label className="label-caps mb-2 block">What's your story about?</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value.slice(0, 240))}
            placeholder="A robot who is afraid of the dark…"
            rows={4}
            className="w-full resize-none rounded-panel border-2 border-border p-3 font-body text-ink outline-none focus:border-primary"
          />
          <div className="mb-5 mt-1 text-right text-xs text-muted">
            {topic.length}/240
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {ideaChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setTopic(chip)}
                className="rounded-pill border border-border bg-page px-3 py-1.5 text-xs font-bold text-muted-2 hover:border-primary hover:text-primary"
              >
                {chip}
              </button>
            ))}
          </div>

          <label className="label-caps mb-2 block">Art style</label>
          <div className="mb-5 flex gap-2">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`flex-1 rounded-btn border-2 py-2.5 font-display font-bold ${
                  style === s
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-muted-2"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {characters.length > 0 && (
            <>
              <label className="label-caps mb-2 block">Characters (optional)</label>
              <div className="mb-7 flex flex-wrap gap-2">
                {characters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleCharacter(c.id)}
                    className={`flex items-center gap-2 rounded-pill border px-3 py-1.5 text-sm font-bold ${
                      characterIds.includes(c.id)
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-2"
                    }`}
                  >
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: c.color }}
                      />
                    )}
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <label className="label-caps mb-2 block">Length</label>
          <div className="mb-7 flex gap-1 rounded-pill bg-page p-1">
            {lengths.map((l) => (
              <button
                key={l.label}
                onClick={() => setLength(l.label)}
                className={`flex-1 rounded-pill py-2 text-sm font-display font-bold ${
                  length === l.label
                    ? "bg-white text-ink shadow-card"
                    : "text-muted"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={startGenerate}
            disabled={!topic.trim() || comic?.status === "generating"}
            className="btn-3d w-full bg-primary py-3.5 text-white shadow-btn-primary active:shadow-btn-primary-active disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✨ Generate my comic
          </button>
          {error && <p className="mt-3 text-sm font-bold text-red-text">{error}</p>}
        </div>

        <div className="rounded-card border border-border bg-white p-7 shadow-card">
          <label className="label-caps mb-4 block">Live preview</label>

          {!comic && (
            <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-panel border-2 border-dashed border-border text-center text-muted">
              <span className="text-3xl">🎨</span>
              <p className="text-sm">
                Write a topic and tap Generate to see your comic come to life
              </p>
            </div>
          )}

          {comic?.status === "generating" && (
            <div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: totalPanels }).map((_, i) => {
                  const panel = comic.panels.find((p) => p.index === i + 1);
                  const isDone = !!panel?.imageUrl;
                  return (
                    <div
                      key={i}
                      className={`flex h-24 items-center justify-center rounded-panel border-2 text-xs ${
                        isDone
                          ? "border-primary bg-primary-soft text-primary"
                          : "animate-shimmer border-border bg-[linear-gradient(90deg,#eaf4f1_0%,#fff_50%,#eaf4f1_100%)] bg-[length:400px_100%] text-muted"
                      }`}
                    >
                      {isDone ? "✓" : i + 1}
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-pill bg-scoretrack">
                <div
                  className="h-full rounded-pill bg-primary transition-all"
                  style={{ width: `${comic.progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-center text-sm font-bold text-muted">
                Drawing {totalPanels - comic.panels.filter((p) => p.imageUrl).length} of {totalPanels} panels…
              </p>
            </div>
          )}

          {comic?.status === "failed" && (
            <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
              <span className="text-3xl">😕</span>
              <p className="text-sm font-bold text-red-text">
                Our artist got stuck. Let's try again.
              </p>
              <button
                onClick={redo}
                className="btn-3d border-2 border-border bg-white px-5 py-2.5 text-ink"
              >
                Redo
              </button>
            </div>
          )}

          {comic?.status === "done" && (
            <div>
              <div className="grid grid-cols-2 gap-3">
                {comic.panels.map((panel) =>
                  panel.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={panel.id}
                      src={panel.imageUrl}
                      alt={panel.sceneLabel}
                      className="h-24 w-full rounded-panel border-2 border-primary object-cover"
                    />
                  ) : (
                    <div
                      key={panel.id}
                      className="placeholder-art flex h-24 flex-col items-center justify-center gap-1.5 rounded-panel border-2 border-primary"
                    >
                      <span className="text-xs">panel {panel.index}</span>
                      <button
                        onClick={() => retryPanelImage(panel.id)}
                        disabled={regeneratingPanelIds.has(panel.id)}
                        className="rounded-pill bg-primary px-2.5 py-1 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {regeneratingPanelIds.has(panel.id) ? "Drawing…" : "🔁 Retry"}
                      </button>
                    </div>
                  )
                )}
              </div>
              <p className="mt-4 text-center font-display font-bold text-green-dark">
                ✓ Ready!
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={redo}
                  className="btn-3d flex-1 border-2 border-border bg-white py-3 text-ink"
                >
                  Redo
                </button>
                <button
                  onClick={() => router.push(`/read/${comic.id}`)}
                  className="btn-3d flex-1 bg-primary py-3 text-white shadow-btn-primary active:shadow-btn-primary-active"
                >
                  Read & speak →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
