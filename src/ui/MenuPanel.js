/**
 * MenuPanel - Expandable furniture selection menu
 * Shows items within a selected category
 */

import { AppState } from '../state/AppState.js';

export class MenuPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.titleEl = document.getElementById('menu-title');
    this.contentsEl = document.getElementById('menu-contents');
    this.closeBtn = document.getElementById('menu-close-btn');
    
    this.currentCategory = null;
    this.onItemSelect = null; // Callback when item is selected
    
    this._init();
  }

  _init() {
    // Close button handler
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // Subscribe to category changes
    AppState.subscribe('selectedCategory', (categoryId) => {
      if (categoryId !== null) {
        const data = AppState.get('furnitureData');
        const category = data.categories.find(c => c.id === categoryId);
        if (category) {
          this.open(category);
        }
      } else {
        this.close();
      }
    });

    // Subscribe to active item changes
    AppState.subscribe('activeFurnitureType', (itemId) => {
      this._updateActiveItem(itemId);
    });
  }

  open(category) {
    if (!this.container) return;

    this.currentCategory = category;
    
    // Update title
    if (this.titleEl) {
      this.titleEl.textContent = category.name;
    }

    // Build items grid
    this._buildItems(category);

    // Show panel
    this.container.classList.add('visible');
  }

  close() {
    if (!this.container) return;
    
    this.container.classList.remove('visible');
    this.currentCategory = null;
    // Only set if not already null to prevent circular updates
    if (AppState.get('selectedCategory') !== null) {
      AppState.set('selectedCategory', null);
    }
  }

  _buildItems(category) {
    if (!this.contentsEl) return;

    this.contentsEl.innerHTML = '';

    const data = AppState.get('furnitureData');
    if (!data) return;

    // Get objects for this category
    const objects = data.objects.filter(obj => 
      category.objects.includes(obj.id)
    );

    objects.forEach((item) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'object-container';
      itemEl.dataset.itemId = item.id;

      // Item image
      const img = document.createElement('img');
      img.src = `/assets/images/furniture/${item.path}.jpg`;
      img.alt = item.name;
      img.onerror = () => {
        // Create a colored placeholder
        img.style.backgroundColor = this._getPlaceholderColor(item.id);
        img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
      };

      // Item name
      const title = document.createElement('p');
      title.className = 'object-title';
      title.textContent = item.name;

      itemEl.appendChild(img);
      itemEl.appendChild(title);

      // Click handler - select this furniture type
      itemEl.addEventListener('click', () => {
        this._selectItem(item);
      });

      this.contentsEl.appendChild(itemEl);
    });
  }

  _selectItem(item) {
    const currentActive = AppState.get('activeFurnitureType');
    
    // Toggle: if clicking same item, deselect
    if (currentActive && currentActive.id === item.id) {
      AppState.set('activeFurnitureType', null);
      if (this.onItemSelect) {
        this.onItemSelect(null);
      }
    } else {
      AppState.set('activeFurnitureType', item);
      if (this.onItemSelect) {
        this.onItemSelect(item);
      }
      console.log('📦 Active furniture:', item.name);
    }
  }

  _updateActiveItem(item) {
    if (!this.contentsEl) return;

    const itemElements = this.contentsEl.querySelectorAll('.object-container');
    
    itemElements.forEach((el) => {
      const id = parseInt(el.dataset.itemId);
      if (item && id === item.id) {
        el.classList.add('active-item');
      } else {
        el.classList.remove('active-item');
      }
    });
  }

  _getPlaceholderColor(id) {
    const colors = ['#8B4513', '#2E8B57', '#4169E1', '#DC143C', '#FFD700', '#9932CC'];
    return colors[id % colors.length];
  }

  // Set callback for item selection
  setOnItemSelect(callback) {
    this.onItemSelect = callback;
  }
}

export default MenuPanel;