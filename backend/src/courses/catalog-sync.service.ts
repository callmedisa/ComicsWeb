import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { syncCourseCatalog } from "./catalog";

// Courses used to exist only after someone ran prisma/seed-courses.ts by hand,
// so a deployed database that skipped that step showed an empty Courses page.
// Syncing on startup makes the catalog part of the deploy itself.
@Injectable()
export class CourseCatalogSyncService implements OnModuleInit {
  private readonly logger = new Logger(CourseCatalogSyncService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const count = await syncCourseCatalog(this.prisma);
      this.logger.log(`Course catalog synced (${count} courses)`);
    } catch (err) {
      // Never block startup over this — the rest of the app still works.
      this.logger.warn(`Couldn't sync course catalog: ${(err as Error).message}`);
    }
  }
}
