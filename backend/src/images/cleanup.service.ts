import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { readdir, stat, unlink } from "fs/promises";
import { join } from "path";
import { PrismaService } from "../prisma/prisma.service";

const PUBLIC_DIR = join(process.cwd(), "public", "generated");
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

// Panel/character image files are named `<id>.jpg`. If generation crashes
// mid-comic or a record never finishes saving, the file is written but never
// linked to a DB row — these orphans accumulate forever with nothing else to
// clean them up. Sweep them on startup and hourly after that.
@Injectable()
export class GeneratedFilesCleanupService implements OnModuleInit {
  private readonly logger = new Logger(GeneratedFilesCleanupService.name);

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.cleanup();
    setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
  }

  private async cleanup() {
    let files: string[];
    try {
      files = await readdir(PUBLIC_DIR);
    } catch {
      return;
    }

    const [panels, characters] = await Promise.all([
      this.prisma.panel.findMany({ select: { id: true } }),
      this.prisma.character.findMany({ select: { id: true } }),
    ]);
    const validIds = new Set([...panels.map((p) => p.id), ...characters.map((c) => c.id)]);

    let freedBytes = 0;
    let deletedCount = 0;
    for (const file of files) {
      const id = file.replace(/\.jpg$/, "");
      if (validIds.has(id)) continue;
      const filePath = join(PUBLIC_DIR, file);
      try {
        const { size } = await stat(filePath);
        await unlink(filePath);
        freedBytes += size;
        deletedCount += 1;
      } catch {
        // already gone or unreadable — skip
      }
    }

    if (deletedCount > 0) {
      this.logger.log(`Cleaned up ${deletedCount} orphan image(s), freed ${(freedBytes / 1024).toFixed(0)} KB`);
    }
  }
}
