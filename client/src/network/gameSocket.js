import { io } from 'socket.io-client';
import { EVENTS } from '@air-battle/shared';

const SERVER_EVENTS = [EVENTS.READY, EVENTS.PLAYERS, EVENTS.PLAYER_JOINED, EVENTS.PLAYER_LEFT, EVENTS.SNAPSHOT, EVENTS.BULLET_FIRED, EVENTS.EXPLOSION];

export class GameSocket {
  #socket;
  #listeners = new Map();

  
  constructor(url = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin)) {
    this.#socket = io(url, { transports: ['websocket', 'polling'], reconnection: true });
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
