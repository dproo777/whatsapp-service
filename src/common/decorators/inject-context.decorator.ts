import { applyDecorators, UseInterceptors, UsePipes } from '@nestjs/common'
import { InjectContextInterceptor } from '../interceptors'
import { StripContextPipe } from '../pipes'

export const InjectContext = () =>
  applyDecorators(
    UseInterceptors(InjectContextInterceptor),
    UsePipes(StripContextPipe),
  )
