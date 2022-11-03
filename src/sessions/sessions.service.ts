import { existsSync, readdir, unlinkSync } from 'fs'
import { join } from 'path'
import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import makeWASocket, {
  Browsers,
  delay,
  DisconnectReason,
  makeInMemoryStore,
  useSingleFileAuthState,
} from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import { toDataURL } from 'qrcode'
import { CreateSessionDto } from './dto'
import { session } from './types'

@Injectable()
export class SessionsService implements OnApplicationBootstrap {
  private logger = new Logger(SessionsService.name)

  private sessions = new Map<string, session>()

  private retries = new Map<string, number>()

  constructor(private configService: ConfigService) {}

  onApplicationBootstrap() {
    readdir(this.getSessionPath(), async (err, files) => {
      if (err) {
        throw new InternalServerErrorException(err)
      }

      for (const file of files) {
        if (!file.endsWith('.json')) {
          continue
        }

        const filename = file.replace('.json', '')

        const id = filename.substring(3)

        await this.create({
          id,
        })
      }
    })
  }

  async create(createSessionDto: CreateSessionDto, res?: Response) {
    const { id } = createSessionDto

    const store = makeInMemoryStore({})

    const sessionPath = this.getSessionPath(id)

    const { state, saveState } = useSingleFileAuthState(sessionPath)

    const socket = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: false,
    })

    const storePath = this.getStorePath(id)

    store.readFromFile(storePath)

    store.bind(socket.ev)

    this.sessions.set(id, {
      ...socket,
      store,
    })

    socket.ev.on('connection.update', async (event) => {
      const { connection, lastDisconnect } = event

      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode

      if (connection === 'open') {
        this.retries.delete(id)
      } else if (connection === 'close') {
        if (
          statusCode === DisconnectReason.loggedOut ||
          !this.shouldReconnect(id)
        ) {
          return this.deleteSession(id)
        }

        const reconnectInterval =
          statusCode === DisconnectReason.restartRequired
            ? 0
            : this.configService.get<number>('RECONNECT_INTERVAL', 0)

        setTimeout(() => this.create(createSessionDto, res), reconnectInterval)
      }

      if (event.qr) {
        if (res && !res.headersSent) {
          try {
            res.status(HttpStatus.OK).json({
              data: {
                qrCodeDataUrl: await toDataURL(event.qr),
              },
              message: 'Please scan the given QR code to continue!',
            })
          } catch {
            throw new InternalServerErrorException(
              'Unable to convert QR code to data url',
            )
          }

          return
        }

        try {
          await socket.logout()
        } catch {
          // no-op
        } finally {
          this.deleteSession(id)
        }
      }
    })

    socket.ev.on('creds.update', saveState)

    socket.ev.on('messages.upsert', async (event) => {
      const message = event.messages[0]

      if (!message.key.fromMe && event.type === 'notify') {
        await delay(1000)

        await socket.sendReceipt(
          message.key.remoteJid,
          message.key.participant,
          [message.key.id],
          'read',
        )
      }
    })
  }

  findOne(id: string) {
    if (!this.hasSession(id)) {
      throw new NotFoundException(`Session ${id} not found`)
    }

    return {
      message: `Session ${id} found`,
    }
  }

  async remove(id: string) {
    const session = this.sessions.get(id)

    if (!session) {
      throw new NotFoundException(`Session ${id} not found`)
    }

    try {
      await session.logout()
    } catch {
      // no-op
    } finally {
      this.deleteSession(id)
    }
  }

  hasSession(id: string) {
    return this.sessions.has(id)
  }

  findSession(id: string) {
    const session = this.sessions.get(id)

    if (!session) {
      throw new NotFoundException(`Session ${id} not found`)
    }

    return session
  }

  private shouldReconnect(id: string) {
    let maxRetry = this.configService.get<number>('MAX_RETRY', 1)

    if (maxRetry < 1) {
      maxRetry = 1
    }

    let attempt = this.retries.get(id) ?? 0

    if (attempt < maxRetry) {
      ++attempt

      this.retries.set(id, attempt)

      this.logger.log('Reconnecting...', {
        id: id,
        attempt,
      })

      return true
    }

    return false
  }

  private deleteSession(id: string) {
    const sessionPath = this.getSessionPath(id)

    if (existsSync(sessionPath)) {
      unlinkSync(sessionPath)
    }

    const storePath = this.getStorePath(id)

    if (existsSync(storePath)) {
      unlinkSync(storePath)
    }

    this.sessions.delete(id)

    this.retries.delete(id)
  }

  private getSessionPath(id?: string) {
    return join(__dirname, '../..', 'sessions', id ? `${id}.json` : '')
  }

  private getStorePath(id?: string) {
    return join(__dirname, '../..', 'stores', id ? `${id}.json` : '')
  }
}
