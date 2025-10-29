import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateHabitLogDto, GetHabitLogsQueryDto } from './dto/habit-log.dto';
import { Request } from 'express';

@Controller('api/habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.habitsService.findAll(req.userId!);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHabitDto: CreateHabitDto, @Req() req: Request) {
    return this.habitsService.create(createHabitDto, req.userId!);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
    @Req() req: Request,
  ) {
    return this.habitsService.update(id, updateHabitDto, req.userId!);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.habitsService.remove(id, req.userId!);
  }

  @Post(':id/log')
  createLog(
    @Param('id') id: string,
    @Body() createLogDto: CreateHabitLogDto,
    @Req() req: Request,
  ) {
    return this.habitsService.createLog(id, createLogDto, req.userId!);
  }

  @Get(':id/logs')
  getLogs(
    @Param('id') id: string,
    @Query() query: GetHabitLogsQueryDto,
    @Req() req: Request,
  ) {
    return this.habitsService.getLogs(id, req.userId!, query);
  }
}

