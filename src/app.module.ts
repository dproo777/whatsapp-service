import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PersonsModule } from './persons/persons.module'
import { GroupsModule } from './groups/groups.module'
import { GroupsController } from './groups/groups.controller'
import { SessionsModule } from './sessions/sessions.module'
import { PersonsController } from './persons/persons.controller'
import { SessionValidatorMiddleware } from './common/middlewares'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GroupsModule,
    PersonsModule,
    SessionsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionValidatorMiddleware)
      .forRoutes(GroupsController, PersonsController)
  }
}
