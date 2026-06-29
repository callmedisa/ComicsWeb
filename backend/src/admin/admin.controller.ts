import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { TeacherGuard } from "../auth/teacher.guard";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(AuthGuard, TeacherGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("overview")
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get("students")
  listStudents() {
    return this.adminService.listStudents();
  }

  @Get("students/:id")
  getStudent(@Param("id") id: string) {
    return this.adminService.getStudent(id);
  }

  @Post("students/:id/reset-password")
  resetPassword(@Param("id") id: string) {
    return this.adminService.resetPassword(id);
  }
}
