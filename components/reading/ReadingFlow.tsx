"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Comic } from "@/lib/types";
import { scoreSpeech } from "@/lib/scoring";
import { recordAttempt, regeneratePanelImage, transcribeAudio } from "@/lib/api-client";
import { ScoreRing } from "./ScoreRing";
import { Waveform } from "./Waveform";

type RecState = "idle" | "recording" | "transcribing" | "scored";

const MAX_RECORDING_MS = 7000;

export function ReadingFlow({ comic }: { comic: Comic }) {
  const [panelIndex, setPanelIndex] = useState(0);
  const [panels, setPanels] = useState(comic.panels);
  const [recState, setRecState] = useState<RecState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof scoreSpeech> | null>(
    null
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panel = panels[panelIndex];
  const line = panel?.dialogue[0];
  const isLast = panelIndex === panels.length - 1;

  async function retryPanelImage() {
    if (!panel) return;
    setRegenerating(true);
    try {
      const updated = await regeneratePanelImage(comic.id, panel.id);
      setPanels((ps) => ps.map((p) => (p.id === panel.id ? updated : p)));
    } catch {
      setError("Couldn't redraw this panel. Try again in a moment.");
    } finally {
      setRegenerating(false);
    }
  }

  function finishWith(transcript: string) {
    if (!line) return;
    const scored = scoreSpeech(line.text, transcript);
    setResult(scored);
    setRecState("scored");
    recordAttempt({ lineId: line.id, transcript: scored.recognized, score: scored.score });
  }

  async function startRecording() {
    if (!line) return;
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (autoStopRef.current) clearTimeout(autoStopRef.current);

        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        setRecState("transcribing");
        try {
          const transcript = await transcribeAudio(blob);
          finishWith(transcript);
        } catch {
          setError("Couldn't reach the speech service. Try again.");
          setRecState("idle");
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecState("recording");
      autoStopRef.current = setTimeout(() => {
        if (mediaRecorderRef.current === mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, MAX_RECORDING_MS);
    } catch {
      setError("Couldn't access the microphone.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  function tryAgain() {
    setResult(null);
    setError(null);
    setRecState("idle");
  }

  function nextLine() {
    setResult(null);
    setError(null);
    setRecState("idle");
    if (!isLast) setPanelIndex((i) => i + 1);
  }

  function listen() {
    if (!line || typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(line.text);
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  }

  function listenSlow() {
    if (!line || typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(line.text);
    utter.rate = 0.6;
    window.speechSynthesis.speak(utter);
  }

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xl text-muted">
            ←
          </Link>
          <h1 className="font-display text-xl font-extrabold text-ink">
            {comic.title}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          {panels.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-8 rounded-pill ${
                i <= panelIndex ? "bg-primary" : "bg-scoretrack"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          {panel && (
            <div
              key={panel.id}
              className="comic-panel border-primary p-4 shadow-[0_0_0_4px_#E2F5F0]"
            >
              <span className="label-caps mb-2 inline-block rounded-pill bg-red/10 px-2.5 py-1 text-red-text">
                🎙️ Your line
              </span>
              {panel.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={panel.imageUrl}
                  alt={panel.sceneLabel}
                  className="aspect-[4/3] w-full rounded-panel object-cover"
                />
              ) : (
                <div className="placeholder-art flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-panel text-center">
                  <span className="px-4 text-sm">{panel.sceneLabel}</span>
                  <button
                    onClick={retryPanelImage}
                    disabled={regenerating}
                    className="rounded-pill bg-primary px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {regenerating ? "Drawing…" : "🔁 Retry image"}
                  </button>
                </div>
              )}
              <div className="speech-bubble mt-5">
                <p className="font-body font-bold text-ink">
                  {panel.dialogue[0]?.speaker}: {panel.dialogue[0]?.text}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-card border border-border bg-white p-7 shadow-card">
          {line && (
            <>
              <span className="label-caps mb-2 block">Say this line</span>
              <p className="mb-6 font-display text-lg font-extrabold text-ink">
                &ldquo;{line.text}&rdquo;
              </p>

              {recState === "idle" && (
                <div className="flex flex-col items-center gap-5 py-6">
                  <button
                    onClick={startRecording}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl text-white shadow-btn-primary transition-transform hover:scale-105 active:shadow-btn-primary-active"
                  >
                    🎙️
                  </button>
                  <p className="text-sm font-bold text-muted">
                    Tap & speak the line
                  </p>
                  {error && <p className="text-sm font-bold text-red-text">{error}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={listen}
                      className="btn-3d border-2 border-border bg-white px-4 py-2 text-sm text-ink"
                    >
                      ▶ Listen
                    </button>
                    <button
                      onClick={listenSlow}
                      className="btn-3d border-2 border-border bg-white px-4 py-2 text-sm text-ink"
                    >
                      🐢 Slow
                    </button>
                  </div>
                </div>
              )}

              {recState === "recording" && (
                <div className="flex flex-col items-center gap-5 py-6">
                  <button
                    onClick={stopRecording}
                    className="flex h-20 w-20 animate-pulseRing items-center justify-center rounded-full bg-red text-3xl text-white"
                  >
                    🎙️
                  </button>
                  <p className="text-sm font-bold text-red-text">
                    Listening… tap to stop
                  </p>
                  <Waveform active />
                </div>
              )}

              {recState === "transcribing" && (
                <div className="flex flex-col items-center gap-5 py-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-3xl">
                    🤔
                  </div>
                  <p className="text-sm font-bold text-muted">Checking your pronunciation…</p>
                </div>
              )}

              {recState === "scored" && result && (
                <div className="flex flex-col items-center gap-4 py-2">
                  <ScoreRing score={result.score} />
                  <p className="font-display font-bold text-ink">
                    {result.note}
                  </p>
                  {result.missing.length > 0 && (
                    <p className="text-sm text-red-text">
                      Missing: {result.missing.join(", ")}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {result.words.map((w, i) => (
                      <span
                        key={i}
                        className={`rounded-chip px-2.5 py-1 text-sm font-bold ${
                          w.ok
                            ? "bg-wordok-bg text-wordok-text"
                            : "border border-dashed border-wordmiss-border bg-wordmiss-bg text-wordmiss-text"
                        }`}
                      >
                        {w.word} {w.ok ? "✓" : "✕"}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted">
                    We heard: &ldquo;{result.recognized}&rdquo;
                  </p>
                  {result.score >= 70 && (
                    <p className="font-display text-sm font-bold text-gold-text">
                      +30 XP
                    </p>
                  )}
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={tryAgain}
                      className="btn-3d border-2 border-border bg-white px-4 py-2.5 text-ink"
                    >
                      🎙️ Try again
                    </button>
                    {!isLast ? (
                      <button
                        onClick={nextLine}
                        className="btn-3d bg-primary px-4 py-2.5 text-white shadow-btn-primary active:shadow-btn-primary-active"
                      >
                        Next line →
                      </button>
                    ) : (
                      <Link
                        href="/dashboard"
                        className="btn-3d bg-primary px-4 py-2.5 text-white shadow-btn-primary active:shadow-btn-primary-active"
                      >
                        Finish 🎉
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
