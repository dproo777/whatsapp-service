import { Module } from '@nestjs/common'
import { SessionService } from './session.service'
import { SessionController } from './session.controller'
import { WhatsappModule } from '../whatsapp/whatsapp.module'

@Module({
  imports: [WhatsappModule],
  providers: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}
