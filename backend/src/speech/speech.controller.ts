import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SpeechService } from "./speech.service";
import { CreateAttemptDto } from "./dto";

@Controller("speech")
export class SpeechController {
  constructor(private speechService: SpeechService) {}

  @Post("transcribe")
  @UseInterceptors(FileInterceptor("audio"))
  async transcribe(@UploadedFile() audio?: Express.Multer.File) {
    if (!audio) throw new BadRequestException("audio file is required");
    const transcript = await this.speechService.transcribe(
      audio.buffer,
      audio.originalname || "audio.webm"
    );
    return { transcript };
  }

  @Post("attempts")
  recordAttempt(@Body() dto: CreateAttemptDto) {
    return this.speechService.recordAttempt(dto);
  }
}
