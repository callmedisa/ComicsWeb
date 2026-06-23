import { BadRequestException, Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user.decorator";
import { SpeechService } from "./speech.service";
import { CreateAttemptDto } from "./dto";

@Controller("speech")
@UseGuards(AuthGuard)
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
  recordAttempt(@Body() dto: CreateAttemptDto, @CurrentUserId() userId: string) {
    return this.speechService.recordAttempt(dto, userId);
  }
}
