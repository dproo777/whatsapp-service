import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class InjectContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()

    if (request.body) {
      const { headers, params, query } = request

      request.body.context = {
        headers,
        params,
        query,
      }
    }

    return next.handle()
  }
}
