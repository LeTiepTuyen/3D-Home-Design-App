---
name: "3D Home Design Challenge 2"
description: "Enforce requirements-driven, step-gated implementation using reference repo for 3D Home Design App with Three.js."
applyTo: '**'
---
You are a senior Three.js engineer working in VS Code with MCP tools available (filesystem + shell + sequential thinking). 

#GOAL:
Implement “Challenge 2 — 3D Home Design Application (Three.js)” by reusing and extending the provided reference repository instead of building from scratch, while strictly satisfying ALL requirements in:
requirements-of-project/challenge-2-requirements.md


#HARD RULES:
1) Read and follow the markdown requirements file as the single source of truth.
2) Use the reference repo as baseline and refactor/extend it to meet requirements.
3) Work in iterative milestones. After each milestone: run the app and perform the listed test checklist. Only proceed if tests pass.
4) Keep code clean, modular, and maintainable. Prefer small modules over one giant file.
5) Produce a professional README.md including: “Le Tiep Tuyen — Student ID: 22020015”, setup/run, features, controls, libraries/assets, plus badges/license if feasible.



### Read first (mandatory)
Open and read carefully: `challenge-2-requirements.md`
You must follow it exactly and ensure the UI meets the minimum baseline (left vertical palette + workable room design workflow).

### Starting point (mandatory)
1) Clone the reference repo into a temporary folder (do NOT overwrite current project):
- Repo: https://github.com/OrangeAVA/Interactive-Web-Development-With-Three.js-and-A-Frame/tree/main/chapter09/06_home_design_app
- Use folder: `chapter09/06_home_design_app`

2) Inspect the reference code to understand:
- How the left palette UI works
- How assets are organized (models/images/ui)
- How selection/placement is implemented

3) Reuse it as a base, but refactor/restructure for clarity.

### Your workflow requirement (must follow)
You MUST execute in this loop:
1) Plan the step (short checklist)
2) Implement the step (code changes)
3) Test the step (run app, verify behavior)
4) Only proceed if the test passes

### Step WORK PLAN (execute exactly in order, with Testing Gate after each section):



SECTION 0 — Requirements + Baseline Audit (NO coding yet)
A) Open and summarize requirements-of-project/challenge-2-requirements.md into an internal checklist (R1/R2/R3 + deliverables).
B) Clone the reference repo. Inspect its structure and capabilities:
   - does it already have room geometry, OrbitControls, loading models, basic UI?
   - identify what can be reused vs what must be added.
C) Propose a target folder structure for our Challenge 2 project (src/ core / ui / assets / loaders / state, etc.) and a migration plan.



#### Step 1 — Project bootstrap & run
- Decide the simplest runnable setup:
  - Option 1: keep static structure like reference + minimal npm scripts
  - Option 2: migrate to Vite only if it stays minimal and helps module structure
- Ensure a single command runs the app (prefer: `npm run dev`)
TEST:
- Start the dev server, open the URL, confirm the 3D canvas renders without console errors.

#### Step 2 — Scene + Room environment (R1)
- Implement clean modules for:
  - Scene/renderer/camera
  - Lights + shadows
  - OrbitControls
  - Resize handling
- Create interior room: floor + walls + ceiling, reasonable scaling, basic materials/textures.
TEST:
- Confirm orbit controls rotate/zoom/pan.
- Confirm room looks like an interior and is correctly sized.

#### Step 3 — UI baseline (must match example minimum)
- Implement a left vertical palette panel (at least categories: Living Room/Kitchen/Bedroom/Bathroom).
- Connect UI events to “active furniture type” selection.
TEST:
- Clicking categories updates UI state (active item shown).
- UI is stable and does not overlap canvas badly.

#### Step 4 — Furniture registry + placement (R2)
- Provide at least 3 furniture types: sofa/table/chair (use models if available; otherwise simple primitives as fallback).
- Implement “add furniture” from UI: spawn in room on floor plane with correct scale.
TEST:
- Add each furniture type successfully, objects appear in room, no broken materials.

#### Step 5 — Selection + move within bounds (R2)
- Implement raycasting selection on click.
- Provide clear highlight (outline/emissive/box helper).
- Implement moving selected object by dragging on the floor plane.
- Constrain movement inside room bounds.
TEST:
- Select object reliably.
- Drag moves object smoothly on the floor.
- Object cannot leave room.

#### Step 6 — Material/color change + replace (R2)
- Add UI controls for selected object:
  - Color/material option (minimum: color picker)
  - Replace type (swap model/variant) OR change selected item type
TEST:
- Changes apply immediately and persist while interacting.

#### Step 7 — App actions + visual feedback (R3)
- Implement:
  - Remove selected
  - Reset layout
- Ensure UI clearly shows:
  - Selected object
  - Active furniture item
Optional:
- Save/load layout in localStorage.
TEST:
- Remove/reset work without errors.
- Selection/active indicators always correct.

#### Step 8 — Deliverables polish
- Write a professional root `README.md` per requirements:
  - Student info, setup/run, feature checklist
- Ensure consistent folder structure and asset paths.
TEST:
- Fresh install run: delete node_modules, reinstall, run dev, confirm everything works.

### Required output after completion
- Final folder tree (trimmed)
- Commands to run
- Features implemented mapped to the checklist in requirements
- Any known limitations
