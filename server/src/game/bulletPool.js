import { COMBAT } from '@air-battle/shared';

export class BulletPool {
  #bullets = [];
  #free = [];
  #nextId = 1;

  constructor() {
    for (let index = 0; index < COMBAT.MAX_BULLETS; index += 1) this.#free.push({});
  }

  fire(owner) {
    const bullet = this.#free.pop();
    if (!bullet) return null;
    const { state, aim } = owner;
    Object.assign(bullet, {
      id: this.#nextId++, ownerId: owner.id, age: 0,
      x: state.x + aim.x * 7, y: state.y + aim.y * 2, z: state.z + aim.z * 7,
      vx: aim.x * COMBAT.BULLET_SPEED, vy: aim.y * COMBAT.BULLET_SPEED, vz: aim.z * COMBAT.BULLET_SPEED,
    });
    this.#bullets.push(bullet);
    return bullet;
  }

  update(deltaSeconds, players, onHit) {
    for (let index = this.#bullets.length - 1; index >= 0; index -= 1) {
      const bullet = this.#bullets[index];
      bullet.age += deltaSeconds;
      bullet.x += bullet.vx * deltaSeconds;
      bullet.y += bullet.vy * deltaSeconds;
      bullet.z += bullet.vz * deltaSeconds;
      const victim = findVictim(bullet, players);
      if (victim) onHit(bullet, victim);
      if (victim || bullet.age > COMBAT.BULLET_LIFETIME) this.#release(index);
    }
  }

  snapshot() {
    return this.#bullets.map(({ id, ownerId, x, y, z, vx, vy, vz }) => ({ id, ownerId, x, y, z, vx, vy, vz }));
  }

  #release(index) {
    const [bullet] = this.#bullets.splice(index, 1);
    this.#free.push(bullet);
  }
}

function findVictim(bullet, players) {
  for (const player of players) {
    if (!player.alive || player.id === bullet.ownerId) continue;
    const dx = player.state.x - bullet.x;
    const dy = player.state.y - bullet.y;
    const dz = player.state.z - bullet.z;
    if (dx * dx + dy * dy + dz * dz < 105) return player;
  }
  return null;
}
