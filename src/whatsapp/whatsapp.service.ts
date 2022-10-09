import { Injectable, Logger } from '@nestjs/common'
import { session } from './types/session'

@Injectable()
export class WhatsappService {
  protected logger = new Logger(WhatsappService.name)

  protected sessions = new Map<string, session>()

  protected retries = new Map<string, number>()
}
