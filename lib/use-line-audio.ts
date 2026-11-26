"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLineAudioUrl } from "./api-client";

type Speed = "normal" | "slow";

// Prefer the most natural-sounding voice the device has, instead of the
// browser default (often a robotic system voice). Only used as a fallback
// when the server-side neural voice is unavailable.
const PREFERRED_VOICES = [/natural/i, /google us english/i, /samantha/i, /\bava\b/i, /allison/i, /aria/i, /jenny/i];

function pickBrowserVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("en"));
  for (const pattern of PREFERRED_VOICES) {
    const match = voices.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  return voices.find((v) => v.lang === "en-US") ?? voices[0];
}

function speakWithBrowser(text: string, speed: Speed) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = speed === "slow" ? 0.7 : 0.95;
  const voice = pickBrowserVoice();
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

/**
 * Plays a dialogue line in a natural neural voice. The normal-speed clip for
 * the current line is fetched as soon as the line is shown, so "Listen"
 * usually starts instantly; the slow clip is fetched on first use.
 */
export function useLineAudio(line: { id: string; text: string } | undefined) {
  const urls = useRef(new Map<string, Promise<string | null>>());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState<Speed | null>(null);
  const [playing, setPlaying] = useState<Speed | null>(null);

  const load = useCallback((lineId: string, speed: Speed) => {
    const key = `${lineId}:${speed}`;
    let pending = urls.current.get(key);
    if (!pending) {
      pending = getLineAudioUrl(lineId, speed === "slow");
      // Don't cache failures — a later click should retry.
      pending.then((url) => url ?? urls.current.delete(key));
      urls.current.set(key, pending);
    }
    return pending;
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setPlaying(null);
  }, []);

  const lineId = line?.id;

  // Prefetch the normal-speed clip and warm the browser's audio cache.
  useEffect(() => {
    if (!lineId) return;
    load(lineId, "normal").then((url) => {
      if (url) new Audio(url).preload = "auto";
    });
  }, [lineId, load]);

  // Stop playback when switching lines or leaving the page.
  useEffect(() => stop, [lineId, stop]);

  const play = useCallback(
    async (speed: Speed) => {
      if (!line) return;
      stop();
      setLoading(speed);
      const url = await load(line.id, speed);
      setLoading(null);
      if (!url) {
        speakWithBrowser(line.text, speed);
        return;
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(null);
      setPlaying(speed);
      audio.play().catch(() => {
        setPlaying(null);
        speakWithBrowser(line.text, speed);
      });
    },
    [line, load, stop]
  );

  return { play, stop, loading, playing };
}
