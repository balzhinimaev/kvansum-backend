import { Controller, Get, Post, Body } from '@nestjs/common';
import { ThoughtsService } from './thoughts.service';

@Controller('api/thoughts')
export class ThoughtsController {
  constructor(private readonly thoughtsService: ThoughtsService) {}

  @Get('today')
  getThoughtOfTheDay() {
    return this.thoughtsService.getThoughtOfTheDay();
  }

  @Get()
  findAll() {
    // В продакшене здесь должна быть проверка на admin роль
    return this.thoughtsService.findAll();
  }

  @Post()
  create(@Body() body: { quote: string; author?: string }) {
    // В продакшене здесь должна быть проверка на admin роль
    return this.thoughtsService.create(body.quote, body.author);
  }
}

