import { IsString, IsOptional, IsEnum, MaxLength, Matches, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class HabitStageDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  days: number;
}

export class CreateHabitDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  levelId: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsEnum(['morning', 'day', 'evening', 'summary'])
  timeOfDay?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabitStageDto)
  stages?: HabitStageDto[];

  // Старые поля для обратной совместимости
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'time must be in HH:mm format',
  })
  time?: string;

  @IsOptional()
  @IsEnum(['Легкая', 'Средняя', 'Сложная'])
  difficultyLegacy?: string;

  @IsOptional()
  @IsEnum(['Утро', 'День', 'Вечер', 'Итоги дня'])
  period?: string;
}

