import * as THREE from 'three';
import {
  store
} from './state.js';
import {
  $
} from './gui.js';
export function createCanvas(width, height) {
  store.renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  store.renderer.setSize(width, height);
  $('projectCanvas').appendChild(store.renderer.domElement);
}
export function animate() {
  requestAnimationFrame(animate);
  store.controls.update();
  store.renderer.render(store.scene, store.camera);
}
