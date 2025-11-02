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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateHabitLogDto, GetHabitLogsQueryDto } from './dto/habit-log.dto';
import { Request } from 'express';

@ApiTags('habits')
@Controller('api/habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все активные привычки пользователя' })
  @ApiResponse({ status: 200, description: 'Список привычек успешно получен' })
  findAll(@Req() req: Request) {
    return this.habitsService.findAll(req.userId!);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать новую привычку' })
  @ApiResponse({ status: 201, description: 'Привычка успешно создана' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiBody({ type: CreateHabitDto })
  create(@Body() createHabitDto: CreateHabitDto, @Req() req: Request) {
    return this.habitsService.create(createHabitDto, req.userId!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить привычку' })
  @ApiParam({ name: 'id', description: 'ID привычки' })
  @ApiResponse({ status: 200, description: 'Привычка успешно обновлена' })
  @ApiResponse({ status: 404, description: 'Привычка не найдена' })
  @ApiBody({ type: UpdateHabitDto })
  update(
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
    @Req() req: Request,
  ) {
    return this.habitsService.update(id, updateHabitDto, req.userId!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить (архивировать) привычку' })
  @ApiParam({ name: 'id', description: 'ID привычки' })
  @ApiResponse({ status: 200, description: 'Привычка успешно удалена' })
  @ApiResponse({ status: 404, description: 'Привычка не найдена' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.habitsService.remove(id, req.userId!);
  }

  @Post(':id/log')
  @ApiOperation({ summary: 'Отметить выполнение привычки' })
  @ApiParam({ name: 'id', description: 'ID привычки' })
  @ApiResponse({ status: 200, description: 'Выполнение успешно зафиксировано' })
  @ApiResponse({ status: 404, description: 'Привычка не найдена' })
  @ApiBody({ type: CreateHabitLogDto })
  createLog(
    @Param('id') id: string,
    @Body() createLogDto: CreateHabitLogDto,
    @Req() req: Request,
  ) {
    return this.habitsService.createLog(id, createLogDto, req.userId!);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Получить историю выполнения привычки' })
  @ApiParam({ name: 'id', description: 'ID привычки' })
  @ApiResponse({ status: 200, description: 'История успешно получена' })
  @ApiResponse({ status: 404, description: 'Привычка не найдена' })
  getLogs(
    @Param('id') id: string,
    @Query() query: GetHabitLogsQueryDto,
    @Req() req: Request,
  ) {
    return this.habitsService.getLogs(id, req.userId!, query);
  }
}

