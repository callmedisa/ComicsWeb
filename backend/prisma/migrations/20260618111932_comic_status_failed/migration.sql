-- AlterEnum
ALTER TYPE "ComicStatus" ADD VALUE 'failed';

-- AlterTable
ALTER TABLE "Comic" ALTER COLUMN "genre" SET DEFAULT '';
