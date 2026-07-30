import * as THREE from 'three';

const WING_GEOMETRY = new THREE.BoxGeometry(14, 0.55, 2.8);
const TAIL_GEOMETRY = new THREE.BoxGeometry(6, 0.4, 1.2);
const BODY_GEOMETRY = new THREE.ConeGeometry(2.25, 13, 6);

export function createPlane(color) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.54, metalness: 0.12 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: '#172433', flatShading: true });
  const body = new THREE.Mesh(BODY_GEOMETRY, material);
  body.rotation.x = Math.PI / 2;
  const wing = new THREE.Mesh(WING_GEOMETRY, material);
  wing.position.z = -1;
  const tail = new THREE.Mesh(TAIL_GEOMETRY, material);
  tail.position.set(0, 1.7, -4.7);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6), darkMaterial);
  cockpit.scale.set(0.75, 0.48, 1.25);
  cockpit.position.set(0, 1, 1);
  const exhaust = new THREE.Mesh(new THREE.ConeGeometry(1.15, 7, 6), new THREE.MeshBasicMaterial({ color: '#d5e7ed', transparent: true, opacity: 0.45 }));
  exhaust.rotation.x = -Math.PI / 2;
  exhaust.position.z = -8;
  exhaust.name = 'exhaust';
  const smoke = new THREE.Mesh(new THREE.ConeGeometry(1.7, 10, 6), new THREE.MeshBasicMaterial({ color: '#9eb5bf', transparent: true, opacity: 0.16, depthWrite: false }));
  smoke.rotation.x = -Math.PI / 2;
  smoke.position.z = -11;
  smoke.name = 'smoke';
  group.add(body, wing, tail, cockpit, exhaust, smoke);
  return group;
}
