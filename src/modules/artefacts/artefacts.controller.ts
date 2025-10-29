import { Controller, Get, Post, Body } from '@nestjs/common';
import { ArtefactsService } from './artefacts.service';

@Controller('api/artefacts')
export class ArtefactsController {
  constructor(private readonly artefactsService: ArtefactsService) {}

  @Get()
  findAll() {
    return this.artefactsService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      emoji?: string;
      description?: string;
      tag?: string;
    },
  ) {
    // В продакшене здесь должна быть проверка на admin роль
    return this.artefactsService.create(body);
  }
}

