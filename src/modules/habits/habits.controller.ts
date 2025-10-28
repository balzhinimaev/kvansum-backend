import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHabitDto: CreateHabitDto) {
    // TODO: Получить userId из JWT токена
    const userId = '000000000000000000000001'; // Mock userId
    return this.habitsService.create(createHabitDto, userId);
  }

  @Get()
  findAll() {
    // TODO: Получить userId из JWT токена
    const userId = '000000000000000000000001'; // Mock userId
    return this.habitsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // TODO: Получить userId из JWT токена
    const userId = '000000000000000000000001'; // Mock userId
    return this.habitsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHabitDto: UpdateHabitDto) {
    // TODO: Получить userId из JWT токена
    const userId = '000000000000000000000001'; // Mock userId
    return this.habitsService.update(id, updateHabitDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    // TODO: Получить userId из JWT токена
    const userId = '000000000000000000000001'; // Mock userId
    return this.habitsService.remove(id, userId);
  }

  @Post(':id/complete')
  markComplete(@Param('id') id: string) {
    // TODO: Получить userId из JWT токена
    const userId = '000000000000000000000001'; // Mock userId
    return this.habitsService.markComplete(id, userId, new Date());
  }
}

