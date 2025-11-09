import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { UserStats, UserStatsDocument } from '../../common/schemas/user-stats.schema';
import { JwtService } from '@nestjs/jwt';

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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserStats.name) private userStatsModel: Model<UserStatsDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * Валидация initData от Telegram Web App
   * Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
   */
  validateInitData(initData: string): ValidatedData {
    this.logger.log('[validateInitData] Starting validation...');
    this.logger.debug(`[validateInitData] Received initData: ${initData.substring(0, 100)}...`);
    
    const botToken = this.configService.get<string>('telegram.botToken');
    
    if (!botToken) {
      this.logger.error('[validateInitData] Telegram bot token is not configured');
      throw new UnauthorizedException('Telegram bot token is not configured');
    }

    // Парсим initData в объект
    const urlParams = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    const hash = urlParams.get('hash');

    if (!hash) {
      this.logger.error('[validateInitData] Hash is missing from initData');
      throw new UnauthorizedException('Hash is missing from initData');
    }

    // Собираем все параметры кроме hash
    urlParams.forEach((value, key) => {
      if (key !== 'hash') {
        data[key] = value;
      }
    });

    this.logger.debug(`[validateInitData] Parsed data keys: ${Object.keys(data).join(', ')}`);

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
      this.logger.error('[validateInitData] Invalid initData hash');
      this.logger.debug(`[validateInitData] Expected hash: ${calculatedHash}, received: ${hash}`);
      throw new UnauthorizedException('Invalid initData hash');
    }

    this.logger.log('[validateInitData] Hash validation successful');

    // Проверяем, что данные не устарели (не более 24 часов)
    const authDate = parseInt(data.auth_date || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 часа

    if (currentTime - authDate > maxAge) {
      this.logger.error(`[validateInitData] InitData expired. Auth date: ${authDate}, current: ${currentTime}`);
      throw new UnauthorizedException('InitData has expired');
    }

    // Парсим данные пользователя
    let user: TelegramUser;
    try {
      user = JSON.parse(data.user || '{}');
      this.logger.log(`[validateInitData] Parsed user data: ${JSON.stringify(user)}`);
    } catch (error) {
      this.logger.error('[validateInitData] Failed to parse user data', error);
      throw new UnauthorizedException('Invalid user data format');
    }

    if (!user.id) {
      this.logger.error('[validateInitData] User ID is missing');
      throw new UnauthorizedException('User ID is missing');
    }

    this.logger.log(`[validateInitData] Validation successful for user: ${user.id} (${user.username || 'no username'})`);

    return {
      ...data,
      user,
      auth_date: authDate,
      hash,
    };
  }

  /**
   * Авторизация пользователя через Telegram
   * Создает нового пользователя или возвращает существующего, а затем генерирует JWT
   */
  async authenticateWithTelegram(initData: string): Promise<{ accessToken: string; userId: string; telegramId: number }> {
    this.logger.log('=== [authenticateWithTelegram] START ===');
    
    // Валидируем initData
    const validatedData = this.validateInitData(initData);
    this.logger.debug(`[authenticateWithTelegram] validatedData keys: ${Object.keys(validatedData).join(', ')}`);
    this.logger.debug(`[authenticateWithTelegram] validatedData.user type: ${typeof validatedData.user}`);
    
    const telegramUser = validatedData.user;

    this.logger.log(`[authenticateWithTelegram] Telegram user data: ID=${telegramUser.id}, username=${telegramUser.username}, firstName=${telegramUser.first_name}`);

    // Ищем или создаем пользователя
    this.logger.log(`[authenticateWithTelegram] Looking for user with telegramId: ${telegramUser.id}`);
    let user = await this.userModel.findOne({ telegramId: telegramUser.id });

    if (!user) {
      this.logger.log('[authenticateWithTelegram] User NOT found - creating new user...');
      
      // Создаем нового пользователя
      user = await this.userModel.create({
        telegramId: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
      });

      this.logger.log(`[authenticateWithTelegram] ✅ New user created: ${user._id}`);

      // Создаем статистику для нового пользователя
      const stats = await this.userStatsModel.create({ 
        userId: user._id,
      });
      
      this.logger.log(`[authenticateWithTelegram] ✅ User stats created: ${stats._id}`);
    } else {
      this.logger.log(`[authenticateWithTelegram] User FOUND: ${user._id} - updating data...`);
      
      // Обновляем данные существующего пользователя
      const oldData = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      user.username = telegramUser.username || user.username;
      user.firstName = telegramUser.first_name || user.firstName;
      user.lastName = telegramUser.last_name || user.lastName;
      await user.save();

      this.logger.log(`[authenticateWithTelegram] ✅ User updated. Old: ${JSON.stringify(oldData)}, New: username=${user.username}, firstName=${user.firstName}`);
    }

    // Генерируем JWT токен
    const { accessToken } = await this.login(user);
    
    this.logger.log(`[authenticateWithTelegram] === END === Returning JWT token`);

    return { 
      accessToken, 
      userId: user._id.toString(), 
      telegramId: user.telegramId 
    };
  }

  /**
   * Генерация JWT токена для пользователя
   */
  async login(user: UserDocument): Promise<{ accessToken: string }> {
    const payload = { 
      sub: user._id.toString(), 
      telegramId: user.telegramId,
      username: user.username,
    };
    this.logger.log(`[login] Generating JWT for userId: ${payload.sub}`);
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  /**
   * Проверка существования пользователя по telegramId
   */
  async findUserByTelegramId(telegramId: number): Promise<UserDocument | null> {
    return this.userModel.findOne({ telegramId });
  }
}

