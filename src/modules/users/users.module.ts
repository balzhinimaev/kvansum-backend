import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProgressController } from './users.progress.controller';
import { User, UserSchema } from '../../common/schemas/user.schema';
import { UserStats, UserStatsSchema } from '../../common/schemas/user-stats.schema';
import { UserProgress, UserProgressSchema } from '../../common/schemas/user-progress.schema';
import { Habit, HabitSchema } from '../../common/schemas/habit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserStats.name, schema: UserStatsSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: Habit.name, schema: HabitSchema },
    ]),
  ],
  controllers: [UsersController, ProgressController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

