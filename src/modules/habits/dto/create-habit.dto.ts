import { IsString, IsOptional, IsEnum, MaxLength, Matches } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'time must be in HH:mm format',
  })
  time?: string;

  @IsOptional()
  @IsEnum(['Легкая', 'Средняя', 'Сложная'])
  difficulty?: string;

  @IsOptional()
  @IsEnum(['Утро', 'День', 'Вечер', 'Итоги дня'])
  period?: string;
}

