import { Body, Controller, Delete, Get, Param, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { SessionService } from './session.service'
import { CreateSessionDto } from './dto'

@Controller('sessions')
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Post()
  create(
    @Body() createSessionDto: CreateSessionDto,
    @Res() response: Response,
  ) {
    return this.sessionService.create(createSessionDto, response)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionService.remove(id)
  }
}
