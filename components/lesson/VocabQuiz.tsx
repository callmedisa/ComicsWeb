"use client";

import { useState } from "react";
import { QuizQuestion } from "@/lib/types";

export function VocabQuiz({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (scorePct: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    if (option === question.correctMeaning) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (isLast) {
      onComplete(Math.round((correctCount / questions.length) * 100));
      return;
    }
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto max-w-lg rounded-card border border-border bg-white p-8 shadow-card">
      <span className="label-caps mb-2 block text-center">
        Word {index + 1} of {questions.length}
      </span>
      <h2 className="mb-6 text-center font-display text-2xl font-extrabold text-ink">
        {question.word}
      </h2>
      <div className="flex flex-col gap-2.5">
        {question.options.map((option) => {
          const isCorrect = option === question.correctMeaning;
          const isPicked = option === selected;
          let style = "border-border text-ink hover:border-primary";
          if (selected) {
            if (isCorrect) style = "border-green bg-wordok-bg text-wordok-text";
            else if (isPicked) style = "border-red bg-wordmiss-bg text-wordmiss-text";
            else style = "border-border text-muted opacity-60";
          }
          return (
            <button
              key={option}
              onClick={() => choose(option)}
              disabled={!!selected}
              className={`rounded-btn border-2 px-4 py-3 text-left font-body font-bold transition-colors ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {selected && (
        <button
          onClick={next}
          className="btn-3d mt-6 w-full bg-primary py-3 text-white shadow-btn-primary active:shadow-btn-primary-active"
        >
          {isLast ? "See results →" : "Next word →"}
        </button>
      )}
    </div>
  );
}
