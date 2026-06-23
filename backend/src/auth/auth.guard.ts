import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { COOKIE_NAME } from "./dto";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { userId?: string }>();
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new UnauthorizedException("Not signed in");

    try {
      const payload = this.jwt.verify<{ sub: string }>(token);
      req.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException("Session expired, please sign in again");
    }
  }
}
