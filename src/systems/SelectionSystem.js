/**
 * SelectionSystem - Handles object selection and movement
 * Step 5: Selection + move within bounds
 */

import * as THREE from 'three';
import { AppState } from '../state/AppState.js';
import { ROOM_CONFIG } from '../core/Room.js';

export class SelectionSystem {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    
    // Raycaster for selection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Selection state
    this.selectedObject = null;
    this.highlightHelper = null;
    
    // Drag state
    this.isDragging = false;
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Floor plane
    this.dragOffset = new THREE.Vector3();
    this.dragStartPosition = new THREE.Vector3();
    
    // Visual feedback
    this.originalMaterials = new Map();
    this.highlightColor = new THREE.Color(0x00ff00); // Green highlight
    this.selectedEmissive = 0x003300;
    
    // Bind event handlers
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    
    this._init();
  }

  _init() {
    // Mouse events for selection and dragging
    this.domElement.addEventListener('mousedown', this._onMouseDown);
    this.domElement.addEventListener('mousemove', this._onMouseMove);
    this.domElement.addEventListener('mouseup', this._onMouseUp);
    
    // Keyboard events
    window.addEventListener('keydown', this._onKeyDown);
    
    // Subscribe to state changes
    AppState.subscribe('selectedObject', (obj) => {
      this._updateSelection(obj);
    });
    
    console.log('✅ SelectionSystem initialized');
  }

  /**
   * Update selection when state changes externally
   */
  _updateSelection(obj) {
    // Only update if different from current selection
    if (obj === this.selectedObject) return;
    
    if (obj) {
      // External selection - create highlights without recursion
      if (this.selectedObject) {
        this._removeHighlight();
        this._restoreOriginalMaterials(this.selectedObject);
        this.selectedObject.userData.isSelected = false;
      }
      
      this.selectedObject = obj;
      obj.userData.isSelected = true;
      this._createHighlight(obj);
      this._applyHighlightMaterial(obj);
    } else {
      // External deselection
      if (this.selectedObject) {
        this._removeHighlight();
        this._restoreOriginalMaterials(this.selectedObject);
        this.selectedObject.userData.isSelected = false;
        this.selectedObject = null;
      }
    }
  }

  /**
   * Handle mouse down - start selection or drag
   */
  _onMouseDown(event) {
    // Only handle left click
    if (event.button !== 0) return;
    
    // Ignore if clicking on UI
    if (this._isClickOnUI(event)) return;
    
    this._updateMousePosition(event);
    
    // Try to select an object
    const intersected = this._raycastFurniture();
    
    if (intersected) {
      const furniture = this._getFurnitureRoot(intersected.object);
      
      if (furniture) {
        // If clicking on already selected object, start dragging
        if (furniture === this.selectedObject) {
          this._startDrag(event, intersected.point);
        } else {
          // Select new object
          this.select(furniture);
        }
      }
    } else {
      // Clicked on empty space - deselect
      if (!this.isDragging) {
        this.deselect();
      }
    }
  }

  /**
   * Handle mouse move - drag selected object
   */
  _onMouseMove(event) {
    if (!this.isDragging || !this.selectedObject) return;
    
    this._updateMousePosition(event);
    
    // Get intersection with drag plane
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersectPoint = new THREE.Vector3();
    
    if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
      // Calculate new position
      const newPosition = intersectPoint.sub(this.dragOffset);
      
      // Constrain to room bounds
      const constrainedPos = this._constrainToRoom(newPosition);
      
      // Apply position
      this.selectedObject.position.x = constrainedPos.x;
      this.selectedObject.position.z = constrainedPos.z;
      // Keep Y position unchanged (on floor)
      
      // Update box helper position
      if (this.highlightHelper) {
        this.highlightHelper.update();
      }
    }
  }

  /**
   * Handle mouse up - end drag
   */
  _onMouseUp(event) {
    if (this.isDragging) {
      this._endDrag();
    }
  }

  /**
   * Handle keyboard input
   */
  _onKeyDown(event) {
    if (!this.selectedObject) return;
    
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        this._deleteSelected();
        break;
      case 'Escape':
        this.deselect();
        break;
      case 'r':
      case 'R':
        // Rotate 45 degrees
        this.selectedObject.rotation.y += Math.PI / 4;
        if (this.highlightHelper) this.highlightHelper.update();
        break;
    }
  }

  /**
   * Select an object
   */
  select(object) {
    // Deselect current if any
    if (this.selectedObject && this.selectedObject !== object) {
      this.deselect();
    }
    
    this.selectedObject = object;
    object.userData.isSelected = true;
    
    // Create highlight
    this._createHighlight(object);
    
    // Apply emissive highlight to materials
    this._applyHighlightMaterial(object);
    
    // Update app state
    AppState.set('selectedObject', object);
    
    console.log('🎯 Selected:', object.name);
  }

  /**
   * Deselect current object
   */
  deselect() {
    if (!this.selectedObject) return;
    
    // Remove highlight
    this._removeHighlight();
    
    // Restore original materials
    this._restoreOriginalMaterials(this.selectedObject);
    
    this.selectedObject.userData.isSelected = false;
    this.selectedObject = null;
    
    // Update app state
    AppState.set('selectedObject', null);
    
    console.log('🚫 Deselected');
  }

  /**
   * Start dragging
   */
  _startDrag(event, intersectPoint) {
    this.isDragging = true;
    this.dragStartPosition.copy(this.selectedObject.position);
    
    // Calculate offset from object center to click point
    this.dragOffset.copy(intersectPoint).sub(this.selectedObject.position);
    this.dragOffset.y = 0; // Keep on floor plane
    
    // Change cursor
    this.domElement.style.cursor = 'grabbing';
    
    console.log('🖐️ Start drag');
  }

  /**
   * End dragging
   */
  _endDrag() {
    this.isDragging = false;
    this.domElement.style.cursor = 'auto';
    
    if (this.selectedObject) {
      console.log('📍 Moved to:', 
        this.selectedObject.position.x.toFixed(2), 
        this.selectedObject.position.z.toFixed(2)
      );
    }
  }

  /**
   * Constrain position to room bounds
   */
  _constrainToRoom(position) {
    const margin = 0.3; // Small margin from walls
    const halfWidth = (ROOM_CONFIG.width / 2) - margin;
    const halfDepth = (ROOM_CONFIG.depth / 2) - margin;
    
    // Get object bounding box for size-aware constraints
    let objectHalfWidth = 0;
    let objectHalfDepth = 0;
    
    if (this.selectedObject) {
      const box = new THREE.Box3().setFromObject(this.selectedObject);
      const size = box.getSize(new THREE.Vector3());
      objectHalfWidth = size.x / 2;
      objectHalfDepth = size.z / 2;
    }
    
    return new THREE.Vector3(
      Math.max(-halfWidth + objectHalfWidth, Math.min(halfWidth - objectHalfWidth, position.x)),
      position.y,
      Math.max(-halfDepth + objectHalfDepth, Math.min(halfDepth - objectHalfDepth, position.z))
    );
  }

  /**
   * Create visual highlight for selected object
   */
  _createHighlight(object) {
    // Remove existing helper
    this._removeHighlight();
    
    // Create box helper
    this.highlightHelper = new THREE.BoxHelper(object, this.highlightColor);
    this.highlightHelper.name = 'SelectionHelper';
    this.scene.add(this.highlightHelper);
  }

  /**
   * Remove highlight helper
   */
  _removeHighlight() {
    if (this.highlightHelper) {
      this.scene.remove(this.highlightHelper);
      this.highlightHelper.dispose();
      this.highlightHelper = null;
    }
  }

  /**
   * Apply highlight material (emissive glow)
   */
  _applyHighlightMaterial(object) {
    object.traverse((child) => {
      if (child.isMesh && child.material) {
        // Store original material
        if (!this.originalMaterials.has(child.uuid)) {
          this.originalMaterials.set(child.uuid, {
            emissive: child.material.emissive?.clone(),
            emissiveIntensity: child.material.emissiveIntensity
          });
        }
        
        // Apply highlight
        if (child.material.emissive) {
          child.material.emissive.setHex(this.selectedEmissive);
          child.material.emissiveIntensity = 0.5;
        }
      }
    });
  }

  /**
   * Restore original materials
   */
  _restoreOriginalMaterials(object) {
    object.traverse((child) => {
      if (child.isMesh && child.material) {
        const original = this.originalMaterials.get(child.uuid);
        if (original) {
          if (child.material.emissive && original.emissive) {
            child.material.emissive.copy(original.emissive);
            child.material.emissiveIntensity = original.emissiveIntensity || 0;
          }
        }
      }
    });
    this.originalMaterials.clear();
  }

  /**
   * Raycast to find furniture objects
   */
  _raycastFurniture() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Get furniture container
    const container = this.scene.getObjectByName('FurnitureContainer');
    if (!container || container.children.length === 0) return null;
    
    // Collect all meshes from furniture
    const meshes = [];
    container.children.forEach(furniture => {
      furniture.traverse(child => {
        if (child.isMesh) {
          meshes.push(child);
        }
      });
    });
    
    const intersects = this.raycaster.intersectObjects(meshes, false);
    return intersects.length > 0 ? intersects[0] : null;
  }

  /**
   * Get the root furniture object from a mesh
   */
  _getFurnitureRoot(object) {
    let current = object;
    const container = this.scene.getObjectByName('FurnitureContainer');
    
    while (current && current.parent !== container) {
      current = current.parent;
    }
    
    return current;
  }

  /**
   * Update mouse position from event
   */
  _updateMousePosition(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Check if click is on UI elements
   */
  _isClickOnUI(event) {
    const target = event.target;
    return target.closest('.palette-container') || 
           target.closest('#menu-container') ||
           target.closest('#buttons-container') ||
           target.closest('#status-bar');
  }

  /**
   * Delete the selected object
   */
  _deleteSelected() {
    if (!this.selectedObject) return;
    
    const objectToDelete = this.selectedObject;
    this.deselect();
    
    // Get placement system to remove the object
    const container = this.scene.getObjectByName('FurnitureContainer');
    if (container) {
      container.remove(objectToDelete);
      
      // Dispose resources
      objectToDelete.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      // Update state
      AppState.removePlacedObject(objectToDelete);
      console.log('🗑️ Deleted:', objectToDelete.name);
    }
  }

  /**
   * Get currently selected object
   */
  getSelected() {
    return this.selectedObject;
  }

  /**
   * Dispose of the system
   */
  dispose() {
    this.domElement.removeEventListener('mousedown', this._onMouseDown);
    this.domElement.removeEventListener('mousemove', this._onMouseMove);
    this.domElement.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('keydown', this._onKeyDown);
    
    this._removeHighlight();
    this.originalMaterials.clear();
  }
}
