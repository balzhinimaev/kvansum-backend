import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { UserStats, UserStatsDocument } from '../../common/schemas/user-stats.schema';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface ValidatedData {
  user: TelegramUser;
  auth_date: number;
  hash: string;
  [key: string]: any;
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserStats.name) private userStatsModel: Model<UserStatsDocument>,
  ) {}

  /**
   * Валидация initData от Telegram Web App
   * Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
   */
  validateInitData(initData: string): ValidatedData {
    const botToken = this.configService.get<string>('telegram.botToken');
    
    if (!botToken) {
      throw new UnauthorizedException('Telegram bot token is not configured');
    }

    // Парсим initData в объект
    const urlParams = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    const hash = urlParams.get('hash');

    if (!hash) {
      throw new UnauthorizedException('Hash is missing from initData');
    }

    // Собираем все параметры кроме hash
    urlParams.forEach((value, key) => {
      if (key !== 'hash') {
        data[key] = value;
      }
    });

    // Сортируем ключи и создаем строку data-check-string
    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    // Создаем секретный ключ из bot token
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();

    // Вычисляем hash
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Сравниваем хэши
    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Invalid initData hash');
    }

    // Проверяем, что данные не устарели (не более 24 часов)
    const authDate = parseInt(data.auth_date || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 часа

    if (currentTime - authDate > maxAge) {
      throw new UnauthorizedException('InitData has expired');
    }

    // Парсим данные пользователя
    let user: TelegramUser;
    try {
      user = JSON.parse(data.user || '{}');
    } catch (error) {
      throw new UnauthorizedException('Invalid user data format');
    }

    if (!user.id) {
      throw new UnauthorizedException('User ID is missing');
    }

    return {
      user,
      auth_date: authDate,
      hash,
      ...data,
    };
  }

  /**
   * Авторизация пользователя через Telegram
   * Создает нового пользователя или возвращает существующего
   */
  async authenticateWithTelegram(initData: string) {
    // Валидируем initData
    const validatedData = this.validateInitData(initData);
    const telegramUser = validatedData.user;

    // Ищем или создаем пользователя
    let user = await this.userModel.findOne({ telegramId: telegramUser.id });

    if (!user) {
      // Создаем нового пользователя
      user = await this.userModel.create({
        telegramId: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
      });

      // Создаем статистику для нового пользователя
      await this.userStatsModel.create({ 
        userId: user._id,
      });
    } else {
      // Обновляем данные существующего пользователя
      user.username = telegramUser.username || user.username;
      user.firstName = telegramUser.first_name || user.firstName;
      user.lastName = telegramUser.last_name || user.lastName;
      await user.save();
    }

    return {
      userId: user._id.toString(),
      telegramId: user.telegramId!,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: telegramUser.photo_url,
    };
  }

  /**
   * Проверка существования пользователя по telegramId
   */
  async findUserByTelegramId(telegramId: number): Promise<UserDocument | null> {
    return this.userModel.findOne({ telegramId });
  }
}

