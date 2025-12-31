/**
 * PaletteUI - Left vertical category palette
 * Displays furniture categories for selection
 */

import { AppState } from '../state/AppState.js';

export class PaletteUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.categories = [];
    this.onCategorySelect = null; // Callback when category is selected
    
    this._init();
  }

  async _init() {
    // Load furniture data
    const data = await AppState.loadFurnitureData();
    this.categories = data.categories;
    
    // Build UI
    this._buildPalette();
    
    // Subscribe to state changes
    AppState.subscribe('selectedCategory', (categoryId) => {
      this._updateSelection(categoryId);
    });
  }

  _buildPalette() {
    if (!this.container) {
      console.error('Palette container not found');
      return;
    }

    this.container.innerHTML = '';

    this.categories.forEach((category) => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'category';
      categoryEl.dataset.categoryId = category.id;

      // Category icon/image
      const img = document.createElement('img');
      img.className = 'category-img';
      img.src = category.thumb || '/assets/ui/translate.svg';
      img.alt = category.name;
      img.onerror = () => {
        img.src = '/assets/ui/translate.svg'; // Fallback icon
      };

      // Category name
      const text = document.createElement('p');
      text.className = 'category-text';
      text.textContent = category.name;

      categoryEl.appendChild(img);
      categoryEl.appendChild(text);

      // Click handler
      categoryEl.addEventListener('click', () => {
        this._selectCategory(category);
      });

      this.container.appendChild(categoryEl);
    });

    console.log('✅ Palette UI built with', this.categories.length, 'categories');
  }

  _selectCategory(category) {
    const currentSelected = AppState.get('selectedCategory');
    
    // Toggle: if clicking same category, deselect
    if (currentSelected === category.id) {
      AppState.set('selectedCategory', null);
      if (this.onCategorySelect) {
        this.onCategorySelect(null);
      }
    } else {
      AppState.set('selectedCategory', category.id);
      if (this.onCategorySelect) {
        this.onCategorySelect(category);
      }
    }
  }

  _updateSelection(categoryId) {
    const categoryElements = this.container.querySelectorAll('.category');
    
    categoryElements.forEach((el) => {
      const id = parseInt(el.dataset.categoryId);
      if (id === categoryId) {
        el.classList.add('selected-category');
      } else {
        el.classList.remove('selected-category');
      }
    });
  }

  // Set callback for category selection
  setOnCategorySelect(callback) {
    this.onCategorySelect = callback;
  }
}

export default PaletteUI;