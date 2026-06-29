import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user.decorator";
import { CoursesService } from "./courses.service";

@Controller("courses")
@UseGuards(AuthGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  findAll(@CurrentUserId() userId: string) {
    return this.coursesService.getCoursesWithProgress(userId);
  }
}
