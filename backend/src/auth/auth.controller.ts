import { Body, Controller, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { COOKIE_NAME, LoginDto, RegisterDto } from "./dto";

const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  private setSessionCookie(res: Response, userId: string) {
    const token = this.authService.signToken(userId);
    // Frontend and backend live on different domains in production
    // (vercel.app / onrender.com) — that's a cross-site request as far as
    // the browser is concerned, so the cookie needs SameSite=None, which
    // browsers only honor when Secure is also set. Locally both run on
    // http://localhost, where Secure cookies aren't sent at all, so dev
    // needs the old Lax/non-secure combination instead.
    const isProd = process.env.NODE_ENV === "production";
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(dto.name, dto.password, dto.teacherCode);
    this.setSessionCookie(res, user.id);
    return { id: user.id, name: user.name, role: user.role };
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.name, dto.password, dto.role);
    this.setSessionCookie(res, user.id);
    return { id: user.id, name: user.name, role: user.role };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie(COOKIE_NAME, { sameSite: isProd ? "none" : "lax", secure: isProd });
    return { ok: true };
  }
}
