import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramAuthDto, AuthResponseDto } from './dto/telegram-auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async authenticateWithTelegram(
    @Body() telegramAuthDto: TelegramAuthDto,
  ): Promise<AuthResponseDto> {
    return this.authService.authenticateWithTelegram(telegramAuthDto.initData);
  }
}

