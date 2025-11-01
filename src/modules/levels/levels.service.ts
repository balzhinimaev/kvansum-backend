import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Level, LevelDocument } from '../../common/schemas/level.schema';

@Injectable()
export class LevelsService {
  constructor(
    @InjectModel(Level.name) private levelModel: Model<LevelDocument>,
  ) {}

  async findAll() {
    const levels = await this.levelModel.find().sort({ order: 1 }).exec();

    return {
      levels: levels.map((l) => ({
        id: l.id,
        order: l.order,
        title: l.title,
        description: l.description,
        emoji: l.emoji,
        nextLevelId: l.nextLevelId,
        unlockAfterDays: l.unlockAfterDays,
      })),
    };
  }

  async findById(id: string) {
    return await this.levelModel.findOne({ id }).exec();
  }

  async create(levelData: Partial<Level>) {
    const level = await this.levelModel.create(levelData);
    return {
      id: level.id,
      order: level.order,
      title: level.title,
      description: level.description,
      emoji: level.emoji,
      nextLevelId: level.nextLevelId,
      unlockAfterDays: level.unlockAfterDays,
    };
  }
}

