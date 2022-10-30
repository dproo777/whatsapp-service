import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { SendMessageDto } from './dto'
import { FindOneParamsDto } from '../persons/dto'
import { Session } from '../decorators'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(@Session() sessionId: string) {
    return this.groupsService.findAll(sessionId)
  }

  @Get(':jid')
  findOne(
    @Session() sessionId: string,
    @Param('jid') jid: string,
    @Query() findOneParamsDto: FindOneParamsDto,
  ) {
    return this.groupsService.findOne(sessionId, jid, findOneParamsDto)
  }

  @Post('send-message')
  sendMessage(
    @Session() sessionId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.groupsService.sendMessage(sessionId, sendMessageDto)
  }
}
