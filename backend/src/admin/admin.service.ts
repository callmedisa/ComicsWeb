import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

const PASSWORD_HASH_ROUNDS = 10;
const TEMP_PASSWORD_LENGTH = 10;
const TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function generateTempPassword(): string {
  return Array.from(randomBytes(TEMP_PASSWORD_LENGTH), (b) => TEMP_PASSWORD_CHARS[b % TEMP_PASSWORD_CHARS.length]).join("");
}

function isToday(date: Date | null): boolean {
  if (!date) return false;
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

function avg(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private async studentSummaries() {
    const students = await this.prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      include: {
        comics: { select: { status: true, createdAt: true } },
        speechAttempts: { select: { score: true } },
      },
    });

    return students.map((s) => {
      const comicsDone = s.comics.filter((c) => c.status === "done").length;
      const comicsThisWeek = s.comics.filter(
        (c) => c.status === "done" && Date.now() - c.createdAt.getTime() < WEEK_MS
      ).length;
      const avgScore = avg(s.speechAttempts.map((a) => a.score));
      return {
        id: s.id,
        name: s.name,
        username: s.name,
        level: s.level,
        streakDays: s.streakDays,
        comicsDone,
        comicsThisWeek,
        avgScore,
        activeToday: isToday(s.lastActiveDate),
        createdAt: s.createdAt,
      };
    });
  }

  async listStudents() {
    const summaries = await this.studentSummaries();
    return summaries.map(({ comicsThisWeek, ...rest }) => rest);
  }

  async getOverview() {
    const summaries = await this.studentSummaries();
    const withScores = summaries.filter((s) => s.avgScore > 0);
    return {
      studentCount: summaries.length,
      activeToday: summaries.filter((s) => s.activeToday).length,
      comicsThisWeek: summaries.reduce((sum, s) => sum + s.comicsThisWeek, 0),
      classAvg: avg(withScores.map((s) => s.avgScore)),
    };
  }

  async getStudent(studentId: string) {
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== "STUDENT") throw new NotFoundException("Student not found");

    const [comics, attempts, comicsCreated, linesSpoken, perfectScores] = await Promise.all([
      this.prisma.comic.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, title: true, status: true, createdAt: true },
      }),
      this.prisma.speechAttempt.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { score: true, createdAt: true },
      }),
      this.prisma.comic.count({ where: { userId: studentId } }),
      this.prisma.speechAttempt.count({ where: { userId: studentId } }),
      this.prisma.speechAttempt.count({ where: { userId: studentId, score: 100 } }),
    ]);

    const practiceByDay = new Map<string, { date: Date; scores: number[] }>();
    for (const a of attempts) {
      const key = a.createdAt.toISOString().slice(0, 10);
      const bucket = practiceByDay.get(key) ?? { date: a.createdAt, scores: [] };
      bucket.scores.push(a.score);
      practiceByDay.set(key, bucket);
    }

    const activity = [
      ...comics.map((c) => ({
        type: "comic_created" as const,
        title: `Created “${c.title}”`,
        when: c.createdAt,
        value: c.status === "done" ? "✓ Done" : c.status,
      })),
      ...Array.from(practiceByDay.values()).map((b) => ({
        type: "practice" as const,
        title: `Practiced speaking · ${b.scores.length} ${b.scores.length === 1 ? "line" : "lines"}`,
        when: b.date,
        value: `${avg(b.scores)}%`,
      })),
    ]
      .sort((a, b) => b.when.getTime() - a.when.getTime())
      .slice(0, 8);

    return {
      id: student.id,
      name: student.name,
      username: student.name,
      level: student.level,
      xp: student.xp,
      streakDays: student.streakDays,
      avgScore: avg(attempts.map((a) => a.score)),
      lastActiveDate: student.lastActiveDate,
      stats: { comicsCreated, linesSpoken, perfectScores },
      activity,
    };
  }

  async resetPassword(studentId: string): Promise<{ tempPassword: string }> {
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== "STUDENT") throw new NotFoundException("Student not found");

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, PASSWORD_HASH_ROUNDS);
    await this.prisma.user.update({ where: { id: studentId }, data: { password: hash } });

    return { tempPassword };
  }
}
