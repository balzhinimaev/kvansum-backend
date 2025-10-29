import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Thought, ThoughtDocument } from '../../common/schemas/thought.schema';

@Injectable()
export class ThoughtsService {
  constructor(
    @InjectModel(Thought.name) private thoughtModel: Model<ThoughtDocument>,
  ) {}

  async getThoughtOfTheDay() {
    // Получаем все активные мысли
    const thoughts = await this.thoughtModel.find({ isActive: true });

    if (thoughts.length === 0) {
      return {
        thought: {
          id: 'default',
          quote: 'Каждый день - это новая возможность стать лучше.',
          author: 'Kvansum',
        },
      };
    }

    // Детерминированный выбор мысли на основе даты
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const index = dayOfYear % thoughts.length;

    const thought = thoughts[index];

    return {
      thought: {
        id: thought._id,
        quote: thought.quote,
        author: thought.author,
      },
    };
  }

  async findAll() {
    const thoughts = await this.thoughtModel.find().sort({ order: 1, createdAt: -1 });

    return {
      thoughts: thoughts.map((t) => ({
        id: t._id,
        quote: t.quote,
        author: t.author,
        isActive: t.isActive,
        order: t.order,
        createdAt: t.createdAt,
      })),
    };
  }

  async create(quote: string, author?: string) {
    const thought = await this.thoughtModel.create({ quote, author });

    return {
      id: thought._id,
      quote: thought.quote,
      author: thought.author,
      isActive: thought.isActive,
      order: thought.order,
      createdAt: thought.createdAt,
    };
  }
}

