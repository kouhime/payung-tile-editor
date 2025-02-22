import * as THREE from 'three'
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let selectedTile = null; // { dataURL, type } where type can be "normal" or "autotile"
const tiles = []; 
let placedTiles = []; 
let previewMesh = null; 

let currentGridCols = 0,
    currentGridRows = 0,
    currentTileW = 0,
    currentTileH = 0;
let currentRotation = 0;

const $ = id => document.getElementById(id)

document.addEventListener("DOMContentLoaded", function() {
    const tilesetInput = $('tilesetInput');
    const tileWidthInput = $('tileWidth');
    const tileHeightInput = $('tileHeight');
    const loadTilesetButton = $('loadTileset');
    const normalTilesContainer = $('normalTilesContainer');
    const autotileCheckbox = $('autotileCheckbox');
    const autotileContainer = $('autotileContainer');

    const gridColsInput = $('gridCols');
    const gridRowsInput = $('gridRows');
    const createProjectButton = $('createProject');
    const projectCanvasDiv = $('projectCanvas');
    const zIndexSlider = $('zIndexSlider');
    const zIndexValue = $('zIndexValue');
    const saveFinalButton = $('saveFinal');

    // (90° per press)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'r' || event.key === 'R') {
            currentRotation += Math.PI / 2;
            if (previewMesh) {
                previewMesh.rotation.z = currentRotation;
            }
        }
    });

    loadTilesetButton.addEventListener('click', function() {
        if (!tilesetInput.files.length) {
            alert("Please select at least one tileset image.");
            return;
        }
        const tileW = parseInt(tileWidthInput.value);
        const tileH = parseInt(tileHeightInput.value);
        const useAutotile = autotileCheckbox.checked;
        Array.from(tilesetInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    if (useAutotile) {
                        img.classList.add('tile');
                        img.style.width = tileW + 'px';
                        img.style.height = tileH + 'px';
                        img.addEventListener('click', function() {
                            document.querySelectorAll('.tile').forEach(el => el.classList.remove('selected'));
                            img.classList.add('selected');
                            selectedTile = {
                                dataURL: img.src,
                                type: "autotile"
                            };
                        });
                        autotileContainer.appendChild(img);
                        tiles.push({
                            dataURL: img.src,
                            type: "autotile"
                        });
                    } else {
                        // slicer by defined dimension
                        const cols = Math.floor(img.width / tileW);
                        const rows = Math.floor(img.height / tileH);
                        for (let y = 0; y < rows; y++) {
                            for (let x = 0; x < cols; x++) {
                                const tileCanvas = document.createElement('canvas');
                                tileCanvas.width = tileW;
                                tileCanvas.height = tileH;
                                const ctx = tileCanvas.getContext('2d');
                                ctx.drawImage(img, x * tileW, y * tileH, tileW, tileH, 0, 0, tileW, tileH);
                                tileCanvas.classList.add('tile');
                                tileCanvas.addEventListener('click', function() {
                                    document.querySelectorAll('.tile').forEach(el => el.classList.remove('selected'));
                                    tileCanvas.classList.add('selected');
                                    selectedTile = {
                                        dataURL: tileCanvas.toDataURL(),
                                        type: "normal"
                                    };
                                });
                                normalTilesContainer.appendChild(tileCanvas);
                                tiles.push({
                                    dataURL: tileCanvas.toDataURL(),
                                    type: "normal"
                                });
                            }
                        }
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    });

    function initThree(gridCols, gridRows, tileW, tileH) {
        if (renderer) {
            projectCanvasDiv.removeChild(renderer.domElement);
        }
        scene = new THREE.Scene();
        placedTiles = [];
        if (previewMesh) {
            scene.remove(previewMesh);
            previewMesh = null;
        }

        const width = projectCanvasDiv.clientWidth;
        const height = projectCanvasDiv.clientHeight;
        camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -500, 1000);
        camera.position.set(0, 0, 500);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(width, height);
        projectCanvasDiv.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableRotate = false;
        controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;

        const gridWidth = gridCols * tileW;
        const gridHeight = gridRows * tileH;

        const gridHelper = new THREE.GridHelper(gridWidth, gridCols, 0x888888, 0x444444);
        scene.add(gridHelper);

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
        scene.add(boundaryLine);
    }

    createProjectButton.addEventListener('click', function() {
        currentGridCols = parseInt(gridColsInput.value);
        currentGridRows = parseInt(gridRowsInput.value);
        currentTileW = parseInt(tileWidthInput.value);
        currentTileH = parseInt(tileHeightInput.value);
        initThree(currentGridCols, currentGridRows, currentTileW, currentTileH);
        animate();
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    function withinBoundaries(x, y) {
        const gridWidth = currentGridCols * currentTileW;
        const gridHeight = currentGridRows * currentTileH;
        const leftBound = -gridWidth / 2 + currentTileW / 2;
        const rightBound = gridWidth / 2 - currentTileW / 2;
        const bottomBound = -gridHeight / 2 + currentTileH / 2;
        const topBound = gridHeight / 2 - currentTileH / 2;
        return (x >= leftBound && x <= rightBound && y >= bottomBound && y <= topBound);
    }

    function updateLayerVisibility() {
        const activeZ = parseInt(zIndexSlider.value);
        zIndexValue.innerText = activeZ;
        placedTiles.forEach(tile => {
            if (tile.zIndex > activeZ) {
                tile.mesh.visible = false;
            } else {
                tile.mesh.visible = true;
                tile.mesh.material.opacity = (tile.zIndex === activeZ) ? 1 : (tile.zIndex + 1) / (activeZ + 1);
            }
        });
        if (previewMesh) {
            previewMesh.position.z = activeZ;
        }
    }
    zIndexSlider.addEventListener('input', updateLayerVisibility);

    projectCanvasDiv.addEventListener('mousemove', function(event) {
        if (!selectedTile) {
            if (previewMesh) {
                scene.remove(previewMesh);
                previewMesh = null;
            }
            return;
        }
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ, intersectPoint);

        const snappedX = Math.floor(intersectPoint.x / currentTileW) * currentTileW + currentTileW / 2;
        const snappedY = Math.floor(intersectPoint.y / currentTileH) * currentTileH + currentTileH / 2;

        if (!withinBoundaries(snappedX, snappedY)) {
            if (previewMesh) {
                scene.remove(previewMesh);
                previewMesh = null;
            }
            return;
        }

        const activeZ = parseInt(zIndexSlider.value);
        const cellOccupied = placedTiles.some(tile => tile.x === snappedX && tile.y === snappedY && tile.zIndex === activeZ);
        if (cellOccupied) {
            if (previewMesh) {
                scene.remove(previewMesh);
                previewMesh = null;
            }
            return;
        }

        if (!previewMesh) {
            const texture = new THREE.TextureLoader().load(selectedTile.dataURL);
            if (selectedTile.type === "autotile") {
                texture.repeat.set(1 / 4, 1 / 4);
            }
            const geometry = new THREE.PlaneGeometry(currentTileW, currentTileH);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.5
            });
            previewMesh = new THREE.Mesh(geometry, material);
            scene.add(previewMesh);
        }
        previewMesh.position.set(snappedX, snappedY, activeZ);
        previewMesh.rotation.z = currentRotation;
    });

    projectCanvasDiv.addEventListener('mouseleave', function() {
        if (previewMesh) {
            scene.remove(previewMesh);
            previewMesh = null;
        }
    });
    
    function getPlacedTile(x, y, z) {
        return placedTiles.find(tile => tile.x === x && tile.y === y && tile.zIndex === z);
    }

    // up=1, right=2, down=4, left=8.
    function updateAutotileAt(x, y, z) {
        const tile = getPlacedTile(x, y, z);
        if (!tile || tile.tileType !== "autotile") return;
        let bitmask = 0;
        const activeZ = tile.zIndex;
        if (getPlacedTile(x, y + currentTileH, activeZ) && getPlacedTile(x, y + currentTileH, activeZ).tileType === "autotile") bitmask += 1;
        if (getPlacedTile(x + currentTileW, y, activeZ) && getPlacedTile(x + currentTileW, y, activeZ).tileType === "autotile") bitmask += 2;
        if (getPlacedTile(x, y - currentTileH, activeZ) && getPlacedTile(x, y - currentTileH, activeZ).tileType === "autotile") bitmask += 4;
        if (getPlacedTile(x - currentTileW, y, activeZ) && getPlacedTile(x - currentTileW, y, activeZ).tileType === "autotile") bitmask += 8;
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

    function updateAutotileNeighbors(x, y, z) {
        updateAutotileAt(x, y, z);
        updateAutotileAt(x, y + currentTileH, z);
        updateAutotileAt(x + currentTileW, y, z);
        updateAutotileAt(x, y - currentTileH, z);
        updateAutotileAt(x - currentTileW, y, z);
    }

    projectCanvasDiv.addEventListener('click', function(event) {
        if (!selectedTile) return;
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ, intersectPoint);

        const snappedX = Math.floor(intersectPoint.x / currentTileW) * currentTileW + currentTileW / 2;
        const snappedY = Math.floor(intersectPoint.y / currentTileH) * currentTileH + currentTileH / 2;

        if (!withinBoundaries(snappedX, snappedY)) return;

        const activeZ = parseInt(zIndexSlider.value);
        const existingIndex = placedTiles.findIndex(tile => tile.x === snappedX && tile.y === snappedY && tile.zIndex === activeZ);
        if (existingIndex !== -1) {
            const removedTile = placedTiles[existingIndex];
            scene.remove(removedTile.mesh);
            placedTiles.splice(existingIndex, 1);
            // If an autotile was removed, update neighbors.
            if (removedTile.tileType === "autotile") {
                updateAutotileNeighbors(snappedX, snappedY, activeZ);
            }
            return;
        }

        const texture = new THREE.TextureLoader().load(selectedTile.dataURL);
        if (selectedTile.type === "autotile") {
            texture.repeat.set(1 / 4, 1 / 4);
        }
        const geometry = new THREE.PlaneGeometry(currentTileW, currentTileH);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(snappedX, snappedY, activeZ);
        mesh.rotation.z = currentRotation;
        scene.add(mesh);

        placedTiles.push({
            x: snappedX,
            y: snappedY,
            zIndex: activeZ,
            mesh: mesh,
            tileType: selectedTile.type,
            dataURL: selectedTile.dataURL,
            rotation: currentRotation
        });
        if (selectedTile.type === "autotile") {
            updateAutotileNeighbors(snappedX, snappedY, activeZ);
        }
        updateLayerVisibility();
    });

    saveFinalButton.addEventListener("click", async function() {
        const zip = new JSZip();
        const gridWidth = currentGridCols * currentTileW;
        const gridHeight = currentGridRows * currentTileH;
        const zIndices = [...new Set(placedTiles.map(tile => tile.zIndex))];
        for (const z of zIndices) {
            const canvas = document.createElement("canvas");
            canvas.width = gridWidth;
            canvas.height = gridHeight;
            const ctx = canvas.getContext("2d");
        // 
            const layerTiles = placedTiles.filter(tile => tile.zIndex === z);
            for (const tile of layerTiles) {                
                await new Promise(resolve => {
                    const img = new Image();
                    img.onload = function() {                        
                        const drawX = tile.x + gridWidth / 2 - currentTileW / 2;
                        const drawY = gridHeight / 2 - tile.y - currentTileH / 2;
                        ctx.save();                        
                        ctx.translate(drawX + currentTileW / 2, drawY + currentTileH / 2);
                        ctx.rotate(tile.rotation);
                        if (tile.tileType === "autotile" && tile.variant) {                            
                            const sWidth = img.width / 4;
                            const sHeight = img.height / 4;
                            const sX = tile.variant.col * sWidth;                            
                            const sY = (3 - tile.variant.row) * sHeight;
                            ctx.drawImage(img, sX, sY, sWidth, sHeight, -currentTileW / 2, -currentTileH / 2, currentTileW, currentTileH);
                        } else {                            
                            ctx.drawImage(img, -currentTileW / 2, -currentTileH / 2, currentTileW, currentTileH);
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
    });
});