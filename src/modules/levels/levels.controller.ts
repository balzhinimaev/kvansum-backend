import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LevelsService } from './levels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('levels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все уровни прогрессии' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список всех уровней (lvl1-lvl7) с описаниями и условиями разблокировки' 
  })
  findAll() {
    return this.levelsService.findAll();
  }
}

