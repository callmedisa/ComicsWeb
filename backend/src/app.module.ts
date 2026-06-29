import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ComicsModule } from "./comics/comics.module";
import { CharactersModule } from "./characters/characters.module";
import { SpeechModule } from "./speech/speech.module";
import { CoursesModule } from "./courses/courses.module";
import { AdminModule } from "./admin/admin.module";
import { TeachersModule } from "./teachers/teachers.module";
import { GeneratedFilesCleanupService } from "./images/cleanup.service";

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ComicsModule, CharactersModule, SpeechModule, CoursesModule, AdminModule, TeachersModule],
  providers: [GeneratedFilesCleanupService],
})
export class AppModule {}
