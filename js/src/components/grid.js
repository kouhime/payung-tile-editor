import * as THREE from 'three';
export function createGrid(gridCols, gridRows, tileW, tileH) {
  const gridWidth = gridCols * tileW;
  const gridHeight = gridRows * tileH;
  const gridHelper = new THREE.GridHelper(gridWidth, gridCols, 0x888888, 0x444444);
  return gridHelper;
}
export function createBoundary(gridCols, gridRows, tileW, tileH) {
  const gridWidth = gridCols * tileW;
  const gridHeight = gridRows * tileH;
  const boundaryPoints = [
    new THREE.Vector3(-gridWidth / 2, -gridHeight / 2, 1),
    new THREE.Vector3(gridWidth / 2, -gridHeight / 2, 1),
    new THREE.Vector3(gridWidth / 2, gridHeight / 2, 1),
    new THREE.Vector3(-gridWidth / 2, gridHeight / 2, 1),
    new THREE.Vector3(-gridWidth / 2, -gridHeight / 2, 1)
  ];
  const boundaryGeometry = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
  const boundaryMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000
  });
  const boundaryLine = new THREE.Line(boundaryGeometry, boundaryMaterial);
  return boundaryLine;
}
