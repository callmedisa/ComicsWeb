import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getDemoUser() {
    const user = await this.prisma.user.findFirst();
    if (!user) throw new NotFoundException("No seeded user found — run prisma:seed");

    return {
      name: user.name,
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
    };
  }
}
