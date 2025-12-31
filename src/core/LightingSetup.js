/**
 * LightingSetup - Scene lighting configuration
 * Ambient + Directional lights with shadows
 */

import * as THREE from 'three';

export class LightingSetup {
  constructor(scene) {
    this.scene = scene;
    this.lights = [];
    
    this._setupLights();
  }

  _setupLights() {
    // Ambient light - soft overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Main directional light - simulates sunlight through window
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    
    // Shadow configuration
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    mainLight.shadow.bias = -0.0001;
    
    this.scene.add(mainLight);
    this.lights.push(mainLight);

    // Fill light - softer light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 8, -5);
    this.scene.add(fillLight);
    this.lights.push(fillLight);

    // Hemisphere light - sky/ground color variation
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    hemiLight.position.set(0, 10, 0);
    this.scene.add(hemiLight);
    this.lights.push(hemiLight);
  }

  getMainLight() {
    return this.lights[1]; // Directional light
  }
}

export default LightingSetup;
