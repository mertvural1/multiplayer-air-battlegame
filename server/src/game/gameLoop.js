import { COMBAT, EVENTS, NETWORK, PLAYER } from '@air-battle/shared';
import { BulletPool } from './bulletPool.js';
import { simulatePlayerMovement } from './playerMovement.js';

export class GameLoop {
  #lastTime = performance.now();
  #snapshotElapsed = 0;
  #bullets = new BulletPool();

  constructor({ registry, io }) {
    this.registry = registry;
    this.io = io;
  }

  start() {
    const timer = setInterval(() => this.#tick(), 1000 / NETWORK.TICK_RATE);
    timer.unref();
  }

  fire(playerId) {
    const player = this.registry.get(playerId);
    const now = Date.now();
    if (!player?.alive || now - player.lastShotAt < COMBAT.FIRE_INTERVAL_MS) return;
    const bullet = this.#bullets.fire(player);
    if (!bullet) return;
    player.lastShotAt = now;
    this.io.volatile.emit(EVENTS.BULLET_FIRED, publicBullet(bullet));
  }

  #tick() {
    const now = performance.now();
    const deltaSeconds = Math.min((now - this.#lastTime) / 1000, 0.1);
    this.#lastTime = now;
    const players = [...this.registry.values()];

    for (const player of players) {
      if (!player.alive && Date.now() >= player.respawnAt) this.registry.respawn(player);
      simulatePlayerMovement(player, deltaSeconds);
    }
    this.#bullets.update(deltaSeconds, players, (bullet, victim) => this.#applyHit(bullet, victim));

    this.#snapshotElapsed += deltaSeconds;
    if (this.#snapshotElapsed >= 1 / NETWORK.SNAPSHOT_RATE) {
      this.#snapshotElapsed = 0;
      this.io.volatile.emit(EVENTS.SNAPSHOT, { serverTime: Date.now(), players: this.registry.all() });
    }
  }

  #applyHit(bullet, victim) {
    victim.hp -= 1;
    if (victim.hp > 0) return;
    victim.alive = false;
    victim.deaths += 1;
    victim.respawnAt = Date.now() + PLAYER.RESPAWN_MS;
    const attacker = this.registry.get(bullet.ownerId);
    if (attacker) attacker.kills += 1;
    this.io.emit(EVENTS.EXPLOSION, {
      position: { x: victim.state.x, y: victim.state.y, z: victim.state.z },
      victimId: victim.id,
      attackerId: bullet.ownerId,
    });
  }
}

function publicBullet({ id, ownerId, x, y, z, vx, vy, vz }) {
  return { id, ownerId, x, y, z, vx, vy, vz };
}
