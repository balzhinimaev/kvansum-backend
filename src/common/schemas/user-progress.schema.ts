import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProgressDocument = UserProgress & Document;

@Schema({ timestamps: true })
export class UserProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // Статус выполнения по датам: { "2025-10-29": { "h-water": "success", "h-bed": "fail" } }
  @Prop({ type: Map, of: Object, default: {} })
  completionByDate: Map<string, Record<string, string>>;

  // Серии (стрики) по привычкам: { "h-water": 18, "h-bed": 12 }
  @Prop({ type: Map, of: Number, default: {} })
  habitStreak: Map<string, number>;

  // Даты разблокировки уровней: { "lvl1": "2025-09-01", "lvl2": undefined }
  @Prop({ type: Map, of: String, default: {} })
  levelUnlockedAt: Map<string, string | undefined>;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);

// Индексы
UserProgressSchema.index({ userId: 1 }, { unique: true });

