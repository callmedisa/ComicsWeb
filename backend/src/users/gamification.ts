function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isPreviousUtcDay(previous: Date, current: Date): boolean {
  const nextDay = new Date(previous);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return isSameUtcDay(nextDay, current);
}

export interface DailyProgressInput {
  lastActiveDate: Date | null;
  streakDays: number;
  dailyChallengeDone: number;
  dailyChallengeGoal: number;
}

export interface DailyProgressResult {
  streakDays: number;
  dailyChallengeDone: number;
  lastActiveDate: Date;
  challengeJustCompleted: boolean;
}

/**
 * Called once per successful speech attempt. Streak/daily-challenge are both
 * day-boundary concerns (UTC, since this is a single-server demo with no
 * per-user timezone) so they're rolled into one update: a new calendar day
 * resets the daily challenge and either extends the streak (practiced
 * yesterday) or resets it to 1 (missed a day).
 */
export function applyDailyProgress(
  input: DailyProgressInput,
  now: Date = new Date()
): DailyProgressResult {
  let { streakDays, dailyChallengeDone } = input;
  const isNewDay = !input.lastActiveDate || !isSameUtcDay(input.lastActiveDate, now);

  if (isNewDay) {
    dailyChallengeDone = 0;
    if (!input.lastActiveDate) {
      streakDays = 1;
    } else if (isPreviousUtcDay(input.lastActiveDate, now)) {
      streakDays += 1;
    } else {
      streakDays = 1;
    }
  }

  const wasComplete = dailyChallengeDone >= input.dailyChallengeGoal;
  dailyChallengeDone = Math.min(input.dailyChallengeGoal, dailyChallengeDone + 1);
  const challengeJustCompleted = !wasComplete && dailyChallengeDone >= input.dailyChallengeGoal;

  return { streakDays, dailyChallengeDone, lastActiveDate: now, challengeJustCompleted };
}
