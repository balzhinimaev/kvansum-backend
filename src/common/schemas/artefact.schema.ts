import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArtefactDocument = Artefact & Document;

export type ArtifactUnlock = 
  | { type: 'habit_stage'; habitId: string; days: number }
  | { type: 'level_progress'; levelId: string; threshold: number };

@Schema({ timestamps: true })
export class Artefact {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({ type: Object, required: true })
  unlock: ArtifactUnlock;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ArtefactSchema = SchemaFactory.createForClass(Artefact);

// Индекс на isActive (id уже unique в @Prop)
ArtefactSchema.index({ isActive: 1 });

