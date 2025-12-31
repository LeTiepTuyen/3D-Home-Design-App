/**
 * Room - Interior room geometry
 * Creates floor, walls, and ceiling for the home design space
 */

import * as THREE from 'three';

// Room dimensions (in units, roughly meters)
export const ROOM_CONFIG = {
  width: 10,    // X axis
  depth: 10,    // Z axis
  height: 3,    // Y axis
  wallThickness: 0.1
};

export class Room {
  constructor(scene) {
    this.scene = scene;
    this.roomGroup = new THREE.Group();
    this.roomGroup.name = 'room';
    
    this._createFloor();
    this._createWalls();
    this._createCeiling();
    
    this.scene.add(this.roomGroup);
  }

  _createFloor() {
    const { width, depth } = ROOM_CONFIG;
    
    // Floor geometry
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    
    // Floor material - wood-like appearance
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B7355, // Wood brown
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Lay flat
    floor.position.y = 0;
    floor.receiveShadow = true;
    floor.name = 'floor';

    this.roomGroup.add(floor);
    this.floor = floor;
  }

  _createWalls() {
    const { width, depth, height, wallThickness } = ROOM_CONFIG;
    
    // Wall material - light beige/off-white
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xF5F5DC, // Beige
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    // Back wall (Z = -depth/2)
    const backWall = this._createWallMesh(width, height, wallMaterial);
    backWall.position.set(0, height / 2, -depth / 2);
    backWall.name = 'wall-back';
    this.roomGroup.add(backWall);

    // Front wall (Z = +depth/2) - optional, often left open for camera view
    // Commenting out for better visibility
    // const frontWall = this._createWallMesh(width, height, wallMaterial);
    // frontWall.position.set(0, height / 2, depth / 2);
    // frontWall.rotation.y = Math.PI;
    // frontWall.name = 'wall-front';
    // this.roomGroup.add(frontWall);

    // Left wall (X = -width/2)
    const leftWall = this._createWallMesh(depth, height, wallMaterial);
    leftWall.position.set(-width / 2, height / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.name = 'wall-left';
    this.roomGroup.add(leftWall);

    // Right wall (X = +width/2) - optional for camera view
    // const rightWall = this._createWallMesh(depth, height, wallMaterial);
    // rightWall.position.set(width / 2, height / 2, 0);
    // rightWall.rotation.y = -Math.PI / 2;
    // rightWall.name = 'wall-right';
    // this.roomGroup.add(rightWall);
  }

  _createWallMesh(wallWidth, wallHeight, material) {
    const geometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const wall = new THREE.Mesh(geometry, material);
    wall.receiveShadow = true;
    wall.castShadow = false;
    return wall;
  }

  _createCeiling() {
    const { width, depth, height } = ROOM_CONFIG;
    
    // Ceiling material - white
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2; // Face down
    ceiling.position.y = height;
    ceiling.receiveShadow = false;
    ceiling.name = 'ceiling';

    this.roomGroup.add(ceiling);
    this.ceiling = ceiling;
  }

  // Get room bounds for constraining furniture movement
  getBounds() {
    const { width, depth } = ROOM_CONFIG;
    const margin = 0.5; // Keep furniture slightly away from walls
    
    return {
      minX: -width / 2 + margin,
      maxX: width / 2 - margin,
      minZ: -depth / 2 + margin,
      maxZ: depth / 2 - margin,
      floorY: 0
    };
  }

  getFloor() {
    return this.floor;
  }
}

export default Room;
