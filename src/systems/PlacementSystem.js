/**
 * PlacementSystem - Handles furniture placement in the room
 * Manages adding objects to scene when user clicks on floor
 */

import * as THREE from 'three';
import { furnitureLoader } from '../loaders/FurnitureLoader.js';
import { AppState } from '../state/AppState.js';
import { ROOM_CONFIG } from '../core/Room.js';

export class PlacementSystem {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    
    // Expose furniture loader for external use (Step 7: StorageManager)
    this.furnitureLoader = furnitureLoader;
    
    // Raycaster for floor detection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Floor plane for placement calculations
    this.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    
    // Container for all placed furniture
    this.furnitureContainer = new THREE.Group();
    this.furnitureContainer.name = 'FurnitureContainer';
    this.scene.add(this.furnitureContainer);
    
    // Track placed objects with metadata
    this.placedObjects = [];
    
    // Loading state
    this.isLoading = false;
    
    // Bind event handlers
    this._onDoubleClick = this._onDoubleClick.bind(this);
    
    this._init();
  }

  _init() {
    // Listen for double-click to place furniture
    this.domElement.addEventListener('dblclick', this._onDoubleClick);
    
    console.log('✅ PlacementSystem initialized');
  }

  /**
   * Handle double-click to place furniture
   */
  async _onDoubleClick(event) {
    // Get active furniture type from state
    const activeFurniture = AppState.get('activeFurnitureType');
    if (!activeFurniture) {
      console.log('ℹ️ No furniture type selected. Select one from the palette first.');
      return;
    }
    
    // Prevent if already loading
    if (this.isLoading) {
      console.log('⏳ Already loading a model...');
      return;
    }

    // Calculate mouse position
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Get intersection point with floor plane
    const intersectPoint = this._getFloorIntersection();
    if (!intersectPoint) {
      console.log('ℹ️ Click on the floor to place furniture');
      return;
    }
    
    // Check if within room bounds
    if (!this._isWithinBounds(intersectPoint)) {
      console.log('⚠️ Position outside room bounds');
      return;
    }
    
    // Place the furniture
    await this._placeFurniture(activeFurniture, intersectPoint);
  }

  /**
   * Get floor intersection point from mouse position
   */
  _getFloorIntersection() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const intersectPoint = new THREE.Vector3();
    const didIntersect = this.raycaster.ray.intersectPlane(this.floorPlane, intersectPoint);
    
    return didIntersect ? intersectPoint : null;
  }

  /**
   * Check if position is within room bounds
   */
  _isWithinBounds(position, margin = 0.5) {
    const halfWidth = (ROOM_CONFIG.width / 2) - margin;
    const halfDepth = (ROOM_CONFIG.depth / 2) - margin;
    
    return (
      position.x >= -halfWidth && position.x <= halfWidth &&
      position.z >= -halfDepth && position.z <= halfDepth
    );
  }

  /**
   * Place furniture at specified position
   */
  async _placeFurniture(furnitureData, position) {
    this.isLoading = true;
    AppState.set('isLoading', true);
    
    try {
      let model;
      
      // Try to load the GLTF model
      try {
        model = await furnitureLoader.load(furnitureData.path);
        console.log(`📦 Loaded model: ${furnitureData.name}`);
      } catch (error) {
        // Fallback to primitive shape
        console.warn(`⚠️ Model not found, using primitive for: ${furnitureData.name}`);
        model = this._createPrimitiveFallback(furnitureData);
      }
      
      // Position on floor
      model.position.copy(position);
      model.position.y = 0; // Ensure on floor
      
      // Apply proper scale based on furniture type
      this._applyScale(model, furnitureData);
      
      // Store metadata for later operations
      model.userData = {
        id: Date.now() + Math.random(), // Unique ID
        furnitureData: furnitureData,
        originalColor: null,
        isSelected: false
      };
      model.name = `Furniture_${furnitureData.name}_${model.userData.id}`;
      
      // Add to scene
      this.furnitureContainer.add(model);
      this.placedObjects.push(model);
      
      // Update app state
      AppState.addPlacedObject(model);
      
      console.log(`✅ Placed: ${furnitureData.name} at (${position.x.toFixed(2)}, ${position.z.toFixed(2)})`);
      
    } catch (error) {
      console.error('❌ Failed to place furniture:', error);
    } finally {
      this.isLoading = false;
      AppState.set('isLoading', false);
    }
  }

  /**
   * Create primitive fallback when model is not available
   */
  _createPrimitiveFallback(furnitureData) {
    const name = furnitureData.name.toLowerCase();
    let type = 'default';
    
    // Determine type from name
    if (name.includes('chair') || name.includes('arm')) type = 'chair';
    else if (name.includes('table')) type = 'table';
    else if (name.includes('couch') || name.includes('sofa')) type = 'couch';
    else if (name.includes('bed')) type = 'bed';
    else if (name.includes('cabinet') || name.includes('cupboard')) type = 'cabinet';
    
    return this._createPrimitiveByType(type, furnitureData);
  }

  /**
   * Create primitive mesh by type
   */
  _createPrimitiveByType(type, furnitureData) {
    const group = new THREE.Group();
    let geometry, material, mesh;
    
    // Random color based on ID for variety
    const hue = (furnitureData.id * 37) % 360;
    const color = new THREE.Color().setHSL(hue / 360, 0.6, 0.5);
    
    material = new THREE.MeshStandardMaterial({ 
      color, 
      roughness: 0.7,
      metalness: 0.1
    });
    
    switch (type) {
      case 'chair':
        // Seat
        geometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.45;
        group.add(mesh);
        // Back
        const back = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, 0.05),
          material
        );
        back.position.set(0, 0.7, -0.22);
        group.add(back);
        // Legs
        const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
        [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([x, z]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(x, 0.225, z);
          group.add(leg);
        });
        break;
        
      case 'table':
        // Top
        geometry = new THREE.BoxGeometry(1.2, 0.05, 0.8);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.75;
        group.add(mesh);
        // Legs
        const tLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.73);
        const tLegMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
        [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].forEach(([x, z]) => {
          const leg = new THREE.Mesh(tLegGeo, tLegMat);
          leg.position.set(x, 0.365, z);
          group.add(leg);
        });
        break;
        
      case 'couch':
        // Base
        geometry = new THREE.BoxGeometry(2, 0.4, 0.9);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.3;
        group.add(mesh);
        // Back
        const cBack = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.5, 0.15),
          material
        );
        cBack.position.set(0, 0.55, -0.38);
        group.add(cBack);
        // Arms
        const armGeo = new THREE.BoxGeometry(0.15, 0.3, 0.9);
        [-0.92, 0.92].forEach(x => {
          const arm = new THREE.Mesh(armGeo, material);
          arm.position.set(x, 0.45, 0);
          group.add(arm);
        });
        break;
        
      case 'bed':
        // Mattress
        geometry = new THREE.BoxGeometry(1.8, 0.3, 2.2);
        mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xf5f5dc }));
        mesh.position.y = 0.35;
        group.add(mesh);
        // Frame
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(1.9, 0.2, 2.3),
          new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        frame.position.y = 0.1;
        group.add(frame);
        // Headboard
        const headboard = new THREE.Mesh(
          new THREE.BoxGeometry(1.9, 0.8, 0.1),
          new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        headboard.position.set(0, 0.6, -1.1);
        group.add(headboard);
        break;
        
      case 'cabinet':
        geometry = new THREE.BoxGeometry(0.8, 1.2, 0.5);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.6;
        group.add(mesh);
        // Doors
        const doorGeo = new THREE.BoxGeometry(0.35, 1.1, 0.02);
        const doorMat = new THREE.MeshStandardMaterial({ color: color.clone().multiplyScalar(0.8) });
        [-0.18, 0.18].forEach(x => {
          const door = new THREE.Mesh(doorGeo, doorMat);
          door.position.set(x, 0.6, 0.26);
          group.add(door);
        });
        break;
        
      default:
        // Generic box
        geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.3;
        group.add(mesh);
    }
    
    // Enable shadows for all meshes
    group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    return group;
  }

  /**
   * Apply appropriate scale to furniture model
   */
  _applyScale(model, furnitureData) {
    // Get bounding box to determine size
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    
    // Target scale based on furniture type
    const name = furnitureData.name.toLowerCase();
    let targetHeight = 1.0; // Default height
    
    if (name.includes('chair')) targetHeight = 0.9;
    else if (name.includes('table')) targetHeight = 0.75;
    else if (name.includes('couch') || name.includes('sofa')) targetHeight = 0.8;
    else if (name.includes('bed')) targetHeight = 0.6;
    else if (name.includes('cabinet') || name.includes('cupboard')) targetHeight = 1.2;
    else if (name.includes('tv')) targetHeight = 0.6;
    else if (name.includes('fridge')) targetHeight = 1.8;
    else if (name.includes('wardrobe')) targetHeight = 2.0;
    
    // Only scale if model is not already close to target
    if (size.y > 0.01) { // Avoid division by zero
      const currentHeight = size.y;
      if (Math.abs(currentHeight - targetHeight) > 0.3) {
        const scale = targetHeight / currentHeight;
        // Limit scale to reasonable range
        const clampedScale = Math.max(0.1, Math.min(3, scale));
        model.scale.setScalar(clampedScale);
      }
    }
    
    // Adjust position so model sits on floor
    const newBox = new THREE.Box3().setFromObject(model);
    const minY = newBox.min.y;
    if (minY < 0) {
      model.position.y = -minY;
    }
  }

  /**
   * Remove a specific object
   */
  removeObject(object) {
    const index = this.placedObjects.indexOf(object);
    if (index > -1) {
      this.placedObjects.splice(index, 1);
      this.furnitureContainer.remove(object);
      
      // Dispose of geometries and materials
      object.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      AppState.removePlacedObject(object);
      console.log(`🗑️ Removed: ${object.name}`);
    }
  }

  /**
   * Remove all placed objects
   */
  clearAll() {
    [...this.placedObjects].forEach(obj => this.removeObject(obj));
    console.log('🗑️ All furniture cleared');
  }

  /**
   * Get all placed objects
   */
  getPlacedObjects() {
    return [...this.placedObjects];
  }

  /**
   * Dispose of the system
   */
  dispose() {
    this.domElement.removeEventListener('dblclick', this._onDoubleClick);
    this.clearAll();
  }
}
