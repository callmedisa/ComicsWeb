export type ArtStyle = "Cartoon" | "Comic" | "Pixel";
export type ComicLength = "Short" | "Medium" | "Long";
export type ComicStatus = "generating" | "done" | "failed";
export type CharacterType =
  | "Superhero"
  | "Robot"
  | "Animal"
  | "Fantasy"
  | "Historical";

export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
}

export interface Panel {
  id: string;
  index: number;
  sceneLabel: string;
  imageUrl: string | null;
  dialogue: DialogueLine[];
}

export interface Comic {
  id: string;
  title: string;
  genre: string;
  style: ArtStyle;
  length: ComicLength;
  status: ComicStatus;
  progressPct: number; // status bar while generating
  panels: Panel[];
  panelsTotal: number;
}

export interface Character {
  id: string;
  type: CharacterType;
  name: string;
  traits: string[];
  color: string;
  imageUrl: string | null;
  level: number;
}

export interface WordScore {
  word: string;
  ok: boolean;
}

export interface SpeechResult {
  score: number;
  words: WordScore[];
  note: string;
  missing: string[];
  recognized: string;
}

export interface UserProfile {
  name: string;
  xp: number;
  xpGoal: number;
  gems: number;
  streakDays: number;
  level: number;
  dailyChallenge: { done: number; goal: number; rewardXp: number };
}
