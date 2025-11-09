import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ description: 'ID пользователя для приглашения' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

