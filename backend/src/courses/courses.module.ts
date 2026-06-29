import { Module } from "@nestjs/common";
import { ComicsModule } from "../comics/comics.module";
import { OllamaService } from "../ollama/ollama.service";
import { CoursesController } from "./courses.controller";
import { LessonsController } from "./lessons.controller";
import { CoursesService } from "./courses.service";

@Module({
  imports: [ComicsModule],
  controllers: [CoursesController, LessonsController],
  providers: [CoursesService, OllamaService],
})
export class CoursesModule {}
