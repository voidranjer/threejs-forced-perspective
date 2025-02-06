import * as THREE from "three";
import { GUI } from "dat.gui";
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
let prevDistToObj = null;
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

// helpers
const virtualMesh = new THREE.Mesh(
  new THREE.SphereGeometry(RADIUS),
  new THREE.MeshBasicMaterial({ color: 0x00ff00, visible: false })
);
const translatePivot = new THREE.Object3D();

const gui = new GUI();
const customDebugger = { message: "empty", message2: "empty" };
const debugFolder = gui.addFolder("Debug");
debugFolder.add(customDebugger, "message").listen();
debugFolder.add(customDebugger, "message2").listen();
debugFolder.open();

const pointerLockControls = new PointerLockControls(camera, document.body);

function onMouseUp(e) {
  isMouseDown = false;
  prevDistToObj = null;
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
  // scene.add(mesh);
  // scene.add(virtualMesh);
  scene.add(translatePivot);
  translatePivot.add(mesh);
  translatePivot.add(virtualMesh);

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

  let intersects = raycaster.intersectObjects(objects);
  // objects.forEach((obj) => obj.material.color.set(0xff0000));
  // mesh.material.color.set(0xff0000);
  // if (intersects.length === 2) {
  // const firstIntersected = intersects[0].object;
  // mesh.material.color.set(0x00ff00);
  // }

  // Forced Perspective
  let distToObj = camera.position.distanceTo(mesh.position);
  // customDebugger.message = `${cameraDirection.x.toFixed(
  //   2
  // )}, ${cameraDirection.y.toFixed(2)}, ${cameraDirection.z.toFixed(2)}`;
  customDebugger.message = mesh
    .getWorldPosition(new THREE.Vector3())
    .toArray()
    .map((item) => item.toFixed(2))
    .toString();
  if (intersects.length === 2 && isMouseDown) {
    // if (prevDistToObj === null) {
    /*
        - setting prevDistToObj fixes the apparent scale of the object to look like its
          actual scale when prevDistToObj == distToObj
        - to set an anchor point (for the apparent scale of the obj), capture the value of
          distToObj at that moment into prevDistToObj
      */
    // prevDistToObj = distToObj;
    // }

    // if (prevIntersectPoint !== null) {
    //   // const offset = intersects[1].point.clone().sub(prevIntersectPoint);
    //   // offset.z = 0; // move only in x and y TODO: This may not work if we use it on another plane (not xy)
    //   // mesh.position.add(offset);

    // }
    // prevIntersectPoint = intersects[1].point.clone();

    if (prevMouseState === "mouseup") {
      console.log("i ran");
      // reattach mesh to translatePivot
      scene.attach(mesh);
      scene.attach(virtualMesh);
      translatePivot.position.copy(intersects[1].point);
      translatePivot.attach(mesh);
      translatePivot.attach(virtualMesh);
    }
    translatePivot.position.copy(intersects[1].point);
    raycaster.intersectObjects(objects); // recompute intersects after moving

    // compute bounding boxes
    mesh.geometry.computeBoundingBox();
    plane.geometry.computeBoundingBox();
    let meshBox = mesh.geometry.boundingBox
      .clone()
      .applyMatrix4(mesh.matrixWorld);
    let planeBox = plane.geometry.boundingBox
      .clone()
      .applyMatrix4(plane.matrixWorld);
    // let meshBoxLength = meshBox.getSize(new THREE.Vector3()).length();
    // compute intersection
    // let boxIntersection = meshBox.clone().intersect(planeBox);
    // let boxIntersectionLength = boxIntersection
    //   .getSize(new THREE.Vector3())
    //   .length();

    // push object away from the camera until it reaches the plane
    if (meshBox.intersectsBox(planeBox)) {
      // use virtualMesh to simulate pushing the box
      // if pulling the box will cause it to leave the plane, do not do it
      // otherwise, pull it actually

      virtualMesh.position.copy(mesh.position);
      virtualMesh.position.addScaledVector(cameraDirection, -1);
      virtualMesh.geometry.computeBoundingBox();
      let virtualMeshBox = virtualMesh.geometry.boundingBox
        .clone()
        .applyMatrix4(virtualMesh.matrixWorld);

      if (virtualMeshBox.intersectsBox(planeBox)) {
        mesh.position.addScaledVector(cameraDirection, -1);
      }
    } else {
      mesh.position.addScaledVector(cameraDirection, 1);
    }

    // recompute after moving
    distToObj = camera
      .getWorldPosition(new THREE.Vector3())
      .distanceTo(mesh.getWorldPosition(new THREE.Vector3()));

    // scale
    if (prevDistToObj !== null) {
      const scale = distToObj / prevDistToObj;
      customDebugger.message2 = scale;
      const scalingMatrix = new THREE.Matrix4().makeScale(scale, scale, scale); // TODO: Scale not from 0,0,0 but from pointer
      mesh.applyMatrix4(scalingMatrix);
    }
    prevDistToObj = distToObj;

    prevMouseState = "mousedown";
  } else {
    prevMouseState = "mouseup";
  }
}

setup();
renderer.setAnimationLoop(animate);
