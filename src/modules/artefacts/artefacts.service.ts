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
        id: a.id,
        title: a.title,
        body: a.body,
        unlock: a.unlock,
      })),
    };
  }

  async create(data: { id: string; title: string; body: string; unlock: any }) {
    const artefact = await this.artefactModel.create(data);

    return {
      id: artefact.id,
      title: artefact.title,
      body: artefact.body,
      unlock: artefact.unlock,
      isActive: artefact.isActive,
      createdAt: artefact.createdAt,
    };
  }
}

