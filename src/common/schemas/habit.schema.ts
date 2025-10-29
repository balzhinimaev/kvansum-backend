import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitDocument = Habit & Document;

@Schema({ timestamps: true })
export class Habit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  // Основные поля
  @Prop({ required: true })
  name: string;

  @Prop()
  emoji?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  note?: string;

  // Настройки
  @Prop()
  time?: string; // "HH:mm" формат

  @Prop({ enum: ['Легкая', 'Средняя', 'Сложная'] })
  difficulty?: string;

  @Prop({ enum: ['Утро', 'День', 'Вечер', 'Итоги дня'] })
  period?: string;

  // Статистика
  @Prop({ default: 0 })
  streak: number;

  @Prop({ default: 0 })
  bestStreak: number;

  @Prop({ default: 0 })
  totalDone: number;

  // Порядок и состояние
  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isArchived: boolean;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);

// Индексы для оптимизации запросов
HabitSchema.index({ userId: 1, isActive: 1 });
HabitSchema.index({ userId: 1 });

