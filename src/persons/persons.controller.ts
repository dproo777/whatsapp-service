import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common'
import { PersonsService } from './persons.service'
import { SendMessageDto } from './dto'
import { Session } from '../decorators'

@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Get()
  findAll(@Session() sessionId: string) {
    return this.personsService.findAll(sessionId)
  }

  @Post('send-message')
  sendMessage(
    @Session() sessionId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.personsService.sendMessage(sessionId, sendMessageDto)
  }

  @Post('send-messages')
  sendMessages(
    @Session() sessionId: string,
    @Body(new ParseArrayPipe({ items: SendMessageDto }))
    sendMessageDtos: SendMessageDto[],
  ) {
    return this.personsService.sendMessages(sessionId, sendMessageDtos)
  }
}
