import { Module } from "@nestjs/common";
import { SpeechController } from "./speech.controller";
import { SpeechService } from "./speech.service";
import { TtsService } from "../tts/tts.service";

@Module({
  controllers: [SpeechController],
  providers: [SpeechService, TtsService],
})
export class SpeechModule {}
