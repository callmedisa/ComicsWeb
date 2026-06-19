import { Injectable, Logger } from "@nestjs/common";

export interface GeneratedDialogue {
  speaker: string;
  text: string;
}

export interface GeneratedPanel {
  scene: string;
  characters: string[];
  dialogue: GeneratedDialogue[];
}

export interface GeneratedStory {
  title: string;
  genre: string;
  panels: GeneratedPanel[];
}

export interface CharacterContext {
  name: string;
  type: string;
  traits: string[];
}

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2:3b";
const MAX_ATTEMPTS = 2;

function storySchema(panelsTotal: number) {
  return {
    type: "object",
    properties: {
      title: { type: "string", minLength: 3 },
      genre: { type: "string", minLength: 3 },
      panels: {
        type: "array",
        minItems: panelsTotal,
        maxItems: panelsTotal,
        items: {
          type: "object",
          properties: {
            scene: { type: "string", minLength: 20 },
            characters: { type: "array", items: { type: "string" } },
            dialogue: {
              type: "array",
              minItems: 1,
              maxItems: 1,
              items: {
                type: "object",
                properties: {
                  speaker: { type: "string", minLength: 1 },
                  text: { type: "string", minLength: 2 },
                },
                required: ["speaker", "text"],
              },
            },
          },
          required: ["scene", "characters", "dialogue"],
        },
      },
    },
    required: ["title", "genre", "panels"],
  };
}

function isValidStory(story: GeneratedStory, panelsTotal: number): boolean {
  if (!story.title?.trim() || !story.genre?.trim()) return false;
  if (!Array.isArray(story.panels) || story.panels.length !== panelsTotal) return false;
  return story.panels.every(
    (p) =>
      p.scene?.trim().length >= 15 &&
      !/^panel\s*\d*$/i.test(p.scene.trim()) &&
      p.dialogue?.[0]?.text?.trim().length >= 2
  );
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);

  async generateStory(
    topic: string,
    style: string,
    panelsTotal: number,
    characters: CharacterContext[] = []
  ): Promise<GeneratedStory> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const story = await this.requestStory(topic, style, panelsTotal, characters);
        if (isValidStory(story, panelsTotal)) return story;
        this.logger.warn(
          `Attempt ${attempt}: story failed quality checks, ${attempt < MAX_ATTEMPTS ? "retrying" : "giving up"}`
        );
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`Attempt ${attempt} failed: ${lastError.message}`);
      }
    }

    throw lastError ?? new Error("LLM returned a low-quality story after retries");
  }

  private async requestStory(
    topic: string,
    style: string,
    panelsTotal: number,
    characters: CharacterContext[]
  ): Promise<GeneratedStory> {
    const charactersLine = characters.length
      ? ` Use these existing characters and keep them consistent — do not rename them: ${characters
          .map((c) => `${c.name} (a ${c.type.toLowerCase()}${c.traits.length ? `, ${c.traits.join(" and ").toLowerCase()}` : ""})`)
          .join("; ")}. List which of these appear in each panel's "characters" field. You may add at most one new supporting character if the story needs it.`
      : "";
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: storySchema(panelsTotal),
        options: { num_predict: Math.min(2000, 300 * panelsTotal + 300), temperature: 0.8 },
        messages: [
          {
            role: "system",
            content:
              "You are a children's comic book writer for English-learning kids ages 6-10. Write simple, friendly, grammatically correct English. Each panel needs a vivid, specific visual scene description (what we SEE — setting, characters, action) of at least 15 words, never a placeholder like 'Panel 1'. Each panel has exactly one short spoken line (max 8 words) that a child can read aloud.",
          },
          {
            role: "user",
            content: `Topic: ${topic}. Art style: ${style}. Tell a complete short story across exactly ${panelsTotal} panels with a clear beginning, middle, and happy ending. Give every panel a unique, descriptive scene.${charactersLine}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      throw new Error(`Ollama request failed: ${res.status}`);
    }

    const body = await res.json();
    const content: string = body?.message?.content ?? "";

    try {
      return JSON.parse(content);
    } catch {
      this.logger.error(`Failed to parse Ollama output as JSON: ${content}`);
      throw new Error("LLM returned malformed JSON");
    }
  }
}
