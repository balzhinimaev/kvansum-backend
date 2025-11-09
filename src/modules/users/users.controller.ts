import { Controller, Get, Patch, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

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
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user.userId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Получить полный профиль пользователя (для фронтенда)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Полный профиль: имя, username, telegramId, очки, город, био, ранг' 
  })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.userId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Получить рейтинг участников' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список участников с рангами, очками, позициями и флагом "isMe"' 
  })
  async getLeaderboard(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getLeaderboard(user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.userId, updateUserDto);
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Экспорт всех данных пользователя (GDPR)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Полный экспорт данных: профиль, привычки, логи, прогресс' 
  })
  async exportData(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.exportData(user.userId);
  }
}

