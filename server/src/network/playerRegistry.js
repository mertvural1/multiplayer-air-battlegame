import { PLAYER } from '@air-battle/shared';

const ADJECTIVES = ['Swift', 'Azure', 'Brave', 'Crimson', 'Silent', 'Solar', 'Storm', 'Wild'];
const NOUNS = ['Falcon', 'Eagle', 'Comet', 'Viper', 'Raven', 'Meteor', 'Hawk', 'Phoenix'];
const COLORS = ['#ff5d73', '#38bdf8', '#a3e635', '#fbbf24', '#c084fc', '#fb7185'];

export class PlayerRegistry {
  #players = new Map();

  add(id) {
    const player = {
      id,
      nickname: `${pick(ADJECTIVES)} ${pick(NOUNS)}`,
      color: pick(COLORS),
      connectedAt: Date.now(),
      kills: 0,
      deaths: 0,
      hp: PLAYER.HP,
      alive: true,
      respawnAt: 0,
      nitro: PLAYER.NITRO_MAX,
      lastShotAt: 0,
      lastInputAt: 0,
      input: emptyInput(),
      aim: { x: 0, y: 0, z: 1 },
      state: spawnState(),
    };
    this.#players.set(id, player);
    return this.public(player);
  }

  remove(id) { return this.#players.delete(id); }
  get(id) { return this.#players.get(id); }
  values() { return this.#players.values(); }
  count() { return this.#players.size; }
  all() { return [...this.#players.values()].map((player) => this.public(player)); }

  setInput(id, input) {
    const player = this.#players.get(id);
    if (!player || !input || typeof input !== 'object') return;
    player.input = {
      throttle: input.throttle === true,
      brake: input.brake === true,
      turnLeft: input.turnLeft === true,
      turnRight: input.turnRight === true,
      climb: input.climb === true,
      descend: input.descend === true,
      nitro: input.nitro === true,
    };
    player.lastInputAt = Date.now();
  }

  setAim(id, direction) {
    const player = this.#players.get(id);
    if (!player?.alive || !isDirection(direction)) return;
    const length = Math.hypot(direction.x, direction.y, direction.z);
    player.aim = {
      x: direction.x / length,
      y: direction.y / length,
      z: direction.z / length,
    };
  }

  respawn(player) {
    player.alive = true;
    player.hp = PLAYER.HP;
    player.nitro = PLAYER.NITRO_MAX;
    player.state = spawnState();
    player.input = emptyInput();
  }

  public(player) {
    return {
      id: player.id,
      nickname: player.nickname,
      color: player.color,
      kills: player.kills,
      deaths: player.deaths,
      hp: player.hp,
      alive: player.alive,
      nitro: Math.round(player.nitro),
      respawnAt: player.respawnAt,
      state: { ...player.state },
    };
  }
}

function spawnState() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 120 + Math.random() * 500;
  return {
    x: Math.cos(angle) * radius,
    y: PLAYER.SPAWN_ALTITUDE + (Math.random() - 0.5) * 28,
    z: Math.sin(angle) * radius,
    yaw: angle + Math.PI / 2,
    speed: PLAYER.CRUISE_SPEED,
    verticalSpeed: 0,
    pitch: 0,
  };
}

function emptyInput() {
  return { throttle: false, brake: false, turnLeft: false, turnRight: false, climb: false, descend: false, nitro: false };
}

function isDirection(value) {
  return value && typeof value === 'object'
    && ['x', 'y', 'z'].every((key) => Number.isFinite(value[key]))
    && Math.hypot(value.x, value.y, value.z) > 0.01
    && Math.hypot(value.x, value.y, value.z) < 2;
}

function pick(values) { return values[Math.floor(Math.random() * values.length)]; }
