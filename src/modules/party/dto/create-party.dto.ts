import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePartyDto {
  @ApiProperty({ description: 'Название группы', example: 'Группа архитектора' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

