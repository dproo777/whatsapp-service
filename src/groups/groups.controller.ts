import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { SendMessageDto } from './dto'
import { Session } from '../common/decorators'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(@Session() sessionId: string) {
    return this.groupsService.findAll(sessionId)
  }

  @Post('send-message')
  sendMessage(
    @Session() sessionId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.groupsService.sendMessage(sessionId, sendMessageDto)
  }

  @Post('send-messages')
  sendMessages(
    @Session() sessionId: string,
    @Body(new ParseArrayPipe({ items: SendMessageDto }))
    sendMessageDtos: SendMessageDto[],
  ) {
    return this.groupsService.sendMessages(sessionId, sendMessageDtos)
  }
}
