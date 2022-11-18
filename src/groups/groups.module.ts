import { Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { IsGroupOnWhatsappValidator } from './validators'
import { SessionsModule } from '../sessions/sessions.module'

@Module({
  imports: [SessionsModule],
  controllers: [GroupsController],
  providers: [GroupsService, IsGroupOnWhatsappValidator],
})
export class GroupsModule {}
