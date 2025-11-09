import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  telegramId?: number;
  username?: string;
}

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

