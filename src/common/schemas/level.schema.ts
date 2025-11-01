import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LevelDocument = Level & Document;

@Schema({ timestamps: true })
export class Level {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  emoji: string;

  @Prop({ type: String })
  nextLevelId?: string;

  @Prop({ type: Number })
  unlockAfterDays?: number;
}

export const LevelSchema = SchemaFactory.createForClass(Level);

// Индексы для оптимизации запросов (id уже unique в @Prop)
LevelSchema.index({ order: 1 });

