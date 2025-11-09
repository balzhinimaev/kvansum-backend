import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Party, PartyDocument, PartyMember } from '../../common/schemas/party.schema';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';

@Injectable()
export class PartyService {
  constructor(
    @InjectModel(Party.name) private partyModel: Model<PartyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createParty(userId: string, createPartyDto: CreatePartyDto): Promise<PartyDocument> {
    // Проверяем, нет ли уже группы у этого пользователя
    const existingParty = await this.partyModel.findOne({ ownerId: new Types.ObjectId(userId) });
    if (existingParty) {
      throw new BadRequestException('У вас уже есть группа');
    }

    // Получаем данные пользователя
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const ownerName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Владелец';

    // Создаем группу с владельцем в участниках
    const party = await this.partyModel.create({
      name: createPartyDto.name,
      ownerId: new Types.ObjectId(userId),
      members: [
        {
          id: new Types.ObjectId(userId),
          name: ownerName,
        },
      ],
      invites: [],
    });

    return party;
  }

  async getMyParty(userId: string) {
    // Ищем группу, где пользователь владелец или участник
    const party = await this.partyModel.findOne({
      $or: [
        { ownerId: new Types.ObjectId(userId) },
        { 'members.id': new Types.ObjectId(userId) },
      ],
    });

    if (!party) {
      return null;
    }

    return {
      id: party._id.toString(),
      name: party.name,
      ownerId: party.ownerId.toString(),
      members: party.members.map((m) => ({
        id: m.id.toString(),
        name: m.name,
      })),
      invites: party.invites.map((i) => ({
        id: i.id.toString(),
        name: i.name,
      })),
    };
  }

  async updateParty(userId: string, partyId: string, updatePartyDto: UpdatePartyDto) {
    const party = await this.partyModel.findById(partyId);

    if (!party) {
      throw new NotFoundException('Группа не найдена');
    }

    if (party.ownerId.toString() !== userId) {
      throw new ForbiddenException('Только владелец может изменять группу');
    }

    party.name = updatePartyDto.name || party.name;
    await party.save();

    return {
      id: party._id.toString(),
      name: party.name,
      ownerId: party.ownerId.toString(),
      members: party.members.map((m) => ({
        id: m.id.toString(),
        name: m.name,
      })),
      invites: party.invites.map((i) => ({
        id: i.id.toString(),
        name: i.name,
      })),
    };
  }

  async inviteUser(userId: string, partyId: string, targetUserId: string) {
    const party = await this.partyModel.findById(partyId);

    if (!party) {
      throw new NotFoundException('Группа не найдена');
    }

    if (party.ownerId.toString() !== userId) {
      throw new ForbiddenException('Только владелец может приглашать участников');
    }

    // Проверяем лимит участников
    if (party.members.length >= party.maxMembers) {
      throw new BadRequestException('Достигнут лимит участников группы');
    }

    // Проверяем, не является ли пользователь уже участником
    const isAlreadyMember = party.members.some((m) => m.id.toString() === targetUserId);
    if (isAlreadyMember) {
      throw new BadRequestException('Пользователь уже является участником группы');
    }

    // Проверяем, не приглашен ли уже
    const isAlreadyInvited = party.invites.some((i) => i.id.toString() === targetUserId);
    if (isAlreadyInvited) {
      throw new BadRequestException('Пользователь уже приглашен');
    }

    // Получаем данные пользователя
    const targetUser = await this.userModel.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Пользователь для приглашения не найден');
    }

    const targetUserName = [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ') || targetUser.username || 'Пользователь';

    // Добавляем приглашение
    party.invites.push({
      id: new Types.ObjectId(targetUserId),
      name: targetUserName,
      invitedAt: new Date(),
    });

    await party.save();

    return {
      id: party._id.toString(),
      name: party.name,
      ownerId: party.ownerId.toString(),
      members: party.members.map((m) => ({
        id: m.id.toString(),
        name: m.name,
      })),
      invites: party.invites.map((i) => ({
        id: i.id.toString(),
        name: i.name,
      })),
    };
  }

  async acceptInvite(userId: string, partyId: string) {
    const party = await this.partyModel.findById(partyId);

    if (!party) {
      throw new NotFoundException('Группа не найдена');
    }

    // Проверяем, есть ли приглашение
    const inviteIndex = party.invites.findIndex((i) => i.id.toString() === userId);
    if (inviteIndex === -1) {
      throw new BadRequestException('Приглашение не найдено');
    }

    // Проверяем лимит
    if (party.members.length >= party.maxMembers) {
      throw new BadRequestException('Группа заполнена');
    }

    // Получаем данные пользователя
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Пользователь';

    // Добавляем в участники
    party.members.push({
      id: new Types.ObjectId(userId),
      name: userName,
    });

    // Удаляем приглашение
    party.invites.splice(inviteIndex, 1);

    await party.save();

    return {
      id: party._id.toString(),
      name: party.name,
      ownerId: party.ownerId.toString(),
      members: party.members.map((m) => ({
        id: m.id.toString(),
        name: m.name,
      })),
      invites: party.invites.map((i) => ({
        id: i.id.toString(),
        name: i.name,
      })),
    };
  }

  async leaveParty(userId: string, partyId: string) {
    const party = await this.partyModel.findById(partyId);

    if (!party) {
      throw new NotFoundException('Группа не найдена');
    }

    // Владелец не может покинуть группу
    if (party.ownerId.toString() === userId) {
      throw new BadRequestException('Владелец не может покинуть группу. Удалите группу или передайте владение.');
    }

    // Удаляем из участников
    const memberIndex = party.members.findIndex((m) => m.id.toString() === userId);
    if (memberIndex === -1) {
      throw new BadRequestException('Вы не являетесь участником группы');
    }

    party.members.splice(memberIndex, 1);
    await party.save();

    return { message: 'Вы покинули группу' };
  }

  async deleteParty(userId: string, partyId: string) {
    const party = await this.partyModel.findById(partyId);

    if (!party) {
      throw new NotFoundException('Группа не найдена');
    }

    if (party.ownerId.toString() !== userId) {
      throw new ForbiddenException('Только владелец может удалить группу');
    }

    await this.partyModel.findByIdAndDelete(partyId);

    return { message: 'Группа удалена' };
  }

  async getAvailableUsers(userId: string, limit: number = 50) {
    // Получаем всех пользователей кроме текущего
    const users = await this.userModel
      .find({ _id: { $ne: new Types.ObjectId(userId) } })
      .limit(limit)
      .lean();

    return users.map((user) => ({
      id: user._id.toString(),
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Пользователь',
    }));
  }
}

