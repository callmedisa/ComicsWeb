import { Module } from "@nestjs/common";
import { ComicsController } from "./comics.controller";
import { ComicsService } from "./comics.service";
import { OllamaService } from "../ollama/ollama.service";
import { ImagesService } from "../images/images.service";

@Module({
  controllers: [ComicsController],
  providers: [ComicsService, OllamaService, ImagesService],
  exports: [ComicsService],
})
export class ComicsModule {}
