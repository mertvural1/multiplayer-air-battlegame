import * as THREE from 'three';
import { createPlane } from './planeFactory.js';

export class PlayerRenderer {
  #aircraft = new Map();

  constructor(scene) { this.scene = scene; }

  sync(players) {
    const ids = new Set(players.keys());
    for (const [id, plane] of this.#aircraft) {
      if (!ids.has(id)) { this.scene.remove(plane.object); this.#aircraft.delete(id); }
    }
    for (const player of players.values()) this.#syncPlayer(player);
  }

  getPosition(id) { return this.#aircraft.get(id)?.object.position; }
  getObject(id) { return this.#aircraft.get(id)?.object; }

  #syncPlayer(player) {
    let plane = this.#aircraft.get(player.id);
    if (!plane) {
      const object = createPlane(player.color);
      object.position.set(player.state.x, player.state.y, player.state.z);
      object.rotation.y = player.state.yaw;
      this.scene.add(object);
      plane = { object, target: new THREE.Vector3(), yaw: player.state.yaw };
      this.#aircraft.set(player.id, plane);
    }
    plane.target.set(player.state.x, player.state.y, player.state.z);
    plane.object.visible = player.alive;
    plane.object.position.lerp(plane.target, 0.28);
    plane.object.rotation.y = lerpAngle(plane.object.rotation.y, player.state.yaw, 0.3);
    plane.object.rotation.x = THREE.MathUtils.lerp(plane.object.rotation.x, player.state.pitch ?? 0, 0.15);
    plane.object.rotation.z = THREE.MathUtils.lerp(plane.object.rotation.z, 0, 0.12);
    const exhaust = plane.object.getObjectByName('exhaust');
    if (exhaust) exhaust.scale.z = 0.65 + Math.max(0, player.state.speed - 22) / 28;
    const smoke = plane.object.getObjectByName('smoke');
    if (smoke) smoke.scale.z = 0.6 + Math.max(0, player.state.speed - 18) / 20;
  }
}

function lerpAngle(from, to, amount) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * amount;
}
