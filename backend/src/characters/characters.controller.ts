import { Body, Controller, Get, Post } from "@nestjs/common";
import { CharactersService } from "./characters.service";
import { CharacterPreviewDto, CreateCharacterDto } from "./dto";

@Controller("characters")
export class CharactersController {
  constructor(private charactersService: CharactersService) {}

  @Get()
  findAll() {
    return this.charactersService.findAll();
  }

  @Post("preview")
  generatePreview(@Body() dto: CharacterPreviewDto) {
    return this.charactersService.generatePreview(dto);
  }

  @Post()
  create(@Body() dto: CreateCharacterDto) {
    return this.charactersService.create(dto);
  }
}
