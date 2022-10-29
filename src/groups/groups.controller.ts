import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Query,
  Session,
} from '@nestjs/common'
import { GroupsService } from './groups.service'
import { SendMessageDto } from './dto'
import { FindOneParamsDto } from '../chats/dto'

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
