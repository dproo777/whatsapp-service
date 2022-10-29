import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ChatsModule } from './chats/chats.module'
import { GroupsModule } from './groups/groups.module'
import { SessionsModule } from './sessions/sessions.module'
import { ChatsController } from './chats/chats.controller'
import { GroupsController } from './groups/groups.controller'
import { SessionValidatorMiddleware } from './middlewares'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatsModule,
    GroupsModule,
    SessionsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionValidatorMiddleware)
      .forRoutes(ChatsController, GroupsController)
  }
}
