import {
  store
} from './state.js';
export function getPlacedTile(x, y, z) {
  return store.placedTiles.find(tile => tile.x === x && tile.y === y && tile.zIndex === z);
}
// up=1, right=2, down=4, left=8.
export function updateAutotileAt(x, y, z) {
  const tile = getPlacedTile(x, y, z);
  if (!tile || tile.tileType !== "autotile") return;
  let bitmask = 0;
  const activeZ = tile.zIndex;
  if (getPlacedTile(x, y + store.currentTileH, activeZ) && getPlacedTile(x, y + store.currentTileH, activeZ).tileType === "autotile") bitmask += 1;
  if (getPlacedTile(x + store.currentTileW, y, activeZ) && getPlacedTile(x + store.currentTileW, y, activeZ).tileType === "autotile") bitmask += 2;
  if (getPlacedTile(x, y - store.currentTileH, activeZ) && getPlacedTile(x, y - store.currentTileH, activeZ).tileType === "autotile") bitmask += 4;
  if (getPlacedTile(x - store.currentTileW, y, activeZ) && getPlacedTile(x - store.currentTileW, y, activeZ).tileType === "autotile") bitmask += 8;
  const col = bitmask % 4;
  const row = Math.floor(bitmask / 4);
  const texture = tile.mesh.material.map;
  texture.repeat.set(1 / 4, 1 / 4);
  texture.offset.set(col / 4, 1 - (row + 1) / 4);
  texture.needsUpdate = true;
  tile.variant = {
    col: col,
    row: row
  };
}
export function updateAutotileNeighbors(x, y, z) {
  updateAutotileAt(x, y, z);
  updateAutotileAt(x, y + store.currentTileH, z);
  updateAutotileAt(x + store.currentTileW, y, z);
  updateAutotileAt(x, y - store.currentTileH, z);
  updateAutotileAt(x - store.currentTileW, y, z);
}
