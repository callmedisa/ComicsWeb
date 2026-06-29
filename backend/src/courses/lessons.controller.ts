import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user.decorator";
import { CoursesService } from "./courses.service";
import { CompleteLessonDto } from "./dto";

@Controller("lessons")
@UseGuards(AuthGuard)
export class LessonsController {
  constructor(private coursesService: CoursesService) {}

  @Post(":id/start")
  start(@Param("id") id: string, @CurrentUserId() userId: string) {
    return this.coursesService.startLesson(id, userId);
  }

  @Post(":id/complete")
  complete(@Param("id") id: string, @Body() dto: CompleteLessonDto, @CurrentUserId() userId: string) {
    return this.coursesService.completeLesson(id, userId, dto.score);
  }

  @Get(":id/quiz")
  quiz(@Param("id") id: string, @CurrentUserId() userId: string) {
    return this.coursesService.getQuiz(id, userId);
  }
}
