import { Module } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { ChatsController } from './chats.controller'
import { SessionsModule } from '../sessions/sessions.module'

@Module({
  imports: [SessionsModule],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
