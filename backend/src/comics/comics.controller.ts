import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user.decorator";
import { ComicsService } from "./comics.service";
import { CreateComicDto } from "./dto";

@Controller("comics")
@UseGuards(AuthGuard)
export class ComicsController {
  constructor(private comicsService: ComicsService) {}

  @Get()
  findAll(@CurrentUserId() userId: string) {
    return this.comicsService.findAll(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUserId() userId: string) {
    return this.comicsService.findOne(id, userId);
  }

  @Post()
  create(@Body() dto: CreateComicDto, @CurrentUserId() userId: string) {
    return this.comicsService.create(dto, userId);
  }

  @Post(":id/panels/:panelId/regenerate-image")
  regeneratePanelImage(
    @Param("id") id: string,
    @Param("panelId") panelId: string,
    @CurrentUserId() userId: string
  ) {
    return this.comicsService.regeneratePanelImage(id, panelId, userId);
  }
}
