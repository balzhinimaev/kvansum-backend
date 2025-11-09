import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ThoughtsService } from './thoughts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('thoughts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/thoughts')
export class ThoughtsController {
  constructor(private readonly thoughtsService: ThoughtsService) {}

  @Get('today')
  @ApiOperation({ summary: 'Получить мысль дня' })
  @ApiResponse({ 
    status: 200, 
    description: 'Детерминированная мысль дня на основе текущей даты' 
  })
  getThoughtOfTheDay() {
    return this.thoughtsService.getThoughtOfTheDay();
  }

  @Get()
  @ApiOperation({ summary: 'Получить все мысли (admin)' })
  @ApiResponse({ status: 200, description: 'Полный список мыслей' })
  findAll() {
    // В продакшене здесь должна быть проверка на admin роль
    return this.thoughtsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Создать новую мысль (admin)' })
  @ApiResponse({ status: 201, description: 'Мысль успешно создана' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['quote'],
      properties: {
        quote: { type: 'string', example: 'Путь в тысячу ли начинается с первого шага' },
        author: { type: 'string', example: 'Лао-цзы' },
      },
    },
  })
  create(@Body() body: { quote: string; author?: string }) {
    // В продакшене здесь должна быть проверка на admin роль
    return this.thoughtsService.create(body.quote, body.author);
  }
}

