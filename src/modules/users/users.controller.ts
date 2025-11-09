import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Расширяем интерфейс Request для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        telegramId: number;
        username: string;
      };
    }
  }
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Получить данные текущего пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Профиль пользователя с общей статистикой' 
  })
  async getMe(@Req() req: Request) {
    return this.usersService.getMe(req.user!.userId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Получить полный профиль пользователя (для фронтенда)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Полный профиль: имя, username, telegramId, очки, город, био, ранг' 
  })
  async getProfile(@Req() req: Request) {
    return this.usersService.getProfile(req.user!.userId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Получить рейтинг участников' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список участников с рангами, очками, позициями и флагом "isMe"' 
  })
  async getLeaderboard(@Req() req: Request) {
    return this.usersService.getLeaderboard(req.user?.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user!.userId, updateUserDto);
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Экспорт всех данных пользователя (GDPR)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Полный экспорт данных: профиль, привычки, логи, прогресс' 
  })
  async exportData(@Req() req: Request) {
    return this.usersService.exportData(req.user!.userId);
  }
}

