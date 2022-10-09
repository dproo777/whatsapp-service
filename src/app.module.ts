import { Module } from '@nestjs/common'
import { SessionModule } from './session/session.module'
import { ConfigModule } from '@nestjs/config'
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SessionModule,
    WhatsappModule,
  ],
})
export class AppModule {}
