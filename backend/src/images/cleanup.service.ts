import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { readdir, stat, unlink } from "fs/promises";
import { join } from "path";
import { PrismaService } from "../prisma/prisma.service";

const PUBLIC_DIR = join(process.cwd(), "public", "generated");
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const MIN_ORPHAN_AGE_MS = 24 * 60 * 60 * 1000;

function referencedFilename(imageUrl: string | null): string | null {
  const match = imageUrl?.match(/\/generated\/([^/?#]+)/);
  return match ? match[1] : null;
}

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

    type Row = { id: string; imageUrl: string | null };
    let panels: Row[], characters: Row[];
    try {
      [panels, characters] = await Promise.all([
        this.prisma.panel.findMany({ select: { id: true, imageUrl: true } }),
        this.prisma.character.findMany({ select: { id: true, imageUrl: true } }),
      ]);
    } catch (err) {
      this.logger.warn(`Skipping cleanup, failed to read panel/character ids: ${(err as Error).message}`);
      return;
    }
    // A file is in use if it's named after a panel/character id, or if a row's
    // imageUrl points at it — the latter matters for character previews, which
    // are saved under a throwaway preview id and then attached to a character
    // with a different id.
    const keep = new Set<string>();
    for (const row of [...panels, ...characters]) {
      keep.add(`${row.id}.jpg`);
      const referenced = referencedFilename(row.imageUrl);
      if (referenced) keep.add(referenced);
    }
    const cutoff = Date.now() - MIN_ORPHAN_AGE_MS;

    let freedBytes = 0;
    let deletedCount = 0;
    for (const file of files) {
      if (keep.has(file) || file.startsWith(".")) continue;
      const filePath = join(PUBLIC_DIR, file);
      try {
        const { size, mtimeMs } = await stat(filePath);
        // Skip fresh files: a preview the user hasn't saved yet, or a panel
        // whose row is about to be updated with its imageUrl.
        if (mtimeMs > cutoff) continue;
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
