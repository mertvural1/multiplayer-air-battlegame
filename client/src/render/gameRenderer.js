import * as THREE from 'three';
import { BulletRenderer } from './bulletRenderer.js';
import { ExplosionSystem } from './explosionSystem.js';
import { PlayerRenderer } from './playerRenderer.js';
import { createWorld } from './world.js';

export class GameRenderer {
  #clock = new THREE.Clock();
  #cameraVelocity = new THREE.Vector3();
  #forward = new THREE.Vector3();
  #desiredCamera = new THREE.Vector3();
  #lookTarget = new THREE.Vector3();
  #aimTarget = new THREE.Vector3();
  #selfPosition = new THREE.Vector3();
  #shake = 0;
  #raycaster = new THREE.Raycaster();
  #mouse = new THREE.Vector2();

  constructor(container) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 1900);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.append(this.renderer.domElement);
    createWorld(this.scene);
    this.players = new PlayerRenderer(this.scene);
    this.bullets = new BulletRenderer(this.scene);
    this.explosions = new ExplosionSystem(this.scene);
    this.camera.position.set(0, 100, -45);
    window.addEventListener('resize', () => this.#resize());
  }

  render(state) {
    const deltaSeconds = Math.min(this.#clock.getDelta(), 0.05);
    this.players.sync(state.players);
    this.bullets.update(deltaSeconds);
    this.explosions.update(deltaSeconds);
    this.#followPlayer(state.selfId);
    this.renderer.render(this.scene, this.camera);
  }

  aimAt(clientX, clientY, self) {
    if (!self) return null;
    this.#mouse.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    this.#raycaster.setFromCamera(this.#mouse, this.camera);
    const direction = this.#raycaster.ray.direction;
    const origin = this.#raycaster.ray.origin;
    const distance = (self.state.y - origin.y) / direction.y;
    if (!Number.isFinite(distance) || distance < 0) return { x: Math.sin(self.state.yaw), y: 0, z: Math.cos(self.state.yaw) };
    this.#aimTarget.copy(direction).multiplyScalar(distance).add(origin);
    this.#selfPosition.set(self.state.x, self.state.y, self.state.z);
    this.#aimTarget.sub(this.#selfPosition).normalize();
    return { x: this.#aimTarget.x, y: this.#aimTarget.y, z: this.#aimTarget.z };
  }

  explode(position) { this.explosions.explode(new THREE.Vector3(position.x, position.y, position.z)); this.#shake = 0.65; }
  fireBullet(bullet) { this.bullets.spawn(bullet); }

  #followPlayer(id) {
    const plane = this.players.getObject(id);
    if (!plane?.visible) return;
    this.#forward.set(Math.sin(plane.rotation.y), 0, Math.cos(plane.rotation.y));
    this.#desiredCamera.copy(plane.position).addScaledVector(this.#forward, -37).addScaledVector(UP, 17);
    this.camera.position.lerp(this.#desiredCamera, 0.09);
    this.#shake *= 0.88;
    if (this.#shake > 0.01) this.camera.position.add(this.#cameraVelocity.set((Math.random() - 0.5) * this.#shake, (Math.random() - 0.5) * this.#shake, 0));
    this.#lookTarget.copy(plane.position).addScaledVector(this.#forward, 55);
    this.camera.lookAt(this.#lookTarget);
  }

  #resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

const UP = new THREE.Vector3(0, 1, 0);
