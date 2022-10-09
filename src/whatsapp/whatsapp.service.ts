import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
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
import { ConnectDto } from './dto'

@Injectable()
export class WhatsappService {
  private logger = new Logger(WhatsappService.name)

  private sessions = new Map<string, object>()

  private retries = new Map<string, number>()

  constructor(private configService: ConfigService) {}

  async connect(connectDto: ConnectDto, response: Response) {
    const { sessionId } = connectDto

    if (this.sessions.has(sessionId)) {
      throw new ConflictException(
        `Session ${sessionId} already exists, please use another id to connect!`,
      )
    }

    const store = makeInMemoryStore({})

    const sessionPath = this.getSessionPath(sessionId)

    const { state, saveState } = useSingleFileAuthState(sessionPath)

    const socket = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: false,
    })

    const storePath = this.getStorePath(sessionId)

    store.readFromFile(storePath)

    store.bind(socket.ev)

    this.sessions.set(sessionId, {
      ...socket,
      store,
    })

    socket.ev.on('connection.update', async (event) => {
      const { connection, lastDisconnect } = event

      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode

      if (connection === 'open') {
        this.retries.delete(sessionId)
      } else if (connection === 'close') {
        if (
          statusCode === DisconnectReason.loggedOut ||
          !this.shouldReconnect(sessionId)
        ) {
          return this.deleteSession(sessionId)
        }

        const reconnectInterval =
          statusCode === DisconnectReason.restartRequired
            ? 0
            : this.configService.get<number>('RECONNECT_INTERVAL', 0)

        setTimeout(() => this.connect(connectDto, response), reconnectInterval)
      }

      if (event.qr) {
        if (response && !response.headersSent) {
          try {
            response.status(HttpStatus.OK).json({
              data: {
                qrCodeDataURL: await toDataURL(event.qr),
              },
              message: 'Please scan the given QR code to continue!',
            })
          } catch {
            throw new InternalServerErrorException(
              'Unable to convert QR code to data URL',
            )
          }

          return
        }

        try {
          await socket.logout()
        } catch {
          // no-op
        } finally {
          this.deleteSession(sessionId)
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

  private shouldReconnect(sessionId: string) {
    let maxRetry = this.configService.get<number>('MAX_RETRY', 1)

    if (maxRetry < 1) {
      maxRetry = 1
    }

    let attempt = this.retries.get(sessionId) ?? 0

    if (attempt < maxRetry) {
      ++attempt

      this.retries.set(sessionId, attempt)

      this.logger.log('Reconnecting...', {
        sessionId: sessionId,
        attempt,
      })

      return true
    }

    return false
  }

  private deleteSession(sessionId: string) {
    const sessionPath = this.getSessionPath(sessionId)

    if (existsSync(sessionPath)) {
      unlinkSync(sessionPath)
    }

    const storePath = this.getStorePath(sessionId)

    if (existsSync(storePath)) {
      unlinkSync(storePath)
    }

    this.sessions.delete(sessionId)

    this.retries.delete(sessionId)
  }

  private getSessionPath(sessionId: string) {
    return join(__dirname, '../..', 'sessions', `${sessionId}.json`)
  }

  private getStorePath(sessionId: string) {
    return join(__dirname, '../..', 'stores', `${sessionId}.json`)
  }
}
