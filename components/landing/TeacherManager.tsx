"use client";

import { useState } from "react";
import { createTeacherProfile, deleteTeacherProfile, updateTeacherProfile } from "@/lib/api-client";
import { TeacherProfile } from "@/lib/types";
import { Reveal } from "./Reveal";
import { TeacherCard } from "./TeacherCard";

const STRIPE_COLORS: [string, string][] = [
  ["#CDEDE6", "#A9DDD0"],
  ["#FFE3C2", "#FFCB8E"],
  ["#E3DCFF", "#C9BBFF"],
  ["#FFD7D2", "#FFB3A8"],
];
const EMOJIS = ["🎙️", "🎨", "📖", "🗣️"];

function decorFor(index: number) {
  return { emoji: EMOJIS[index % EMOJIS.length], stripeColors: STRIPE_COLORS[index % STRIPE_COLORS.length] };
}

function TeacherForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: TeacherProfile;
  onCancel: () => void;
  onSaved: (teacher: TeacherProfile) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("bio", bio);
    if (photo) formData.append("photo", photo);
    try {
      const saved = initial
        ? await updateTeacherProfile(initial.id, formData)
        : await createTeacherProfile(formData);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save teacher");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border-2 border-dashed border-border bg-white p-5 shadow-card"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
        className="mb-2 w-full rounded-panel border border-border px-3 py-2 text-sm font-bold"
      />
      <input
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="Role / title"
        required
        className="mb-2 w-full rounded-panel border border-border px-3 py-2 text-sm font-bold"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Short bio"
        required
        rows={3}
        className="mb-2 w-full rounded-panel border border-border px-3 py-2 text-sm"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        className="mb-3 w-full text-sm"
      />
      {error && <p className="mb-2 text-sm font-bold text-red-text">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-3d flex-1 bg-primary py-2 text-sm text-white shadow-btn-primary active:shadow-btn-primary-active disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-3d flex-1 border-2 border-border bg-white py-2 text-sm text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function TeacherManager({
  teachers: initialTeachers,
  isAdmin,
}: {
  teachers: TeacherProfile[];
  isAdmin: boolean;
}) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("Remove this teacher?")) return;
    await deleteTeacherProfile(id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }

  function handleSaved(saved: TeacherProfile) {
    setTeachers((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved];
    });
    setEditingId(null);
    setAdding(false);
  }

  return (
    <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
      {teachers.map((t, i) =>
        editingId === t.id ? (
          <TeacherForm
            key={t.id}
            initial={t}
            onCancel={() => setEditingId(null)}
            onSaved={handleSaved}
          />
        ) : (
          <Reveal key={t.id} direction="up" delayMs={i * 90}>
            <div className="relative">
              <TeacherCard {...decorFor(i)} name={t.name} role={t.role} bio={t.bio} photoUrl={t.photoUrl} />
              {isAdmin && (
                <div className="absolute right-3 top-3 flex gap-1.5">
                  <button
                    onClick={() => setEditingId(t.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-white text-xs"
                    aria-label="Edit teacher"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-white text-xs"
                    aria-label="Delete teacher"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          </Reveal>
        )
      )}

      {isAdmin && (adding ? (
        <TeacherForm onCancel={() => setAdding(false)} onSaved={handleSaved} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-border bg-white text-muted-2 shadow-card"
        >
          <span className="text-3xl">➕</span>
          <span className="font-body font-bold">Add teacher</span>
        </button>
      ))}
    </div>
  );
}
