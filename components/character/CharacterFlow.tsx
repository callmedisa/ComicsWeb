"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CharacterType } from "@/lib/types";
import { previewCharacter, saveCharacter } from "@/lib/api-client";

const types: { type: CharacterType; icon: string }[] = [
  { type: "Superhero", icon: "🦸" },
  { type: "Robot", icon: "🤖" },
  { type: "Animal", icon: "🦊" },
  { type: "Fantasy", icon: "🧚" },
  { type: "Historical", icon: "🏛️" },
];

const traitOptions = ["Brave", "Funny", "Curious", "Kind", "Clever"];
const colors = ["#11B5A4", "#3D9BFF", "#FFC93C", "#FF8A5B", "#9B7BFF", "#FF6363"];

export function CharacterFlow() {
  const router = useRouter();
  const [type, setType] = useState<CharacterType>("Superhero");
  const [name, setName] = useState("");
  const [traits, setTraits] = useState<string[]>(["Brave", "Funny"]);
  const [color, setColor] = useState(colors[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTrait(trait: string) {
    setTraits((t) =>
      t.includes(trait) ? t.filter((x) => x !== trait) : [...t, trait]
    );
  }

  async function regenerate() {
    if (!name.trim()) {
      setError("Give your character a name first.");
      return;
    }
    setError(null);
    setRegenerating(true);
    try {
      const { imageUrl: url } = await previewCharacter({ type, name: name.trim(), traits, color });
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't draw your character.");
    } finally {
      setRegenerating(false);
    }
  }

  async function save() {
    if (!name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await saveCharacter({ type, name: name.trim(), traits, color, imageUrl });
      router.push("/create");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your character.");
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
      <div className="rounded-card border border-border bg-white p-7 shadow-card">
        <label className="label-caps mb-2 block">Character type</label>
        <div className="mb-6 grid grid-cols-3 gap-2">
          {types.map((t) => (
            <button
              key={t.type}
              onClick={() => setType(t.type)}
              className={`flex flex-col items-center gap-1 rounded-btn border-2 py-3 ${
                type === t.type
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-2"
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs font-bold">{t.type}</span>
            </button>
          ))}
        </div>

        <label className="label-caps mb-2 block">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Give your character a name"
          className="mb-6 w-full rounded-panel border-2 border-border p-3 font-body text-ink outline-none focus:border-primary"
        />

        <label className="label-caps mb-2 block">Personality</label>
        <div className="mb-6 flex flex-wrap gap-2">
          {traitOptions.map((trait) => (
            <button
              key={trait}
              onClick={() => toggleTrait(trait)}
              className={`rounded-pill border px-3 py-1.5 text-sm font-bold ${
                traits.includes(trait)
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-2"
              }`}
            >
              {trait}
            </button>
          ))}
        </div>

        <label className="label-caps mb-2 block">Color</label>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-9 w-9 rounded-full border-2"
              style={{
                background: c,
                borderColor: color === c ? "#143230" : "transparent",
              }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div className="rounded-card border border-border bg-white p-7 shadow-card">
        <div className="comic-panel relative p-4">
          {imageUrl && !regenerating ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name || "character preview"}
              className="aspect-[4/3] w-full rounded-panel object-cover"
            />
          ) : (
            <div
              className={`placeholder-art aspect-[4/3] rounded-panel ${regenerating ? "animate-shimmer bg-[linear-gradient(90deg,#eaf4f1_0%,#fff_50%,#eaf4f1_100%)] bg-[length:400px_100%]" : ""}`}
            >
              {regenerating ? "drawing…" : `${type.toLowerCase()} character art`}
            </div>
          )}
          <div className="absolute -right-3 -top-3 rounded-pill bg-gold px-3 py-1 font-comic text-xs text-ink">
            ★ NEW
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: color }}
            />
            <span className="font-display font-bold text-ink">
              {name || "Unnamed"}
            </span>
            <span className="ml-auto rounded-chip bg-page px-2 py-1 text-xs font-bold text-muted">
              Lv 1
            </span>
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-bold text-red-text">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            onClick={regenerate}
            disabled={regenerating || saving}
            className="btn-3d flex-1 border-2 border-border bg-white py-3 text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            🔁 {imageUrl ? "Regenerate" : "Draw character"}
          </button>
          <button
            onClick={save}
            disabled={!name.trim() || saving || regenerating}
            className="btn-3d flex-1 bg-primary py-3 text-white shadow-btn-primary active:shadow-btn-primary-active disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save character"}
          </button>
        </div>
      </div>
    </div>
  );
}
