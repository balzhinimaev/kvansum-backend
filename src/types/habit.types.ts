/**
 * Общие типы для модуля Habits
 */

export interface HabitDto {
  id: string;
  title: string;
  description?: string;
  cadence: 'daily' | 'weekly';
}

// Добавьте другие типы по мере необходимости
export type HabitCadence = 'daily' | 'weekly';

