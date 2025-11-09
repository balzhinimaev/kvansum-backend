import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TelegramAuthDto, AuthResponseDto } from './dto/telegram-auth.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

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
    this.logger.log('🔐 [POST /api/auth/telegram] Request received');
    this.logger.debug(`[POST /api/auth/telegram] InitData length: ${telegramAuthDto.initData?.length || 0}`);
    
    const result = await this.authService.authenticateWithTelegram(telegramAuthDto.initData);
    
    this.logger.log(`🔐 [POST /api/auth/telegram] ✅ Success for userId: ${result.userId}, telegramId: ${result.telegramId}`);
    
    return result;
  }
}

