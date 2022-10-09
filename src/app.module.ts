import { Module } from '@nestjs/common'
import { SessionModule } from './session/session.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SessionModule,
  ],
})
export class AppModule {}
