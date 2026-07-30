import { EVENTS } from '@air-battle/shared';
import './styles/base.css';
import { GameState } from './game/gameState.js';
import { InputController } from './game/inputController.js';
import { GameSocket } from './network/gameSocket.js';
import { GameRenderer } from './render/gameRenderer.js';
import { Hud } from './ui/hud.js';
import { Sounds } from './ui/sounds.js';

document.querySelector('#app').innerHTML = '<div id="game"></div><div id="ui"></div>';

const state = new GameState();
const renderer = new GameRenderer(document.querySelector('#game'));
const hud = new Hud(document.querySelector('#ui'));
const sounds = new Sounds();

function showNicknameModal(root) {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.className = 'nickname-modal';
    container.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal">
        <h2>Oyuncu Adı Gir</h2>
        <input id="nickname-input" placeholder="Nickname" maxlength="24" />
        <div class="modal-actions"><button id="nickname-submit">Başla</button></div>
      </div>`;
    root.appendChild(container);
    const input = container.querySelector('#nickname-input');
    const submit = container.querySelector('#nickname-submit');
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit.click(); });
    submit.addEventListener('click', () => {
      const value = (input.value || '').trim().slice(0, 24);
      root.removeChild(container);
      resolve(value);
    });
    input.focus();
  });
}

async function start() {
  const uiRoot = document.querySelector('#ui');
  const nickname = await showNicknameModal(uiRoot);
  const socket = new GameSocket(undefined, nickname || undefined);
  let lastAim = null;
  let lastAimSentAt = 0;

  new InputController({
    onInput: (input) => socket.sendInput(input),
    onPointer: (x, y) => {
      lastAim = renderer.aimAt(x, y, state.self);
      const now = performance.now();
      if (lastAim && now - lastAimSentAt > 50) { socket.sendAim(lastAim); lastAimSentAt = now; }
    },
    onFire: () => {
      if (!state.self?.alive) return;
      const yaw = state.self?.state?.yaw ?? 0;
      const forwardAim = { x: Math.sin(yaw), y: 0, z: Math.cos(yaw) };
      socket.sendAim(forwardAim);
      socket.fire();
      sounds.fire();
    },
  });

  socket.on(EVENTS.READY, ({ self, onlineCount }) => {
    state.setReady({ self });
    hud.setConnection(`${self.nickname} · ${onlineCount} OYUNCU ÇEVRİMİÇİ`);
  });
  socket.on(EVENTS.PLAYERS, (players) => state.setPlayers(players));
  socket.on(EVENTS.PLAYER_JOINED, (player) => state.setPlayers([player]));
  socket.on(EVENTS.PLAYER_LEFT, ({ id }) => state.removePlayer(id));
  socket.on(EVENTS.SNAPSHOT, (snapshot) => { state.applySnapshot(snapshot); hud.update(state); });
  socket.on(EVENTS.BULLET_FIRED, (bullet) => renderer.fireBullet(bullet));
  socket.on(EVENTS.EXPLOSION, ({ position }) => { renderer.explode(position); sounds.explosion(); });
  socket.on('connection:error', () => hud.setConnection('SUNUCUYA YENİDEN BAĞLANILIYOR…'));

  function frame() {
    renderer.render(state);
    requestAnimationFrame(frame);
  }
  frame();
}

start();
