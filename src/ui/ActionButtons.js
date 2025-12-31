/**
 * ActionButtons - Controls for delete, reset, save, load
 * Step 5 & 7: App actions + persistence
 */

import { AppState } from '../state/AppState.js';

export class ActionButtons {
  constructor(scene, storageManager = null) {
    this.scene = scene;
    this.storageManager = storageManager;
    this._init();
  }

  /**
   * Set storage manager (can be set after construction)
   */
  setStorageManager(storageManager) {
    this.storageManager = storageManager;
    this._updateLoadButton();
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

    // Save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this._saveLayout());
    }

    // Load button
    const loadBtn = document.getElementById('load-btn');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => this._loadLayout());
    }

    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this._clearStorage());
    }

    // Update load button state
    this._updateLoadButton();

    console.log('✅ ActionButtons initialized');
  }

  /**
   * Update load button based on saved data
   */
  _updateLoadButton() {
    const loadBtn = document.getElementById('load-btn');
    if (loadBtn && this.storageManager) {
      const info = this.storageManager.getSavedLayoutInfo();
      if (info) {
        loadBtn.title = `Load saved layout (${info.objectCount} objects, ${info.date})`;
        loadBtn.classList.add('has-data');
      } else {
        loadBtn.title = 'No saved layout';
        loadBtn.classList.remove('has-data');
      }
    }
  }

  /**
   * Save layout to localStorage
   */
  _saveLayout() {
    if (!this.storageManager) {
      console.warn('StorageManager not available');
      return;
    }

    const success = this.storageManager.saveLayout();
    if (success) {
      this._showNotification('💾 Layout saved!');
      this._updateLoadButton();
    } else {
      this._showNotification('⚠️ Nothing to save');
    }
  }

  /**
   * Load layout from localStorage
   */
  async _loadLayout() {
    if (!this.storageManager) {
      console.warn('StorageManager not available');
      return;
    }

    if (!this.storageManager.hasSavedLayout()) {
      this._showNotification('ℹ️ No saved layout found');
      return;
    }

    this._showNotification('📂 Loading layout...');
    
    const success = await this.storageManager.loadLayout();
    if (success) {
      this._showNotification('✅ Layout loaded!');
    } else {
      this._showNotification('❌ Failed to load layout');
    }
  }

  /**
   * Show temporary notification
   */
  _showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.action-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'action-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 2 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * Clear saved storage
   */
  _clearStorage() {
    if (!this.storageManager) {
      console.warn('StorageManager not available');
      return;
    }

    if (!this.storageManager.hasSavedLayout()) {
      this._showNotification('ℹ️ No saved data to clear');
      return;
    }

    // Clear saved layout
    this.storageManager.clearSavedLayout();
    this._showNotification('🧹 Saved storage cleared!');
    this._updateLoadButton();
    console.log('🧹 Storage cleared');
  }

  /**
   * Delete selected object
   */
  _deleteSelected() {
    const selected = AppState.get('selectedObject');
    if (!selected) {
      this._showNotification('⚠️ No object selected');
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
