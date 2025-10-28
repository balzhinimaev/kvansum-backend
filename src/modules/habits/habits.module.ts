import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Habit, HabitSchema } from '../../common/schemas/habit.schema';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { WebSocketsModule } from '../../common/websockets/websockets.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Habit.name, schema: HabitSchema }]),
    WebSocketsModule,
  ],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}

