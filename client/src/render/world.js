import * as THREE from 'three';

export function createWorld(scene) {
  scene.background = new THREE.Color('#78b9e8');
  scene.fog = new THREE.FogExp2('#9dcae9', 0.00072);
  scene.add(new THREE.HemisphereLight('#dff6ff', '#3a5470', 2.3));

  const sunLight = new THREE.DirectionalLight('#fff4ca', 3.2);
  sunLight.position.set(240, 420, -180);
  scene.add(sunLight);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(38, 20, 14), new THREE.MeshBasicMaterial({ color: '#fff0ad' }));
  sun.position.copy(sunLight.position).multiplyScalar(3);
  scene.add(sun);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1700, 32, 16),
    new THREE.MeshBasicMaterial({ color: '#79b9e8', side: THREE.BackSide }),
  );
  scene.add(sky);

  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(2600, 2600),
    new THREE.MeshStandardMaterial({ color: '#23689d', roughness: 0.44, metalness: 0.08 }),
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = -5;
  scene.add(ocean);

  const islandMaterial = new THREE.MeshStandardMaterial({ color: '#47744b', flatShading: true });
  const rockMaterial = new THREE.MeshStandardMaterial({ color: '#81694f', flatShading: true });
  for (let index = 0; index < 18; index += 1) {
    const angle = index * 2.399;
    const radius = 180 + (index % 6) * 110;
    const island = new THREE.Group();
    island.position.set(Math.cos(angle) * radius, 12 + (index % 4) * 19, Math.sin(angle) * radius);
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(20 + (index % 4) * 7, 1), rockMaterial);
    rock.scale.set(1.7, 0.6, 1.4);
    const grass = new THREE.Mesh(new THREE.IcosahedronGeometry(18 + (index % 4) * 6, 1), islandMaterial);
    grass.position.y = 12;
    grass.scale.set(1.55, 0.45, 1.25);
    island.add(rock, grass);
    scene.add(island);
  }

  const cloudGeometry = new THREE.DodecahedronGeometry(12, 0);
  const clouds = new THREE.InstancedMesh(cloudGeometry, new THREE.MeshStandardMaterial({ color: '#ffffff', flatShading: true, transparent: true, opacity: 0.84 }), 150);
  const matrix = new THREE.Matrix4();
  for (let index = 0; index < 150; index += 1) {
    const angle = index * 2.4;
    const radius = 100 + ((index * 79) % 800);
    const scale = 0.8 + (index % 5) * 0.22;
    matrix.compose(new THREE.Vector3(Math.cos(angle) * radius, 75 + (index % 7) * 23, Math.sin(angle) * radius), new THREE.Quaternion(), new THREE.Vector3(scale * 2.2, scale, scale * 1.4));
    clouds.setMatrixAt(index, matrix);
  }
  clouds.instanceMatrix.needsUpdate = true;
  scene.add(clouds);
}
