import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../auth/auth.guard";
import { TeacherGuard } from "../auth/teacher.guard";
import { TeachersService } from "./teachers.service";
import { UpsertTeacherDto } from "./dto";

@Controller("teachers")
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  @Get()
  list() {
    return this.teachersService.list();
  }

  @Post()
  @UseGuards(AuthGuard, TeacherGuard)
  @UseInterceptors(FileInterceptor("photo"))
  create(@Body() dto: UpsertTeacherDto, @UploadedFile() photo?: Express.Multer.File) {
    return this.teachersService.create(dto, photo);
  }

  @Put(":id")
  @UseGuards(AuthGuard, TeacherGuard)
  @UseInterceptors(FileInterceptor("photo"))
  update(@Param("id") id: string, @Body() dto: UpsertTeacherDto, @UploadedFile() photo?: Express.Multer.File) {
    return this.teachersService.update(id, dto, photo);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, TeacherGuard)
  remove(@Param("id") id: string) {
    return this.teachersService.remove(id);
  }
}
