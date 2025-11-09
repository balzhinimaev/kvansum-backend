import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Получить статистику для главной страницы' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика за сегодня и последние 7 дней, включая общие данные пользователя' 
  })
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.statsService.getDashboard(user.userId);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Получить детальную статистику за неделю' })
  @ApiQuery({ name: 'week', required: false, description: 'Номер недели (опционально)', type: String })
  @ApiResponse({ status: 200, description: 'Детальная статистика за неделю' })
  getWeekly(@CurrentUser() user: AuthenticatedUser, @Query() query: { week?: string }) {
    return this.statsService.getWeekly(user.userId, query.week);
  }

  @Get('rank')
  @ApiOperation({ summary: 'Получить прогресс ранга и уровня пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Текущий ранг, уровень и прогресс до следующего уровня' 
  })
  getRank(@CurrentUser() user: AuthenticatedUser) {
    return this.statsService.getRank(user.userId);
  }
}

