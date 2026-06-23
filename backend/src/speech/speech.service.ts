import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { applyDailyProgress, applyLevelUp } from "../users/gamification";
import { CreateAttemptDto, GEMS_PER_SUCCESS, SUCCESS_SCORE_THRESHOLD, XP_PER_SUCCESS } from "./dto";

const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL ?? "http://localhost:8001";

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);

  constructor(private prisma: PrismaService) {}

  async transcribe(buffer: Buffer, filename: string): Promise<string> {
    const formData = new FormData();
    formData.append("audio", new Blob([new Uint8Array(buffer)]), filename);

    const res = await fetch(`${WHISPER_SERVICE_URL}/transcribe`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      this.logger.error(`Whisper service returned ${res.status}`);
      throw new Error(`Whisper service returned ${res.status}`);
    }

    const body = await res.json();
    return (body.text ?? "").trim();
  }

  async recordAttempt(dto: CreateAttemptDto, userId: string) {
    if (!dto.lineId) throw new BadRequestException("lineId is required");
    if (!Number.isInteger(dto.score) || dto.score < 0 || dto.score > 100) {
      throw new BadRequestException("score must be an integer between 0 and 100");
    }

    const line = await this.prisma.dialogueLine.findUnique({
      where: { id: dto.lineId },
      include: { panel: { include: { comic: true } } },
    });
    if (!line || line.panel.comic.userId !== userId) {
      throw new NotFoundException(`Line ${dto.lineId} not found`);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const success = dto.score >= SUCCESS_SCORE_THRESHOLD;

    await this.prisma.speechAttempt.create({
      data: {
        userId: user.id,
        lineId: dto.lineId,
        transcript: dto.transcript ?? "",
        score: dto.score,
      },
    });

    if (!success) {
      return { recorded: true, xpAwarded: 0, gemsAwarded: 0 };
    }

    const progress = applyDailyProgress({
      lastActiveDate: user.lastActiveDate,
      streakDays: user.streakDays,
      dailyChallengeDone: user.dailyChallengeDone,
      dailyChallengeGoal: user.dailyChallengeGoal,
    });
    const bonusXp = progress.challengeJustCompleted ? user.dailyChallengeRewardXp : 0;
    const leveling = applyLevelUp(user.level, user.xp + XP_PER_SUCCESS + bonusXp, user.xpGoal);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        xp: leveling.xp,
        xpGoal: leveling.xpGoal,
        level: leveling.level,
        gems: user.gems + GEMS_PER_SUCCESS,
        streakDays: progress.streakDays,
        dailyChallengeDone: progress.dailyChallengeDone,
        lastActiveDate: progress.lastActiveDate,
      },
    });

    return {
      recorded: true,
      xpAwarded: XP_PER_SUCCESS + bonusXp,
      gemsAwarded: GEMS_PER_SUCCESS,
      streakDays: progress.streakDays,
      challengeCompleted: progress.challengeJustCompleted,
      leveledUp: leveling.leveledUp,
      level: leveling.level,
    };
  }
}
