import { IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHabitLogDto {
  @ApiProperty({ description: 'Дата выполнения', example: '2025-11-02', pattern: 'YYYY-MM-DD' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;

  @ApiProperty({ description: 'Статус выполнения', enum: ['success', 'fail', 'pending', 'skipped'], example: 'success' })
  @IsEnum(['success', 'fail', 'pending', 'skipped'])
  status: 'success' | 'fail' | 'pending' | 'skipped';

  @ApiPropertyOptional({ description: 'Заметка о выполнении', example: 'Отличная тренировка!' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class GetHabitLogsQueryDto {
  @ApiPropertyOptional({ description: 'Начальная дата', example: '2025-10-01', pattern: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'from must be in YYYY-MM-DD format',
  })
  from?: string;

  @ApiPropertyOptional({ description: 'Конечная дата', example: '2025-11-02', pattern: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'to must be in YYYY-MM-DD format',
  })
  to?: string;

  @ApiPropertyOptional({ description: 'Лимит записей', example: 30 })
  @IsOptional()
  limit?: number;
}

