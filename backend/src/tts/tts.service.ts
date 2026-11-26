import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { fal } from "@fal-ai/client";
import { createHash } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

// Neural text-to-speech for the "Listen" / "Slow" buttons, replacing the
// browser's robotic built-in voice. Runs on fal.ai (same FAL_KEY as images).
//
// TTS_PROVIDER picks the model, TTS_VOICE the voice:
//   elevenlabs — most human-sounding, ~$0.05 / 1000 chars
//                voices: Rachel, Sarah, Aria, Charlotte, Lily, Jessica, Charlie, Will, …
//   kokoro     — very natural for the price, ~$0.02 / 1000 chars
//                voices: af_heart, af_bella, af_nicole, af_sky, am_michael, am_puck, …
// Clips are cached in the SpeechAudio table, so each distinct line is only
// ever paid for once per voice/speed.
type Provider = "elevenlabs" | "kokoro";

const PROVIDERS: Record<Provider, { model: string; defaultVoice: string; input: (text: string, voice: string, speed: number) => object }> = {
  elevenlabs: {
    model: "fal-ai/elevenlabs/tts/turbo-v2.5",
    defaultVoice: "Rachel",
    input: (text, voice, speed) => ({ text, voice, speed, language_code: "en" }),
  },
  kokoro: {
    model: "fal-ai/kokoro/american-english",
    defaultVoice: "af_heart",
    input: (text, voice, speed) => ({ prompt: text, voice, speed }),
  },
};

const FAL_KEY = process.env.FAL_KEY;
const PROVIDER: Provider = process.env.TTS_PROVIDER === "kokoro" ? "kokoro" : "elevenlabs";
const VOICE = process.env.TTS_VOICE || PROVIDERS[PROVIDER].defaultVoice;
// ElevenLabs' slowest supported speed is 0.7. Natively slowed speech keeps
// clear word boundaries, which is better for learners than time-stretching.
const SLOW_SPEED = 0.7;
const MAX_TEXT_LENGTH = 300;
const REQUEST_TIMEOUT_MS = 20_000;

if (FAL_KEY) fal.config({ credentials: FAL_KEY });

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  // Dedupe concurrent requests for the same clip (e.g. prefetch + click).
  private readonly inFlight = new Map<string, Promise<string>>();

  constructor(private prisma: PrismaService) {}

  get enabled(): boolean {
    return !!FAL_KEY;
  }

  async getAudioUrl(text: string, slow: boolean): Promise<string> {
    if (!FAL_KEY) throw new ServiceUnavailableException("Text-to-speech is not configured");
    const clean = text.trim().slice(0, MAX_TEXT_LENGTH);
    const speed = slow ? SLOW_SPEED : 1;
    const { model, input } = PROVIDERS[PROVIDER];
    const key = createHash("sha256").update(`${model}|${VOICE}|${speed}|${clean}`).digest("hex");

    const cached = await this.prisma.speechAudio.findUnique({ where: { key } });
    if (cached) return cached.url;

    const pending = this.inFlight.get(key);
    if (pending) return pending;

    const job = (async () => {
      try {
        const result = await Promise.race([
          fal.run(model, { input: input(clean, VOICE, speed) }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timed out")), REQUEST_TIMEOUT_MS)),
        ]);
        const url: string | undefined = (result as any).data?.audio?.url;
        if (!url) throw new Error("no audio returned");
        await this.prisma.speechAudio.upsert({ where: { key }, update: { url }, create: { key, url } });
        return url;
      } catch (err) {
        this.logger.warn(`TTS failed (${model}, ${VOICE}): ${(err as Error).message}`);
        throw new ServiceUnavailableException("Couldn't generate audio right now");
      } finally {
        this.inFlight.delete(key);
      }
    })();
    this.inFlight.set(key, job);
    return job;
  }
}
