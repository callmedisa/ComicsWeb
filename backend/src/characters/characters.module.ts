import { Module } from "@nestjs/common";
import { CharactersController } from "./characters.controller";
import { CharactersService } from "./characters.service";
import { ImagesService } from "../images/images.service";

@Module({
  controllers: [CharactersController],
  providers: [CharactersService, ImagesService],
})
export class CharactersModule {}
