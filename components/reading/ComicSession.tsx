"use client";

import { useState } from "react";
import { Comic } from "@/lib/types";
import { ComicIntro } from "./ComicIntro";
import { ReadingFlow } from "./ReadingFlow";
import { Results } from "./Results";

type Phase = "intro" | "reading" | "results";

export function ComicSession({
  comic,
  streakDays,
}: {
  comic: Comic;
  streakDays: number;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [sessionKey, setSessionKey] = useState(0);
  const [results, setResults] = useState({
    avgScore: 0,
    totalLines: comic.panels.length,
    earnedXp: 0,
  });

  if (phase === "intro") {
    return (
      <ComicIntro
        title={comic.title}
        genre={comic.genre}
        totalLines={comic.panels.length}
        streakDays={streakDays}
        comicId={comic.id}
        onStart={() => setPhase("reading")}
      />
    );
  }

  if (phase === "results") {
    return (
      <Results
        avgScore={results.avgScore}
        earnedXp={results.earnedXp}
        totalLines={results.totalLines}
        newStreak={streakDays + 1}
        comicId={comic.id}
        onReadAgain={() => {
          setSessionKey((k) => k + 1);
          setPhase("reading");
        }}
      />
    );
  }

  return (
    <ReadingFlow
      key={sessionKey}
      comic={comic}
      onComplete={(r) => {
        setResults(r);
        setPhase("results");
      }}
    />
  );
}
