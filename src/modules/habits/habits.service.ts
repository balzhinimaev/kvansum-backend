import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit, HabitDocument } from '../../common/schemas/habit.schema';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { EventsGateway } from '../../common/websockets/events.gateway';
import { WebSocketEventType } from '../../common/websockets/events.types';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createHabitDto: CreateHabitDto, userId: string): Promise<Habit> {
    const habit = new this.habitModel({
      ...createHabitDto,
      userId: new Types.ObjectId(userId),
    });
    const savedHabit = await habit.save();

    // Отправляем WebSocket уведомление
    this.eventsGateway.broadcastNotification(WebSocketEventType.HABIT_CREATED, {
      habitId: savedHabit._id.toString(),
      userId,
      title: savedHabit.title,
      timestamp: new Date().toISOString(),
    });

    return savedHabit;
  }

  async findAll(userId: string): Promise<Habit[]> {
    return this.habitModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Habit> {
    const habit = await this.habitModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    return habit;
  }

  async update(
    id: string,
    updateHabitDto: UpdateHabitDto,
    userId: string,
  ): Promise<Habit> {
    const habit = await this.habitModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: updateHabitDto },
        { new: true },
      )
      .exec();

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    // Отправляем WebSocket уведомление
    this.eventsGateway.broadcastNotification(WebSocketEventType.HABIT_UPDATED, {
      habitId: id,
      userId,
      changes: updateHabitDto,
      timestamp: new Date().toISOString(),
    });

    return habit;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.habitModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: { isActive: false } },
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    // Отправляем WebSocket уведомление
    this.eventsGateway.broadcastNotification(WebSocketEventType.HABIT_DELETED, {
      habitId: id,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  async markComplete(id: string, userId: string, date: Date): Promise<Habit> {
    const habit = await this.habitModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        {
          $push: { completedDates: date },
          $inc: { streak: 1 },
        },
        { new: true },
      )
      .exec();

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    // Отправляем WebSocket уведомление
    this.eventsGateway.broadcastNotification(
      WebSocketEventType.HABIT_COMPLETED,
      {
        habitId: id,
        userId,
        completedAt: date.toISOString(),
        streak: habit.streak,
      },
    );

    return habit;
  }
}

