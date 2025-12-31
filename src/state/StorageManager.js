/**
 * StorageManager - Save/Load layout to localStorage
 * Step 7: Persistence
 */

import * as THREE from 'three';
import { AppState } from './AppState.js';

const STORAGE_KEY = '3d-home-design-layout';

export class StorageManager {
  constructor(scene, furnitureLoader) {
    this.scene = scene;
    this.furnitureLoader = furnitureLoader;
    
    console.log('✅ StorageManager initialized');
  }

  /**
   * Save current layout to localStorage
   */
  saveLayout() {
    const placedObjects = AppState.get('placedObjects') || [];
    
    if (placedObjects.length === 0) {
      console.log('ℹ️ Nothing to save');
      return false;
    }

    const layoutData = {
      version: '1.0',
      timestamp: Date.now(),
      objects: placedObjects.map(obj => this._serializeObject(obj))
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutData));
      console.log(`💾 Saved layout: ${layoutData.objects.length} objects`);
      return true;
    } catch (error) {
      console.error('Failed to save layout:', error);
      return false;
    }
  }

  /**
   * Load layout from localStorage
   */
  async loadLayout() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        console.log('ℹ️ No saved layout found');
        return false;
      }

      const layoutData = JSON.parse(data);
      
      if (!layoutData.objects || layoutData.objects.length === 0) {
        console.log('ℹ️ Saved layout is empty');
        return false;
      }

      console.log(`📂 Loading layout: ${layoutData.objects.length} objects`);

      // Clear current objects first
      this._clearCurrentObjects();

      // Load each object
      for (const objData of layoutData.objects) {
        await this._deserializeObject(objData);
      }

      console.log('✅ Layout loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load layout:', error);
      return false;
    }
  }

  /**
   * Check if there's a saved layout
   */
  hasSavedLayout() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    
    try {
      const layoutData = JSON.parse(data);
      return layoutData.objects && layoutData.objects.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get saved layout info
   */
  getSavedLayoutInfo() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    try {
      const layoutData = JSON.parse(data);
      return {
        objectCount: layoutData.objects?.length || 0,
        timestamp: layoutData.timestamp,
        date: new Date(layoutData.timestamp).toLocaleString()
      };
    } catch {
      return null;
    }
  }

  /**
   * Clear saved layout
   */
  clearSavedLayout() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Saved layout cleared');
  }

  /**
   * Serialize a 3D object to JSON-compatible format
   */
  _serializeObject(obj) {
    // Get furniture data from different possible locations in userData
    const furnitureData = obj.userData?.furnitureData || {};
    
    return {
      name: obj.name,
      // Support both old format (furnitureType/Path) and new format (furnitureData)
      furnitureType: obj.userData?.furnitureType || furnitureData.name || 'unknown',
      furniturePath: obj.userData?.furniturePath || furnitureData.path || '',
      furnitureId: obj.userData?.furnitureId || furnitureData.id || 0,
      // Store complete furniture data for proper reload
      furnitureData: furnitureData,
      position: {
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z
      },
      rotation: {
        x: obj.rotation.x,
        y: obj.rotation.y,
        z: obj.rotation.z
      },
      scale: {
        x: obj.scale.x,
        y: obj.scale.y,
        z: obj.scale.z
      },
      // Save color/material modifications
      materialMods: this._serializeMaterialMods(obj)
    };
  }

  /**
   * Serialize material modifications
   */
  _serializeMaterialMods(obj) {
    const mods = [];
    
    obj.traverse((child) => {
      if (child.isMesh && child.material && child.material._isCloned) {
        mods.push({
          childName: child.name || child.uuid,
          color: child.material.color ? '#' + child.material.color.getHexString() : null,
          metalness: child.material.metalness,
          roughness: child.material.roughness,
          opacity: child.material.opacity
        });
      }
    });
    
    return mods.length > 0 ? mods : null;
  }

  /**
   * Deserialize and create a 3D object
   */
  async _deserializeObject(objData) {
    try {
      // Get furniture container
      const container = this.scene.getObjectByName('FurnitureContainer');
      if (!container) {
        console.error('FurnitureContainer not found');
        return null;
      }

      let furniture = null;
      
      // Get the model path from either direct path or furnitureData
      const modelPath = objData.furniturePath || objData.furnitureData?.path;

      // Try to load the model
      if (modelPath && this.furnitureLoader) {
        try {
          furniture = await this.furnitureLoader.load(modelPath);
        } catch (loadError) {
          console.warn(`⚠️ Failed to load model ${modelPath}:`, loadError.message || loadError);
          furniture = null;
        }
      }

      // Fallback to primitive if model loading failed
      if (!furniture) {
        console.log(`⚠️ Using fallback primitive for: ${objData.name}`);
        furniture = this._createFallbackPrimitive(objData.furnitureType, objData.furnitureData);
      }

      // Apply saved properties
      furniture.name = objData.name;
      
      // Restore userData - preserve furnitureData for future saves
      furniture.userData = {
        id: Date.now() + Math.random(),
        name: objData.name,
        furnitureType: objData.furnitureType,
        furniturePath: modelPath,
        furnitureId: objData.furnitureId,
        furnitureData: objData.furnitureData || {
          name: objData.furnitureType,
          path: modelPath,
          id: objData.furnitureId
        },
        isSelectable: true
      };

      // Apply position, rotation, scale
      furniture.position.set(
        objData.position.x,
        objData.position.y,
        objData.position.z
      );
      furniture.rotation.set(
        objData.rotation.x,
        objData.rotation.y,
        objData.rotation.z
      );
      furniture.scale.set(
        objData.scale.x,
        objData.scale.y,
        objData.scale.z
      );

      // Apply material modifications if any
      if (objData.materialMods) {
        this._applyMaterialMods(furniture, objData.materialMods);
      }

      // Add to scene and state
      container.add(furniture);
      AppState.addPlacedObject(furniture);

      console.log(`✅ Restored: ${objData.name} at (${objData.position.x.toFixed(2)}, ${objData.position.z.toFixed(2)})`);

      return furniture;
    } catch (error) {
      console.error('Failed to deserialize object:', objData.name, error);
      return null;
    }
  }

  /**
   * Apply saved material modifications
   */
  _applyMaterialMods(obj, mods) {
    obj.traverse((child) => {
      if (child.isMesh && child.material) {
        const mod = mods.find(m => 
          m.childName === child.name || m.childName === child.uuid
        );
        
        if (mod) {
          // Clone material
          child.material = child.material.clone();
          child.material._isCloned = true;
          
          if (mod.color && child.material.color) {
            child.material.color.set(mod.color);
          }
          if (mod.metalness !== undefined) {
            child.material.metalness = mod.metalness;
          }
          if (mod.roughness !== undefined) {
            child.material.roughness = mod.roughness;
          }
          if (mod.opacity !== undefined) {
            child.material.opacity = mod.opacity;
            child.material.transparent = mod.opacity < 1;
          }
        }
      }
    });
  }

  /**
   * Create fallback primitive geometry with proper styling
   */
  _createFallbackPrimitive(type, furnitureData = null) {
    const group = new THREE.Group();
    
    // Determine type from various sources
    let furnitureType = type || 'default';
    if (furnitureData) {
      const name = (furnitureData.name || '').toLowerCase();
      if (name.includes('chair') || name.includes('arm')) furnitureType = 'chair';
      else if (name.includes('table')) furnitureType = 'table';
      else if (name.includes('couch') || name.includes('sofa')) furnitureType = 'couch';
      else if (name.includes('bed')) furnitureType = 'bed';
      else if (name.includes('cabinet') || name.includes('wardrobe')) furnitureType = 'cabinet';
    }
    
    // Colors for different furniture types
    const typeColors = {
      chair: 0x8B4513,    // Brown
      table: 0xDEB887,    // BurlyWood
      couch: 0x4169E1,    // RoyalBlue
      bed: 0x9370DB,      // MediumPurple
      cabinet: 0x2F4F4F,  // DarkSlateGray
      default: 0x708090   // SlateGray
    };
    
    const color = typeColors[furnitureType] || typeColors.default;
    const material = new THREE.MeshStandardMaterial({ 
      color,
      roughness: 0.7,
      metalness: 0.1
    });
    
    let mesh;
    
    switch (furnitureType) {
      case 'chair':
        // Seat
        const seatGeo = new THREE.BoxGeometry(0.5, 0.1, 0.5);
        const seat = new THREE.Mesh(seatGeo, material);
        seat.position.y = 0.45;
        group.add(seat);
        // Back
        const backGeo = new THREE.BoxGeometry(0.5, 0.5, 0.08);
        const back = new THREE.Mesh(backGeo, material);
        back.position.set(0, 0.7, -0.21);
        group.add(back);
        // Legs
        const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const positions = [[-0.2, 0.2, -0.2], [0.2, 0.2, -0.2], [-0.2, 0.2, 0.2], [0.2, 0.2, 0.2]];
        positions.forEach(pos => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(...pos);
          group.add(leg);
        });
        break;
        
      case 'table':
        // Top
        const topGeo = new THREE.BoxGeometry(1.2, 0.08, 0.8);
        const top = new THREE.Mesh(topGeo, material);
        top.position.y = 0.75;
        group.add(top);
        // Legs
        const tLegGeo = new THREE.BoxGeometry(0.08, 0.7, 0.08);
        const tLegPositions = [[-0.5, 0.35, -0.3], [0.5, 0.35, -0.3], [-0.5, 0.35, 0.3], [0.5, 0.35, 0.3]];
        tLegPositions.forEach(pos => {
          const leg = new THREE.Mesh(tLegGeo, material);
          leg.position.set(...pos);
          group.add(leg);
        });
        break;
        
      case 'couch':
        // Base
        const baseGeo = new THREE.BoxGeometry(2, 0.4, 0.9);
        const base = new THREE.Mesh(baseGeo, material);
        base.position.y = 0.25;
        group.add(base);
        // Back
        const cBackGeo = new THREE.BoxGeometry(2, 0.5, 0.2);
        const cBack = new THREE.Mesh(cBackGeo, material);
        cBack.position.set(0, 0.65, -0.35);
        group.add(cBack);
        // Arms
        const armGeo = new THREE.BoxGeometry(0.15, 0.3, 0.7);
        const leftArm = new THREE.Mesh(armGeo, material);
        leftArm.position.set(-0.925, 0.5, 0);
        group.add(leftArm);
        const rightArm = new THREE.Mesh(armGeo, material);
        rightArm.position.set(0.925, 0.5, 0);
        group.add(rightArm);
        break;
        
      default:
        // Simple box
        const boxGeo = new THREE.BoxGeometry(0.8, 0.5, 0.8);
        mesh = new THREE.Mesh(boxGeo, material);
        mesh.position.y = 0.25;
        group.add(mesh);
    }
    
    // Enable shadows for all children
    group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    return group;
  }

  /**
   * Clear current objects from scene
   */
  _clearCurrentObjects() {
    const container = this.scene.getObjectByName('FurnitureContainer');
    if (!container) return;

    // Deselect first
    AppState.set('selectedObject', null);

    // Remove all furniture
    while (container.children.length > 0) {
      const obj = container.children[0];
      container.remove(obj);
      
      // Dispose resources
      obj.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // Clear state
    AppState.clearPlacedObjects();
  }
}

export default StorageManager;
