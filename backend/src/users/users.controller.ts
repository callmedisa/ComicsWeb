import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserId } from "../auth/current-user.decorator";
import { UsersService } from "./users.service";

@Controller("me")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getMe(@CurrentUserId() userId: string) {
    return this.usersService.getProfile(userId);
  }
}
