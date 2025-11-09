import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { UserStats, UserStatsDocument } from '../../common/schemas/user-stats.schema';
import { Habit, HabitDocument } from '../../common/schemas/habit.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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

  async findOrCreateByTelegramId(telegramId: number, userData?: Partial<User>): Promise<UserDocument> {
    this.logger.log(`[findOrCreateByTelegramId] Looking for telegramId: ${telegramId}`);
    let user = await this.userModel.findOne({ telegramId });
    
    if (!user) {
      this.logger.log(`[findOrCreateByTelegramId] User NOT found - creating new user...`);
      this.logger.debug(`[findOrCreateByTelegramId] User data: ${JSON.stringify(userData)}`);
      
      // Создаем нового пользователя
      user = await this.userModel.create({
        telegramId,
        username: userData?.username,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        email: userData?.email,
      });
      
      this.logger.log(`[findOrCreateByTelegramId] ✅ User created: ${user._id}, telegramId: ${user.telegramId}`);
      
      // Создаем статистику для нового пользователя
      const stats = await this.userStatsModel.create({ userId: user._id });
      this.logger.log(`[findOrCreateByTelegramId] ✅ User stats created: ${stats._id}`);
    } else if (userData) {
      this.logger.log(`[findOrCreateByTelegramId] User FOUND: ${user._id} - updating...`);
      
      // Обновляем данные существующего пользователя
      user.username = userData.username || user.username;
      user.firstName = userData.firstName || user.firstName;
      user.lastName = userData.lastName || user.lastName;
      user.email = userData.email || user.email;
      await user.save();
      
      this.logger.log(`[findOrCreateByTelegramId] ✅ User updated: ${user._id}`);
    } else {
      this.logger.log(`[findOrCreateByTelegramId] User FOUND: ${user._id} - no update needed`);
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
        createdAt: (user as any).createdAt,
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
      city: user.city,
      bio: user.bio,
      avatarLetter: user.avatarLetter,
      createdAt: (user as any).createdAt,
    };
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    let stats = await this.userStatsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!stats) {
      stats = await this.userStatsModel.create({
        userId: new Types.ObjectId(userId),
      });
    }

    // Формируем полное имя
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Пользователь';

    // Генерируем avatarLetter если его нет
    let avatarLetter = user.avatarLetter;
    if (!avatarLetter && user.firstName) {
      avatarLetter = user.firstName.charAt(0).toUpperCase();
    } else if (!avatarLetter && user.username) {
      avatarLetter = user.username.charAt(0).toUpperCase();
    } else if (!avatarLetter) {
      avatarLetter = 'У';
    }

    return {
      name,
      username: user.username || 'user',
      telegramId: user.telegramId?.toString() || '',
      totalPoints: stats.totalPoints || 0,
      avatarLetter,
      rankKey: stats.currentRank || 'beginner',
      city: user.city || '',
      bio: user.bio || '',
    };
  }

  async getLeaderboard(currentUserId?: string, limit: number = 100) {
    // Получаем всех пользователей с их статистикой
    const usersWithStats = await this.userStatsModel
      .find()
      .sort({ totalPoints: -1 })
      .limit(limit)
      .populate('userId')
      .lean();

    // Маппинг рангов с эмодзи роста
    const rankGrowth: Record<string, string> = {
      beginner: '🌱',
      observer: '🔎',
      active: '⚡',
      systemic: '🔄',
      architect: '🏗️',
      scaling: '🚀',
    };

    // Массивы для случайных эмодзи
    const streakEmojis = ['🔥', '⚡', '💫', '✨'];
    const energyEmojis = ['💪', '🎯', '⭐', '🌟'];

    const participants = usersWithStats.map((stat, index) => {
      const user = stat.userId as any;
      const firstName = user?.firstName || '';
      const lastName = user?.lastName || '';
      const username = user?.username || 'user';
      const name = [firstName, lastName].filter(Boolean).join(' ') || username;

      // Определяем ранг
      const rank = stat.currentRank || 'beginner';
      const rankTitles: Record<string, string> = {
        beginner: 'Начинающий',
        observer: 'Наблюдатель',
        active: 'Активный',
        systemic: 'Системный',
        architect: 'Архитектор',
        scaling: 'Масштабирующий',
      };

      // Вычисляем трофеи на основе очков
      const trophies = Math.max(3, Math.round(stat.totalPoints / 40));

      return {
        id: user?._id?.toString() || '',
        name,
        rank: rankTitles[rank] || 'Начинающий',
        rankIcon: rankGrowth[rank] || '🌱',
        points: stat.totalPoints || 0,
        trophies,
        streakEmoji: streakEmojis[index % streakEmojis.length],
        energyEmoji: energyEmojis[index % energyEmojis.length],
        growthEmoji: rankGrowth[rank] || '🌱',
        isYou: currentUserId ? user?._id?.toString() === currentUserId : false,
        position: index + 1,
        profilePath: `/profile/${user?._id}`,
      };
    });

    return participants;
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
        createdAt: (user as any).createdAt,
      },
      stats: stats || {},
      habits: habits.map((h) => ({
        id: h._id,
        name: h.title,
        emoji: h.emoji,
        note: h.note,
        streak: h.streak,
        bestStreak: h.bestStreak,
        totalDone: h.totalDone,
        createdAt: (h as any).createdAt,
      })),
      exportedAt: new Date().toISOString(),
    };
  }
}

