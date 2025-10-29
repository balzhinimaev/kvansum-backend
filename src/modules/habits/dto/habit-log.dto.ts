import { IsString, IsEnum, IsOptional, Matches } from 'class-validator';

export class CreateHabitLogDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;

  @IsEnum(['success', 'fail', 'pending', 'skipped'])
  status: 'success' | 'fail' | 'pending' | 'skipped';

  @IsOptional()
  @IsString()
  note?: string;
}

export class GetHabitLogsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'from must be in YYYY-MM-DD format',
  })
  from?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'to must be in YYYY-MM-DD format',
  })
  to?: string;

  @IsOptional()
  limit?: number;
}

