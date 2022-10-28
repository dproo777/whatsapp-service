import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { delay } from '@adiwajshing/baileys'
import { WAMessageCursor } from '@adiwajshing/baileys/lib/Types'
import { SessionsService } from '../sessions/sessions.service'
import { FindOneParamsDto, SendChatDto } from './dto'
import { session } from '../sessions/types'

@Injectable()
export class ChatsService {
  private logger: Logger

  constructor(private readonly sessionsService: SessionsService) {
    this.logger = new Logger(ChatsService.name)
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

  async send(sessionId: string, sendChatDto: SendChatDto) {
    const session = this.sessionsService.findSession(sessionId)

    const receiver = this.formatPhone(sendChatDto.receiver)

    if (!(await this.isOnWhatsApp(session, receiver))) {
      throw new UnprocessableEntityException({
        receiver: 'Receiver phone number is not on whatsapp',
      })
    }

    try {
      await delay(1000)

      await session.sendMessage(receiver, {
        text: sendChatDto.message,
      })

      return {
        message: 'Message has been sent successfully',
      }
    } catch (e) {
      this.logger.log(e)

      throw new InternalServerErrorException('Failed to send message')
    }
  }

  async sendBulk(sessionId: string, sendChatDtos: SendChatDto[]) {
    const session = this.sessionsService.findSession(sessionId)

    const errors = []

    for (const [index, sendChatDto] of sendChatDtos.entries()) {
      const receiver = this.formatPhone(sendChatDto.receiver)

      if (!(await this.isOnWhatsApp(session, receiver))) {
        errors.push({
          index,
          code: 422,
          messages: {
            receiver: 'Receiver phone number is not on whatsapp',
          },
        })
      }

      try {
        await delay(1000)

        await session.sendMessage(receiver, {
          text: sendChatDto.message,
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

    if (errors.length === sendChatDtos.length) {
      throw new InternalServerErrorException('Failed to send all message')
    }

    return {
      message: 'Some message has been sent successfully',
      errors,
    }
  }

  private async isOnWhatsApp(session: session, jid: string) {
    try {
      const [result] = await session.onWhatsApp(jid)

      return result.exists
    } catch {
      return false
    }
  }

  private formatPhone(phone: string) {
    return phone.endsWith('@s.whatsapp.net')
      ? phone
      : phone.replace(/\D/g, '').concat('@s.whatsapp.net')
  }
}
