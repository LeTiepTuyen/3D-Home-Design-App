/**
 * PropertiesPanel - Shows properties and controls for selected object
 * Step 6: Material/color change
 */

import * as THREE from 'three';
import { AppState } from '../state/AppState.js';

export class PropertiesPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedObject = null;
    this.originalColors = new Map(); // Store original colors for reset
    
    this._init();
  }

  _init() {
    if (!this.container) {
      console.warn('PropertiesPanel container not found');
      return;
    }

    // Subscribe to selection changes
    AppState.subscribe('selectedObject', (obj) => {
      this.selectedObject = obj;
      this._update();
    });

    // Initial state - hidden
    this._update();
    
    console.log('✅ PropertiesPanel initialized');
  }

  _update() {
    if (!this.container) return;

    if (!this.selectedObject) {
      this.container.classList.remove('visible');
      return;
    }

    // Show panel
    this.container.classList.add('visible');

    // Get object info
    const name = this.selectedObject.userData?.name || this.selectedObject.name || 'Object';
    const type = this.selectedObject.userData?.furnitureType || 'furniture';
    
    // Get current color (from first mesh found)
    const currentColor = this._getCurrentColor();

    this.container.innerHTML = `
      <div class="props-header">
        <h3>Properties</h3>
        <span class="props-close" id="props-close">×</span>
      </div>
      
      <div class="props-content">
        <div class="props-section">
          <label class="props-label">Name</label>
          <div class="props-value">${name}</div>
        </div>
        
        <div class="props-section">
          <label class="props-label">Type</label>
          <div class="props-value">${type}</div>
        </div>
        
        <div class="props-divider"></div>
        
        <div class="props-section">
          <label class="props-label">Color</label>
          <div class="color-picker-container">
            <input type="color" id="color-picker" value="${currentColor}" class="color-picker">
            <span class="color-value">${currentColor}</span>
          </div>
        </div>
        
        <div class="props-section">
          <label class="props-label">Quick Colors</label>
          <div class="preset-colors">
            <button class="color-preset" data-color="#ffffff" style="background: #ffffff" title="White"></button>
            <button class="color-preset" data-color="#8B4513" style="background: #8B4513" title="Brown"></button>
            <button class="color-preset" data-color="#2F4F4F" style="background: #2F4F4F" title="Dark Slate"></button>
            <button class="color-preset" data-color="#800000" style="background: #800000" title="Maroon"></button>
            <button class="color-preset" data-color="#000080" style="background: #000080" title="Navy"></button>
            <button class="color-preset" data-color="#006400" style="background: #006400" title="Dark Green"></button>
            <button class="color-preset" data-color="#FFD700" style="background: #FFD700" title="Gold"></button>
            <button class="color-preset" data-color="#FF6347" style="background: #FF6347" title="Tomato"></button>
          </div>
        </div>
        
        <div class="props-divider"></div>
        
        <div class="props-section">
          <label class="props-label">Material</label>
          <select id="material-select" class="props-select">
            <option value="standard">Standard</option>
            <option value="glossy">Glossy</option>
            <option value="matte">Matte</option>
            <option value="metallic">Metallic</option>
          </select>
        </div>
        
        <div class="props-section">
          <label class="props-label">Opacity</label>
          <input type="range" id="opacity-slider" min="0.1" max="1" step="0.1" value="1" class="props-slider">
        </div>
        
        <div class="props-divider"></div>
        
        <div class="props-actions">
          <button class="props-btn" id="reset-color-btn">🔄 Reset Color</button>
          <button class="props-btn danger" id="duplicate-btn">📋 Duplicate</button>
        </div>
      </div>
    `;

    // Bind events
    this._bindEvents();
  }

  _bindEvents() {
    // Close button
    const closeBtn = document.getElementById('props-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        AppState.set('selectedObject', null);
      });
    }

    // Color picker
    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        this._applyColor(e.target.value);
      });
    }

    // Preset colors
    const presetBtns = this.container.querySelectorAll('.color-preset');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        this._applyColor(color);
        // Update color picker
        const picker = document.getElementById('color-picker');
        if (picker) picker.value = color;
      });
    });

    // Material select
    const materialSelect = document.getElementById('material-select');
    if (materialSelect) {
      materialSelect.addEventListener('change', (e) => {
        this._applyMaterial(e.target.value);
      });
    }

    // Opacity slider
    const opacitySlider = document.getElementById('opacity-slider');
    if (opacitySlider) {
      opacitySlider.addEventListener('input', (e) => {
        this._applyOpacity(parseFloat(e.target.value));
      });
    }

    // Reset color button
    const resetColorBtn = document.getElementById('reset-color-btn');
    if (resetColorBtn) {
      resetColorBtn.addEventListener('click', () => {
        this._resetColor();
      });
    }

    // Duplicate button
    const duplicateBtn = document.getElementById('duplicate-btn');
    if (duplicateBtn) {
      duplicateBtn.addEventListener('click', () => {
        this._duplicateObject();
      });
    }
  }

  /**
   * Get current color from selected object
   */
  _getCurrentColor() {
    if (!this.selectedObject) return '#888888';
    
    let color = '#888888';
    this.selectedObject.traverse((child) => {
      if (child.isMesh && child.material && child.material.color) {
        color = '#' + child.material.color.getHexString();
        return; // Take first mesh color
      }
    });
    return color;
  }

  /**
   * Store original colors before modification
   */
  _storeOriginalColors() {
    if (!this.selectedObject) return;
    
    const objId = this.selectedObject.uuid;
    if (this.originalColors.has(objId)) return; // Already stored
    
    const colors = [];
    this.selectedObject.traverse((child) => {
      if (child.isMesh && child.material) {
        colors.push({
          uuid: child.uuid,
          color: child.material.color ? child.material.color.clone() : null,
          metalness: child.material.metalness,
          roughness: child.material.roughness,
          opacity: child.material.opacity
        });
      }
    });
    this.originalColors.set(objId, colors);
  }

  /**
   * Apply color to selected object
   */
  _applyColor(hexColor) {
    if (!this.selectedObject) return;
    
    // Store original first
    this._storeOriginalColors();
    
    const color = new THREE.Color(hexColor);
    
    this.selectedObject.traverse((child) => {
      if (child.isMesh && child.material) {
        // Clone material if shared
        if (!child.material._isCloned) {
          child.material = child.material.clone();
          child.material._isCloned = true;
        }
        
        if (child.material.color) {
          child.material.color.copy(color);
        }
      }
    });

    // Update color value display
    const colorValue = this.container.querySelector('.color-value');
    if (colorValue) colorValue.textContent = hexColor;

    console.log('🎨 Applied color:', hexColor);
  }

  /**
   * Apply material preset
   */
  _applyMaterial(preset) {
    if (!this.selectedObject) return;
    
    // Store original first
    this._storeOriginalColors();
    
    const settings = {
      standard: { metalness: 0.1, roughness: 0.8 },
      glossy: { metalness: 0.3, roughness: 0.2 },
      matte: { metalness: 0, roughness: 1 },
      metallic: { metalness: 0.9, roughness: 0.3 }
    };
    
    const { metalness, roughness } = settings[preset] || settings.standard;
    
    this.selectedObject.traverse((child) => {
      if (child.isMesh && child.material) {
        // Clone material if shared
        if (!child.material._isCloned) {
          child.material = child.material.clone();
          child.material._isCloned = true;
        }
        
        if (child.material.metalness !== undefined) {
          child.material.metalness = metalness;
        }
        if (child.material.roughness !== undefined) {
          child.material.roughness = roughness;
        }
        child.material.needsUpdate = true;
      }
    });

    console.log('✨ Applied material:', preset);
  }

  /**
   * Apply opacity to selected object
   */
  _applyOpacity(opacity) {
    if (!this.selectedObject) return;
    
    this.selectedObject.traverse((child) => {
      if (child.isMesh && child.material) {
        // Clone material if shared
        if (!child.material._isCloned) {
          child.material = child.material.clone();
          child.material._isCloned = true;
        }
        
        child.material.transparent = opacity < 1;
        child.material.opacity = opacity;
        child.material.needsUpdate = true;
      }
    });

    console.log('👁️ Applied opacity:', opacity);
  }

  /**
   * Reset to original colors
   */
  _resetColor() {
    if (!this.selectedObject) return;
    
    const objId = this.selectedObject.uuid;
    const originalData = this.originalColors.get(objId);
    
    if (!originalData) {
      console.log('ℹ️ No original color stored');
      return;
    }
    
    this.selectedObject.traverse((child) => {
      if (child.isMesh && child.material) {
        const orig = originalData.find(o => o.uuid === child.uuid);
        if (orig) {
          if (orig.color && child.material.color) {
            child.material.color.copy(orig.color);
          }
          if (orig.metalness !== undefined) {
            child.material.metalness = orig.metalness;
          }
          if (orig.roughness !== undefined) {
            child.material.roughness = orig.roughness;
          }
          if (orig.opacity !== undefined) {
            child.material.opacity = orig.opacity;
            child.material.transparent = orig.opacity < 1;
          }
          child.material.needsUpdate = true;
        }
      }
    });

    // Update UI
    this._update();
    console.log('🔄 Reset to original colors');
  }

  /**
   * Duplicate selected object
   */
  _duplicateObject() {
    if (!this.selectedObject) return;
    
    // Clone the object
    const clone = this.selectedObject.clone();
    
    // Offset position
    clone.position.x += 0.5;
    clone.position.z += 0.5;
    
    // Generate new name
    clone.name = this.selectedObject.name + '_copy';
    clone.userData = { ...this.selectedObject.userData };
    clone.userData.name = clone.name;
    
    // Add to scene
    const container = this.selectedObject.parent;
    if (container) {
      container.add(clone);
      AppState.addPlacedObject(clone);
      
      // Select the new clone
      AppState.set('selectedObject', clone);
      
      console.log('📋 Duplicated:', clone.name);
    }
  }

  /**
   * Dispose panel
   */
  dispose() {
    this.originalColors.clear();
  }
}

export default PropertiesPanel;
