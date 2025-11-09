import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Number, unique: true, sparse: true })
  telegramId?: number;

  @Prop({ type: String })
  username?: string;

  @Prop({ type: String })
  firstName?: string;

  @Prop({ type: String })
  lastName?: string;

  @Prop({ type: String, unique: true, sparse: true })
  email?: string;

  @Prop({ type: String })
  city?: string;

  @Prop({ type: String })
  bio?: string;

  @Prop({ type: String })
  avatarLetter?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Индексы уже определены в @Prop decorators с index: true

