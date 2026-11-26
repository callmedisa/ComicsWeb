import { BadRequestException, Body, Controller, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user.decorator";
import { SpeechService } from "./speech.service";
import { CreateAttemptDto } from "./dto";
import { TtsService } from "../tts/tts.service";

@Controller("speech")
@UseGuards(AuthGuard)
export class SpeechController {
  constructor(
    private speechService: SpeechService,
    private tts: TtsService
  ) {}

  // Natural-sounding audio for a dialogue line ("Listen" / "Slow" buttons).
  @Get("lines/:lineId/audio")
  async lineAudio(
    @Param("lineId") lineId: string,
    @Query("slow") slow: string | undefined,
    @CurrentUserId() userId: string
  ) {
    const text = await this.speechService.getLineText(lineId, userId);
    const url = await this.tts.getAudioUrl(text, slow === "1" || slow === "true");
    return { url };
  }

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
