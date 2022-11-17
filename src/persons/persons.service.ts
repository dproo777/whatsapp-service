import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { delay } from '@adiwajshing/baileys'
import { SessionsService } from '../sessions/sessions.service'
import { SendMessageDto } from './dto'
import { session } from '../sessions/types'

@Injectable()
export class PersonsService {
  private logger: Logger

  constructor(private readonly sessionsService: SessionsService) {
    this.logger = new Logger(PersonsService.name)
  }

  findAll(sessionId: string) {
    const session = this.sessionsService.findSession(sessionId)

    return session.store.chats.filter((chat) =>
      chat.id.endsWith('@s.whatsapp.net'),
    )
  }

  async sendMessage(sessionId: string, sendMessageDto: SendMessageDto) {
    const session = this.sessionsService.findSession(sessionId)

    const jid = this.formatJid(sendMessageDto.whatsappId)

    if (!(await this.isOnWhatsapp(session, jid))) {
      throw new UnprocessableEntityException({
        whatsappId: 'Person is not on whatsapp',
      })
    }

    try {
      await delay(1000)

      await session.sendMessage(jid, {
        text: sendMessageDto.message,
      })

      return {
        message: 'Message has been sent successfully',
      }
    } catch (e) {
      this.logger.log(e)

      throw new InternalServerErrorException('Failed to send message')
    }
  }

  async sendMessages(sessionId: string, sendMessageDtos: SendMessageDto[]) {
    const session = this.sessionsService.findSession(sessionId)

    const errors = []

    for (const [index, sendMessageDto] of sendMessageDtos.entries()) {
      const jid = this.formatJid(sendMessageDto.whatsappId)

      if (!(await this.isOnWhatsapp(session, jid))) {
        errors.push({
          index,
          code: HttpStatus.UNPROCESSABLE_ENTITY,
          messages: {
            whatsappId: 'Person is not on whatsapp',
          },
        })
      }

      try {
        await delay(1000)

        await session.sendMessage(jid, {
          text: sendMessageDto.message,
        })
      } catch (e) {
        this.logger.log(e)

        errors.push({
          index,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send message',
        })
      }
    }

    if (!errors.length) {
      return {
        message: 'All messages has been sent successfully',
      }
    }

    if (errors.length === sendMessageDtos.length) {
      throw new InternalServerErrorException('Failed to send all messages')
    }

    return {
      message: 'Some messages has been sent successfully',
      errors,
    }
  }

  private async isOnWhatsapp(session: session, jid: string) {
    try {
      const [result] = await session.onWhatsApp(jid)

      return result.exists
    } catch {
      return false
    }
  }

  private formatJid(whatsappId: string) {
    return whatsappId.endsWith('@s.whatsapp.net')
      ? whatsappId
      : whatsappId.replace(/\D/g, '').concat('@s.whatsapp.net')
  }
}
