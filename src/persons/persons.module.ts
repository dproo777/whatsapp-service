import { Module } from '@nestjs/common'
import { PersonsService } from './persons.service'
import { PersonsController } from './persons.controller'
import { IsPersonOnWhatsappValidator } from './validators'
import { SessionsModule } from '../sessions/sessions.module'

@Module({
  imports: [SessionsModule],
  controllers: [PersonsController],
  providers: [PersonsService, IsPersonOnWhatsappValidator],
})
export class PersonsModule {}
