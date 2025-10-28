import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: 'user' | 'admin';

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  telegramData?: {
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };

  @Prop({ type: Object })
  billingInfo?: {
    plan: 'free' | 'premium';
    subscriptionEnd?: Date;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Индексы
UserSchema.index({ email: 1 });
UserSchema.index({ 'telegramData.telegramId': 1 });

