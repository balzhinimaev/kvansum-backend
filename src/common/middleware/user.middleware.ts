import { Injectable, NestMiddleware, UnauthorizedException, Inject, forwardRef, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { UsersService } from '../../modules/users/users.service';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      telegramId?: number;
    }
  }
}

@Injectable()
export class UserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserMiddleware.name);

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const path = req.path;
    this.logger.log(`🔒 [UserMiddleware] ${req.method} ${path}`);

    // Для разработки можно использовать mock пользователя
    const nodeEnv = this.configService.get<string>('nodeEnv');
    
    // В режиме разработки можно использовать заголовок X-User-Id для тестирования
    if (nodeEnv === 'development') {
      const mockUserId = req.headers['x-user-id'] as string;
      if (mockUserId) {
        this.logger.log(`[UserMiddleware] Development mode - using mock userId: ${mockUserId}`);
        req.userId = mockUserId;
        next();
        return;
      }
    }

    // Проверяем наличие initData в заголовках
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      this.logger.warn(`[UserMiddleware] ❌ Missing X-Telegram-Init-Data header for ${path}`);
      throw new UnauthorizedException('Missing Telegram authentication data');
    }

    try {
      this.logger.log(`[UserMiddleware] Validating initData...`);
      
      // Валидируем initData
      const validatedData = this.validateInitData(initData);
      
      // Извлекаем telegramId из валидированных данных
      req.telegramId = validatedData.user.id;
      
      this.logger.log(`[UserMiddleware] Validated telegramId: ${req.telegramId}`);
      
      // Находим или создаем пользователя в БД
      const user = await this.usersService.findOrCreateByTelegramId(
        validatedData.user.id,
        {
          username: validatedData.user.username,
          firstName: validatedData.user.first_name,
          lastName: validatedData.user.last_name,
        }
      );
      
      // Устанавливаем userId для использования в контроллерах
      req.userId = user._id.toString();
      
      this.logger.log(`[UserMiddleware] ✅ User authorized: userId=${req.userId}, telegramId=${req.telegramId}`);
      
      next();
    } catch (error) {
      this.logger.error(`[UserMiddleware] ❌ Authentication failed: ${error.message}`);
      throw new UnauthorizedException('Invalid Telegram authentication data');
    }
  }

  private validateInitData(initData: string): { user: { id: number; [key: string]: any }; [key: string]: any } {
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
    let user: { id: number; [key: string]: any };
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
      auth_date: parseInt(data.auth_date || '0', 10),
      hash,
      ...data,
    };
  }
}

