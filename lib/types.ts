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

export type Role = "STUDENT" | "TEACHER";

export interface UserProfile {
  name: string;
  role: Role;
  xp: number;
  xpGoal: number;
  gems: number;
  streakDays: number;
  level: number;
  dailyChallenge: { done: number; goal: number; rewardXp: number };
  stats: { comicsCreated: number; linesSpoken: number; perfectScores: number };
}

export type LessonStatus = "locked" | "available" | "completed";

export interface LessonSummary {
  id: string;
  title: string;
  topic: string;
  order: number;
  xpReward: number;
  status: LessonStatus;
  score: number | null;
  completedAt: string | null;
  comicId: string | null;
}

export interface CourseSummary {
  id: string;
  title: string;
  level: string;
  order: number;
  lessons: LessonSummary[];
}

export interface QuizQuestion {
  word: string;
  correctMeaning: string;
  options: string[];
}

export interface StudentSummary {
  id: string;
  name: string;
  username: string;
  level: number;
  streakDays: number;
  comicsDone: number;
  avgScore: number;
  activeToday: boolean;
  createdAt: string;
}

export interface AdminOverview {
  studentCount: number;
  activeToday: number;
  comicsThisWeek: number;
  classAvg: number;
}

export interface ActivityEvent {
  type: "comic_created" | "practice";
  title: string;
  when: string;
  value: string;
}

export interface StudentDetail {
  id: string;
  name: string;
  username: string;
  level: number;
  xp: number;
  streakDays: number;
  avgScore: number;
  lastActiveDate: string | null;
  stats: { comicsCreated: number; linesSpoken: number; perfectScores: number };
  activity: ActivityEvent[];
}

export interface TeacherProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
}
