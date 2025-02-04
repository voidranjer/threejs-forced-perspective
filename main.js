import * as THREE from "three";
// import WebGL from "three/addons/capabilities/WebGL.js";
// import { DragControls } from "three/addons/controls/DragControls.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// constants
const SPEED = 0.5;
const RADIUS = 3;

// state variables
const objects = [];
let isMouseDown = false;
let moveForward = false;
let moveBackward = false;
let strafeRight = false;
let strafeLeft = false;
let prevMouseState = "mouseup"; // mouseup, mousedown
let initialDistToObj = null;
let prevIntersectPoint = null;

const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
const scene = new THREE.Scene();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const arrowHelper = new THREE.ArrowHelper(
  raycaster.ray.cameraDirection,
  raycaster.ray.origin,
  300,
  0x0000ff
);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
  })
);
const mesh = new THREE.Mesh(
  new THREE.SphereGeometry(RADIUS),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);

// const dragControls = new DragControls(objects, camera, renderer.domElement);
const pointerLockControls = new PointerLockControls(camera, document.body);

// const box = new THREE.Box3();

// ensure the bounding box is computed for its geometry
// this should be done only once (assuming static geometries)
// mesh.geometry.computeBoundingBox();

// in the animation loop, compute the current bounding box with the world matrix
// box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);

function onMouseUp(e) {
  isMouseDown = false;
  initialDistToObj = null;
  prevIntersectPoint = null;
}
function onMouseDown(e) {
  isMouseDown = true;
}
function onKeyDown(e) {
  switch (e.key) {
    case "w":
      moveForward = true;
      break;
    case "s":
      moveBackward = true;
      break;
    case "d":
      strafeRight = true;
      break;
    case "a":
      strafeLeft = true;
      break;
  }
}
function onKeyUp(e) {
  switch (e.key) {
    case "w":
      moveForward = false;
      break;
    case "s":
      moveBackward = false;
      break;
    case "d":
      strafeRight = false;
      break;
    case "a":
      strafeLeft = false;
      break;
  }
}
function onPointerMove(e) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function setup() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 50);
  camera.lookAt(0, 0, 0);

  plane.position.set(0, 0, -20);
  objects.push(plane);
  scene.add(plane);

  objects.push(mesh);
  scene.add(mesh);

  // add crosshair to center using pos absolute
  const crosshair = document.createElement("div");
  crosshair.style.position = "absolute";
  crosshair.style.width = "20px";
  crosshair.style.height = "20px";
  crosshair.style.border = "2px solid #fff";
  crosshair.style.left = window.innerWidth / 2 - 10 + "px";
  crosshair.style.top = window.innerHeight / 2 - 10 + "px";
  document.body.appendChild(crosshair);

  // event listeners
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("click", () => {
    pointerLockControls.lock();
  });
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mouseup", onMouseUp);

  // debug
  // scene.add(arrowHelper);
}

function animate() {
  renderer.render(scene, camera);

  // Camera orientation
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  cameraDirection.normalize();
  const rightDirection = new THREE.Vector3();
  rightDirection.crossVectors(cameraDirection, camera.up).normalize(); // Compute rightward direction

  // Movement
  const ylessDirection = cameraDirection.clone();
  ylessDirection.y = 0;
  const ylessRightDirection = rightDirection.clone();
  ylessRightDirection.y = 0;
  if (moveForward) {
    camera.position.addScaledVector(ylessDirection, SPEED);
  }
  if (moveBackward) {
    camera.position.addScaledVector(ylessDirection, -SPEED);
  }
  if (strafeRight) {
    camera.position.addScaledVector(ylessRightDirection, SPEED);
  }
  if (strafeLeft) {
    camera.position.addScaledVector(ylessRightDirection, -SPEED);
  }

  // Raycasting
  raycaster.setFromCamera(pointer, camera); // pos
  raycaster.ray.direction.copy(cameraDirection); // orientation
  // arrowHelper.position.copy(camera.position);
  // arrowHelper.setDirection(direction);

  // TODO: this is computed twice (dupe)
  const intersects = raycaster.intersectObjects(objects);
  // objects.forEach((obj) => obj.material.color.set(0xff0000));
  // mesh.material.color.set(0xff0000);
  // if (intersects.length === 2) {
  // const firstIntersected = intersects[0].object;
  // mesh.material.color.set(0x00ff00);
  // }

  // Forced Perspective
  let distToObj = camera.position.distanceTo(mesh.position);
  if (intersects.length === 2 && isMouseDown) {
    if (initialDistToObj === null) {
      /*
        - setting initialDistToObj fixes the apparent scale of the object to look like its
          actual scale when initialDistToObj == distToObj
        - to set an anchor point (for the apparent scale of the obj), capture the value of
          distToObj at that moment into initialDistToObj
      */
      initialDistToObj = distToObj;
    }

    if (prevMouseState === "mouseup") {
    }

    // compute bounding boxes
    mesh.geometry.computeBoundingBox();
    plane.geometry.computeBoundingBox();
    const meshBox = mesh.geometry.boundingBox
      .clone()
      .applyMatrix4(mesh.matrixWorld);
    const planeBox = plane.geometry.boundingBox
      .clone()
      .applyMatrix4(plane.matrixWorld);

    // push object away from the camera until it reaches the plane
    if (!meshBox.intersectsBox(planeBox)) {
      const CLIPPING_THRESH = 0.1; // percentage
      mesh.position.addScaledVector(cameraDirection, RADIUS * CLIPPING_THRESH);
    }
    distToObj = camera.position.distanceTo(mesh.position); // recompute after moving

    const scale = distToObj / initialDistToObj;
    mesh.scale.set(scale, scale, scale);

    // if (prevIntersectPoint !== null) {
    //   const offset = intersects[1].point
    //     .clone()
    //     .sub(prevIntersectPoint);
    //   mesh.position.add(offset);
    // }
    // prevIntersectPoint = intersects[0].point.clone();

    // if (initialDist === null || prevIntersectPoint === null) {
    //   initialDist = dist;
    // prevIntersectPoint = intersects[0].point;
    //   return;
    // }
  }
  prevMouseState = isMouseDown ? "mousedown" : "mouseup";
}

setup();
renderer.setAnimationLoop(animate);

// if (!WebGL.isWebGL2Available()) {
//   const warning = WebGL.getWebGL2ErrorMessage();
//   document.getElementById("container").appendChild(warning);
// }
