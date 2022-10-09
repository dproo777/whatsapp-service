import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ChatsModule } from './chats/chats.module'
import { SessionsModule } from './sessions/sessions.module'
import { SessionValidatorMiddleware } from './middlewares'
import { ChatsController } from './chats/chats.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatsModule,
    SessionsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionValidatorMiddleware).forRoutes(ChatsController)
  }
}
