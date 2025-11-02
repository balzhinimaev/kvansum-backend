import { IsString, IsOptional, IsEnum, MaxLength, Matches, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HabitStageDto {
  @ApiProperty({ description: 'Название этапа', example: 'Первые ростки' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Описание этапа', example: 'Неделя дисциплины' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Количество дней для достижения этапа', example: 7 })
  days: number;
}

export class CreateHabitDto {
  @ApiProperty({ description: 'Название привычки', example: 'Медитация', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'ID уровня', example: 'lvl2' })
  @IsString()
  levelId: string;

  @ApiPropertyOptional({ description: 'Emoji привычки', example: '🧘' })
  @IsOptional()
  @IsString()
  emoji?: string;

  @ApiPropertyOptional({ description: 'URL изображения', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Краткое описание привычки', example: '10 минут утренней медитации', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @ApiPropertyOptional({ description: 'Заметка пользователя', example: 'Помогает сосредоточиться', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ description: 'Сложность привычки', enum: ['easy', 'medium', 'hard'], example: 'easy' })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Время дня', enum: ['morning', 'day', 'evening', 'summary'], example: 'morning' })
  @IsOptional()
  @IsEnum(['morning', 'day', 'evening', 'summary'])
  timeOfDay?: string;

  @ApiPropertyOptional({ description: 'Дни недели', example: ['daily'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[];

  @ApiPropertyOptional({ description: 'Этапы развития привычки', type: [HabitStageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabitStageDto)
  stages?: HabitStageDto[];

  // Старые поля для обратной совместимости
  @ApiPropertyOptional({ description: 'Время (legacy)', example: '07:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'time must be in HH:mm format',
  })
  time?: string;

  @ApiPropertyOptional({ description: 'Сложность (legacy)', enum: ['Легкая', 'Средняя', 'Сложная'] })
  @IsOptional()
  @IsEnum(['Легкая', 'Средняя', 'Сложная'])
  difficultyLegacy?: string;

  @ApiPropertyOptional({ description: 'Период дня (legacy)', enum: ['Утро', 'День', 'Вечер', 'Итоги дня'] })
  @IsOptional()
  @IsEnum(['Утро', 'День', 'Вечер', 'Итоги дня'])
  period?: string;
}

