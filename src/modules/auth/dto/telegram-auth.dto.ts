import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TelegramAuthDto {
  @ApiProperty({ 
    description: 'Данные инициализации из Telegram Web App',
    example: 'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397...'
  })
  @IsString()
  @IsNotEmpty()
  initData: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'ID пользователя в системе', example: '507f1f77bcf86cd799439011' })
  userId: string;

  @ApiProperty({ description: 'Telegram ID пользователя', example: 279058397 })
  telegramId: number;

  @ApiPropertyOptional({ description: 'Имя пользователя', example: 'Иван' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Фамилия пользователя', example: 'Иванов' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Username в Telegram', example: 'ivan_dev' })
  username?: string;

  @ApiPropertyOptional({ description: 'URL фото профиля', example: 'https://t.me/i/userpic/320/...' })
  photoUrl?: string;
}

