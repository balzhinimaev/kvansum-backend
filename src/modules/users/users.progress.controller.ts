import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserProgress, UserProgressDocument } from '../../common/schemas/user-progress.schema';

@ApiTags('progress')
@Controller('api/progress')
export class ProgressController {
  constructor(
    @InjectModel(UserProgress.name)
    private userProgressModel: Model<UserProgressDocument>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получить прогресс пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Прогресс пользователя: выполнение по датам, серии привычек, разблокированные уровни' 
  })
  async getProgress(@Req() req: Request) {
    const userId = req.userId!;

    let progress = await this.userProgressModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    // Если прогресс не найден, создаем пустой
    if (!progress) {
      progress = await this.userProgressModel.create({
        userId: new Types.ObjectId(userId),
        completionByDate: new Map(),
        habitStreak: new Map(),
        levelUnlockedAt: new Map([['lvl1', new Date().toISOString().split('T')[0]]]),
      });
    }

    // Конвертируем Map в объекты для JSON
    const completionByDate: Record<string, Record<string, string>> = {};
    progress.completionByDate.forEach((value, key) => {
      completionByDate[key] = value;
    });

    const habitStreak: Record<string, number> = {};
    progress.habitStreak.forEach((value, key) => {
      habitStreak[key] = value;
    });

    const levelUnlockedAt: Record<string, string | undefined> = {};
    progress.levelUnlockedAt.forEach((value, key) => {
      levelUnlockedAt[key] = value;
    });

    return {
      completionByDate,
      habitStreak,
      levelUnlockedAt,
    };
  }
}

