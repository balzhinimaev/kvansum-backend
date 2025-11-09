import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePartyDto {
  @ApiPropertyOptional({ description: 'Название группы', example: 'Новое название группы' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}

