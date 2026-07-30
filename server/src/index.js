import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Server } from 'socket.io';
import { EVENTS, NETWORK } from '@air-battle/shared';
import { PlayerRegistry } from './network/playerRegistry.js';
import { GameLoop } from './game/gameLoop.js';

const port = Number(process.env.PORT ?? NETWORK.DEFAULT_PORT);
let clientOrigin = process.env.CLIENT_ORIGIN ?? NETWORK.DEFAULT_CLIENT_ORIGIN;
// If no CLIENT_ORIGIN provided in production, allow all origins so deployed
// client can reach the socket endpoint. Prefer setting CLIENT_ORIGIN in env.
if (!process.env.CLIENT_ORIGIN && process.env.NODE_ENV === 'production') {
  clientOrigin = '*';
}
const app = express();
const directory = dirname(fileURLToPath(import.meta.url));
const clientDist = resolve(directory, '../../client/dist');

app.use(cors({ origin: clientOrigin }));
app.get('/health', (_request, response) => response.json({ status: 'ok' }));
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_request, response) => response.sendFile(resolve(clientDist, 'index.html')));
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: clientOrigin, methods: ['GET', 'POST'] },
});
const players = new PlayerRegistry();
const gameLoop = new GameLoop({ registry: players, io });
gameLoop.start();

io.on('connection', (socket) => {
  const preferredNickname = socket.handshake?.auth?.nickname;
  const player = players.add(socket.id, preferredNickname);

  // New clients first receive the complete presence snapshot, then live changes.
  socket.emit(EVENTS.READY, { self: player, onlineCount: players.count() });
  socket.emit(EVENTS.PLAYERS, players.all());
  socket.broadcast.emit(EVENTS.PLAYER_JOINED, player);

  socket.on(EVENTS.INPUT, (input) => players.setInput(socket.id, input));
  socket.on(EVENTS.AIM, (direction) => players.setAim(socket.id, direction));
  socket.on(EVENTS.FIRE, () => gameLoop.fire(socket.id));

  // Allow clients to update their nickname after connecting.
  socket.on('set:nickname', (name) => {
    const p = players.get(socket.id);
    if (!p) return;
    const clean = typeof name === 'string' ? name.trim().replace(/[\n\r]/g, ' ').slice(0, 24) : '';
    if (!clean) return;
    p.nickname = clean;
    io.emit(EVENTS.PLAYERS, players.all());
  });

  socket.on('disconnect', () => {
    if (players.remove(socket.id)) {
      io.emit(EVENTS.PLAYER_LEFT, { id: socket.id, onlineCount: players.count() });
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Air Battle server listening on http://localhost:${port}`);
});
