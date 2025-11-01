import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitLogDocument = HabitLog & Document;

@Schema({ timestamps: true })
export class HabitLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true })
  habitId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date; // Дата выполнения (только дата, без времени)

  @Prop({
    type: String,
    required: true,
    enum: ['success', 'fail', 'pending', 'skipped'],
  })
  status: string;

  @Prop({ type: String })
  note?: string;

  @Prop({ type: Number, default: 0 })
  points: number;
}

export const HabitLogSchema = SchemaFactory.createForClass(HabitLog);

// Индексы для оптимизации запросов
HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });
HabitLogSchema.index({ userId: 1, date: 1 });
HabitLogSchema.index({ habitId: 1, date: -1 });

