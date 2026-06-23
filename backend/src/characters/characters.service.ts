import { randomUUID } from "crypto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CharacterType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ImagesService } from "../images/images.service";
import { CharacterPreviewDto, CreateCharacterDto } from "./dto";

@Injectable()
export class CharactersService {
  constructor(
    private prisma: PrismaService,
    private images: ImagesService
  ) {}

  private validate(dto: CharacterPreviewDto) {
    if (!Object.values(CharacterType).includes(dto.type)) {
      throw new BadRequestException("invalid character type");
    }
    if (!dto.name?.trim()) throw new BadRequestException("name is required");
    if (!dto.color?.trim()) throw new BadRequestException("color is required");
  }

  async findAll(userId: string) {
    const characters = await this.prisma.character.findMany({ where: { userId } });
    return characters.map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      traits: c.traits,
      color: c.color,
      imageUrl: c.imageUrl,
      level: c.level,
    }));
  }

  async generatePreview(dto: CharacterPreviewDto) {
    this.validate(dto);
    const previewId = randomUUID();
    const imageUrl = await this.images.generateCharacterImage(
      previewId,
      dto.type,
      dto.name.trim(),
      dto.traits ?? [],
      dto.color
    );
    return { imageUrl };
  }

  async create(dto: CreateCharacterDto, userId: string) {
    this.validate(dto);

    const character = await this.prisma.character.create({
      data: {
        userId,
        type: dto.type,
        name: dto.name.trim(),
        traits: dto.traits ?? [],
        color: dto.color,
        imageUrl: null,
      },
    });

    const imageUrl =
      dto.imageUrl ??
      (await this.images.generateCharacterImage(
        character.id,
        dto.type,
        character.name,
        dto.traits ?? [],
        dto.color
      ));

    const updated = imageUrl
      ? await this.prisma.character.update({ where: { id: character.id }, data: { imageUrl } })
      : character;

    return {
      id: updated.id,
      type: updated.type,
      name: updated.name,
      traits: updated.traits,
      color: updated.color,
      imageUrl: updated.imageUrl,
      level: updated.level,
    };
  }
}
