import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserStatsDocument = UserStats & Document;

@Schema({ timestamps: true })
export class UserStats {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // Общая статистика
  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 1 })
  currentLevel: number;

  @Prop({
    default: 'beginner',
    enum: ['beginner', 'observer', 'active', 'systemic', 'architect', 'scaling'],
  })
  currentRank: string;

  // Серии
  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ default: 0 })
  currentStreak: number;

  // История
  @Prop({ default: 0 })
  totalHabits: number;

  @Prop({ default: 0 })
  completedToday: number;

  @Prop({ default: () => new Date() })
  lastActivityAt: Date;
}

export const UserStatsSchema = SchemaFactory.createForClass(UserStats);

// Индексы
UserStatsSchema.index({ userId: 1 });

