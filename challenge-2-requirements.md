# Challenge 2 — 3D Home Design Application (THREE.js)
## Requirements & Implementation Instructions

### 0) Objective (What you are building)
Build a **web-based 3D Home Design App** using **THREE.js** that allows a user to:
- Navigate a 3D room (orbit, zoom, pan),
- **Place furniture** into the room,
- **Select and move** furniture within the room,
- **Change furniture material/color** and optionally **replace** furniture type,
- Provide **clear UI feedback** (selected object, active furniture item),
- Maintain a **clean, user-friendly interface**.

This challenge is inspired by a reference implementation and must reach at least the **minimum GUI/UX quality** shown in the “Home design app” example (left vertical tool panel + usable in-scene placement).

---

### 1) Reference Repository (Starting Point — required)
You MUST start from (clone and reuse) the reference project:

- Reference repo: `OrangeAVA/Creative-Technology-with-Three.js`
- Folder: `chapter09/06_home_design_app`
- URL: https://github.com/OrangeAVA/Creative-Technology-with-Three.js/tree/main/chapter09/06_home_design_app

Rules:
- You **may reuse** code structure, logic, and assets patterns from the reference.
- You **must refactor/restructure** for clarity and maintainability (do not keep it as a messy copy).
- You **may extend** beyond the reference if it improves quality and meets requirements.

Minimum GUI baseline:
- Left vertical “palette” panel for categories/items (like the example screenshot).
- A working 3D room with furniture placement and interaction.

---

### 2) Functional Requirements (Grading Categories)

## R1 — Scene & Environment Setup (40%)
### R1.1 Core THREE.js Setup
- Use **THREE.js**.
- Initialize:
  - `Scene`
  - `Camera`
  - `WebGLRenderer`
  - Lighting setup (at least ambient + one shadow-casting light)
- Handle responsive resize (camera aspect + renderer size).

### R1.2 Room Environment (Living room baseline)
Create a basic room-like environment:
- **Floor**, **walls**, and **ceiling** representing a simple interior.
- Use appropriate **materials/textures** for floor/walls/ceiling (simple colors are acceptable, textures preferred).
- Ensure **correct scaling** (furniture should look proportionate to room).
- Add a background environment:
  - Skybox / HDRI is optional,
  - A simple background is acceptable if the scene is visually clear.

### R1.3 Navigation Controls
- Implement **OrbitControls**:
  - Rotate, zoom, and pan enabled.
  - User can comfortably explore the room.

Acceptance check (R1):
- Room renders correctly, looks like an interior space, camera controls work smoothly.

---

## R2 — Furniture Modeling & Placement (30%)
### R2.1 Minimum Furniture Set
You must create/import at least **3 furniture types** (at minimum):
- Sofa
- Table
- Chair

Each furniture item must be:
- A separate `Mesh` or `Group` (recommended: `Group` if multi-mesh).
- Maintain consistent scale conventions.

### R2.2 Interaction: Furniture Interaction (Select & Move) & Customization
Implement user interaction using **Raycaster**:
- User can **select** a furniture object by clicking/tapping.
- User can **move** the selected object **within the room bounds** (floor plane constraints).
  - Recommended: drag on a ground plane intersection.
  - Prevent objects from going outside the room.

### R2.3 Material/Color Change + Replace
Must support:
- Change furniture **color** OR **material** at runtime (UI control).
- Replace furniture type with another (e.g., swap chair model variant) OR provide a “change model” option per selected item.
- Changes must apply immediately and remain consistent when interacting.

Acceptance check (R2):
- User can place at least 3 furniture types, select them, move them on the floor, and change appearance.

---

## R3 — Application Logic & Visual Feedback (30%)
### R3.1 Core App Actions
Provide basic application logic:
- Add furniture (via UI palette)
- Remove furniture (delete selected / remove last)
- Reset room layout (clear all placed items and restore default state)

### R3.2 UI / HUD Requirements (must be clean)
You must display a UI overlay that includes:
- Furniture type selector (via left vertical palette like reference UI)
- Material/color options (for selected object)
- Clear indicators:
  - **Selected object** (highlight, outline, emissive, or helper)
  - **Active furniture item** (UI state clearly shows what is active)

### R3.3 (Optional) Save State
Optional bonus:
- Save current design state in **localStorage**
  - Restore on reload
  - Store positions/rotations/scales + type/material params

Acceptance check (R3):
- UI is understandable, user knows what is selected/active, can add/remove/reset reliably.

---

### 3) Minimum UI/UX Target (must match example baseline)
Your app must look and behave like a real “home design” tool at a basic level:
- A **left vertical palette** with category buttons (at least:
  - Living Room
  - Kitchen
  - Bedroom
  - Bathroom
  - Lights (optional)
  - Structure (optional))
- Clicking an item/category shows usable placement options.
- When an item is selected:
  - It is visually highlighted,
  - The UI shows that item as active,
  - User can move it.

You do NOT need to fully replicate every detail of the reference UI, but the structure and usability must be comparable.

---

### 4) Technical Constraints & Guidance
- You may keep the project as a static site (like reference) OR migrate to a bundler (Vite) **only if it stays simple**.
- Code quality matters:
  - Split large logic into modules (scene setup, UI, furniture system, interaction controller).
  - Avoid monolithic `main.js` with everything mixed.
- Must run locally with a clear command:
  - Either `npm run dev` (recommended) or `node server.js` (acceptable).

---

### 5) Suggested Project Structure (recommended)
You may adapt, but keep it clean:

- `public/assets/...` (models, textures, UI images)
- `src/`
  - `main.js`
  - `core/` (scene, renderer, camera, controls, lights)
  - `systems/` (furniture loader/registry, placement, selection/move)
  - `ui/` (palette, panels, state display)
  - `utils/` (helpers, constants)

If you keep the reference structure, at least refactor the JS into logical modules.

---

### 6) Deliverables
1. **Working 3D Home Design App** (code runs locally).
2. **README.md** (professional) including:
   - Project title
   - Student info (as required by course):
     - Name: **Le Tiep Tuyen**
     - Student ID: **22020015**
     - Course: **3D Programming**
     - Date: **Dec 2025**
   - Setup and run instructions
   - Feature checklist + known limitations
   - Optional: badges/license for professionalism

---

### 7) Final Acceptance Criteria Checklist
- [ ] Scene renders a room (floor + walls + ceiling) with correct scale
- [ ] OrbitControls navigation works (rotate/zoom/pan)
- [ ] At least 3 furniture types exist (sofa/table/chair)
- [ ] User can add furniture via UI palette
- [ ] User can select furniture via raycasting
- [ ] Selected object is clearly highlighted
- [ ] User can move selected object on floor within bounds
- [ ] User can change furniture material/color
- [ ] User can remove furniture and reset layout
- [ ] UI clearly indicates selected object + active furniture item
- [ ] App runs locally with documented commands
- [ ] README.md is complete and professional
