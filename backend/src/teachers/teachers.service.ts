import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertTeacherDto } from "./dto";

const PUBLIC_DIR = join(process.cwd(), "public", "teachers");
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL ?? "http://localhost:3001";

function validate(dto: UpsertTeacherDto) {
  if (!dto.name?.trim()) throw new BadRequestException("name is required");
  if (!dto.role?.trim()) throw new BadRequestException("role is required");
  if (!dto.bio?.trim()) throw new BadRequestException("bio is required");
}

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.teacherProfile.findMany({ orderBy: { createdAt: "asc" } });
  }

  private async savePhoto(id: string, photo: Express.Multer.File): Promise<string> {
    await mkdir(PUBLIC_DIR, { recursive: true });
    const filename = `${id}-${Date.now()}.jpg`;
    await writeFile(join(PUBLIC_DIR, filename), photo.buffer);
    return `${BACKEND_PUBLIC_URL}/teachers/${filename}`;
  }

  async create(dto: UpsertTeacherDto, photo?: Express.Multer.File) {
    validate(dto);
    const profile = await this.prisma.teacherProfile.create({
      data: { name: dto.name.trim(), role: dto.role.trim(), bio: dto.bio.trim() },
    });
    if (!photo) return profile;

    const photoUrl = await this.savePhoto(profile.id, photo);
    return this.prisma.teacherProfile.update({ where: { id: profile.id }, data: { photoUrl } });
  }

  async update(id: string, dto: UpsertTeacherDto, photo?: Express.Multer.File) {
    validate(dto);
    const existing = await this.prisma.teacherProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Teacher profile not found");

    const photoUrl = photo ? await this.savePhoto(id, photo) : existing.photoUrl;
    return this.prisma.teacherProfile.update({
      where: { id },
      data: { name: dto.name.trim(), role: dto.role.trim(), bio: dto.bio.trim(), photoUrl },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.teacherProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Teacher profile not found");
    await this.prisma.teacherProfile.delete({ where: { id } });
    return { ok: true };
  }
}
