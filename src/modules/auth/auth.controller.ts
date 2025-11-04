import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TelegramAuthDto, AuthResponseDto } from './dto/telegram-auth.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  @ApiOperation({ summary: 'Аутентификация через Telegram Web App' })
  @ApiResponse({ 
    status: 200, 
    description: 'Успешная аутентификация',
    type: AuthResponseDto
  })
  @ApiResponse({ status: 401, description: 'Невалидные данные Telegram' })
  @ApiBody({ type: TelegramAuthDto })
  async authenticateWithTelegram(
    @Body() telegramAuthDto: TelegramAuthDto,
  ): Promise<AuthResponseDto> {
    return this.authService.authenticateWithTelegram(telegramAuthDto.initData);
  }
}

