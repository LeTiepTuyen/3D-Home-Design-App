/**
 * ControlsManager - OrbitControls setup
 * Handles camera navigation (rotate, zoom, pan)
 */

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ControlsManager {
  constructor(camera, domElement) {
    this.controls = new OrbitControls(camera, domElement);
    this._configure();
  }

  _configure() {
    // Enable damping for smooth movement
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Limit vertical rotation (don't go below floor)
    this.controls.minPolarAngle = 0.1; // Slightly above horizontal
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below floor

    // Zoom limits
    this.controls.minDistance = 3;
    this.controls.maxDistance = 20;

    // Pan limits (keep camera focused on room)
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.8;

    // Set target to room center
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
  }

  update() {
    this.controls.update();
  }

  // Enable/disable controls (useful during object dragging)
  setEnabled(enabled) {
    this.controls.enabled = enabled;
  }

  getTarget() {
    return this.controls.target;
  }
}

export default ControlsManager;
