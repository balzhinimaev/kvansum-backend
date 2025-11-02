import { IsString, IsNotEmpty } from 'class-validator';

export class TelegramAuthDto {
  @IsString()
  @IsNotEmpty()
  initData: string;
}

export class AuthResponseDto {
  userId: string;
  telegramId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

