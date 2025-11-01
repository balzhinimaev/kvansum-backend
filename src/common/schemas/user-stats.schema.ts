import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserStatsDocument = UserStats & Document;

@Schema({ timestamps: true })
export class UserStats {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // Общая статистика
  @Prop({ type: Number, default: 0 })
  totalPoints: number;

  @Prop({ type: Number, default: 1 })
  currentLevel: number;

  @Prop({
    type: String,
    default: 'beginner',
    enum: ['beginner', 'observer', 'active', 'systemic', 'architect', 'scaling'],
  })
  currentRank: string;

  // Серии
  @Prop({ type: Number, default: 0 })
  longestStreak: number;

  @Prop({ type: Number, default: 0 })
  currentStreak: number;

  // История
  @Prop({ type: Number, default: 0 })
  totalHabits: number;

  @Prop({ type: Number, default: 0 })
  completedToday: number;

  @Prop({ type: Date, default: () => new Date() })
  lastActivityAt: Date;
}

export const UserStatsSchema = SchemaFactory.createForClass(UserStats);

// Индекс уже определен в @Prop decorator

