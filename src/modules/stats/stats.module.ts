import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Habit, HabitSchema } from '../../common/schemas/habit.schema';
import { HabitLog, HabitLogSchema } from '../../common/schemas/habit-log.schema';
import { UserStats, UserStatsSchema } from '../../common/schemas/user-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: HabitLog.name, schema: HabitLogSchema },
      { name: UserStats.name, schema: UserStatsSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}

