import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TeacherGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { userId?: string }>();
    const user = await this.prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });
    if (user?.role !== "TEACHER") throw new ForbiddenException("Teachers only");
    return true;
  }
}
