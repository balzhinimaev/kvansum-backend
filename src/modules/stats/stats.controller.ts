import { Controller, Get, Query, Req } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Request } from 'express';

@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  getDashboard(@Req() req: Request) {
    return this.statsService.getDashboard(req.userId!);
  }

  @Get('weekly')
  getWeekly(@Req() req: Request, @Query('week') week?: string) {
    return this.statsService.getWeekly(req.userId!, week);
  }

  @Get('rank')
  getRank(@Req() req: Request) {
    return this.statsService.getRank(req.userId!);
  }
}

