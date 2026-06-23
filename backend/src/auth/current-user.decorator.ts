import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const CurrentUserId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<Request & { userId: string }>();
  return req.userId;
});
