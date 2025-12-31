/**
 * FurnitureLoader - Handles loading and caching of furniture models
 */

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class FurnitureLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map(); // Cache loaded models
    this.loadingPromises = new Map(); // Track in-progress loads
    
    // Setup DRACO decoder for compressed models (optional)
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  /**
   * Load a furniture model by path
   * @param {string} modelPath - Path identifier (e.g., "chair01")
   * @returns {Promise<THREE.Group>} - Cloned model ready to use
   */
  async load(modelPath) {
    const fullPath = `/assets/models/furniture/${modelPath}.glb`;
    
    // Return from cache if available
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath).scene.clone();
    }
    
    // Wait for in-progress load
    if (this.loadingPromises.has(fullPath)) {
      const gltf = await this.loadingPromises.get(fullPath);
      return gltf.scene.clone();
    }
    
    // Start new load
    const loadPromise = new Promise((resolve, reject) => {
      this.loader.load(
        fullPath,
        (gltf) => {
          // Pre-process the model
          this._preprocessModel(gltf.scene);
          
          // Cache the original
          this.cache.set(fullPath, gltf);
          this.loadingPromises.delete(fullPath);
          
          console.log(`✅ Model loaded: ${modelPath}`);
          resolve(gltf);
        },
        (progress) => {
          // Progress callback (optional)
        },
        (error) => {
          console.error(`❌ Failed to load model: ${modelPath}`, error);
          this.loadingPromises.delete(fullPath);
          reject(error);
        }
      );
    });
    
    this.loadingPromises.set(fullPath, loadPromise);
    const gltf = await loadPromise;
    return gltf.scene.clone();
  }

  /**
   * Pre-process loaded model (enable shadows, etc.)
   */
  _preprocessModel(scene) {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Ensure materials are properly set up
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
  }

  /**
   * Create a primitive fallback furniture (when model not available)
   * @param {string} type - Type of furniture
   * @returns {THREE.Mesh}
   */
  createPrimitive(type) {
    const THREE = window.THREE || require('three');
    
    let geometry, material, mesh;
    const colors = {
      chair: 0x8B4513,
      table: 0xDEB887,
      couch: 0x4169E1,
      default: 0x888888
    };
    
    const color = colors[type] || colors.default;
    material = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    
    switch (type) {
      case 'chair':
        // Simple chair shape
        geometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.4;
        break;
        
      case 'table':
        // Simple table shape
        geometry = new THREE.BoxGeometry(1.2, 0.05, 0.8);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.75;
        // Add legs
        const legGeo = new THREE.BoxGeometry(0.05, 0.7, 0.05);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
        const positions = [[-0.5, 0.35, -0.35], [0.5, 0.35, -0.35], [-0.5, 0.35, 0.35], [0.5, 0.35, 0.35]];
        positions.forEach(pos => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(...pos);
          mesh.add(leg);
        });
        break;
        
      case 'couch':
      case 'sofa':
        // Simple couch shape
        geometry = new THREE.BoxGeometry(2, 0.8, 0.9);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.4;
        break;
        
      default:
        // Generic box
        geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.3;
    }
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * Check if a model file exists (by attempting to load it)
   */
  async modelExists(modelPath) {
    try {
      await this.load(modelPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Singleton instance
export const furnitureLoader = new FurnitureLoader();
