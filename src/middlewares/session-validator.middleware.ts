import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { SessionService } from '../session/session.service'

@Injectable()
export class SessionValidatorMiddleware implements NestMiddleware {
  constructor(private readonly sessionService: SessionService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.headers['session'] as string | undefined

    if (!this.sessionService.hasSession(sessionId)) {
      throw new NotFoundException(`Session ${sessionId} not found`)
    }

    next()
  }
}
