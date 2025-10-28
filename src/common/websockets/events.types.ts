/**
 * WebSocket события для модуля Habits
 */

export interface HabitCreatedEvent {
  type: 'habit:created';
  data: {
    habitId: string;
    userId: string;
    title: string;
    timestamp: string;
  };
}

export interface HabitCompletedEvent {
  type: 'habit:completed';
  data: {
    habitId: string;
    userId: string;
    completedAt: string;
    streak: number;
  };
}

export interface HabitUpdatedEvent {
  type: 'habit:updated';
  data: {
    habitId: string;
    userId: string;
    changes: Record<string, any>;
    timestamp: string;
  };
}

export interface HabitDeletedEvent {
  type: 'habit:deleted';
  data: {
    habitId: string;
    userId: string;
    timestamp: string;
  };
}

/**
 * Все типы WebSocket событий
 */
export type WebSocketEvent =
  | HabitCreatedEvent
  | HabitCompletedEvent
  | HabitUpdatedEvent
  | HabitDeletedEvent;

/**
 * Типы событий для подписки
 */
export enum WebSocketEventType {
  HABIT_CREATED = 'habit:created',
  HABIT_COMPLETED = 'habit:completed',
  HABIT_UPDATED = 'habit:updated',
  HABIT_DELETED = 'habit:deleted',
  
  // Общие события
  NOTIFICATION = 'notification',
  USER_CONNECTED = 'user:connected',
  USER_DISCONNECTED = 'user:disconnected',
}

