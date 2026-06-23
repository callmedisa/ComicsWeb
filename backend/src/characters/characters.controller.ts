import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user.decorator";
import { CharactersService } from "./characters.service";
import { CharacterPreviewDto, CreateCharacterDto } from "./dto";

@Controller("characters")
@UseGuards(AuthGuard)
export class CharactersController {
  constructor(private charactersService: CharactersService) {}

  @Get()
  findAll(@CurrentUserId() userId: string) {
    return this.charactersService.findAll(userId);
  }

  @Post("preview")
  generatePreview(@Body() dto: CharacterPreviewDto) {
    return this.charactersService.generatePreview(dto);
  }

  @Post()
  create(@Body() dto: CreateCharacterDto, @CurrentUserId() userId: string) {
    return this.charactersService.create(dto, userId);
  }
}
