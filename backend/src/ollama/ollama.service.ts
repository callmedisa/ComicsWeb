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

export interface VocabQuizQuestion {
  word: string;
  correctMeaning: string;
  distractors: string[];
}

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2:3b";
// Groq hosts an OpenAI-compatible chat API for free — used instead of a local
// Ollama server when deployed somewhere that can't run Ollama itself.
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const MAX_ATTEMPTS = 2;

type ChatMessage = { role: "system" | "user"; content: string };

const STORY_SHAPE_HINT =
  ' Return ONLY a JSON object of this exact shape: {"title": string, "genre": string, "panels": [{"scene": string, "characters": string[], "dialogue": [{"speaker": string, "text": string}]}]}.';

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

  private async chat(
    messages: ChatMessage[],
    schema: object,
    options: { num_predict: number; temperature: number }
  ): Promise<string> {
    return GROQ_API_KEY ? this.chatGroq(messages, options) : this.chatOllama(messages, schema, options);
  }

  private async chatOllama(
    messages: ChatMessage[],
    schema: object,
    options: { num_predict: number; temperature: number }
  ): Promise<string> {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, stream: false, format: schema, options, messages }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`Ollama request failed: ${res.status}`);
    const body = await res.json();
    return body?.message?.content ?? "";
  }

  // Groq's JSON mode only guarantees syntactically valid JSON, not a specific
  // shape (unlike Ollama's schema-constrained `format`) — callers must spell
  // out the required shape in the prompt text itself.
  private async chatGroq(
    messages: ChatMessage[],
    options: { num_predict: number; temperature: number }
  ): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        temperature: options.temperature,
        max_tokens: options.num_predict,
        messages,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`Groq request failed: ${res.status}`);
    const body = await res.json();
    return body?.choices?.[0]?.message?.content ?? "";
  }

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
    const content = await this.chat(
      [
        {
          role: "system",
          content:
            "You are a children's comic book writer for English-learning kids ages 6-10. Write simple, friendly, grammatically correct English. Each panel needs a vivid, specific visual scene description (what we SEE — setting, characters, action) of at least 15 words, never a placeholder like 'Panel 1'. Every panel's scene description must keep the topic's setting and atmosphere visibly present — never drop into a generic background that could belong to any other story, even in panels focused on side characters. Each panel has exactly one short spoken line (max 8 words) that a child can read aloud." +
            STORY_SHAPE_HINT,
        },
        {
          role: "user",
          content: `Topic: ${topic}. Art style: ${style}. Tell a complete short story across exactly ${panelsTotal} panels with a clear beginning, middle, and happy ending. Give every panel a unique, descriptive scene, but every single panel must visibly show the topic's setting ("${topic}") — not just the first and last panel.${charactersLine}`,
        },
      ],
      storySchema(panelsTotal),
      { num_predict: Math.min(2000, 300 * panelsTotal + 300), temperature: 0.8 }
    );

    try {
      return JSON.parse(content);
    } catch {
      this.logger.error(`Failed to parse LLM output as JSON: ${content}`);
      throw new Error("LLM returned malformed JSON");
    }
  }

  async generateVocabQuiz(words: string[]): Promise<VocabQuizQuestion[]> {
    const schema = {
      type: "object",
      properties: {
        questions: {
          type: "array",
          minItems: words.length,
          maxItems: words.length,
          items: {
            type: "object",
            properties: {
              word: { type: "string" },
              correctMeaning: { type: "string", minLength: 2 },
              distractors: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: { type: "string", minLength: 2 },
              },
            },
            required: ["word", "correctMeaning", "distractors"],
          },
        },
      },
      required: ["questions"],
    };

    const content = await this.chat(
      [
        {
          role: "system",
          content:
            "You write vocabulary quizzes for English-learning kids ages 6-10. For each word, give a short, simple, kid-friendly definition (a few words, no examples) as correctMeaning, plus 3 plausible but wrong definitions of similar length as distractors. Keep all four options roughly the same length so the correct one isn't obvious." +
            ' Return ONLY a JSON object of this exact shape: {"questions": [{"word": string, "correctMeaning": string, "distractors": string[]}]}.',
        },
        {
          role: "user",
          content: `Words: ${words.join(", ")}. Return one question per word, same order as given.`,
        },
      ],
      schema,
      { num_predict: 600, temperature: 0.7 }
    );

    try {
      const parsed = JSON.parse(content);
      return parsed.questions ?? [];
    } catch {
      this.logger.error(`Failed to parse quiz output as JSON: ${content}`);
      throw new Error("LLM returned malformed quiz JSON");
    }
  }
}
