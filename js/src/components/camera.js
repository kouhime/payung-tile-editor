import * as THREE from 'three';
import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
  store
} from './state.js';
export function createCamera(width, height) {
  store.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -500, 1000);
  store.camera.position.set(0, 0, 500);
  store.camera.lookAt(0, 0, 0);
}
export function createControls(camera, domElement) {
  store.controls = new OrbitControls(camera, domElement);
  store.controls.enableRotate = false;
  store.controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
}
