# 📋 Report on Challenge 2: 3D Home Design Application

## Course: 3D Programming | December 2025

---

## 👤 Student Information

| Field | Details |
|-------|---------|
| **Name** | Le Tiep Tuyen |
| **Student ID** | 22020015 |
| **Project** | Challenge 2 — 3D Home Design Application |
| **Technology** | Three.js, Vite, JavaScript ES6+ |

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design Approach](#2-design-approach)
3. [Key Technical Challenges](#3-key-technical-challenges)
4. [User Interaction Implementation](#4-user-interaction-implementation)
5. [Application Screenshots](#5-application-screenshots)
6. [Conclusion](#6-conclusion)

---

## 1. Project Overview

### 1.1 Objective

The objective of this project was to develop a **web-based 3D Home Design Application** using **Three.js** that enables users to:

- Navigate a 3D room environment with orbit, zoom, and pan controls
- Place furniture items into the room from a categorized palette
- Select, move, and customize furniture within the room bounds
- Save and load room layouts using browser localStorage

### 1.2 Requirements Summary

The project was structured around three main requirement categories:

| Category | Weight | Description |
|----------|--------|-------------|
| **R1** | 40% | Scene & Environment Setup |
| **R2** | 30% | Furniture Modeling & Placement |
| **R3** | 30% | Application Logic & Visual Feedback |

### 1.3 Final Deliverables

- ✅ Fully functional 3D Home Design Application
- ✅ 40+ furniture models across 6 categories
- ✅ Complete save/load functionality
- ✅ Professional documentation (README.md)
- ✅ MIT License

---

## 2. Design Approach

### 2.1 Architecture Overview

The application follows a **modular architecture** pattern, separating concerns into distinct modules:

```
src/
├── core/           # Scene infrastructure
│   ├── SceneManager.js
│   ├── LightingSetup.js
│   ├── ControlsManager.js
│   └── Room.js
├── systems/        # Interactive systems
│   ├── PlacementSystem.js
│   └── SelectionSystem.js
├── loaders/        # Asset loading
│   └── FurnitureLoader.js
├── state/          # State management
│   ├── AppState.js
│   └── StorageManager.js
├── ui/             # User interface
│   ├── PaletteUI.js
│   ├── MenuPanel.js
│   ├── ActionButtons.js
│   ├── PropertiesPanel.js
│   └── StatusBar.js
└── main.js         # Application entry point
```

### 2.2 Design Principles

1. **Separation of Concerns**: Each module handles a specific responsibility, making the codebase maintainable and testable.

2. **Event-Driven Architecture**: The `AppState` module implements a publish-subscribe pattern for state management, allowing components to react to changes without tight coupling.

3. **Progressive Enhancement**: The application loads with basic functionality first, then enhances with HDRI environment and cached models.

4. **Graceful Degradation**: If a 3D model fails to load, the system falls back to primitive geometry representations.

### 2.3 Technology Stack Selection

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Three.js v0.160** | 3D Rendering | Industry-standard WebGL library with extensive documentation |
| **Vite v5.4** | Build Tool | Fast HMR, ES modules support, minimal configuration |
| **GLTFLoader** | Model Loading | Efficient binary format, wide compatibility |
| **OrbitControls** | Camera Navigation | Intuitive 3D navigation out-of-the-box |

### 2.4 Development Workflow

The project was implemented in **8 iterative steps**, each with specific deliverables and testing gates:

1. **Step 1**: Project bootstrap with Vite
2. **Step 2**: Scene and room environment
3. **Step 3**: UI baseline (left palette)
4. **Step 4**: Furniture placement system
5. **Step 5**: Selection and movement
6. **Step 6**: Color/material customization
7. **Step 7**: Save/Load functionality
8. **Step 8**: Documentation polish

---

## 3. Key Technical Challenges

### 3.1 Challenge: Animation Loop Initialization Race Condition

**Problem**: The application crashed on initial load with the error:
```
TypeError: Cannot read properties of undefined (reading 'update')
```

**Root Cause**: The `animate()` function was called immediately while `init()` (an async function) was still initializing the `controls` object.

**Solution**: Implemented null checks in the animation loop:
```javascript
function animate() {
  requestAnimationFrame(animate);
  
  if (controls) {
    controls.update();
  }
  
  if (sceneManager) {
    sceneManager.render();
  }
}
```

### 3.2 Challenge: OrbitControls Conflict with Drag Movement

**Problem**: When dragging furniture to move it, the OrbitControls would also rotate the camera, making precise positioning impossible.

**Root Cause**: Both systems listened to mouse events simultaneously without coordination.

**Solution**: Implemented a control toggle mechanism in `SelectionSystem.js`:
```javascript
_onPointerDown(event) {
  if (this.selectedObject && this._isPointerOverSelected(event)) {
    this.isDragging = true;
    this.controls.enabled = false; // Disable orbit during drag
  }
}

_onPointerUp() {
  this.isDragging = false;
  this.controls.enabled = true; // Re-enable orbit
}
```

### 3.3 Challenge: Save/Load Model Path Resolution

**Problem**: After loading a saved layout, furniture appeared as gray fallback boxes instead of actual 3D models.

**Root Cause**: The serialization stored `furnitureData` as a nested object, but deserialization looked for `furniturePath` at the root level.

**Solution**: Updated `StorageManager.js` to handle both legacy and new data formats:
```javascript
const modelPath = objData.furniturePath || objData.furnitureData?.path;
```

### 3.4 Challenge: Room Boundary Constraints

**Problem**: Users could drag furniture outside the room boundaries, breaking the visual illusion.

**Solution**: Implemented boundary clamping in the movement handler:
```javascript
_constrainToBounds(position) {
  const halfWidth = (ROOM_CONFIG.width / 2) - this.boundaryMargin;
  const halfDepth = (ROOM_CONFIG.depth / 2) - this.boundaryMargin;
  
  position.x = Math.max(-halfWidth, Math.min(halfWidth, position.x));
  position.z = Math.max(-halfDepth, Math.min(halfDepth, position.z));
  
  return position;
}
```

### 3.5 Challenge: Visual Selection Feedback

**Problem**: Users couldn't clearly identify which object was selected.

**Solution**: Implemented a multi-layered highlight system:
1. **Emissive color change** on materials
2. **BoxHelper** wireframe around selected object
3. **Status bar** displaying selected object name

---

## 4. User Interaction Implementation

### 4.1 Interaction Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Category │───▶│  Select  │───▶│  Place   │              │
│  │  Click   │    │  Item    │    │(dblclick)│              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                        │                    │
│                                        ▼                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Color   │◀───│  Select  │◀───│ Furniture│              │
│  │  Change  │    │  Object  │    │ in Scene │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │                │                                    │
│       ▼                ▼                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Apply   │    │   Drag   │    │  Delete  │              │
│  │ Material │    │   Move   │    │  Object  │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Camera Navigation

**Implementation**: `ControlsManager.js` wraps Three.js `OrbitControls`

| Control | Action | Implementation |
|---------|--------|----------------|
| Left Drag | Rotate camera | `controls.enableRotate = true` |
| Right Drag | Pan camera | `controls.enablePan = true` |
| Scroll | Zoom in/out | `controls.enableZoom = true` |

**Constraints Applied**:
- Minimum distance: 2 units
- Maximum distance: 20 units
- Maximum polar angle: 85° (prevents going underground)

### 4.3 Furniture Placement

**Implementation**: `PlacementSystem.js`

**Process**:
1. User selects furniture type from palette
2. Double-click on floor triggers placement
3. `Raycaster` calculates intersection with floor plane
4. Model loaded via `FurnitureLoader` (with caching)
5. Object positioned at intersection point
6. Added to scene and registered in `AppState`

```javascript
async _placeFurniture(furnitureData, position) {
  const model = await furnitureLoader.load(furnitureData.path);
  model.position.copy(position);
  model.position.y = 0;
  
  model.userData = {
    id: Date.now(),
    furnitureData: furnitureData,
    isSelected: false
  };
  
  this.furnitureContainer.add(model);
  AppState.addPlacedObject(model);
}
```

### 4.4 Selection System

**Implementation**: `SelectionSystem.js`

**Selection Detection**:
```javascript
_performSelection(event) {
  this.raycaster.setFromCamera(this.mouse, this.camera);
  const intersects = this.raycaster.intersectObjects(
    this.furnitureContainer.children, 
    true
  );
  
  if (intersects.length > 0) {
    const selected = this._findRootObject(intersects[0].object);
    this._selectObject(selected);
  }
}
```

**Visual Highlight**:
- Original emissive colors stored in `userData`
- Selection applies green emissive tint
- `BoxHelper` provides wireframe boundary

### 4.5 Drag Movement

**Implementation**: Floor plane intersection with boundary constraints

```javascript
_onPointerMove(event) {
  if (!this.isDragging || !this.selectedObject) return;
  
  // Calculate floor intersection
  this.raycaster.setFromCamera(this.mouse, this.camera);
  const intersectPoint = new THREE.Vector3();
  this.raycaster.ray.intersectPlane(this.floorPlane, intersectPoint);
  
  // Apply boundary constraints
  this._constrainToBounds(intersectPoint);
  
  // Update object position
  this.selectedObject.position.x = intersectPoint.x;
  this.selectedObject.position.z = intersectPoint.z;
}
```

### 4.6 Color Customization

**Implementation**: `PropertiesPanel.js`

**Features**:
- Color picker input for custom colors
- Preset color buttons for quick selection
- Material property controls (metalness, roughness)

```javascript
_applyColor(color) {
  const selected = AppState.get('selectedObject');
  if (!selected) return;
  
  selected.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.color.set(color);
      child.material._isCloned = true;
    }
  });
}
```

### 4.7 Persistence (Save/Load)

**Implementation**: `StorageManager.js`

**Serialization**:
```javascript
_serializeObject(obj) {
  return {
    name: obj.name,
    furnitureType: obj.userData.furnitureData?.name,
    furniturePath: obj.userData.furnitureData?.path,
    position: { x, y, z },
    rotation: { x, y, z },
    scale: { x, y, z },
    materialMods: this._serializeMaterialMods(obj)
  };
}
```

**Storage Key**: `3d-home-design-layout`

---

## 5. Application Screenshots

### 5.1 Main Interface

The main interface displays the 3D room environment with the left vertical palette containing furniture categories.

![Main Interface](demo/01-main-interface.png)

*Figure 1: Main application interface showing the 3D room with category palette*

---

### 5.2 Furniture Placement

Users can select furniture from categories and place them in the room by double-clicking on the floor.

![Furniture Placement](demo/02-furniture-placement.png)

*Figure 2: Multiple furniture items placed in the room*

---

### 5.3 Selection & Highlight

Selected objects are highlighted with a green emissive tint and a bounding box helper.

![Selection Highlight](demo/03-selection-highlight.png)

*Figure 3: Selected furniture with visual highlight indicator*

---

### 5.4 Color Customization

The properties panel allows users to change furniture colors using a color picker or preset buttons.

![Color Picker](demo/04-color-picker.png)

*Figure 4: Color customization panel with picker and presets*

---

### 5.5 Save & Load Layout

Users can save their room design to localStorage and reload it later.

![Save Load](demo/05-save-load.png)

*Figure 5: Save/Load buttons with storage indicator*

---

## 6. Conclusion

### 6.1 Achievements

This project successfully implemented all required features for the 3D Home Design Application:

| Requirement | Status | Notes |
|-------------|--------|-------|
| R1.1 Core THREE.js Setup | ✅ Complete | Scene, Camera, Renderer, Lighting |
| R1.2 Room Environment | ✅ Complete | Floor, walls, ceiling with textures |
| R1.3 Navigation Controls | ✅ Complete | OrbitControls with constraints |
| R2.1 Minimum Furniture Set | ✅ Exceeded | 40+ models (requirement: 3) |
| R2.2 Interaction | ✅ Complete | Selection, drag movement |
| R2.3 Material Change | ✅ Complete | Color picker, presets |
| R3.1 Core App Actions | ✅ Complete | Add, remove, reset |
| R3.2 UI/HUD | ✅ Complete | Palette, status indicators |
| R3.3 Save State | ✅ Complete | localStorage persistence |

### 6.2 Technical Skills Demonstrated

- **Three.js proficiency**: Scene management, materials, lighting, raycasting
- **JavaScript ES6+**: Modules, async/await, classes
- **State management**: Event-driven architecture
- **UI/UX design**: Intuitive controls, visual feedback
- **Problem-solving**: Debugging race conditions, conflict resolution

### 6.3 Future Improvements

1. **Undo/Redo system** for better user experience
2. **Touch/mobile optimization** for tablet devices
3. **Export functionality** (PNG screenshot, JSON layout)
4. **Multiple room support** with room templates
5. **Furniture rotation controls** for precise positioning

### 6.4 Lessons Learned

1. **Modular architecture** is essential for maintainability in Three.js applications
2. **Event coordination** between multiple systems requires careful planning
3. **Graceful degradation** ensures robustness when assets fail to load
4. **User feedback** through visual indicators greatly improves UX

---

## References

1. Three.js Documentation - https://threejs.org/docs/
2. Vite Documentation - https://vitejs.dev/
3. Reference Repository - https://github.com/OrangeAVA/Creative-Technology-with-Three.js
4. GLTF Format Specification - https://www.khronos.org/gltf/

---

<p align="center">
  <strong>Le Tiep Tuyen | Student ID: 22020015</strong><br>
  3D Programming Course — December 2025
</p>
