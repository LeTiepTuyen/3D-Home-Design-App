/**
 * 3D Home Design Application - Main Entry
 * Challenge 2 - Three.js
 * Author: Le Tiep Tuyen (22020015)
 */

import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Core modules
import { SceneManager } from './core/SceneManager.js';
import { LightingSetup } from './core/LightingSetup.js';
import { ControlsManager } from './core/ControlsManager.js';
import { Room, ROOM_CONFIG } from './core/Room.js';

// UI modules
import { PaletteUI } from './ui/PaletteUI.js';
import { MenuPanel } from './ui/MenuPanel.js';
import { StatusBar } from './ui/StatusBar.js';
import { ActionButtons } from './ui/ActionButtons.js';
import { PropertiesPanel } from './ui/PropertiesPanel.js';

// Systems
import { PlacementSystem } from './systems/PlacementSystem.js';
import { SelectionSystem } from './systems/SelectionSystem.js';

// State
import { AppState } from './state/AppState.js';
import { StorageManager } from './state/StorageManager.js';

// ============================================
// Application State
// ============================================
let sceneManager, lighting, controls, room;
let paletteUI, menuPanel, statusBar, actionButtons, propertiesPanel;
let placementSystem, selectionSystem, storageManager;

// ============================================
// Initialize Application
// ============================================
async function init() {
  console.log('🏠 3D Home Design App - Initializing...');

  // Get canvas element
  const canvas = document.getElementById('three-canvas');
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Initialize core components
  sceneManager = new SceneManager(canvas);
  lighting = new LightingSetup(sceneManager.scene);
  controls = new ControlsManager(sceneManager.camera, sceneManager.renderer.domElement);
  room = new Room(sceneManager.scene);

  // Load HDRI environment (optional, enhances lighting)
  loadEnvironment();

  // Add grid helper for development
  addGridHelper();

  // Initialize UI
  await initUI();

  // Initialize placement system (Step 4)
  placementSystem = new PlacementSystem(
    sceneManager.scene,
    sceneManager.camera,
    sceneManager.renderer.domElement
  );

  // Initialize selection system (Step 5)
  selectionSystem = new SelectionSystem(
    sceneManager.scene,
    sceneManager.camera,
    sceneManager.renderer.domElement,
    controls // Pass controls to disable during drag
  );

  // Initialize action buttons (Step 5)
  actionButtons = new ActionButtons(sceneManager.scene);

  // Initialize storage manager (Step 7)
  storageManager = new StorageManager(
    sceneManager.scene,
    placementSystem.furnitureLoader // Pass furniture loader for loading
  );
  
  // Connect storage manager to action buttons
  actionButtons.setStorageManager(storageManager);

  console.log('✅ Scene Manager initialized');
  console.log('✅ Lighting setup complete');
  console.log('✅ OrbitControls enabled');
  console.log('✅ Room created:', ROOM_CONFIG);
  console.log('✅ PlacementSystem ready - double-click to place furniture');
  console.log('✅ SelectionSystem ready - click to select, drag to move');
  console.log('✅ ActionButtons ready - Delete/Reset/Save/Load controls');
  console.log('✅ PropertiesPanel ready - color/material controls');
  console.log('✅ StorageManager ready - localStorage persistence');
  console.log('🎉 Step 7 - Save/Load READY');
}

// ============================================
// Initialize UI Components
// ============================================
async function initUI() {
  // Create palette (left panel with categories)
  paletteUI = new PaletteUI('category-palette');
  
  // Create menu panel (shows items when category selected)
  menuPanel = new MenuPanel('menu-container');
  
  // Create status bar
  statusBar = new StatusBar('status-bar');
  
  // Create properties panel (Step 6)
  propertiesPanel = new PropertiesPanel('properties-panel');
  
  // Handle item selection from menu
  menuPanel.setOnItemSelect((item) => {
    if (item) {
      console.log('🪑 Selected furniture type:', item.name);
      console.log('💡 Double-click on the floor to place it!');
    }
  });

  console.log('✅ UI components initialized');
}

// ============================================
// Load HDRI Environment
// ============================================
function loadEnvironment() {
  const rgbeLoader = new RGBELoader();
  
  rgbeLoader.load('/assets/bg/pisa.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    sceneManager.scene.environment = texture;
    // Don't set as background - we want to see the room walls
    // sceneManager.scene.background = texture;
    sceneManager.scene.backgroundBlurriness = 0.5;
    console.log('✅ HDRI environment loaded');
  }, undefined, (error) => {
    console.warn('HDRI not loaded (optional):', error.message);
  });
}

// ============================================
// Development Helpers
// ============================================
function addGridHelper() {
  const gridHelper = new THREE.GridHelper(ROOM_CONFIG.width, ROOM_CONFIG.width, 0x888888, 0xcccccc);
  gridHelper.position.y = 0.01; // Slightly above floor to avoid z-fighting
  sceneManager.scene.add(gridHelper);
  
  // Expose scene for debugging
  window.scene = sceneManager.scene;
  window.camera = sceneManager.camera;
  window.placementSystem = placementSystem;
}

// ============================================
// Animation Loop
// ============================================
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.update();
  
  // Render scene
  sceneManager.render();
}

// ============================================
// Start Application
// ============================================
init();
animate();
