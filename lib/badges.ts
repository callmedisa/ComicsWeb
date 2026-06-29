export interface Badge {
  icon: string;
  label: string;
  earned: boolean;
  progress: string;
}

export function buildBadges(input: {
  streakDays: number;
  stats: { comicsCreated: number; linesSpoken: number; perfectScores: number };
}): Badge[] {
  const { streakDays, stats } = input;
  return [
    {
      icon: "🔥",
      label: "12-day streak",
      earned: streakDays >= 12,
      progress: `${Math.min(streakDays, 12)}/12 days`,
    },
    {
      icon: "🎯",
      label: "First perfect score",
      earned: stats.perfectScores > 0,
      progress: stats.perfectScores > 0 ? "Unlocked" : "Score 100 on a line",
    },
    {
      icon: "📚",
      label: "5 comics created",
      earned: stats.comicsCreated >= 5,
      progress: `${Math.min(stats.comicsCreated, 5)}/5 comics`,
    },
    {
      icon: "🎙️",
      label: "100 lines spoken",
      earned: stats.linesSpoken >= 100,
      progress: `${Math.min(stats.linesSpoken, 100)}/100 lines`,
    },
  ];
}
