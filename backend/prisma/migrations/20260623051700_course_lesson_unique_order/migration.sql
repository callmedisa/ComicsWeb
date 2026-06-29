-- CreateIndex
CREATE UNIQUE INDEX "Course_level_order_key" ON "Course"("level", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_courseId_order_key" ON "Lesson"("courseId", "order");
