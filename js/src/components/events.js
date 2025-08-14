import * as THREE from 'three';
import {
  store
} from './state.js';
import {
  createCamera,
  createControls
} from './camera.js';
import {
  createGrid,
  createBoundary
} from './grid.js';
import {
  createProject,
  animate
} from './canvas.js';
import {
  updateAutotileNeighbors
} from './tiles.js';

function withinBoundaries(x, y) {
  const gridWidth = store.currentGridCols * store.currentTileW;
  const gridHeight = store.currentGridRows * store.currentTileH;
  const leftBound = -gridWidth / 2 + store.currentTileW / 2;
  const rightBound = gridWidth / 2 - store.currentTileW / 2;
  const bottomBound = -gridHeight / 2 + store.currentTileH / 2;
  const topBound = gridHeight / 2 - store.currentTileH / 2;
  return (x >= leftBound && x <= rightBound && y >= bottomBound && y <= topBound);
}

export function initEventListeners() {
  document.addEventListener('keydown', function(event) {
    if (event.key === 'r' || event.key === 'R') {
      store.currentRotation += Math.PI / 2;
      if (store.previewMesh) {
        store.previewMesh.rotation.z = store.currentRotation;
      }
    }
  });
  const projectCanvas = document.getElementById('projectCanvas');
  projectCanvas.addEventListener('mousemove', function(event) {
    if (!store.selectedTile) {
      if (store.previewMesh) {
        store.scene.remove(store.previewMesh);
        store.previewMesh = null;
      }
      return;
    }
    const rect = store.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, store.camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeZ, intersectPoint);
    const snappedX = Math.floor(intersectPoint.x / store.currentTileW) * store.currentTileW + store.currentTileW / 2;
    const snappedY = Math.floor(intersectPoint.y / store.currentTileH) * store.currentTileH + store.currentTileH / 2;
    if (!withinBoundaries(snappedX, snappedY)) {
      if (store.previewMesh) {
        store.scene.remove(store.previewMesh);
        store.previewMesh = null;
      }
      return;
    }
    const activeZ = store.zIndex;
    const cellOccupied = store.placedTiles.some(tile => tile.x === snappedX && tile.y === snappedY && tile.zIndex === activeZ);
    if (cellOccupied) {
      if (store.previewMesh) {
        store.scene.remove(store.previewMesh);
        store.previewMesh = null;
      }
      return;
    }
    if (!store.previewMesh) {
      const texture = new THREE.TextureLoader().load(store.selectedTile.dataURL);
      if (store.selectedTile.type === "autotile") {
        texture.repeat.set(1 / 4, 1 / 4);
      }
      const geometry = new THREE.PlaneGeometry(store.currentTileW, store.currentTileH);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.5
      });
      store.previewMesh = new THREE.Mesh(geometry, material);
      store.scene.add(store.previewMesh);
    }
    store.previewMesh.position.set(snappedX, snappedY, activeZ);
    store.previewMesh.rotation.z = store.currentRotation;
  });
  projectCanvas.addEventListener('mouseleave', function() {
    if (store.previewMesh) {
      store.scene.remove(store.previewMesh);
      store.previewMesh = null;
    }
  });
  projectCanvas.addEventListener('click', function(event) {
    if (!store.selectedTile) return;
    const rect = store.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, store.camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeZ, intersectPoint);
    const snappedX = Math.floor(intersectPoint.x / store.currentTileW) * store.currentTileW + store.currentTileW / 2;
    const snappedY = Math.floor(intersectPoint.y / store.currentTileH) * store.currentTileH + store.currentTileH / 2;
    if (!withinBoundaries(snappedX, snappedY)) return;
    const activeZ = store.zIndex;
    const existingIndex = store.placedTiles.findIndex(tile => tile.x === snappedX && tile.y === snappedY && tile.zIndex === activeZ);
    if (existingIndex !== -1) {
      const removedTile = store.placedTiles[existingIndex];
      store.scene.remove(removedTile.mesh);
      store.placedTiles.splice(existingIndex, 1);
      // If an autotile was removed, update neighbors.
      if (removedTile.tileType === "autotile") {
        updateAutotileNeighbors(snappedX, snappedY, activeZ);
      }
      return;
    }
    const texture = new THREE.TextureLoader().load(store.selectedTile.dataURL);
    if (store.selectedTile.type === "autotile") {
      texture.repeat.set(1 / 4, 1 / 4);
    }
    const geometry = new THREE.PlaneGeometry(store.currentTileW, store.currentTileH);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(snappedX, snappedY, activeZ);
    mesh.rotation.z = store.currentRotation;
    store.scene.add(mesh);
    store.placedTiles.push({
      x: snappedX,
      y: snappedY,
      zIndex: activeZ,
      mesh: mesh,
      tileType: store.selectedTile.type,
      dataURL: store.selectedTile.dataURL,
      rotation: store.currentRotation
    });
    if (store.selectedTile.type === "autotile") {
      updateAutotileNeighbors(snappedX, snappedY, activeZ);
    }
  });
}
