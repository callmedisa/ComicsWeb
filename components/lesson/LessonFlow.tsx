"use client";

import { useState } from "react";
import Link from "next/link";
import { Comic, LessonSummary, QuizQuestion } from "@/lib/types";
import { completeLesson, fetchComic, getQuiz, startLesson } from "@/lib/api-client";
import { ReadingFlow } from "@/components/reading/ReadingFlow";
import { VocabQuiz } from "./VocabQuiz";

type Phase = "intro" | "generating" | "reading" | "quiz-loading" | "quiz" | "results" | "error";

const POLL_INTERVAL_MS = 700;

export function LessonFlow({ lesson }: { lesson: LessonSummary }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [comic, setComic] = useState<Comic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [result, setResult] = useState<{ xpAwarded: number; leveledUp: boolean; level: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function poll(comicId: string) {
    const interval = setInterval(async () => {
      try {
        const latest = await fetchComic(comicId);
        if (latest.status === "done") {
          clearInterval(interval);
          setComic(latest);
          setPhase("reading");
        } else if (latest.status === "failed") {
          clearInterval(interval);
          setError("Our artist got stuck drawing this lesson's comic.");
          setPhase("error");
        }
      } catch {
        clearInterval(interval);
        setError("Lost connection while drawing the comic.");
        setPhase("error");
      }
    }, POLL_INTERVAL_MS);
  }

  async function begin() {
    setError(null);
    setPhase("generating");
    try {
      const { comicId } = await startLesson(lesson.id);
      poll(comicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the lesson.");
      setPhase("error");
    }
  }

  async function startQuiz() {
    setPhase("quiz-loading");
    try {
      const qs = await getQuiz(lesson.id);
      setQuestions(qs);
      setPhase("quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the quiz.");
      setPhase("error");
    }
  }

  async function finishQuiz(scorePct: number) {
    try {
      const res = await completeLesson(lesson.id, scorePct);
      setResult(res);
      setPhase("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your score.");
      setPhase("error");
    }
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-lg rounded-card border border-border bg-white p-8 text-center shadow-card">
        <span className="text-4xl">📖</span>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink">{lesson.title}</h1>
        <p className="mt-2 text-muted">{lesson.topic}</p>
        <p className="mt-4 text-sm font-bold text-gold-text">+{lesson.xpReward} XP on completion</p>
        <button
          onClick={begin}
          className="btn-3d mt-6 bg-primary px-6 py-3 text-white shadow-btn-primary active:shadow-btn-primary-active"
        >
          ✨ Start lesson
        </button>
      </div>
    );
  }

  if (phase === "generating") {
    return (
      <div className="mx-auto max-w-lg rounded-card border border-border bg-white p-8 text-center shadow-card">
        <span className="text-4xl">🎨</span>
        <p className="mt-3 font-display font-bold text-ink">Drawing your comic…</p>
      </div>
    );
  }

  if (phase === "reading" && comic) {
    return <ReadingFlow comic={comic} onFinish={startQuiz} />;
  }

  if (phase === "quiz-loading") {
    return (
      <div className="mx-auto max-w-lg rounded-card border border-border bg-white p-8 text-center shadow-card">
        <span className="text-4xl">🤔</span>
        <p className="mt-3 font-display font-bold text-ink">Building your vocabulary quiz…</p>
      </div>
    );
  }

  if (phase === "quiz") {
    return <VocabQuiz questions={questions} onComplete={finishQuiz} />;
  }

  if (phase === "results" && result) {
    return (
      <div className="mx-auto max-w-lg rounded-card border border-border bg-white p-8 text-center shadow-card">
        <span className="text-4xl">🎉</span>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink">Lesson complete!</h1>
        <p className="mt-2 font-display text-lg font-bold text-gold-text">+{result.xpAwarded} XP</p>
        {result.leveledUp && (
          <p className="mt-1 font-display font-bold text-primary">
            Level up! You&rsquo;re now level {result.level} 🎉
          </p>
        )}
        <Link
          href="/courses"
          className="btn-3d mt-6 inline-flex bg-primary px-6 py-3 text-white shadow-btn-primary active:shadow-btn-primary-active"
        >
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-card border border-border bg-white p-8 text-center shadow-card">
      <span className="text-4xl">😕</span>
      <p className="mt-3 font-bold text-red-text">{error}</p>
      <button
        onClick={() => setPhase("intro")}
        className="btn-3d mt-6 border-2 border-border bg-white px-5 py-2.5 text-ink"
      >
        Try again
      </button>
    </div>
  );
}
