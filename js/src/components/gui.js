import * as THREE from 'three';
import GUI from 'lil-gui';
import {
  store
} from './state.js';
import {
  loadTileset,
  saveFinal
} from './io.js';
import {
  createProject,
  animate
} from './canvas.js';
import {
  createCamera,
  createControls
} from './camera.js';
import {
  createGrid,
  createBoundary
} from './grid.js';
export function initGUI() {
  const gui = new GUI();
  const tileSettings = {
    tileWidth: 32,
    tileHeight: 32,
    useAutotile: false,
    loadTileset: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = (event) => {
        loadTileset(tileSettings.tileWidth, tileSettings.tileHeight, tileSettings.useAutotile, event.target.files);
      };
      input.click();
    }
  };
  const projectSettings = {
    gridCols: 10,
    gridRows: 10,
    createProject: () => {
      store.currentGridCols = projectSettings.gridCols;
      store.currentGridRows = projectSettings.gridRows;
      store.currentTileW = tileSettings.tileWidth;
      store.currentTileH = tileSettings.tileHeight;
      const projectCanvas = document.getElementById('projectCanvas');
      if (store.renderer) {
        projectCanvas.removeChild(store.renderer.domElement);
      }
      store.scene = new THREE.Scene();
      store.placedTiles = [];
      if (store.previewMesh) {
        store.scene.remove(store.previewMesh);
        store.previewMesh = null;
      }
      const width = projectCanvas.clientWidth;
      const height = projectCanvas.clientHeight;
      createCamera(width, height);
      createControls(store.camera, projectCanvas);
      createProject(width, height);
      const grid = createGrid(store.currentGridCols, store.currentGridRows, store.currentTileW, store.currentTileH);
      store.scene.add(grid);
      const boundary = createBoundary(store.currentGridCols, store.currentGridRows, store.currentTileW, store.currentTileH);
      store.scene.add(boundary);
      animate();
    },
    saveFinal: saveFinal
  };
  const layerSettings = {
    zIndex: 0
  };
  const tileFolder = gui.addFolder('Tile Settings');
  tileFolder.add(tileSettings, 'tileWidth', 1, 128, 1).name('Tile Width (px)');
  tileFolder.add(tileSettings, 'tileHeight', 1, 128, 1).name('Tile Height (px)');
  tileFolder.add(tileSettings, 'useAutotile').name('Use Autotiling');
  tileFolder.add(tileSettings, 'loadTileset').name('Load Tileset');
  const projectFolder = gui.addFolder('Project Settings');
  projectFolder.add(projectSettings, 'gridCols', 1, 100, 1).name('Grid Columns');
  projectFolder.add(projectSettings, 'gridRows', 1, 100, 1).name('Grid Rows');
  projectFolder.add(projectSettings, 'createProject').name('Create Project Canvas');
  projectFolder.add(projectSettings, 'saveFinal').name('Save Final');
  const layerFolder = gui.addFolder('Layer Settings');
  const zIndexController = layerFolder.add(layerSettings, 'zIndex', 0, 10, 1).name('Z-Index');
  zIndexController.onChange((value) => {
    store.zIndex = value;
    updateLayerVisibility(value);
  });
}

function updateLayerVisibility(activeZ) {
  store.placedTiles.forEach(tile => {
    if (tile.zIndex > activeZ) {
      tile.mesh.visible = false;
    } else {
      tile.mesh.visible = true;
      tile.mesh.material.opacity = (tile.zIndex === activeZ) ? 1 : (tile.zIndex + 1) / (activeZ + 1);
    }
  });
  if (store.previewMesh) {
    store.previewMesh.position.z = activeZ;
  }
}
