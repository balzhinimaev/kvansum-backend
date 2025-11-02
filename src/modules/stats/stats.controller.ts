import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Request } from 'express';

@ApiTags('stats')
@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Получить статистику для главной страницы' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика за сегодня и последние 7 дней, включая общие данные пользователя' 
  })
  getDashboard(@Req() req: Request) {
    return this.statsService.getDashboard(req.userId!);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Получить детальную статистику за неделю' })
  @ApiQuery({ name: 'week', required: false, description: 'Номер недели (опционально)', type: String })
  @ApiResponse({ status: 200, description: 'Детальная статистика за неделю' })
  getWeekly(@Req() req: Request, @Query() query: { week?: string }) {
    return this.statsService.getWeekly(req.userId!, query.week);
  }

  @Get('rank')
  @ApiOperation({ summary: 'Получить прогресс ранга и уровня пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Текущий ранг, уровень и прогресс до следующего уровня' 
  })
  getRank(@Req() req: Request) {
    return this.statsService.getRank(req.userId!);
  }
}

