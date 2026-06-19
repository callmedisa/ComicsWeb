import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { ComicsModule } from "./comics/comics.module";
import { CharactersModule } from "./characters/characters.module";
import { SpeechModule } from "./speech/speech.module";

@Module({
  imports: [PrismaModule, UsersModule, ComicsModule, CharactersModule, SpeechModule],
})
export class AppModule {}
