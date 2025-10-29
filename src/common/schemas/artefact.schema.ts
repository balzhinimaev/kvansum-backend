import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArtefactDocument = Artefact & Document;

@Schema({ timestamps: true })
export class Artefact {
  @Prop({ required: true })
  title: string;

  @Prop()
  emoji?: string;

  @Prop()
  description?: string;

  @Prop({ enum: ['рефлексия', 'трекер', 'диагностика'] })
  tag?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ArtefactSchema = SchemaFactory.createForClass(Artefact);

// Индексы
ArtefactSchema.index({ isActive: 1 });

