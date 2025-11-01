import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ThoughtDocument = Thought & Document;

@Schema({ timestamps: true })
export class Thought {
  @Prop({ type: String, required: true })
  quote: string;

  @Prop({ type: String })
  author?: string;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;
}

export const ThoughtSchema = SchemaFactory.createForClass(Thought);

// Индекс уже определен в @Prop decorator с index: true

