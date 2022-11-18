import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { useContainer } from 'class-validator'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // inject nest ioc container to the class validator
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )

  app.enableShutdownHooks()

  await app.listen(3000)
}

bootstrap()
