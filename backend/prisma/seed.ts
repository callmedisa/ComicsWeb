import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Demo login after seeding: name "Mia", password "demo1234".
async function main() {
  await prisma.speechAttempt.deleteMany();
  await prisma.dialogueLine.deleteMany();
  await prisma.panel.deleteMany();
  await prisma.comic.deleteMany();
  await prisma.character.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Mia",
      password: await bcrypt.hash("demo1234", 10),
      xp: 640,
      xpGoal: 1000,
      gems: 240,
      streakDays: 12,
      level: 4,
      dailyChallengeDone: 3,
      dailyChallengeGoal: 5,
      dailyChallengeRewardXp: 50,
    },
  });

  await prisma.character.createMany({
    data: [
      { userId: user.id, type: "Robot", name: "Robo", traits: ["Funny"], color: "#3D9BFF", level: 3 },
      { userId: user.id, type: "Superhero", name: "Sparky", traits: ["Brave", "Funny"], color: "#FFC93C", level: 1 },
    ],
  });

  await prisma.comic.create({
    data: {
      userId: user.id,
      title: "The Sleepy Robot",
      genre: "Comedy",
      style: "Cartoon",
      length: "Medium",
      status: "done",
      progressPct: 100,
      panelsTotal: 4,
      panels: {
        create: [
          {
            index: 1,
            sceneLabel: "comic scene · robot in bed",
            dialogue: { create: [{ speaker: "Robo", text: "I can't sleep at night.", order: 1 }] },
          },
          {
            index: 2,
            sceneLabel: "comic scene · hero + robot",
            dialogue: { create: [{ speaker: "Sparky", text: "Hello! How are you today?", order: 1 }] },
          },
          {
            index: 3,
            sceneLabel: "comic scene · robot counting stars",
            dialogue: { create: [{ speaker: "Robo", text: "I am counting stars outside.", order: 1 }] },
          },
          {
            index: 4,
            sceneLabel: "comic scene · robot asleep",
            dialogue: { create: [{ speaker: "Sparky", text: "Now you can sleep, my friend.", order: 1 }] },
          },
        ],
      },
    },
  });

  await prisma.comic.create({
    data: {
      userId: user.id,
      title: "Space Race",
      genre: "Sci-fi",
      style: "Comic",
      length: "Short",
      status: "done",
      progressPct: 100,
      panelsTotal: 4,
      panels: {
        create: [
          {
            index: 1,
            sceneLabel: "comic scene · rocket launch",
            dialogue: { create: [{ speaker: "Pilot", text: "Three, two, one, go!", order: 1 }] },
          },
        ],
      },
    },
  });

  await prisma.comic.create({
    data: {
      userId: user.id,
      title: "My Dragon Friend",
      genre: "Fantasy",
      style: "Cartoon",
      length: "Short",
      status: "generating",
      progressPct: 40,
      panelsTotal: 4,
      panels: { create: [] },
    },
  });

  console.log(`Seeded user ${user.name} with comics and characters.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
