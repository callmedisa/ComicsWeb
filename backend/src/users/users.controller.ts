import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("me")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getMe() {
    return this.usersService.getDemoUser();
  }
}
