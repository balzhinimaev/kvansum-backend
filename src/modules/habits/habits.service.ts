import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit, HabitDocument } from '../../common/schemas/habit.schema';
import { HabitLog, HabitLogDocument } from '../../common/schemas/habit-log.schema';
import { UserStats, UserStatsDocument } from '../../common/schemas/user-stats.schema';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateHabitLogDto } from './dto/habit-log.dto';
import { EventsGateway } from '../../common/websockets/events.gateway';
import { WebSocketEventType } from '../../common/websockets/events.types';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
    @InjectModel(HabitLog.name) private habitLogModel: Model<HabitLogDocument>,
    @InjectModel(UserStats.name) private userStatsModel: Model<UserStatsDocument>,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(userId: string) {
    const habits = await this.habitModel
      .find({ userId: new Types.ObjectId(userId), isArchived: false })
      .sort({ order: 1, createdAt: -1 })
      .exec();

    return {
      habits: habits.map((h) => ({
        id: h._id,
        levelId: h.levelId,
        title: h.title,
        emoji: h.emoji,
        imageUrl: h.imageUrl,
        summary: h.summary,
        note: h.note,
        difficulty: h.difficulty,
        timeOfDay: h.timeOfDay,
        days: h.days,
        stages: h.stages,
        streak: h.streak,
        bestStreak: h.bestStreak,
        totalDone: h.totalDone,
        order: h.order,
        isActive: h.isActive,
        createdAt: h.createdAt,
        // Старые поля для обратной совместимости
        time: h.time,
        period: h.period,
      })),
    };
  }

  async create(createHabitDto: CreateHabitDto, userId: string) {
    const habit = await this.habitModel.create({
      ...createHabitDto,
      userId: new Types.ObjectId(userId),
    });

    // Отправляем WebSocket уведомление
    this.eventsGateway.broadcastNotification(WebSocketEventType.HABIT_CREATED, {
      habitId: habit._id.toString(),
      userId,
      name: habit.title,
      timestamp: new Date().toISOString(),
    });

    return {
      id: habit._id,
      levelId: habit.levelId,
      title: habit.title,
      emoji: habit.emoji,
      imageUrl: habit.imageUrl,
      summary: habit.summary,
      note: habit.note,
      difficulty: habit.difficulty,
      timeOfDay: habit.timeOfDay,
      days: habit.days,
      stages: habit.stages,
      streak: habit.streak,
      bestStreak: habit.bestStreak,
      totalDone: habit.totalDone,
      order: habit.order,
      isActive: habit.isActive,
      createdAt: habit.createdAt,
    };
  }

  async update(id: string, updateHabitDto: UpdateHabitDto, userId: string) {
    const habit = await this.habitModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: updateHabitDto },
        { new: true },
      )
      .exec();

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    // Отправляем WebSocket уведомление
    this.eventsGateway.broadcastNotification(WebSocketEventType.HABIT_UPDATED, {
      habitId: id,
      userId,
      changes: updateHabitDto,
      timestamp: new Date().toISOString(),
    });

    return {
      id: habit._id,
      levelId: habit.levelId,
      title: habit.title,
      emoji: habit.emoji,
      imageUrl: habit.imageUrl,
      summary: habit.summary,
      note: habit.note,
      difficulty: habit.difficulty,
      timeOfDay: habit.timeOfDay,
      days: habit.days,
      stages: habit.stages,
      streak: habit.streak,
      bestStreak: habit.bestStreak,
      totalDone: habit.totalDone,
      order: habit.order,
      isActive: habit.isActive,
      createdAt: habit.createdAt,
    };
  }

  async remove(id: string, userId: string) {
    const habit = await this.habitModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: { isArchived: true, isActive: false } },
      )
      .exec();

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    // Отправляем WebSocket уведомление
    this.eventsGateway.broadcastNotification(WebSocketEventType.HABIT_DELETED, {
      habitId: id,
      userId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  async createLog(habitId: string, createLogDto: CreateHabitLogDto, userId: string) {
    const habit = await this.habitModel.findOne({
      _id: habitId,
      userId: new Types.ObjectId(userId),
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    const logDate = new Date(createLogDto.date);
    logDate.setUTCHours(0, 0, 0, 0);

    // Проверяем, есть ли уже лог на эту дату
    const existingLog = await this.habitLogModel.findOne({
      habitId: new Types.ObjectId(habitId),
      date: logDate,
    });

    let log: HabitLogDocument;
    if (existingLog) {
      // Обновляем существующий лог
      existingLog.status = createLogDto.status;
      existingLog.note = createLogDto.note;
      log = await existingLog.save();
    } else {
      // Создаем новый лог
      log = await this.habitLogModel.create({
        userId: new Types.ObjectId(userId),
        habitId: new Types.ObjectId(habitId),
        date: logDate,
        status: createLogDto.status,
        note: createLogDto.note,
      });
    }

    // Обновляем статистику привычки
    let pointsEarned = 0;
    if (createLogDto.status === 'success') {
      habit.streak += 1;
      habit.totalDone += 1;
      if (habit.streak > habit.bestStreak) {
        habit.bestStreak = habit.streak;
      }

      // Начисляем очки
      pointsEarned = this.calculatePoints(habit.difficulty, habit.streak);
      log.points = pointsEarned;
    } else if (createLogDto.status === 'fail') {
      habit.streak = 0;
    }

    await habit.save();
    await log.save();

    // Обновляем статистику пользователя
    if (pointsEarned > 0) {
      await this.updateUserStats(userId, pointsEarned, habit.streak);
    }

    // Отправляем WebSocket уведомление
    this.eventsGateway.broadcastNotification(WebSocketEventType.HABIT_COMPLETED, {
      habitId,
      userId,
      status: createLogDto.status,
      streak: habit.streak,
      pointsEarned,
      timestamp: new Date().toISOString(),
    });

    return {
      log: {
        id: log._id,
        date: createLogDto.date,
        status: log.status,
        note: log.note,
        points: log.points,
        createdAt: log.createdAt,
      },
      habit: {
        streak: habit.streak,
        totalDone: habit.totalDone,
      },
      pointsEarned,
    };
  }

  async getLogs(habitId: string, userId: string, query: any) {
    const habit = await this.habitModel.findOne({
      _id: habitId,
      userId: new Types.ObjectId(userId),
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    const filter: any = {
      habitId: new Types.ObjectId(habitId),
    };

    if (query.from || query.to) {
      filter.date = {};
      if (query.from) {
        filter.date.$gte = new Date(query.from);
      }
      if (query.to) {
        filter.date.$lte = new Date(query.to);
      }
    }

    let logsQuery = this.habitLogModel.find(filter).sort({ date: -1 });

    if (query.limit) {
      logsQuery = logsQuery.limit(parseInt(query.limit));
    }

    const logs = await logsQuery.exec();

    return {
      logs: logs.map((l) => ({
        id: l._id,
        date: l.date.toISOString().split('T')[0],
        status: l.status,
        note: l.note,
        points: l.points,
        createdAt: l.createdAt,
      })),
    };
  }

  private calculatePoints(difficulty: string | undefined, streak: number): number {
    // Базовые очки в зависимости от сложности
    let basePoints = 10;
    if (difficulty === 'Средняя') basePoints = 20;
    if (difficulty === 'Сложная') basePoints = 30;

    // Бонус за серию (максимум +50)
    const streakBonus = Math.min(streak * 2, 50);

    return basePoints + streakBonus;
  }

  private async updateUserStats(userId: string, points: number, streak: number) {
    let stats = await this.userStatsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!stats) {
      stats = await this.userStatsModel.create({
        userId: new Types.ObjectId(userId),
      });
    }

    stats.totalPoints += points;
    stats.currentStreak = streak;
    if (streak > stats.longestStreak) {
      stats.longestStreak = streak;
    }

    // Обновляем ранг на основе очков
    stats.currentRank = this.calculateRank(stats.totalPoints);
    stats.currentLevel = Math.floor(stats.totalPoints / 100) + 1;
    stats.lastActivityAt = new Date();

    await stats.save();
  }

  private calculateRank(totalPoints: number): string {
    if (totalPoints >= 10000) return 'scaling';
    if (totalPoints >= 4000) return 'architect';
    if (totalPoints >= 1500) return 'systemic';
    if (totalPoints >= 500) return 'active';
    if (totalPoints >= 100) return 'observer';
    return 'beginner';
  }
}
