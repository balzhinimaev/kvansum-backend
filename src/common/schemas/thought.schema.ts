import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ThoughtDocument = Thought & Document;

@Schema({ timestamps: true })
export class Thought {
  @Prop({ required: true })
  quote: string;

  @Prop()
  author?: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const ThoughtSchema = SchemaFactory.createForClass(Thought);

// Индексы
ThoughtSchema.index({ isActive: 1 });

