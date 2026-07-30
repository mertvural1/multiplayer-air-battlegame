export const NETWORK = Object.freeze({
  DEFAULT_PORT: 3000,
  DEFAULT_CLIENT_ORIGIN: 'http://localhost:5173',
  TICK_RATE: 30,
  SNAPSHOT_RATE: 20,
  MAX_INPUT_RATE: 30,
});

export const PLAYER = Object.freeze({
  HP: 2,
  CRUISE_SPEED: 22,
  MAX_SPEED: 62,
  NITRO_SPEED: 105,
  ACCELERATION: 28,
  BRAKE_DECELERATION: 34,
  COAST_DECELERATION: 8,
  TURN_RATE: 1.85,
  CLIMB_SPEED: 34,
  VERTICAL_ACCELERATION: 62,
  VERTICAL_DAMPING: 48,
  SPAWN_ALTITUDE: 80,
  MIN_ALTITUDE: 24,
  MAX_ALTITUDE: 260,
  WORLD_RADIUS: 900,
  HIT_RADIUS: 9,
  NITRO_MAX: 100,
  NITRO_DRAIN: 30,
  NITRO_RECHARGE: 16,
  RESPAWN_MS: 3000,
});

export const COMBAT = Object.freeze({
  FIRE_INTERVAL_MS: 210,
  BULLET_SPEED: 220,
  BULLET_LIFETIME: 2.25,
  BULLET_RADIUS: 1.2,
  MAX_BULLETS: 512,
});

export const EVENTS = Object.freeze({
  READY: 'server:ready',
  PLAYERS: 'server:players',
  PLAYER_JOINED: 'server:player-joined',
  PLAYER_LEFT: 'server:player-left',
  INPUT: 'client:input',
  AIM: 'client:aim',
  FIRE: 'client:fire',
  BULLET_FIRED: 'server:bullet-fired',
  SNAPSHOT: 'server:snapshot',
  EXPLOSION: 'server:explosion',
});
