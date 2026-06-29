import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const [comicsCreated, linesSpoken, perfectScores] = await Promise.all([
      this.prisma.comic.count({ where: { userId } }),
      this.prisma.speechAttempt.count({ where: { userId } }),
      this.prisma.speechAttempt.count({ where: { userId, score: 100 } }),
    ]);

    return {
      name: user.name,
      role: user.role,
      xp: user.xp,
      xpGoal: user.xpGoal,
      gems: user.gems,
      streakDays: user.streakDays,
      level: user.level,
      dailyChallenge: {
        done: user.dailyChallengeDone,
        goal: user.dailyChallengeGoal,
        rewardXp: user.dailyChallengeRewardXp,
      },
      stats: { comicsCreated, linesSpoken, perfectScores },
    };
  }
}
