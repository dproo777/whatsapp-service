import { Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { SessionsModule } from '../sessions/sessions.module'
import { PersonsModule } from '../persons/persons.module'

@Module({
  imports: [PersonsModule, SessionsModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
