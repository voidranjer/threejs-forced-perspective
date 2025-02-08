import * as THREE from "three";

const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
const scene = new THREE.Scene();

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
  })
);
const mesh = new THREE.Mesh(
  new THREE.SphereGeometry(3),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
const scalePivot = new THREE.Object3D();

function setup() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 50);
  camera.lookAt(0, 0, 0);

  // scalePivot.position.set(3, 0, 0);
  scalePivot.add(mesh);
  mesh.position.set(3, 0, 0);
  scalePivot.scale.set(3, 3, 3);
  scene.add(scalePivot);

  plane.position.set(0, 0, -20);
  scene.add(plane);

  renderer.render(scene, camera);
}

window.requestAnimationFrame(setup);
