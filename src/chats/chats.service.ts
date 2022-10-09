import { Injectable } from '@nestjs/common'

@Injectable()
export class ChatsService {
  findAll(session: string) {
    return `This action returns all chat from ${session}`
  }
}
