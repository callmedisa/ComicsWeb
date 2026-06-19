import { Injectable, Logger } from "@nestjs/common";
import { ArtStyle, CharacterType } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const PUBLIC_DIR = join(process.cwd(), "public", "generated");
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL ?? "http://localhost:3001";
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 25_000;
const RETRY_DELAYS_MS = [3_000, 8_000];

const STYLE_SUFFIX: Record<ArtStyle, string> = {
  Cartoon: "cute children's cartoon illustration, bright colors, simple shapes, friendly",
  Comic: "comic book style, bold ink outlines, halftone shading, dynamic angle",
  Pixel: "16-bit pixel art style, retro video game aesthetic, vibrant palette",
};

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
    const prompt = `${scene}.${castLine} ${STYLE_SUFFIX[style]}, no text, no words, single comic panel illustration for children`;
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
    const prompt = `a ${type.toLowerCase()} character named ${name}, ${traitText}${colorName} color accents, full-body character portrait, plain background, ${STYLE_SUFFIX.Cartoon}, no text, no words`;
    return this.generateImage(characterId, prompt);
  }

  private async generateImage(id: string, prompt: string): Promise<string | null> {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=384&nologo=true`;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
        if (!res.ok) throw new Error(`Image API returned ${res.status}`);

        const buffer = Buffer.from(await res.arrayBuffer());
        await mkdir(PUBLIC_DIR, { recursive: true });
        const filename = `${id}.jpg`;
        await writeFile(join(PUBLIC_DIR, filename), buffer);

        return `${BACKEND_PUBLIC_URL}/generated/${filename}`;
      } catch (err) {
        const message = (err as Error).message;
        if (attempt < MAX_ATTEMPTS) {
          this.logger.warn(`Image attempt ${attempt} failed for ${id} (${message}), retrying...`);
          await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 8_000);
        } else {
          this.logger.warn(`Image generation gave up for ${id}: ${message}`);
        }
      }
    }

    return null;
  }
}
