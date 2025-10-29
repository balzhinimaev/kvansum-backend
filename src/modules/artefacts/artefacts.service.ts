import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artefact, ArtefactDocument } from '../../common/schemas/artefact.schema';

@Injectable()
export class ArtefactsService {
  constructor(
    @InjectModel(Artefact.name) private artefactModel: Model<ArtefactDocument>,
  ) {}

  async findAll() {
    const artefacts = await this.artefactModel
      .find({ isActive: true })
      .sort({ createdAt: -1 });

    return {
      artefacts: artefacts.map((a) => ({
        id: a._id,
        title: a.title,
        emoji: a.emoji,
        tag: a.tag,
        description: a.description,
      })),
    };
  }

  async create(data: { title: string; emoji?: string; description?: string; tag?: string }) {
    const artefact = await this.artefactModel.create(data);

    return {
      id: artefact._id,
      title: artefact.title,
      emoji: artefact.emoji,
      tag: artefact.tag,
      description: artefact.description,
      isActive: artefact.isActive,
      createdAt: artefact.createdAt,
    };
  }
}

