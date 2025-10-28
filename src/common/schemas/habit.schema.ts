import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitDocument = Habit & Document;

@Schema({ timestamps: true })
export class Habit {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, enum: ['daily', 'weekly'], default: 'daily' })
  cadence: 'daily' | 'weekly';

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  streak: number;

  @Prop({ type: [Date], default: [] })
  completedDates: Date[];
}

export const HabitSchema = SchemaFactory.createForClass(Habit);

// Индексы для оптимизации запросов
HabitSchema.index({ userId: 1, isActive: 1 });
HabitSchema.index({ createdAt: -1 });

