# Handoff: ComicSpeak AI — kids' English-speaking comic platform

## Overview
ComicSpeak AI is a web platform where children learn English speaking by creating AI-generated comics, reading character dialogue out loud, and getting instant pronunciation scores with gamification (XP, streaks, badges).

The project started from a **6-screen hi-fi HTML design spec** (two landing directions, dashboard, comic creation, character creation, and the core reading/speech-practice flow), which has since been recreated and built out in the real stack below.

## Stack
Built with **Next.js + React + TypeScript + TailwindCSS** (frontend), **NestJS/Node** (backend), **PostgreSQL**, **Whisper** (`mlx_whisper`) for speech recognition, and an LLM (Ollama) + image model (fal.ai / Pollinations) for comic generation.

> Note on the microphone: production captures audio with `MediaRecorder` and sends it to the **Whisper** backend for transcription, scored word-by-word against the target line.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are specified. Recreate the UI pixel-accurately using the codebase's libraries. Image/character art is shown as **striped placeholders with monospace labels** (e.g. `comic scene · hero + robot`) — these are slots for AI-generated images, not final art.

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Primary (teal) | `#11B5A4` | Buttons, active states, accents |
| Primary shadow | `#0d8d80` | Bottom "3D" shadow on teal buttons |
| Primary soft | `#E2F5F0` | Active nav bg, pills |
| Ink | `#143230` | Text, comic panel/bubble borders, dark hero band |
| Ink shadow | `#061a18` | Bottom shadow on dark buttons |
| Muted text | `#5E807C` | Secondary text |
| Muted text 2 | `#4E6F6B` | Body paragraphs |
| Blue | `#3D9BFF` / dark `#2D7BD4` | Gems, sci-fi comic, secondary |
| Green (success) | `#36C77C` / dark `#0E8E48` | Scores, "done", XP bar fill |
| Coral | `#FF8A5B` | "In progress" tags |
| Yellow / gold | `#FFC93C` / text `#E8870E` | Streaks, badges, sound-fx stickers |
| Purple | `#9B7BFF` | Optional character color only |
| Red (recording) | `#FF6363` / text `#D6502F` | Active mic, missing-word chips |
| Page bg | `#F3FAF8` (app) / `#E7F3EF` (gallery canvas) | App background |
| Card bg | `#FFFFFF` | Cards |
| Border | `#E6F2EE` / `#EAF4F1` / `#DDEDE9` | Card & divider borders |
| Score-track | `#E3F1EC` | Unfilled ring / progress track |
| Word OK bg/text | `#E2F6EC` / `#0E8E48` | Correct word chip |
| Word miss bg/text/border | `#FDE6E0` / `#D6502F` / dashed `#F0A593` | Missing word chip |

### Typography
- **Display / headings:** `Baloo 2` (Google Fonts), weights 600–800. Friendly rounded.
- **UI / body:** `Nunito` (Google Fonts), weights 400–900.
- **Comic sound-effects:** `Bangers` (Google Fonts), with `-webkit-text-stroke:2px #143230` ink outline. Use sparingly (POW!, NICE!, ★ NEW).
- **Placeholder/mono labels:** `ui-monospace, monospace`, 10–11px, letter-spacing `.05–.12em`, color `#5E807C`.
- Scale: H1 hero 54–58px/1.03; screen title 26–28px; section title 17–19px; body 14–19px; labels 12–13px (weight 800, often uppercase + letter-spacing .06em).

### Radius, shadow, spacing
- Radius: buttons `13–16px`; cards `18–22px`; pills `999px`; comic panels `14–18px`; chips `9px`.
- Comic frames & speech bubbles: **3px solid `#143230`** border; bubble tail = a 20px square rotated 45° with right+bottom borders, offset `bottom:-12px;left:~28px`.
- Card shadow: `0 8px 22px rgba(16,80,74,.05)`; raised card `0 14px 32px rgba(16,70,66,.12)`; frame `0 22px 44px rgba(16,70,66,.17)`.
- Duolingo "3D" button: `box-shadow:0 4–5px 0 <darker>`; on `:active` translateY down by that amount and reduce shadow to `0 1px 0`.
- Layout: app shell = fixed **236px** sidebar + fluid main; screen padding `28–36px`; gaps `16–28px`.
- Score ring: 84px circle, `conic-gradient(#36C77C 0 <score>%, #E3F1EC <score>% 100%)`, with a 64px white inner circle.

---

## Screens / Views

### 1. Landing page (two directions)
**Purpose:** Market the product; entry to the app.
- **Variation A — clean:** top nav (logo, links, "Start free" CTA) → two-column hero (eyebrow pill, 54px headline with teal-colored word, paragraph, primary + ghost CTA, star rating) and a rotated comic-card visual (panel + speech bubble + "🎙️ Speak" chip + waveform + floating "85 SCORE" ring + "NICE!" sticker) → 3 feature cards (Create / Speak / Earn).
- **Variation B — bold comic strip:** white nav with dark CTA → full-width **teal halftone hero band** (`#11B5A4` + radial-dot bg, white 58px headline, gold CTA, "POW!" sticker) → 3 bordered comic panels showing the flow (1 Pick a topic / 2 AI draws it / 3 Speak the lines, with a 92 score) → stats row (30k+, 1.2M, 4.9★).

### 2. Student dashboard (kid's home)
**Purpose:** Home base — resume work, see progress.
- **Layout:** 236px sidebar (logo, nav: Home·active / My Comics / Create / Characters / Achievements, user chip pinned bottom) + main.
- Top bar: "Hi, {name}! 👋" greeting + streak `🔥 12` / gems `💎 240` / XP bar (640, 64% filled).
- Hero row: dark teal "**Continue your story**" card (cover placeholder, title, "Panel 3 of 4", ▶ Resume button, 72% progress) + "**Daily challenge**" card (3/5 segmented progress, +50 XP).
- "My comics" grid: 4 cards (Done/In-progress/Done status tags + dashed "New comic" tile).

### 3. Comic creation (topic → generate)
**Purpose:** Describe a story; AI generates the comic.
- **Layout:** step header (1 Topic active · 2 Style · 3 Characters · 4 Generate) + two columns.
- Left: big topic textarea (teal focus border, char counter), idea chips, art-style picker (Cartoon active / Comic / Pixel), length segmented (Short/**Medium**/Long), "✨ Generate my comic" CTA.
- Right "Live preview" panel — **3 states**: idle (empty hint), generating (2×3 panel grid: filled ✓ / shimmer / dashed-pending + progress bar + "Drawing panel X of 6…"), done ("✓ Ready!" + Redo / "Read & speak →").

### 4. Character creation
**Purpose:** Build a reusable character.
- Left form: type cards (🦸 Superhero / 🤖 Robot / 🦊 Animal / 🧚 Fantasy / 🏛️ Historical — selectable), name input, personality toggle chips (Brave/Funny on), color swatches (6).
- Right: bordered character preview card (placeholder art + "★ NEW" sticker, name plate with accent dot in selected color + "Lv 1"), 4 variation thumbnails, Regenerate / Save buttons.

### 5. Reading + speech practice (CORE)
**Purpose:** Read a line aloud, get scored.
- Header: back arrow, comic title, 4-segment panel progress, streak.
- Left: comic reader — two stacked panels. Panel A (ROBO: "I can't sleep at night."), Panel B = **active** (teal border + glow + "🎙️ YOUR LINE" tag, SPARKY: "Hello! How are you today?").
- Right "practice console" — **3 states**:
  - **Idle:** target sentence + big teal 🎙️ mic ("Tap & speak the line") + Listen/Slow buttons.
  - **Recording:** live waveform (16 bars driven by mic analyser), interim transcript, pulsing red mic ("Listening… tap to stop").
  - **Scored:** score ring (e.g. 85/100) + note ("Great job! 🎉") + missing-word line + word-by-word chips (green ✓ / red dashed ✕) + "We heard: …" + Try again mic + "+30 XP" + "Next line →".

---

## Interactions & Behavior
- **Navigation:** sidebar items and CTAs switch screens (`landing → dashboard → create/character/reading`). Logo returns to landing. Resume / comic cards / "Read & speak" → reading.
- **Comic generation:** click Generate → `generating` (progress 0→100 over ~3s on a timer, panels fill one by one) → `done`. Production: replace the timer with real LLM + image-generation jobs (poll or stream progress).
- **Speech practice:** tap mic → request mic, show live waveform + interim transcript → tap again or auto-stop (≈7s / on silence) → compute score → show result. Re-tap "Try again" re-records.
  - **Scoring algorithm (prototype):** normalize (lowercase, strip punctuation), sequentially match each target word against the recognized stream; `score = matched/total × 100`; unmatched target words flagged "missing". Reproduces the brief's example (missing "you" → 85). Production: use forced-alignment / phoneme-level pronunciation assessment for per-word accuracy.
- **Hover/press:** buttons lift on hover (`translateY(-1px)`/`scale(1.05)`) and press down on active; chips/cards highlight border or lift; transitions ~80–120ms.
- **Animations:** `shimmer` (generating panels), `pulseRing` (recording mic, 1.4s), `pop` (score reveal, .25s).

## State Management
- `screen`: `'landing' | 'dashboard' | 'create' | 'character' | 'reading'`.
- Create: `genState: 'idle'|'generating'|'done'`, `genPct`, `genPanel`.
- Character: `charType`, `charColor`.
- Reading: `recState: 'idle'|'recording'|'scored'`, `recognized`, `score`, `words[]{word,ok}`, `note`, `missing[]`.
- Tweakable props (demo): `studentName`, `streakDays`, `comicStickers` (toggles sound-fx stickers).
- Data to fetch in production: user (XP/streak/gems/level), comics list + panels + dialogue lines, characters, per-line scores/attempts.

## Assets
- **Fonts:** Google Fonts — Baloo 2, Nunito, Bangers.
- **Emoji** used as lightweight icons (🎙️🔥💎🏆🎯🦸🤖🦊🧚🏛️). Swap for a real icon set if preferred.
- **Imagery:** comic/character art is generated per-comic via fal.ai (or Pollinations as a free fallback) — see `backend/src/images/images.service.ts`.
