import * as THREE from 'three';

export class BulletRenderer {
  #mesh;
  #slots;
  #freeSlots = [];
  #slotById = new Map();
  #matrix = new THREE.Matrix4();
  #quaternion = new THREE.Quaternion();
  #direction = new THREE.Vector3();
  #position = new THREE.Vector3();

  constructor(scene, maxBullets = 512) {
    this.#mesh = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.35, 4.5, 2, 5), new THREE.MeshBasicMaterial({ color: '#fff3a0' }), maxBullets);
    this.#mesh.count = 0;
    this.#mesh.frustumCulled = false;
    this.#slots = Array.from({ length: maxBullets }, (_, index) => {
      this.#freeSlots.push(index);
      return { active: false, id: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, age: 0 };
    });
    scene.add(this.#mesh);
  }

  spawn(bullet) {
    if (this.#slotById.has(bullet.id)) return;
    const index = this.#freeSlots.pop();
    if (index === undefined) return;
    const slot = this.#slots[index];
    Object.assign(slot, bullet, { active: true, age: 0 });
    this.#slotById.set(slot.id, index);
  }

  update(deltaSeconds) {
    let visible = 0;
    const up = UP;
    for (let index = 0; index < this.#slots.length; index += 1) {
      const bullet = this.#slots[index];
      if (!bullet.active) continue;
      bullet.age += deltaSeconds;
      if (bullet.age > 2.25) { this.#release(index); continue; }
      bullet.x += bullet.vx * deltaSeconds;
      bullet.y += bullet.vy * deltaSeconds;
      bullet.z += bullet.vz * deltaSeconds;
      this.#direction.set(bullet.vx, bullet.vy, bullet.vz).normalize();
      this.#quaternion.setFromUnitVectors(up, this.#direction);
      this.#position.set(bullet.x, bullet.y, bullet.z);
      this.#matrix.compose(this.#position, this.#quaternion, ONE);
      this.#mesh.setMatrixAt(visible, this.#matrix);
      visible += 1;
    }
    this.#mesh.count = visible;
    this.#mesh.instanceMatrix.needsUpdate = true;
  }

  #release(index) {
    const bullet = this.#slots[index];
    this.#slotById.delete(bullet.id);
    bullet.active = false;
    this.#freeSlots.push(index);
  }
}

const UP = new THREE.Vector3(0, 1, 0);
const ONE = new THREE.Vector3(1, 1, 1);
