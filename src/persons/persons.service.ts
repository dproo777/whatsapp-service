import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { delay } from '@adiwajshing/baileys'
import { WAMessageCursor } from '@adiwajshing/baileys/lib/Types'
import { SessionsService } from '../sessions/sessions.service'
import { FindOneParamsDto, SendMessageDto } from './dto'
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

  async findOne(
    sessionId: string,
    jid: string,
    findOneParamsDto: FindOneParamsDto,
  ) {
    const session = this.sessionsService.findSession(sessionId)

    const cursor: WAMessageCursor = findOneParamsDto.id
      ? {
          before: {
            id: findOneParamsDto.id,
            fromMe: findOneParamsDto.fromMe,
          },
        }
      : undefined

    try {
      return await session.store.loadMessages(
        jid,
        findOneParamsDto.limit,
        cursor,
        undefined,
      )
    } catch (e) {
      this.logger.log(e)

      throw new InternalServerErrorException('Failed to load messages')
    }
  }

  async sendMessage(sessionId: string, sendMessageDto: SendMessageDto) {
    const session = this.sessionsService.findSession(sessionId)

    const jid = this.formatJid(sendMessageDto.whatsappId)

    if (!(await this.isOnWhatsapp(session, jid))) {
      throw new UnprocessableEntityException({
        person: 'Phone is not on whatsapp',
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
          code: 422,
          messages: {
            person: 'Whatsapp ID is not on whatsapp',
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
          code: 500,
          message: 'Failed to send message',
        })
      }
    }

    if (!errors.length) {
      return {
        message: 'All message has been sent successfully',
      }
    }

    if (errors.length === sendMessageDtos.length) {
      throw new InternalServerErrorException('Failed to send all message')
    }

    return {
      message: 'Some message has been sent successfully',
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
