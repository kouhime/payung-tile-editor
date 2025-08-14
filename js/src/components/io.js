import {
  store
} from './state.js';
import {
  updateTileSelector
} from './tile-selector.js';
export function loadTileset(tileW, tileH, useAutotile, files) {
  if (!files.length) {
    alert("Please select at least one tileset image.");
    return;
  }
  store.tiles.length = 0;
  store.autotile = null;
  let filesLoaded = 0;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        if (useAutotile) {
          store.autotile = {
            dataURL: img.src,
            type: "autotile"
          };
        } else {
          const cols = Math.floor(img.width / tileW);
          const rows = Math.floor(img.height / tileH);
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const tileCanvas = document.createElement('canvas');
              tileCanvas.width = tileW;
              tileCanvas.height = tileH;
              const ctx = tileCanvas.getContext('2d');
              ctx.drawImage(img, x * tileW, y * tileH, tileW, tileH, 0, 0, tileW, tileH);
              store.tiles.push({
                dataURL: tileCanvas.toDataURL(),
                type: "normal"
              });
            }
          }
        }
        filesLoaded++;
        if (filesLoaded === files.length) {
          updateTileSelector();
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
export async function saveFinal() {
  const zip = new JSZip();
  const gridWidth = store.currentGridCols * store.currentTileW;
  const gridHeight = store.currentGridRows * store.currentTileH;
  const zIndices = [...new Set(store.placedTiles.map(tile => tile.zIndex))];
  for (const z of zIndices) {
    const canvas = document.createElement("canvas");
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    const ctx = canvas.getContext("2d");
    //
    const layerTiles = store.placedTiles.filter(tile => tile.zIndex === z);
    for (const tile of layerTiles) {
      await new Promise(resolve => {
        const img = new Image();
        img.onload = function() {
          const drawX = tile.x + gridWidth / 2 - store.currentTileW / 2;
          const drawY = gridHeight / 2 - tile.y - store.currentTileH / 2;
          ctx.save();
          ctx.translate(drawX + store.currentTileW / 2, drawY + store.currentTileH / 2);
          ctx.rotate(tile.rotation);
          if (tile.tileType === "autotile" && tile.variant) {
            const sWidth = img.width / 4;
            const sHeight = img.height / 4;
            const sX = tile.variant.col * sWidth;
            const sY = (3 - tile.variant.row) * sHeight;
            ctx.drawImage(img, sX, sY, sWidth, sHeight, -store.currentTileW / 2, -store.currentTileH / 2, store.currentTileW, store.currentTileH);
          } else {
            ctx.drawImage(img, -store.currentTileW / 2, -store.currentTileH / 2, store.currentTileW, store.currentTileH);
          }
          ctx.restore();
          resolve();
        };
        img.onerror = function() {
          resolve();
        };
        img.src = tile.dataURL;
      });
    }
    const pngData = canvas.toDataURL("image/png");
    const res = await fetch(pngData);
    const blob = await res.blob();
    zip.file(`layer_${z}.png`, blob);
  }
  zip.generateAsync({
    type: "blob"
  }).then(function(content) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(content);
    a.href = url;
    a.download = "final.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
