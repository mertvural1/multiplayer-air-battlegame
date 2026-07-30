import { PLAYER } from '@air-battle/shared';

export function simulatePlayerMovement(player, deltaSeconds) {
  if (!player.alive) return;
  const { input, state } = player;
  const turnDirection = Number(input.turnRight) - Number(input.turnLeft);
  state.yaw += turnDirection * PLAYER.TURN_RATE * deltaSeconds;

  const nitroActive = input.nitro && player.nitro > 0 && !input.brake;
  const targetSpeed = nitroActive ? PLAYER.NITRO_SPEED : input.throttle ? PLAYER.MAX_SPEED : PLAYER.CRUISE_SPEED;
  const acceleration = input.brake ? PLAYER.BRAKE_DECELERATION : input.throttle || nitroActive ? PLAYER.ACCELERATION : PLAYER.COAST_DECELERATION;
  state.speed = approach(state.speed, input.brake ? 0 : targetSpeed, acceleration * deltaSeconds);

  player.nitro = clamp(
    player.nitro + (nitroActive ? -PLAYER.NITRO_DRAIN : PLAYER.NITRO_RECHARGE) * deltaSeconds,
    0,
    PLAYER.NITRO_MAX,
  );

  state.x += Math.sin(state.yaw) * state.speed * deltaSeconds;
  state.z += Math.cos(state.yaw) * state.speed * deltaSeconds;
  const verticalDirection = Number(input.climb) - Number(input.descend);
  const verticalTarget = verticalDirection * PLAYER.CLIMB_SPEED;
  const verticalChange = (verticalDirection ? PLAYER.VERTICAL_ACCELERATION : PLAYER.VERTICAL_DAMPING) * deltaSeconds;
  state.verticalSpeed = approach(state.verticalSpeed, verticalTarget, verticalChange);
  state.y = clamp(state.y + state.verticalSpeed * deltaSeconds, PLAYER.MIN_ALTITUDE, PLAYER.MAX_ALTITUDE);
  if (state.y === PLAYER.MIN_ALTITUDE || state.y === PLAYER.MAX_ALTITUDE) state.verticalSpeed = 0;
  state.pitch = clamp(state.verticalSpeed / PLAYER.CLIMB_SPEED, -1, 1) * 0.34;
  keepInsideMap(state);
}

function approach(value, target, amount) {
  return value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);
}

function keepInsideMap(state) {
  const distance = Math.hypot(state.x, state.z);
  if (distance <= PLAYER.WORLD_RADIUS) return;
  const scale = PLAYER.WORLD_RADIUS / distance;
  state.x *= scale;
  state.z *= scale;
  state.yaw += Math.PI;
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
