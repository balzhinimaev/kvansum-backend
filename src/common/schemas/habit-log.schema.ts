import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitLogDocument = HabitLog & Document;

@Schema({ timestamps: true })
export class HabitLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true, index: true })
  habitId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date; // Дата выполнения (только дата, без времени)

  @Prop({
    required: true,
    enum: ['success', 'fail', 'pending', 'skipped'],
  })
  status: string;

  @Prop()
  note?: string;

  @Prop({ default: 0 })
  points: number;
}

export const HabitLogSchema = SchemaFactory.createForClass(HabitLog);

// Индексы для оптимизации запросов
HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });
HabitLogSchema.index({ userId: 1, date: 1 });
HabitLogSchema.index({ habitId: 1, date: -1 });

