import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ComicsService } from "./comics.service";
import { CreateComicDto } from "./dto";

@Controller("comics")
export class ComicsController {
  constructor(private comicsService: ComicsService) {}

  @Get()
  findAll() {
    return this.comicsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.comicsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateComicDto) {
    return this.comicsService.create(dto);
  }
}
