import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Idempotent: upserts by (level, order) / (courseId, order), never deletes.
// Safe to re-run against a database that already has real user data.
const COURSES = [
  {
    title: "Daily Life",
    level: "A1",
    order: 1,
    lessons: [
      { title: "Saying Hello", topic: "Two new friends meet at the park and say hello", order: 1, xpReward: 50 },
      { title: "My Family", topic: "A kid introduces their family members at a picnic", order: 2, xpReward: 50 },
      { title: "Going to School", topic: "A student's first day at a new school", order: 3, xpReward: 50 },
      { title: "Favorite Food", topic: "Friends ordering ice cream and talking about favorite foods", order: 4, xpReward: 50 },
      { title: "Weather Talk", topic: "Two friends planning a picnic and checking the weather", order: 5, xpReward: 50 },
    ],
  },
  {
    title: "Adventure",
    level: "A2",
    order: 2,
    lessons: [
      { title: "The Lost Map", topic: "A young pirate crew finds a mysterious treasure map", order: 1, xpReward: 60 },
      { title: "Into the Jungle", topic: "Explorers trekking through a jungle looking for a hidden temple", order: 2, xpReward: 60 },
      { title: "The Haunted House", topic: "Friends investigate strange noises in an old haunted house", order: 3, xpReward: 60 },
      { title: "Space Mission", topic: "Young astronauts on a mission to repair a space station", order: 4, xpReward: 60 },
      { title: "The Dragon's Cave", topic: "A young hero must convince a dragon to share its treasure peacefully", order: 5, xpReward: 60 },
    ],
  },
];

async function main() {
  for (const courseData of COURSES) {
    const course = await prisma.course.upsert({
      where: { level_order: { level: courseData.level, order: courseData.order } },
      update: { title: courseData.title },
      create: { title: courseData.title, level: courseData.level, order: courseData.order },
    });

    for (const lessonData of courseData.lessons) {
      await prisma.lesson.upsert({
        where: { courseId_order: { courseId: course.id, order: lessonData.order } },
        update: {
          title: lessonData.title,
          topic: lessonData.topic,
          xpReward: lessonData.xpReward,
        },
        create: {
          courseId: course.id,
          title: lessonData.title,
          topic: lessonData.topic,
          order: lessonData.order,
          xpReward: lessonData.xpReward,
        },
      });
    }
  }

  console.log(`Seeded ${COURSES.length} courses with lessons.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
