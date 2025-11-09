import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateHabitLogDto, GetHabitLogsQueryDto } from './dto/habit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@ApiTags('habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все активные привычки пользователя' })
  @ApiResponse({ status: 200, description: 'Список привычек успешно получен' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.habitsService.findAll(user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать новую привычку' })
  @ApiResponse({ status: 201, description: 'Привычка успешно создана' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiBody({ type: CreateHabitDto })
  create(@Body() createHabitDto: CreateHabitDto, @CurrentUser() user: AuthenticatedUser) {
    return this.habitsService.create(createHabitDto, user.userId);
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
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.habitsService.update(id, updateHabitDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить (архивировать) привычку' })
  @ApiParam({ name: 'id', description: 'ID привычки' })
  @ApiResponse({ status: 200, description: 'Привычка успешно удалена' })
  @ApiResponse({ status: 404, description: 'Привычка не найдена' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.habitsService.remove(id, user.userId);
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
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.habitsService.createLog(id, createLogDto, user.userId);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Получить историю выполнения привычки' })
  @ApiParam({ name: 'id', description: 'ID привычки' })
  @ApiQuery({ name: 'from', required: false, description: 'Начальная дата (YYYY-MM-DD)', type: String })
  @ApiQuery({ name: 'to', required: false, description: 'Конечная дата (YYYY-MM-DD)', type: String })
  @ApiQuery({ name: 'limit', required: false, description: 'Лимит записей', type: Number })
  @ApiResponse({ status: 200, description: 'История успешно получена' })
  @ApiResponse({ status: 404, description: 'Привычка не найдена' })
  getLogs(
    @Param('id') id: string,
    @Query() query: GetHabitLogsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.habitsService.getLogs(id, user.userId, query);
  }
}

