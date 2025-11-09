import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ArtefactsService } from './artefacts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/schemas';

@ApiTags('artefacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/artefacts')
export class ArtefactsController {
  constructor(private readonly artefactsService: ArtefactsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список активных артефактов' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список артефактов с условиями разблокировки' 
  })
  findAll() {
    return this.artefactsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый артефакт (admin)' })
  @ApiResponse({ status: 201, description: 'Артефакт успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['id', 'title', 'body', 'unlock'],
      properties: {
        id: { type: 'string', example: 'art-custom-1' },
        title: { type: 'string', example: 'Название артефакта' },
        body: { type: 'string', example: 'Подробное описание артефакта' },
        unlock: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['habit_stage', 'level_progress'], example: 'habit_stage' },
            habitId: { type: 'string', example: 'h-water' },
            days: { type: 'number', example: 21 },
            levelId: { type: 'string', example: 'lvl1' },
            threshold: { type: 'number', example: 0.3 },
          },
        },
      },
    },
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body()
    body: {
      id: string;
      title: string;
      body: string;
      unlock: any;
    },
  ) {
    return this.artefactsService.create(body);
  }
}

