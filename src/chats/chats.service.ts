import { Injectable } from '@nestjs/common'

@Injectable()
export class ChatsService {
  findAll(sessionId: string) {
    return `This action returns all chat from ${sessionId}`
  }
}
