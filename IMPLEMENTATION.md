# ComicSpeak AI — Implementation guide (for Claude Code)

This is the build plan that turns the HTML prototype into a working app. It explains the **AI comic-generation pipeline**, the **speech-scoring pipeline**, the **API + data model**, and a **button-by-button checklist** so every control becomes functional.

---

## 0. Stack & services to stand up first
- **Frontend:** Next.js + React + TypeScript + TailwindCSS (recreate the prototype screens as components).
- **Backend:** NestJS (or Node/Express). REST or tRPC.
- **DB:** PostgreSQL (Prisma recommended).
- **Storage:** S3 / MinIO for generated images & audio.
- **Auth:** NextAuth or Firebase Auth.
- **AI services (run as separate workers/containers):**
  - **LLM** — Ollama (local, e.g. Llama 3) or an API. Writes the story + dialogue as JSON.
  - **Image model** — Stable Diffusion via **ComfyUI** or **Fooocus** API. Draws each panel + character art.
  - **STT** — **faster-whisper** (production) — transcribes the child's recording.
  - **Pronunciation scoring** — **SpeechBrain** or Kaldi for phoneme-level accuracy (start simpler, see §3).
  - **TTS (optional)** — for the "▶ Listen" button (Coqui TTS / Piper / cloud).

Use a **job queue** (BullMQ + Redis) for generation — image gen takes seconds to minutes, so generation is async with progress polling/streaming.

---

## 1. How AI creates a comic (the core pipeline)

```
User topic ─▶ [LLM]  ─▶ structured comic JSON (title, panels[], dialogue[])
                         │
            for each panel ▼
                       [Image model]  ─▶ panel image (S3 url)
                         │ (reuse character art for consistency)
                         ▼
              comic saved ▶ panels with image url + dialogue lines
```

### Step 1 — Story + dialogue (LLM)
Prompt the LLM to return **strict JSON**. Example contract:
```json
{
  "title": "The Sleepy Robot",
  "genre": "Comedy",
  "panels": [
    {
      "index": 1,
      "scene": "A small robot lies awake in bed in a dark bedroom, wide glowing eyes",
      "characters": ["Robo"],
      "dialogue": [{ "speaker": "Robo", "text": "I can't sleep at night." }]
    }
  ]
}
```
Constrain by `length` (Short=4 / Medium=6 / Long=8 panels), reading level (kid-friendly, short sentences — these become the speaking targets), and the selected characters.

### Step 2 — Panel images (image model)
For each panel, build a prompt from `scene` + chosen **art style** (Cartoon/Comic/Pixel) + a fixed style suffix for consistency. Feed character reference images (from Character Creation) so the same character looks consistent across panels (IP-Adapter / reference image in ComfyUI). Save each result to S3, store the URL on the panel.

### Step 3 — Assemble & stream progress
Emit progress events (`panel 2 of 6 done`) the frontend's generating-state UI already expects. When all panels are done → status `done`, show the comic, enable **"Read & speak →"**.

> The prototype's `setInterval` fake progress maps 1:1 to real job events — swap the timer for queue progress.

---

## 2. Speech practice pipeline (the money feature)

```
Tap mic ─▶ MediaRecorder captures audio ─▶ POST /api/speech/score {audio, expectedText, lineId}
                                              │
                                       [faster-whisper] ─▶ transcript
                                              │
                                    [scoring] ─▶ {score, words:[{word, ok}]}
                                              │
                                    award XP, update streak, save attempt
```

- **Capture:** `navigator.mediaDevices.getUserMedia({audio})` + `MediaRecorder` → Blob (webm/opus). The prototype already shows the live waveform via an `AnalyserNode` — keep that for UX.
- **Transcribe:** send the Blob to the backend; faster-whisper returns text (+ optional word timestamps).
- **Score:** see §3.
- **Persist:** save the attempt (lineId, score, transcript), add XP (e.g. +30 for ≥80), bump the daily streak/challenge counters.

> The prototype's `webkitSpeechRecognition` is a **browser demo only** — replace it with the MediaRecorder→Whisper round-trip.

---

## 3. Pronunciation scoring — start simple, upgrade later
**v1 (ship first):** word-match scoring already implemented in the prototype — normalize both strings, sequentially align target vs. transcript, `score = matched/total × 100`, flag missing words. Good enough to launch.

**v2 (better):** phoneme-level **Goodness of Pronunciation (GOP)** via SpeechBrain/Kaldi forced alignment — per-word/per-phoneme accuracy, not just word presence. Return the same `{score, words[]}` shape so the UI doesn't change.

---

## 4. Suggested API surface
| Method & route | Purpose |
|---|---|
| `POST /api/comics` | Start generation `{topic, style, length, characterIds}` → returns `comicId`, status `generating` |
| `GET /api/comics/:id` | Poll comic + panels + per-panel status/progress |
| `GET /api/comics` | Dashboard "My comics" list |
| `POST /api/characters` | Generate character `{type, name, traits, color}` → image + variations |
| `POST /api/characters/:id/regenerate` | New variations |
| `POST /api/speech/score` | `{audio, expectedText, lineId}` → `{score, words[]}` |
| `GET /api/me` | XP, streak, gems, level (top bar) |
| `GET /api/tts?lineId=` | (optional) audio for "▶ Listen" |

### Data model (Prisma sketch)
```
User(id, name, xp, gems, streakDays, level)
Comic(id, userId, title, genre, style, status, coverUrl, createdAt)
Panel(id, comicId, index, imageUrl, sceneText, status)
DialogueLine(id, panelId, speaker, text, order)
Character(id, userId, type, name, traits[], color, imageUrl)
SpeechAttempt(id, userId, lineId, transcript, score, createdAt)
```

---

## 5. Button-by-button checklist (make everything work)

**Landing**
- [ ] "Open the app" / "Try the demo" → route to `/dashboard` (auth gate).
- [ ] "Try the mic" → `/read/[lineId]` of a sample comic.

**Dashboard**
- [ ] Top bar → bind to `GET /api/me` (XP/streak/gems/level).
- [ ] "Resume" / a comic card → `/read/[comicId]` at the next unspoken line.
- [ ] "New comic" tile + sidebar "Create" → `/create`.
- [ ] Daily-challenge progress → derive from today's `SpeechAttempt`s with score ≥80.
- [ ] Sidebar nav → real routes; highlight by active path.

**Create**
- [ ] Topic field → controlled textarea + char counter.
- [ ] Idea chips → fill the field on click.
- [ ] Art-style & length → selectable state, sent in the request.
- [ ] "✨ Generate" → `POST /api/comics`, switch preview to generating, poll `GET /api/comics/:id`, fill panels as they complete, show "Ready!".
- [ ] "Redo" → reset; "Read & speak →" → `/read/[comicId]`.

**Character**
- [ ] Type cards / color swatches / personality chips → selectable controlled state.
- [ ] Name → input.
- [ ] "Regenerate" → `POST /characters/:id/regenerate`, shimmer the preview, swap variations.
- [ ] "Save character" → persist, return to create/dashboard.

**Reading + practice**
- [ ] Load comic; render panels from `imageUrl`; mark the current line's panel active.
- [ ] Mic button → record (waveform) → stop → `POST /api/speech/score` → show score/words/note.
- [ ] "▶ Listen" → play TTS; "🐢 Slow" → playbackRate 0.6.
- [ ] "Try again" → re-record same line. "Next line →" → advance; if last line, mark comic complete + award.
- [ ] On score → optimistic XP update, persist attempt.

---

## 6. Build order (so you always have something running)
1. Auth + DB + `GET /api/me` + dashboard wired to real data.
2. Create screen + LLM story JSON (mock images first with placeholders).
3. Reading screen + MediaRecorder + Whisper + v1 scoring + XP/streak.
4. Real image generation (ComfyUI/Fooocus) + async queue + progress streaming.
5. Character creation + reference-consistent panel art.
6. TTS, gamification polish (badges, leaderboards), v2 pronunciation scoring.
