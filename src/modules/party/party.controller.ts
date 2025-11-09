import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { PartyService } from './party.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { Request } from 'express';

@ApiTags('party')
@Controller('api/party')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую группу' })
  @ApiResponse({ status: 201, description: 'Группа успешно создана' })
  @ApiResponse({ status: 400, description: 'У пользователя уже есть группа' })
  @ApiBody({ type: CreatePartyDto })
  async createParty(@Req() req: Request, @Body() createPartyDto: CreatePartyDto) {
    return this.partyService.createParty(req.userId!, createPartyDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Получить мою группу' })
  @ApiResponse({ status: 200, description: 'Данные группы или null' })
  async getMyParty(@Req() req: Request) {
    return this.partyService.getMyParty(req.userId!);
  }

  @Get('available-users')
  @ApiOperation({ summary: 'Получить список пользователей для приглашения' })
  @ApiResponse({ status: 200, description: 'Список доступных пользователей' })
  async getAvailableUsers(@Req() req: Request) {
    return this.partyService.getAvailableUsers(req.userId!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить группу' })
  @ApiResponse({ status: 200, description: 'Группа успешно обновлена' })
  @ApiResponse({ status: 403, description: 'Только владелец может изменять группу' })
  @ApiResponse({ status: 404, description: 'Группа не найдена' })
  @ApiParam({ name: 'id', description: 'ID группы' })
  @ApiBody({ type: UpdatePartyDto })
  async updateParty(
    @Req() req: Request,
    @Param('id') partyId: string,
    @Body() updatePartyDto: UpdatePartyDto,
  ) {
    return this.partyService.updateParty(req.userId!, partyId, updatePartyDto);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Пригласить пользователя в группу' })
  @ApiResponse({ status: 200, description: 'Пользователь приглашен' })
  @ApiResponse({ status: 400, description: 'Некорректный запрос' })
  @ApiResponse({ status: 403, description: 'Только владелец может приглашать' })
  @ApiResponse({ status: 404, description: 'Группа или пользователь не найдены' })
  @ApiParam({ name: 'id', description: 'ID группы' })
  @ApiBody({ type: InviteUserDto })
  async inviteUser(
    @Req() req: Request,
    @Param('id') partyId: string,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    return this.partyService.inviteUser(req.userId!, partyId, inviteUserDto.userId);
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Принять приглашение в группу' })
  @ApiResponse({ status: 200, description: 'Приглашение принято' })
  @ApiResponse({ status: 400, description: 'Приглашение не найдено или группа заполнена' })
  @ApiResponse({ status: 404, description: 'Группа не найдена' })
  @ApiParam({ name: 'id', description: 'ID группы' })
  async acceptInvite(@Req() req: Request, @Param('id') partyId: string) {
    return this.partyService.acceptInvite(req.userId!, partyId);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Покинуть группу' })
  @ApiResponse({ status: 200, description: 'Вы покинули группу' })
  @ApiResponse({ status: 400, description: 'Владелец не может покинуть группу' })
  @ApiResponse({ status: 404, description: 'Группа не найдена' })
  @ApiParam({ name: 'id', description: 'ID группы' })
  async leaveParty(@Req() req: Request, @Param('id') partyId: string) {
    return this.partyService.leaveParty(req.userId!, partyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить группу' })
  @ApiResponse({ status: 200, description: 'Группа удалена' })
  @ApiResponse({ status: 403, description: 'Только владелец может удалить группу' })
  @ApiResponse({ status: 404, description: 'Группа не найдена' })
  @ApiParam({ name: 'id', description: 'ID группы' })
  async deleteParty(@Req() req: Request, @Param('id') partyId: string) {
    return this.partyService.deleteParty(req.userId!, partyId);
  }
}

