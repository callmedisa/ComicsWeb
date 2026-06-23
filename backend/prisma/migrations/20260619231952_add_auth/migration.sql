-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
