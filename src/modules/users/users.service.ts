import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { UserStats, UserStatsDocument } from '../../common/schemas/user-stats.schema';
import { Habit, HabitDocument } from '../../common/schemas/habit.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserStats.name) private userStatsModel: Model<UserStatsDocument>,
    @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
  ) {}

  async findOrCreate(userId: string): Promise<UserDocument> {
    let user = await this.userModel.findById(userId);
    if (!user) {
      user = await this.userModel.create({ _id: userId });
      // Создаем статистику для нового пользователя
      await this.userStatsModel.create({ userId: new Types.ObjectId(userId) });
    }
    return user;
  }

  async findById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getMe(userId: string) {
    const user = await this.findOrCreate(userId);
    let stats = await this.userStatsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!stats) {
      stats = await this.userStatsModel.create({
        userId: new Types.ObjectId(userId),
      });
    }

    const totalHabits = await this.habitModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        email: user.email,
        createdAt: user.createdAt,
      },
      stats: {
        totalPoints: stats.totalPoints,
        currentLevel: stats.currentLevel,
        currentRank: stats.currentRank,
        totalHabits,
        currentStreak: stats.currentStreak,
      },
    };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateUserDto },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async exportData(userId: string) {
    const user = await this.findById(userId);
    const stats = await this.userStatsModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    const habits = await this.habitModel.find({
      userId: new Types.ObjectId(userId),
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        telegramId: user.telegramId,
        createdAt: user.createdAt,
      },
      stats: stats || {},
      habits: habits.map((h) => ({
        id: h._id,
        name: h.name,
        emoji: h.emoji,
        note: h.note,
        streak: h.streak,
        bestStreak: h.bestStreak,
        totalDone: h.totalDone,
        createdAt: h.createdAt,
      })),
      exportedAt: new Date().toISOString(),
    };
  }
}

