import { Controller, Get } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { Session } from '../decorators'

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatService: ChatsService) {}

  @Get()
  findAll(@Session() session: string) {
    return this.chatService.findAll(session)
  }
}
