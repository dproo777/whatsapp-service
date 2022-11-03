import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
import { SessionsService } from './sessions.service'
import { CreateSessionDto } from './dto'

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto, @Res() res: Response) {
    if (this.sessionsService.hasSession(createSessionDto.id)) {
      throw new ConflictException(
        `Session ${createSessionDto.id} already exists, please use another id to connect!`,
      )
    }

    return this.sessionsService.create(createSessionDto, res)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id)
  }
}
