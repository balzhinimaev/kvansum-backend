import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

@Injectable()
export class UserMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Mock для разработки - всегда используем тестового пользователя
    // В продакшене здесь будет проверка Telegram Mini App initData
    req.userId = 'test-user-1';
    next();
  }
}

