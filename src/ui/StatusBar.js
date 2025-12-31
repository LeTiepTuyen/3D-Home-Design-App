/**
 * StatusBar - Shows current app state
 * Displays selected object and active furniture type
 */

import { AppState } from '../state/AppState.js';

export class StatusBar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this._init();
  }

  _init() {
    if (!this.container) return;

    // Subscribe to state changes
    AppState.subscribe('selectedObject', () => this._update());
    AppState.subscribe('activeFurnitureType', () => this._update());
    AppState.subscribe('placedObjects', () => this._update());

    // Initial update
    this._update();
  }

  _update() {
    if (!this.container) return;

    const selectedObject = AppState.get('selectedObject');
    const activeFurniture = AppState.get('activeFurnitureType');
    const placedObjects = AppState.get('placedObjects') || [];

    this.container.innerHTML = `
      <div class="status-item">
        <span class="status-label">Selected:</span>
        <span class="status-value">${selectedObject ? (selectedObject.userData?.name || 'Object') : 'None'}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Active Type:</span>
        <span class="status-value">${activeFurniture ? activeFurniture.name : 'None'}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Objects:</span>
        <span class="status-value">${placedObjects.length}</span>
      </div>
    `;
  }
}

export default StatusBar;