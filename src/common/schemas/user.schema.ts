import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true })
  telegramId?: number;

  @Prop()
  username?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ unique: true, sparse: true })
  email?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Индексы
UserSchema.index({ telegramId: 1 });
UserSchema.index({ email: 1 });

