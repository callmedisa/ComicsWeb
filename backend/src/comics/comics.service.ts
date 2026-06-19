import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ArtStyle, Character, ComicLength } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { OllamaService } from "../ollama/ollama.service";
import { ImagesService } from "../images/images.service";
import { CreateComicDto, PANELS_BY_LENGTH } from "./dto";

@Injectable()
export class ComicsService {
  private readonly logger = new Logger(ComicsService.name);

  constructor(
    private prisma: PrismaService,
    private ollama: OllamaService,
    private images: ImagesService
  ) {}

  private async getDemoUserId() {
    const user = await this.prisma.user.findFirst();
    if (!user) throw new NotFoundException("No seeded user found — run prisma:seed");
    return user.id;
  }

  private serialize(comic: any) {
    return {
      id: comic.id,
      title: comic.title,
      genre: comic.genre,
      style: comic.style,
      length: comic.length,
      status: comic.status,
      progressPct: comic.progressPct,
      panelsTotal: comic.panelsTotal,
      panels: comic.panels.map((p: any) => ({
        id: p.id,
        index: p.index,
        sceneLabel: p.sceneLabel,
        imageUrl: p.imageUrl,
        dialogue: p.dialogue.map((d: any) => ({
          id: d.id,
          speaker: d.speaker,
          text: d.text,
        })),
      })),
    };
  }

  async findAll() {
    const userId = await this.getDemoUserId();
    const comics = await this.prisma.comic.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { panels: { orderBy: { index: "asc" }, include: { dialogue: { orderBy: { order: "asc" } } } } },
    });
    return comics.map((c) => this.serialize(c));
  }

  async findOne(id: string) {
    const comic = await this.prisma.comic.findUnique({
      where: { id },
      include: { panels: { orderBy: { index: "asc" }, include: { dialogue: { orderBy: { order: "asc" } } } } },
    });
    if (!comic) throw new NotFoundException(`Comic ${id} not found`);
    return this.serialize(comic);
  }

  async create(dto: CreateComicDto) {
    const topic = dto.topic?.trim();
    if (!topic) throw new BadRequestException("topic is required");
    if (topic.length > 240) throw new BadRequestException("topic must be 240 characters or fewer");
    if (!Object.values(ArtStyle).includes(dto.style)) throw new BadRequestException("invalid style");
    if (!Object.values(ComicLength).includes(dto.length)) throw new BadRequestException("invalid length");

    const userId = await this.getDemoUserId();
    const panelsTotal = PANELS_BY_LENGTH[dto.length];

    const characters = dto.characterIds?.length
      ? await this.prisma.character.findMany({ where: { id: { in: dto.characterIds }, userId } })
      : [];

    const comic = await this.prisma.comic.create({
      data: {
        userId,
        title: topic.length > 40 ? `${topic.slice(0, 37)}...` : topic,
        style: dto.style,
        length: dto.length,
        status: "generating",
        progressPct: 0,
        panelsTotal,
      },
      include: { panels: { include: { dialogue: true } } },
    });

    this.generateAsync(comic.id, topic, dto.style, panelsTotal, characters).catch((err) => {
      this.logger.error(`Comic ${comic.id} generation failed`, err);
    });

    return this.serialize(comic);
  }

  private async generateAsync(
    comicId: string,
    topic: string,
    style: ArtStyle,
    panelsTotal: number,
    characters: Character[]
  ) {
    try {
      const story = await this.ollama.generateStory(
        topic,
        style,
        panelsTotal,
        characters.map((c) => ({ name: c.name, type: c.type, traits: c.traits }))
      );

      for (let i = 0; i < story.panels.length; i++) {
        const storyPanel = story.panels[i];
        const panel = await this.prisma.panel.create({
          data: {
            comicId,
            index: i + 1,
            sceneLabel: `comic scene · ${storyPanel.scene.toLowerCase()}`,
            dialogue: {
              create: storyPanel.dialogue.map((d, j) => ({
                speaker: d.speaker,
                text: d.text,
                order: j + 1,
              })),
            },
          },
        });

        const presentCharacters = characters
          .filter((c) =>
            storyPanel.characters.some((name) => name.toLowerCase().includes(c.name.toLowerCase()))
          )
          .map((c) => ({ name: c.name, type: c.type, color: c.color }));

        const imageUrl = await this.images.generatePanelImage(
          panel.id,
          storyPanel.scene,
          style,
          presentCharacters
        );
        if (imageUrl) {
          await this.prisma.panel.update({ where: { id: panel.id }, data: { imageUrl } });
        }

        await this.prisma.comic.update({
          where: { id: comicId },
          data: { progressPct: Math.round(((i + 1) / story.panels.length) * 100) },
        });
      }

      await this.prisma.comic.update({
        where: { id: comicId },
        data: { status: "done", progressPct: 100, title: story.title, genre: story.genre },
      });
    } catch (err) {
      this.logger.error(`Generation failed for comic ${comicId}`, err as Error);
      await this.prisma.comic.update({
        where: { id: comicId },
        data: { status: "failed" },
      });
    }
  }
}
