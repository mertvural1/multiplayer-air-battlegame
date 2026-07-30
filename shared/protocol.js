// Events shared by the client and the authoritative server.
export const EVENTS = Object.freeze({
  CONNECTED: 'session:connected',
  WORLD_SNAPSHOT: 'world:snapshot',
  INPUT: 'player:input',
  AIM: 'player:aim',
  FIRE: 'player:fire'
});
