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
  @ApiProperty({ 
    description: 'JWT токен доступа', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJ1c2VybmFtZSI6Iml2YW5fZGV2IiwiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' 
  })
  accessToken: string;
}

