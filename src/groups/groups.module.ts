import { Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { SessionsModule } from '../sessions/sessions.module'

@Module({
  imports: [SessionsModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
