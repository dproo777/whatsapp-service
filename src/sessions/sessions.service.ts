import { readdir, rm, stat } from 'fs/promises'
import { join } from 'path'
import {
  BeforeApplicationShutdown,
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
  DisconnectReason,
  makeInMemoryStore,
  useMultiFileAuthState,
} from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import { toDataURL } from 'qrcode'
import { CreateSessionDto } from './dto'
import { session } from './types'

@Injectable()
export class SessionsService
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  private logger = new Logger(SessionsService.name)

  private sessions = new Map<string, session>()

  private retries = new Map<string, number>()

  constructor(private configService: ConfigService) {}

  async onApplicationBootstrap() {
    try {
      const sessionDirnames = await readdir(this.getSessionDirPath())

      for (const sessionDirname of sessionDirnames) {
        const sessionDirStats = await stat(
          this.getSessionDirPath(sessionDirname),
        )

        if (!sessionDirStats.isDirectory()) {
          continue
        }

        await this.create({
          id: sessionDirname,
        })
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to create sessions', error)
    }
  }

  beforeApplicationShutdown() {
    this.sessions.forEach((session, sessionId) =>
      session.store.writeToFile(this.getStoreFilePath(sessionId)),
    )
  }

  async create(createSessionDto: CreateSessionDto, res?: Response) {
    const { id } = createSessionDto

    const store = makeInMemoryStore({})

    const { state, saveCreds } = await useMultiFileAuthState(
      this.getSessionDirPath(id),
    )

    const socket = makeWASocket({
      auth: state,
      browser: Browsers.baileys('Desktop'),
      printQRInTerminal: false,
      syncFullHistory: true,
    })

    store.readFromFile(this.getStoreFilePath(id))

    store.bind(socket.ev)

    this.sessions.set(id, {
      ...socket,
      store,
    })

    socket.ev.on('connection.update', async (event) => {
      const { connection, lastDisconnect } = event

      if (connection === 'open') {
        await socket.sendPresenceUpdate('unavailable', id)

        this.retries.delete(id)
      } else if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode

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
            res.status(HttpStatus.CREATED).json({
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
          await this.deleteSession(id)
        }
      }
    })

    socket.ev.on('creds.update', saveCreds)
  }

  findOne(id: string) {
    if (!this.hasSession(id)) {
      throw new NotFoundException(`Session ${id} not found`)
    }

    return {
      message: `Session ${id} already exists`,
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
      await this.deleteSession(id)
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
    let maxRetry = this.configService.get<number>('MAX_RETRY', 3)

    if (maxRetry < 1) {
      maxRetry = 1
    }

    let attempt = this.retries.get(id) ?? 0

    if (attempt < maxRetry) {
      ++attempt

      this.retries.set(id, attempt)

      this.logger.log('Reconnecting...', {
        id,
        attempt,
      })

      return true
    }

    return false
  }

  private async deleteSession(id: string) {
    try {
      const sessionDirPath = this.getSessionDirPath(id)

      const sessionDirStats = await stat(sessionDirPath)

      if (sessionDirStats.isDirectory()) {
        await rm(sessionDirPath, {
          recursive: true,
          force: true,
        })
      }

      const storeFilePath = this.getStoreFilePath(id)

      const storeFileStats = await stat(storeFilePath)

      if (storeFileStats.isFile()) {
        await rm(storeFilePath, {
          force: true,
        })
      }

      this.sessions.delete(id)

      this.retries.delete(id)
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete session', error)
    }
  }

  private getSessionDirPath(id?: string) {
    return join(process.cwd(), 'storage', 'sessions', id || '')
  }

  private getStoreFilePath(id?: string) {
    return join(process.cwd(), 'storage', 'stores', id ? `${id}.json` : '')
  }
}
