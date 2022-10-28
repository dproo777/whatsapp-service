import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ChatsService } from './chats.service'
import { FindOneParamsDto, SendChatDto } from './dto'
import { Session } from '../decorators'

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatService: ChatsService) {}

  @Get()
  findAll(@Session() sessionId: string) {
    return this.chatService.findAll(sessionId)
  }

  @Get(':jid')
  findOne(
    @Session() sessionId: string,
    @Param('jid') jid: string,
    @Query() findOneParamsDto: FindOneParamsDto,
  ) {
    return this.chatService.findOne(sessionId, jid, findOneParamsDto)
  }

  @Post('send')
  send(@Session() sessionId: string, @Body() sendChatDto: SendChatDto) {
    return this.chatService.send(sessionId, sendChatDto)
  }

  @Post('send-bulk')
  sendBulk(
    @Session() sessionId: string,
    @Body(new ParseArrayPipe({ items: SendChatDto }))
    sendChatDtos: SendChatDto[],
  ) {
    return this.chatService.sendBulk(sessionId, sendChatDtos)
  }
}
