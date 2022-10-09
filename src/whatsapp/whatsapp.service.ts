import { Injectable, Logger } from '@nestjs/common'
import { session } from './types'

@Injectable()
export class WhatsappService {
  protected logger = new Logger(this.constructor.name)

  protected sessions = new Map<string, session>()

  protected retries = new Map<string, number>()
}
