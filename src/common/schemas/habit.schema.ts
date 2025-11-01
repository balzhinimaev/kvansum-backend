import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitDocument = Habit & Document;

interface HabitStage {
  days: number;
  title: string;
  description: string;
}

@Schema({ timestamps: true })
export class Habit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // Основные поля
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  emoji?: string;

  @Prop({ type: String })
  imageUrl?: string;

  @Prop({ type: String })
  summary?: string;

  @Prop({ type: String })
  note?: string; // Дополнительная заметка пользователя

  // Настройки привычки из фронтенда
  @Prop({ type: String, required: true })
  levelId: string; // lvl1, lvl2, etc.

  @Prop({ type: String, enum: ['easy', 'medium', 'hard'] })
  difficulty?: string;

  @Prop({ type: String, enum: ['morning', 'day', 'evening', 'summary'] })
  timeOfDay?: string;

  @Prop({ type: [String], default: ['daily'] })
  days: string[]; // ['daily'] или ['mon', 'wed', 'fri']

  @Prop({ type: [Object], default: [] })
  stages: HabitStage[]; // Этапы привычки

  // Старые поля для обратной совместимости
  @Prop({ type: String })
  time?: string; // "HH:mm" формат

  @Prop({ type: String, enum: ['Легкая', 'Средняя', 'Сложная', 'easy', 'medium', 'hard'] })
  difficultyLegacy?: string;

  @Prop({ type: String, enum: ['Утро', 'День', 'Вечер', 'Итоги дня'] })
  period?: string;

  // Статистика
  @Prop({ type: Number, default: 0 })
  streak: number;

  @Prop({ type: Number, default: 0 })
  bestStreak: number;

  @Prop({ type: Number, default: 0 })
  totalDone: number;

  // Порядок и состояние
  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isArchived: boolean;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);

// Индексы для оптимизации запросов (userId уже имеет index в @Prop)
HabitSchema.index({ userId: 1, isActive: 1 });
HabitSchema.index({ userId: 1, levelId: 1 });

