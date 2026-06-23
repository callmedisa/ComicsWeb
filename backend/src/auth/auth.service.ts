import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { MIN_PASSWORD_LENGTH } from "./dto";

const PASSWORD_HASH_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  private validateCredentials(name: string, password: string) {
    if (!name?.trim()) throw new BadRequestException("name is required");
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
  }

  async register(name: string, password: string) {
    this.validateCredentials(name, password);
    const trimmedName = name.trim();

    const existing = await this.prisma.user.findUnique({ where: { name: trimmedName } });
    if (existing) throw new ConflictException("That name is already taken");

    const hash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
    const user = await this.prisma.user.create({
      data: { name: trimmedName, password: hash },
    });
    return user;
  }

  async validateUser(name: string, password: string) {
    this.validateCredentials(name, password);
    const user = await this.prisma.user.findUnique({ where: { name: name.trim() } });
    if (!user?.password) throw new UnauthorizedException("Incorrect name or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException("Incorrect name or password");

    return user;
  }

  signToken(userId: string): string {
    return this.jwt.sign({ sub: userId });
  }
}
