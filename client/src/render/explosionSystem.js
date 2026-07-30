import * as THREE from 'three';

export class ExplosionSystem {
  #effects = [];

  constructor(scene) {
    this.scene = scene;
    this.geometry = new THREE.IcosahedronGeometry(0.7, 0);
    this.material = new THREE.MeshBasicMaterial({ color: '#ffb347' });
  }

  explode(position) {
    const group = new THREE.Group();
    const pieces = [];
    for (let index = 0; index < 24; index += 1) {
      const piece = new THREE.Mesh(this.geometry, this.material);
      piece.position.copy(position);
      const velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.25, Math.random() - 0.5).normalize().multiplyScalar(35 + Math.random() * 38);
      group.add(piece);
      pieces.push({ piece, velocity });
    }
    this.scene.add(group);
    this.#effects.push({ group, pieces, age: 0 });
  }

  update(deltaSeconds) {
    for (let index = this.#effects.length - 1; index >= 0; index -= 1) {
      const effect = this.#effects[index];
      effect.age += deltaSeconds;
      effect.pieces.forEach(({ piece, velocity }) => {
        piece.position.addScaledVector(velocity, deltaSeconds);
        piece.scale.setScalar(Math.max(0.05, 1 - effect.age / 0.8));
      });
      if (effect.age > 0.8) { this.scene.remove(effect.group); this.#effects.splice(index, 1); }
    }
  }
}
