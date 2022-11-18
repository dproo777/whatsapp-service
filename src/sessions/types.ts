import makeWASocket, { makeInMemoryStore } from '@adiwajshing/baileys'

export declare type session = ReturnType<typeof makeWASocket> & {
  store: ReturnType<typeof makeInMemoryStore>
}
