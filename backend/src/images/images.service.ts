import { Injectable, Logger } from "@nestjs/common";
import { fal } from "@fal-ai/client";
import { ArtStyle, CharacterType } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const PUBLIC_DIR = join(process.cwd(), "public", "generated");
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL ?? "http://localhost:3001";
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 25_000;
const RETRY_DELAYS_MS = [3_000, 8_000];
const RATE_LIMIT_RETRY_DELAYS_MS = [4_000, 9_000];

// fal.ai + FLUX [schnell] is fast and stable but costs ~$0.003/image. Falls
// back to the free Pollinations endpoint when no FAL_KEY is configured so
// local dev works without an API key.
const FAL_KEY = process.env.FAL_KEY;
if (FAL_KEY) fal.config({ credentials: FAL_KEY });

const STYLE_SUFFIX: Record<ArtStyle, string> = {
  Cartoon:
    "children's cartoon panel, bright flat colors, clean outlines, friendly characters, Pixar-inspired",
  Comic:
    "comic book panel, bold ink outlines, flat colors, halftone dots, dynamic composition, Marvel/DC style",
  Pixel: "16-bit pixel art panel, retro SNES aesthetic, vibrant limited palette",
};

// Free diffusion backends frequently warp limbs/joints, especially in dynamic
// action poses. This won't eliminate the artifacts (no negative-prompt
// support on this endpoint) but nudges the model toward cleaner anatomy.
const ANATOMY_HINT = "anatomically correct, accurate proportions, clean simple body shapes, no extra limbs";

const COLOR_NAMES: Record<string, string> = {
  "#11B5A4": "teal",
  "#3D9BFF": "blue",
  "#FFC93C": "golden yellow",
  "#FF8A5B": "orange",
  "#9B7BFF": "purple",
  "#FF6363": "red",
};

export interface CharacterDescriptor {
  name: string;
  type: CharacterType;
  color: string;
}

function describeCharacter({ name, type, color }: CharacterDescriptor): string {
  const colorName = COLOR_NAMES[color] ?? color;
  return `${name} (a ${colorName} ${type.toLowerCase()})`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  async generatePanelImage(
    panelId: string,
    scene: string,
    style: ArtStyle,
    presentCharacters: CharacterDescriptor[] = []
  ): Promise<string | null> {
    const castLine = presentCharacters.length
      ? ` Featuring ${presentCharacters.map(describeCharacter).join(" and ")}, drawn consistently with their established look.`
      : "";
    const prompt = `${scene}.${castLine} ${STYLE_SUFFIX[style]}, ${ANATOMY_HINT}, no text, no words, single comic panel illustration for children`;
    return this.generateImage(panelId, prompt);
  }

  async generateCharacterImage(
    characterId: string,
    type: CharacterType,
    name: string,
    traits: string[],
    color: string
  ): Promise<string | null> {
    const colorName = COLOR_NAMES[color] ?? color;
    const traitText = traits.length ? `${traits.join(" and ").toLowerCase()} personality, ` : "";
    const prompt = `a ${type.toLowerCase()} character named ${name}, ${traitText}${colorName} color accents, full-body character portrait, plain background, ${STYLE_SUFFIX.Cartoon}, ${ANATOMY_HINT}, no text, no words`;
    return this.generateImage(characterId, prompt);
  }

  private async generateImage(id: string, prompt: string): Promise<string | null> {
    return FAL_KEY ? this.generateImageFal(id, prompt) : this.generateImagePollinations(id, prompt);
  }

  private async saveBuffer(id: string, buffer: Buffer): Promise<string> {
    await mkdir(PUBLIC_DIR, { recursive: true });
    const filename = `${id}.jpg`;
    await writeFile(join(PUBLIC_DIR, filename), buffer);
    return `${BACKEND_PUBLIC_URL}/generated/${filename}`;
  }

  private async generateImageFal(id: string, prompt: string): Promise<string | null> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const result = await fal.run("fal-ai/flux/schnell", {
          input: { prompt, image_size: "landscape_4_3", num_images: 1 },
        });
        const imageUrl: string | undefined = result.data?.images?.[0]?.url;
        if (!imageUrl) throw new Error("fal.ai returned no image");

        // fal.ai's CDN URL is itself permanent hosted storage — use it
        // directly instead of downloading + re-saving to our own disk, which
        // doesn't persist across restarts on most free hosting tiers.
        return imageUrl;
      } catch (err) {
        const message = (err as Error).message;
        if (attempt < MAX_ATTEMPTS) {
          this.logger.warn(`fal.ai attempt ${attempt} failed for ${id} (${message}), retrying...`);
          await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 8_000);
        } else {
          this.logger.warn(`fal.ai generation gave up for ${id}: ${message}`);
        }
      }
    }
    return null;
  }

  private async generateImagePollinations(id: string, prompt: string): Promise<string | null> {
    const basePrompt = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=384&nologo=true&model=flux`;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // Pollinations returns a deterministic image for an identical URL —
      // without a per-attempt random seed, a retry after a bad/failed
      // generation would just hit the exact same (possibly malformed)
      // result instead of getting a genuine new attempt.
      const seed = Math.floor(Math.random() * 1_000_000_000);
      const url = `${basePrompt}&seed=${seed}`;
      let wasRateLimited = false;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
        if (!res.ok) {
          wasRateLimited = res.status === 429;
          throw new Error(`Image API returned ${res.status}`);
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        return await this.saveBuffer(id, buffer);
      } catch (err) {
        const message = (err as Error).message;
        if (attempt < MAX_ATTEMPTS) {
          this.logger.warn(`Image attempt ${attempt} failed for ${id} (${message}), retrying...`);
          const delays = wasRateLimited ? RATE_LIMIT_RETRY_DELAYS_MS : RETRY_DELAYS_MS;
          await sleep(delays[attempt - 1] ?? 8_000);
        } else {
          this.logger.warn(`Image generation gave up for ${id}: ${message}`);
        }
      }
    }

    return null;
  }
}
