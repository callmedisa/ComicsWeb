import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ComicsService } from "../comics/comics.service";
import { OllamaService } from "../ollama/ollama.service";
import { applyLevelUp } from "../users/gamification";

const STOPWORDS = new Set([
  "the", "a", "an", "is", "am", "are", "was", "were", "be", "been", "to", "of", "in", "on", "at", "for",
  "and", "but", "or", "so", "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "its",
  "our", "their", "this", "that", "these", "those", "do", "does", "did", "have", "has", "had", "will",
  "would", "can", "could", "not", "no", "yes", "with", "up", "down", "out", "me", "him", "us", "them",
  "what", "who", "where", "when", "why", "how", "go", "going", "get", "got", "just", "very", "now",
]);

type LessonStatus = "locked" | "available" | "completed";

interface LessonWithStatus {
  id: string;
  title: string;
  topic: string;
  order: number;
  xpReward: number;
  status: LessonStatus;
  score: number | null;
  completedAt: Date | null;
  comicId: string | null;
}

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private comics: ComicsService,
    private ollama: OllamaService
  ) {}

  // Lesson status isn't stored for every lesson up front — only lessons a
  // user has actually touched get a UserLessonProgress row. Status for the
  // rest is derived by walking lessons in course order and tracking whether
  // the previous one was completed, so unlocking the next lesson is implicit
  // once the current one is marked "completed".
  async getCoursesWithProgress(userId: string) {
    const courses = await this.prisma.course.findMany({
      orderBy: { order: "asc" },
      include: { lessons: { orderBy: { order: "asc" } } },
    });
    const progress = await this.prisma.userLessonProgress.findMany({ where: { userId } });
    const progressByLessonId = new Map(progress.map((p) => [p.lessonId, p]));

    let previousCompleted = true;
    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      level: course.level,
      order: course.order,
      lessons: course.lessons.map((lesson): LessonWithStatus => {
        const p = progressByLessonId.get(lesson.id);
        const status: LessonStatus = p ? (p.status as LessonStatus) : previousCompleted ? "available" : "locked";
        previousCompleted = status === "completed";
        return {
          id: lesson.id,
          title: lesson.title,
          topic: lesson.topic,
          order: lesson.order,
          xpReward: lesson.xpReward,
          status,
          score: p?.score ?? null,
          completedAt: p?.completedAt ?? null,
          comicId: p?.comicId ?? null,
        };
      }),
    }));
  }

  private async getLessonStatus(userId: string, lessonId: string): Promise<LessonWithStatus | null> {
    const courses = await this.getCoursesWithProgress(userId);
    for (const course of courses) {
      const lesson = course.lessons.find((l) => l.id === lessonId);
      if (lesson) return lesson;
    }
    return null;
  }

  async startLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const status = await this.getLessonStatus(userId, lessonId);
    if (!status || status.status === "locked") {
      throw new ForbiddenException("Complete the previous lesson first");
    }

    // Re-starting an already-completed or in-progress lesson reuses the same
    // progress row but draws a brand new comic each time.
    const comic = await this.comics.create({ topic: lesson.topic, style: "Cartoon", length: "Short" }, userId);

    await this.prisma.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { comicId: comic.id },
      create: { userId, lessonId, comicId: comic.id, status: "available" },
    });

    return { comicId: comic.id };
  }

  async completeLesson(lessonId: string, userId: string, score: number) {
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      throw new BadRequestException("score must be an integer between 0 and 100");
    }

    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const existing = await this.prisma.userLessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (!existing) throw new BadRequestException("Start the lesson before completing it");

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const xpAwarded = Math.round((lesson.xpReward * score) / 100);
    const leveling = applyLevelUp(user.level, user.xp + xpAwarded, user.xpGoal);

    await this.prisma.$transaction([
      this.prisma.userLessonProgress.update({
        where: { userId_lessonId: { userId, lessonId } },
        data: { status: "completed", score, completedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { xp: leveling.xp, xpGoal: leveling.xpGoal, level: leveling.level },
      }),
    ]);

    return { xpAwarded, leveledUp: leveling.leveledUp, level: leveling.level };
  }

  async getQuiz(lessonId: string, userId: string) {
    const progress = await this.prisma.userLessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (!progress?.comicId) throw new BadRequestException("Start the lesson before taking the quiz");

    const comic = await this.prisma.comic.findUnique({
      where: { id: progress.comicId },
      include: { panels: { include: { dialogue: true } } },
    });
    if (!comic) throw new NotFoundException("Comic not found");

    const words = this.extractVocabWords(comic.panels.flatMap((p) => p.dialogue.map((d) => d.text)));
    if (words.length === 0) {
      throw new BadRequestException("Not enough vocabulary in this comic yet — try again once it's done.");
    }

    const questions = await this.ollama.generateVocabQuiz(words);
    return questions.map((q) => ({
      word: q.word,
      correctMeaning: q.correctMeaning,
      options: this.shuffle([q.correctMeaning, ...q.distractors]),
    }));
  }

  private extractVocabWords(lines: string[]): string[] {
    const seen = new Set<string>();
    for (const line of lines) {
      const tokens = line.toLowerCase().match(/[a-z']+/g) ?? [];
      for (const token of tokens) {
        if (token.length >= 4 && !STOPWORDS.has(token)) seen.add(token);
      }
    }
    return Array.from(seen).slice(0, 5);
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
