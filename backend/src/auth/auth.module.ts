import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { TeacherGuard } from "./teacher.guard";

// Never fall back to a secret written in the code in production: anyone who
// reads the repository could sign valid login tokens with it.
function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  return "local-dev-only-secret";
}

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtSecret(),
      signOptions: { expiresIn: "30d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, TeacherGuard],
  exports: [AuthGuard, TeacherGuard],
})
export class AuthModule {}
