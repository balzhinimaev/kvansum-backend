import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PartyDocument = Party & Document;

// Схема для участника группы
@Schema({ _id: false })
export class PartyMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;
}

const PartyMemberSchema = SchemaFactory.createForClass(PartyMember);

// Схема для приглашения в группу
@Schema({ _id: false })
export class PartyInvite {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Date, default: () => new Date() })
  invitedAt: Date;
}

const PartyInviteSchema = SchemaFactory.createForClass(PartyInvite);

// Основная схема группы
@Schema({ timestamps: true })
export class Party {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: [PartyMemberSchema], default: [] })
  members: PartyMember[];

  @Prop({ type: [PartyInviteSchema], default: [] })
  invites: PartyInvite[];

  @Prop({ type: Number, default: 10 })
  maxMembers: number;
}

export const PartySchema = SchemaFactory.createForClass(Party);

// Индексы
PartySchema.index({ ownerId: 1 });
PartySchema.index({ 'members.id': 1 });

