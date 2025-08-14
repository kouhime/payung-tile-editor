import {
  initEventListeners
} from './components/events.js';
import {
  initTileSelector
} from './components/tile-selector.js';
import {
  initGUI
} from './components/gui.js';
document.addEventListener("DOMContentLoaded", function() {
  initEventListeners();
  initTileSelector();
  initGUI();
});
