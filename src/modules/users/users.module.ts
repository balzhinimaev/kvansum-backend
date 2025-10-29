import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from '../../common/schemas/user.schema';
import { UserStats, UserStatsSchema } from '../../common/schemas/user-stats.schema';
import { Habit, HabitSchema } from '../../common/schemas/habit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserStats.name, schema: UserStatsSchema },
      { name: Habit.name, schema: HabitSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

