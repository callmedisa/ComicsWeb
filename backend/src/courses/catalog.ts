import { PrismaClient } from "@prisma/client";

// The built-in course catalog. Shared by the server (synced on startup, so a
// fresh database never shows an empty Courses page) and prisma/seed-courses.ts.
export const COURSE_CATALOG = [
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

// Idempotent: upserts by (level, order) / (courseId, order), never deletes, so
// it's safe to run against a database that already has real user progress.
export async function syncCourseCatalog(prisma: PrismaClient): Promise<number> {
  for (const courseData of COURSE_CATALOG) {
    const course = await prisma.course.upsert({
      where: { level_order: { level: courseData.level, order: courseData.order } },
      update: { title: courseData.title },
      create: { title: courseData.title, level: courseData.level, order: courseData.order },
    });

    for (const lessonData of courseData.lessons) {
      const fields = { title: lessonData.title, topic: lessonData.topic, xpReward: lessonData.xpReward };
      await prisma.lesson.upsert({
        where: { courseId_order: { courseId: course.id, order: lessonData.order } },
        update: fields,
        create: { ...fields, courseId: course.id, order: lessonData.order },
      });
    }
  }
  return COURSE_CATALOG.length;
}
