import { Request } from 'express';
import { UserRole } from '../schemas';

export interface AuthenticatedUser {
  userId: string;
  telegramId?: number;
  username?: string;
  role: UserRole;
}

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

