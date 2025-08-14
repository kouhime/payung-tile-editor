import {
  store
} from './state.js';
const TILE_SELECTOR_ID = 'tile-selector-panel';
const TILE_CONTAINER_ID = 'tile-selector-container';
const TILE_SELECTOR_STYLE = `
  #${TILE_SELECTOR_ID} {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 10px;
    max-height: 95vh;
    overflow-y: auto;
    z-index: 2;
    width: 300px;
    max-width: 300px;
    background-color: #1f1f1f;
    border: 1px solid #353535;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    color: #eee;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
  #${TILE_SELECTOR_ID} h3 {
    background-color: #000;
    color: #aaa;
    padding: 10px;
    margin: -10px -10px 10px -10px;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
  }
  #${TILE_CONTAINER_ID} h4 {
    color: #aaa;
    font-weight: bold;
    font-size: 12px;
    margin-top: 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid #353535;
    padding-bottom: 5px;
  }
  #${TILE_CONTAINER_ID} .tile {
    border: 1px solid #353535;
    margin: 2px;
    cursor: pointer;
    display: inline-block;
  }
  #${TILE_CONTAINER_ID} .tile:hover {
    border-color: #555;
  }
  #${TILE_CONTAINER_ID} .tile.selected {
    border: 2px solid #0a84ff;
  }
  .resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 10px;
    height: 10px;
    cursor: se-resize;
  }
`;

function createTileSelectorPanel() {
  const panel = document.createElement('div');
  panel.id = TILE_SELECTOR_ID;
  panel.innerHTML = `
    <h3>Tiles</h3>
    <div id="${TILE_CONTAINER_ID}"></div>
    <div class="resize-handle"></div>
  `;
  document.body.appendChild(panel);

  const style = document.createElement('style');
  style.innerHTML = TILE_SELECTOR_STYLE;
  document.head.appendChild(style);

  const handle = panel.querySelector('.resize-handle');
  let isResizing = false;

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    const startX = e.clientX;
    const startWidth = parseInt(document.defaultView.getComputedStyle(panel).width, 10);

    function doDrag(e) {
      if (isResizing) {
        panel.style.width = (startWidth + e.clientX - startX) + 'px';
      }
    }

    function stopDrag() {
      isResizing = false;
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    }

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  });
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
