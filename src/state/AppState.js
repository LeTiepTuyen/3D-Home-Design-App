/**
 * Application State
 * Centralized state management with event system
 */

class AppStateManager {
  constructor() {
    this.state = {
      selectedObject: null,
      selectedCategory: null,
      activeFurnitureType: null,
      placedObjects: [],
      isLoading: false,
      furnitureData: null
    };
    
    this.listeners = new Map();
  }

  // Get current state
  get(key) {
    return this.state[key];
  }

  // Set state and notify listeners
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this._notify(key, value, oldValue);
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  // Notify all listeners of a state change
  _notify(key, newValue, oldValue) {
    const callbacks = this.listeners.get(key) || [];
    callbacks.forEach(cb => cb(newValue, oldValue));
  }

  // Add a placed object
  addPlacedObject(object) {
    this.state.placedObjects.push(object);
    this._notify('placedObjects', this.state.placedObjects);
  }

  // Remove a placed object
  removePlacedObject(object) {
    const index = this.state.placedObjects.indexOf(object);
    if (index > -1) {
      this.state.placedObjects.splice(index, 1);
      this._notify('placedObjects', this.state.placedObjects);
    }
  }

  // Clear all placed objects
  clearPlacedObjects() {
    this.state.placedObjects = [];
    this.state.selectedObject = null;
    this._notify('placedObjects', this.state.placedObjects);
    this._notify('selectedObject', null);
  }

  // Load furniture data from JSON
  async loadFurnitureData() {
    try {
      const response = await fetch('/data/params.json');
      if (!response.ok) {
        throw new Error('Failed to load furniture data');
      }
      this.state.furnitureData = await response.json();
      console.log('✅ Furniture data loaded:', this.state.furnitureData.categories.length, 'categories');
      return this.state.furnitureData;
    } catch (error) {
      console.error('Error loading furniture data:', error);
      // Return default minimal data
      this.state.furnitureData = {
        objects: [
          { name: "Couch", path: "couch01", id: 16 },
          { name: "Table", path: "table01", id: 31 },
          { name: "Chair", path: "chair01", id: 12 }
        ],
        categories: [
          { id: 0, name: "Living Room", thumb: "/assets/images/furniture/couch01.jpg", objects: [16, 31, 12] }
        ]
      };
      return this.state.furnitureData;
    }
  }
}

// Singleton instance
export const AppState = new AppStateManager();
export default AppState;
