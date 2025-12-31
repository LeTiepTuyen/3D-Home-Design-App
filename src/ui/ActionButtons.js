/**
 * ActionButtons - Controls for delete, reset, etc.
 * Step 5: App actions
 */

import { AppState } from '../state/AppState.js';

export class ActionButtons {
  constructor(scene) {
    this.scene = scene;
    this._init();
  }

  _init() {
    // Delete button
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this._deleteSelected());
    }

    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this._resetLayout());
    }

    console.log('✅ ActionButtons initialized');
  }

  /**
   * Delete selected object
   */
  _deleteSelected() {
    const selected = AppState.get('selectedObject');
    if (!selected) {
      console.log('⚠️ No object selected to delete');
      return;
    }

    // Get furniture container
    const container = this.scene.getObjectByName('FurnitureContainer');
    if (container) {
      // Deselect first
      AppState.set('selectedObject', null);
      
      // Remove from scene
      container.remove(selected);
      
      // Dispose resources
      selected.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      // Remove from state
      AppState.removePlacedObject(selected);
      console.log('🗑️ Deleted:', selected.name);
    }
  }

  /**
   * Reset entire layout (clear all furniture)
   */
  _resetLayout() {
    const container = this.scene.getObjectByName('FurnitureContainer');
    if (!container) return;

    // Confirmation
    if (container.children.length === 0) {
      console.log('ℹ️ Nothing to reset');
      return;
    }

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
    console.log('🔄 Layout reset');
  }
}

export default ActionButtons;
