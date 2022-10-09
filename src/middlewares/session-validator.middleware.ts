import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { SessionsService } from '../sessions/sessions.service'

@Injectable()
export class SessionValidatorMiddleware implements NestMiddleware {
  constructor(private readonly sessionService: SessionsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const session = req.headers['session'] as string | undefined

    if (!this.sessionService.hasSession(session)) {
      throw new NotFoundException(`Session ${session} not found`)
    }

    next()
  }
}
