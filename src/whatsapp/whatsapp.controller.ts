import { Body, Controller, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { WhatsappService } from './whatsapp.service'
import { ConnectDto } from './dto'

@Controller('whatsapp')
export class WhatsappController {
  constructor(private whatsappService: WhatsappService) {}

  @Post('connect')
  connect(@Body() connectDto: ConnectDto, @Res() response: Response) {
    return this.whatsappService.connect(connectDto, response)
  }
}
