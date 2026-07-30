import { io } from 'socket.io-client';
import { EVENTS } from '@air-battle/shared';

const SERVER_EVENTS = [EVENTS.READY, EVENTS.PLAYERS, EVENTS.PLAYER_JOINED, EVENTS.PLAYER_LEFT, EVENTS.SNAPSHOT, EVENTS.BULLET_FIRED, EVENTS.EXPLOSION];

export class GameSocket {
  #socket;
  #listeners = new Map();

  
  // Default to VITE_SERVER_URL when provided at build; in dev use localhost.
  // In production, if VITE_SERVER_URL is not set during the client build (e.g. Vercel),
  // fall back to the deployed Render server so the client connects to the correct backend.
  // Accept an optional `nickname` which will be passed as socket auth so the
  // server can set the player's nickname at connection time.
  constructor(url = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : 'https://multiplayer-air-battlegame-2.onrender.com'), nickname = null) {
    const opts = { transports: ['websocket', 'polling'], reconnection: true };
    if (nickname) opts.auth = { nickname };
    this.#socket = io(url, opts);
    SERVER_EVENTS.forEach((event) => this.#socket.on(event, (payload) => this.#emit(event, payload)));
    this.#socket.on('connect_error', () => this.#emit('connection:error'));
  }

  on(event, callback) {
    const callbacks = this.#listeners.get(event) ?? new Set();
    callbacks.add(callback);
    this.#listeners.set(event, callbacks);
    return () => callbacks.delete(callback);
  }

  sendInput(input) { this.#socket.emit(EVENTS.INPUT, input); }
  sendAim(direction) { this.#socket.emit(EVENTS.AIM, direction); }
  fire() { this.#socket.emit(EVENTS.FIRE); }

  #emit(event, payload) { this.#listeners.get(event)?.forEach((callback) => callback(payload)); }
}
