import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { delay } from '@adiwajshing/baileys'
import { SessionsService } from '../sessions/sessions.service'
import { SendMessageDto } from './dto'

@Injectable()
export class GroupsService {
  private logger: Logger

  constructor(private readonly sessionsService: SessionsService) {
    this.logger = new Logger(GroupsService.name)
  }

  findAll(sessionId: string) {
    const session = this.sessionsService.findSession(sessionId)

    return session.store.chats.filter((chat) => chat.id.endsWith('@g.us'))
  }

  async sendMessage(sessionId: string, sendMessageDto: SendMessageDto) {
    const session = this.sessionsService.findSession(sessionId)

    try {
      await session.sendMessage(sendMessageDto.whatsappId, {
        text: sendMessageDto.text,
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
      try {
        await delay(1000)

        await session.sendMessage(sendMessageDto.whatsappId, {
          text: sendMessageDto.message,
        })
      } catch (e) {
        this.logger.log(e)

        errors.push({
          index,
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
}
