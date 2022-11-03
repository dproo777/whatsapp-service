import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { delay } from '@adiwajshing/baileys'
import { PersonsService } from '../persons/persons.service'
import { SessionsService } from '../sessions/sessions.service'
import { FindOneParamsDto } from '../persons/dto'
import { SendMessageDto } from './dto'
import { session } from '../sessions/types'

@Injectable()
export class GroupsService {
  private logger: Logger

  constructor(
    private readonly personsService: PersonsService,
    private readonly sessionsService: SessionsService,
  ) {
    this.logger = new Logger(GroupsService.name)
  }

  findAll(sessionId: string) {
    const session = this.sessionsService.findSession(sessionId)

    return session.store.chats.filter((chat) => chat.id.endsWith('@g.us'))
  }

  async findOne(
    sessionId: string,
    jid: string,
    findOneParamsDto: FindOneParamsDto,
  ) {
    return this.personsService.findOne(sessionId, jid, findOneParamsDto)
  }

  async sendMessage(sessionId: string, sendMessageDto: SendMessageDto) {
    const session = this.sessionsService.findSession(sessionId)

    const jid = this.formatJid(sendMessageDto.whatsappId)

    if (!(await this.isOnWhatsapp(session, jid))) {
      throw new UnprocessableEntityException({
        receiver: 'Whatsapp ID is not on whatsapp',
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

  private async isOnWhatsapp(session: session, jid: string) {
    try {
      const result = await session.groupMetadata(jid)

      return !!result.id
    } catch {
      return false
    }
  }

  private formatJid(whatsappId: string) {
    return whatsappId.endsWith('@g.us')
      ? whatsappId
      : whatsappId.replace(/[^\d-]/g, '').concat('@g.us')
  }
}
