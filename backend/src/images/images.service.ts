import { Injectable, Logger } from "@nestjs/common";
import { ArtStyle, CharacterType } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const PUBLIC_DIR = join(process.cwd(), "public", "generated");
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL ?? "http://localhost:3001";
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 25_000;
const RETRY_DELAYS_MS = [3_000, 8_000];
const RATE_LIMIT_RETRY_DELAYS_MS = [4_000, 9_000];

const STYLE_SUFFIX: Record<ArtStyle, string> = {
  Cartoon: "cute children's cartoon illustration, bright colors, simple shapes, friendly",
  Comic: "comic book style, bold ink outlines, halftone shading, dynamic angle",
  Pixel: "16-bit pixel art style, retro video game aesthetic, vibrant palette",
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
        await mkdir(PUBLIC_DIR, { recursive: true });
        const filename = `${id}.jpg`;
        await writeFile(join(PUBLIC_DIR, filename), buffer);

        return `${BACKEND_PUBLIC_URL}/generated/${filename}`;
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
