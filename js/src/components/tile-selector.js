import {
  store
} from './state.js';
const TILE_SELECTOR_ID = 'tile-selector-panel';
const TILE_CONTAINER_ID = 'tile-selector-container';
const TILE_SELECTOR_STYLE = `
  #${TILE_SELECTOR_ID} {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 10px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 2;
    width: 250px;
    max-width: 250px;
    background-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(64px);
    border: 1px solid #343740;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transition: all 300ms;
    color: white;
    font-family: Arial, sans-serif;
  }
  #${TILE_CONTAINER_ID} .tile {
    border: 1px solid #000;
    margin: 2px;
    cursor: pointer;
    display: inline-block;
  }
  #${TILE_CONTAINER_ID} .tile.selected {
    border: 2px solid red;
  }
`;

function createTileSelectorPanel() {
  const panel = document.createElement('div');
  panel.id = TILE_SELECTOR_ID;
  panel.innerHTML = `
    <h3>Tiles</h3>
    <div id="${TILE_CONTAINER_ID}"></div>
  `;
  document.body.appendChild(panel);
  const style = document.createElement('style');
  style.innerHTML = TILE_SELECTOR_STYLE;
  document.head.appendChild(style);
}

export function initTileSelector() {
  createTileSelectorPanel();
}
export function updateTileSelector() {
  const container = document.getElementById(TILE_CONTAINER_ID);
  container.innerHTML = '';
  // Populate normal tiles
  const normalTiles = store.tiles;
  if (normalTiles.length > 0) {
    const normalTilesContainer = document.createElement('div');
    normalTilesContainer.innerHTML = '<h4>Normal Tiles</h4>';
    normalTiles.forEach(tile => {
      const img = document.createElement('img');
      img.src = tile.dataURL;
      img.classList.add('tile');
      img.onclick = () => {
        store.selectedTile = tile;
        updateSelectedTile(img);
      };
      normalTilesContainer.appendChild(img);
    });
    container.appendChild(normalTilesContainer);
  }
  // Populate autotile
  const autotile = store.autotile;
  if (autotile) {
    const autotileContainer = document.createElement('div');
    autotileContainer.innerHTML = '<h4>Autotile</h4>';
    const img = document.createElement('img');
    img.src = autotile.dataURL;
    img.classList.add('tile');
    img.onclick = () => {
      store.selectedTile = autotile;
      updateSelectedTile(img);
    };
    autotileContainer.appendChild(img);
    container.appendChild(autotileContainer);
  }
}

function updateSelectedTile(selectedImg) {
  const allTiles = document.querySelectorAll(`#${TILE_CONTAINER_ID} .tile`);
  allTiles.forEach(tile => tile.classList.remove('selected'));
  selectedImg.classList.add('selected');
}
