let scene, camera, renderer, controls;
let selectedTile = null;
const tiles = [];
let placedTiles = [];
let previewMesh = null;
let currentGridCols = 0,
  currentGridRows = 0,
  currentTileW = 0,
  currentTileH = 0;
let currentRotation = 0;
export let store = {
  get scene() {
    return scene;
  },
  set scene(value) {
    scene = value;
  },
  get camera() {
    return camera;
  },
  set camera(value) {
    camera = value;
  },
  get renderer() {
    return renderer;
  },
  set renderer(value) {
    renderer = value;
  },
  get controls() {
    return controls;
  },
  set controls(value) {
    controls = value;
  },
  get selectedTile() {
    return selectedTile;
  },
  set selectedTile(value) {
    selectedTile = value;
  },
  get tiles() {
    return tiles;
  },
  get placedTiles() {
    return placedTiles;
  },
  set placedTiles(value) {
    placedTiles = value;
  },
  get previewMesh() {
    return previewMesh;
  },
  set previewMesh(value) {
    previewMesh = value;
  },
  get currentGridCols() {
    return currentGridCols;
  },
  set currentGridCols(value) {
    currentGridCols = value;
  },
  get currentGridRows() {
    return currentGridRows;
  },
  set currentGridRows(value) {
    currentGridRows = value;
  },
  get currentTileW() {
    return currentTileW;
  },
  set currentTileW(value) {
    currentTileW = value;
  },
  get currentTileH() {
    return currentTileH;
  },
  set currentTileH(value) {
    currentTileH = value;
  },
  get currentRotation() {
    return currentRotation;
  },
  set currentRotation(value) {
    currentRotation = value;
  },
};
