import makeWASocket, { makeInMemoryStore } from '@adiwajshing/baileys'

declare type socket = ReturnType<typeof makeWASocket>

declare type store = ReturnType<typeof makeInMemoryStore>

export declare type session = socket & { store: store }
