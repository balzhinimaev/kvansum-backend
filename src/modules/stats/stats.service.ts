import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit, HabitDocument } from '../../common/schemas/habit.schema';
import { HabitLog, HabitLogDocument } from '../../common/schemas/habit-log.schema';
import { UserStats, UserStatsDocument } from '../../common/schemas/user-stats.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
    @InjectModel(HabitLog.name) private habitLogModel: Model<HabitLogDocument>,
    @InjectModel(UserStats.name) private userStatsModel: Model<UserStatsDocument>,
  ) {}

  async getDashboard(userId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const last7Days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }

    // Получаем все активные привычки пользователя
    const totalActiveHabits = await this.habitModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isActive: true,
      isArchived: false,
    });

    // Статистика за сегодня
    const todayLogs = await this.habitLogModel.find({
      userId: new Types.ObjectId(userId),
      date: today,
    });

    const todayCompleted = todayLogs.filter((l) => l.status === 'success').length;
    const todayPercent = totalActiveHabits > 0 
      ? Math.round((todayCompleted / totalActiveHabits) * 100) 
      : 0;

    // Статистика за последние 7 дней
    const last7DaysData = await Promise.all(
      last7Days.map(async (date) => {
        const logs = await this.habitLogModel.find({
          userId: new Types.ObjectId(userId),
          date: date,
        });

        const completed = logs.filter((l) => l.status === 'success').length;
        const percent = totalActiveHabits > 0 
          ? Math.round((completed / totalActiveHabits) * 100) 
          : 0;

        return {
          date: date.toISOString().split('T')[0],
          total: totalActiveHabits,
          completed,
          percent,
        };
      }),
    );

    // Получаем статистику пользователя
    let userStats = await this.userStatsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!userStats) {
      userStats = await this.userStatsModel.create({
        userId: new Types.ObjectId(userId),
      });
    }

    return {
      today: {
        date: today.toISOString().split('T')[0],
        total: totalActiveHabits,
        completed: todayCompleted,
        pending: totalActiveHabits - todayCompleted,
        percent: todayPercent,
      },
      last7Days: last7DaysData,
      userStats: {
        totalPoints: userStats.totalPoints,
        currentLevel: userStats.currentLevel,
        currentRank: userStats.currentRank,
        currentStreak: userStats.currentStreak,
        longestStreak: userStats.longestStreak,
      },
    };
  }

  async getWeekly(userId: string, weekStart?: string) {
    let startDate: Date;

    if (weekStart) {
      startDate = new Date(weekStart);
    } else {
      // Текущая неделя (понедельник)
      startDate = new Date();
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
    }
    startDate.setUTCHours(0, 0, 0, 0);

    // Генерируем 7 дней недели
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }

    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    // Получаем все активные привычки
    const habits = await this.habitModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
      isArchived: false,
    });

    let weekTotalCompleted = 0;
    let weekTotalPoints = 0;
    let weekTotalPossible = habits.length * 7;

    const days = await Promise.all(
      weekDays.map(async (date) => {
        const logs = await this.habitLogModel
          .find({
            userId: new Types.ObjectId(userId),
            date: date,
          })
          .populate('habitId');

        const habitsData = habits.map((habit) => {
          const log = logs.find(
            (l) => l.habitId.toString() === habit._id.toString(),
          );

          return {
            habitId: habit._id,
            name: habit.title,
            emoji: habit.emoji,
            status: log ? log.status : 'pending',
            points: log ? log.points : 0,
          };
        });

        const totalCompleted = habitsData.filter((h) => h.status === 'success').length;
        const totalPoints = habitsData.reduce((sum, h) => sum + h.points, 0);
        const percent = habits.length > 0 
          ? Math.round((totalCompleted / habits.length) * 100) 
          : 0;

        weekTotalCompleted += totalCompleted;
        weekTotalPoints += totalPoints;

        const dayOfWeek = dayNames[date.getDay()];

        return {
          date: date.toISOString().split('T')[0],
          dayOfWeek,
          habits: habitsData,
          totalCompleted,
          totalPoints,
          percent,
        };
      }),
    );

    const averagePercent = weekTotalPossible > 0 
      ? Math.round((weekTotalCompleted / weekTotalPossible) * 100) 
      : 0;

    return {
      week: startDate.toISOString().split('T')[0],
      days,
      weekTotal: {
        completed: weekTotalCompleted,
        total: weekTotalPossible,
        points: weekTotalPoints,
        averagePercent,
      },
    };
  }

  async getRank(userId: string) {
    let userStats = await this.userStatsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!userStats) {
      userStats = await this.userStatsModel.create({
        userId: new Types.ObjectId(userId),
      });
    }

    const ranks = [
      { name: 'beginner', minPoints: 0, label: 'Начинающий' },
      { name: 'observer', minPoints: 100, label: 'Наблюдатель' },
      { name: 'active', minPoints: 500, label: 'Активный' },
      { name: 'systemic', minPoints: 1500, label: 'Системный' },
      { name: 'architect', minPoints: 4000, label: 'Архитектор' },
      { name: 'scaling', minPoints: 10000, label: 'Масштабирующий' },
    ];

    const currentRankIndex = ranks.findIndex((r) => r.name === userStats.currentRank);
    const nextRankIndex = currentRankIndex + 1;

    let nextRank = null;
    if (nextRankIndex < ranks.length) {
      const nextRankData = ranks[nextRankIndex];
      const requiredPoints = nextRankData.minPoints;
      const progress = Math.min(
        Math.round((userStats.totalPoints / requiredPoints) * 100),
        100,
      );

      nextRank = {
        name: nextRankData.label,
        requiredPoints,
        progress,
      };
    }

    return {
      currentRank: userStats.currentRank,
      currentLevel: userStats.currentLevel,
      totalPoints: userStats.totalPoints,
      nextRank,
      ranks: ranks.map((r) => ({
        name: r.label,
        minPoints: r.minPoints,
        unlocked: userStats.totalPoints >= r.minPoints,
      })),
    };
  }
}

