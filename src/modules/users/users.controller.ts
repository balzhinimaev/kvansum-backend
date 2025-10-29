import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: Request) {
    return this.usersService.getMe(req.userId!);
  }

  @Patch('me')
  async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.userId!, updateUserDto);
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  async exportData(@Req() req: Request) {
    return this.usersService.exportData(req.userId!);
  }
}

