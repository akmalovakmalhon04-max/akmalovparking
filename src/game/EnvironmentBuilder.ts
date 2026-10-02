import * as THREE from 'three';
import { LevelData, Obstacle } from '../types';
import { CarModelBuilder } from './CarModelBuilder';

export interface EnvironmentScene {
  group: THREE.Group;
  targetSpotMesh: THREE.Group;
  targetMarkerRing: THREE.Mesh;
  targetArrow: THREE.Group;
  floatingPIcon: THREE.Group;
  updateAnimations: (time: number, isInsideTarget: boolean) => void;
  cleanup: () => void;
}

export class EnvironmentBuilder {
  public static build(levelData: LevelData): EnvironmentScene {
    const group = new THREE.Group();
    group.name = 'environment_root';

    const { theme, boundary, targetPos, obstacles, parkedCars, decorations } = levelData;
    const width = boundary.maxX - boundary.minX;
    const length = boundary.maxZ - boundary.minZ;

    const isNight = theme === 'night_city';
    const isUnderground = theme === 'underground';

    // Outer landscape plane (extends far beyond perimeter fence for beautiful surroundings)
    const outerGeo = new THREE.PlaneGeometry(width + 36, length + 36);
    outerGeo.rotateX(-Math.PI / 2);
    const outerMat = new THREE.MeshStandardMaterial({
      color: isUnderground ? 0x18181b : isNight ? 0x090d16 : 0x15803d, // lush grass green for daylight
      roughness: 0.9,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.position.set((boundary.minX + boundary.maxX) / 2, -0.02, (boundary.minZ + boundary.maxZ) / 2);
    outerMesh.receiveShadow = true;
    group.add(outerMesh);

    // 1. Tarmac Ground (Inner parking area inside fence)
    const groundGeo = new THREE.PlaneGeometry(width + 2, length + 2);
    groundGeo.rotateX(-Math.PI / 2);

    const groundColor = isUnderground ? 0x27272a : isNight ? 0x18181b : 0x334155;
    const groundMat = new THREE.MeshStandardMaterial({
      color: groundColor,
      roughness: 0.85,
      metalness: 0.1,
    });

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.set((boundary.minX + boundary.maxX) / 2, 0, (boundary.minZ + boundary.maxZ) / 2);
    groundMesh.receiveShadow = true;
    group.add(groundMesh);

    // Parking slot lines (painted white markings on ground)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Grid markings across the parking lot
    const lineGroup = new THREE.Group();
    const createStallLines = (cx: number, cz: number, sw: number, sl: number, rot: number) => {
      const box = new THREE.Group();
      box.position.set(cx, 0.015, cz);
      box.rotation.y = rot;

      const lw = 0.12;
      // Left line
      const lLine = new THREE.Mesh(new THREE.PlaneGeometry(lw, sl), lineMat);
      lLine.rotateX(-Math.PI / 2);
      lLine.position.set(-sw / 2, 0, 0);
      // Right line
      const rLine = new THREE.Mesh(new THREE.PlaneGeometry(lw, sl), lineMat);
      rLine.rotateX(-Math.PI / 2);
      rLine.position.set(sw / 2, 0, 0);
      // End line
      const eLine = new THREE.Mesh(new THREE.PlaneGeometry(sw, lw), yellowLineMat);
      eLine.rotateX(-Math.PI / 2);
      eLine.position.set(0, 0, -sl / 2);

      box.add(lLine, rLine, eLine);
      lineGroup.add(box);
    };

    // Draw lines under parked cars
    parkedCars.forEach((pc) => {
      createStallLines(pc.x, pc.z, pc.width + 0.6, pc.length + 0.8, pc.rotation);
    });

    group.add(lineGroup);

    // 2. Obstacles
    obstacles.forEach((obs) => {
      const obsMesh = this.createObstacleMesh(obs, isUnderground);
      group.add(obsMesh);
    });

    // 3. Parked Cars
    parkedCars.forEach((pc) => {
      const carMesh = CarModelBuilder.createParkedCarMesh(pc.modelType, pc.color, pc.width, pc.length);
      carMesh.position.set(pc.x, 0, pc.z);
      carMesh.rotation.y = pc.rotation;
      group.add(carMesh);
    });

    // 4. Streetlights / Pillars / Trees
    if (decorations?.streetlights) {
      decorations.streetlights.forEach((pos) => {
        const lightPole = this.createStreetlight(pos.x, pos.z, isNight);
        group.add(lightPole);
      });
    }

    if (decorations?.trees && !isUnderground) {
      decorations.trees.forEach((pos) => {
        // Enforce that trees are strictly outside the drivable perimeter
        const isFarOutside = pos.x <= boundary.minX - 2 || pos.x >= boundary.maxX + 2 || pos.z <= boundary.minZ - 2 || pos.z >= boundary.maxZ + 2;
        if (isFarOutside) {
          const tree = this.createTree(pos.x, pos.z);
          group.add(tree);
        }
      });
    }

    // 4.5 Speed Limit 3D Signs (e.g. 60 KM/H signs at entry roads)
    const speedLimitVal = levelData.speedLimit || 60;
    const sign1 = this.createSpeedLimitSign(boundary.minX + 3.5, boundary.maxZ - 4.5, speedLimitVal);
    const sign2 = this.createSpeedLimitSign(boundary.maxX - 3.5, boundary.minZ + 4.5, speedLimitVal);
    group.add(sign1, sign2);

    // 5. Target Parking Zone (Highlighted & Glowing)
    const targetSpotMesh = new THREE.Group();
    targetSpotMesh.position.set(targetPos.x, 0.02, targetPos.z);
    targetSpotMesh.rotation.y = targetPos.rotation;

    // Glowing rectangular border
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.85,
    });

    const tbThick = 0.16;
    const { width: tw, length: tl } = targetPos;

    // Left border
    const bLeft = new THREE.Mesh(new THREE.PlaneGeometry(tbThick, tl), borderMat);
    bLeft.rotateX(-Math.PI / 2);
    bLeft.position.set(-tw / 2, 0, 0);
    // Right border
    const bRight = new THREE.Mesh(new THREE.PlaneGeometry(tbThick, tl), borderMat);
    bRight.rotateX(-Math.PI / 2);
    bRight.position.set(tw / 2, 0, 0);
    // Back border
    const bBack = new THREE.Mesh(new THREE.PlaneGeometry(tw, tbThick), borderMat);
    bBack.rotateX(-Math.PI / 2);
    bBack.position.set(0, 0, -tl / 2);
    // Front dotted entrance
    const bFront = new THREE.Mesh(new THREE.PlaneGeometry(tw * 0.9, tbThick * 0.7), new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.6 }));
    bFront.rotateX(-Math.PI / 2);
    bFront.position.set(0, 0, tl / 2);

    // Glowing ground decal
    const padMat = new THREE.MeshBasicMaterial({
      color: 0x16a34a,
      transparent: true,
      opacity: 0.18,
    });
    const padMesh = new THREE.Mesh(new THREE.PlaneGeometry(tw, tl), padMat);
    padMesh.rotateX(-Math.PI / 2);

    targetSpotMesh.add(bLeft, bRight, bBack, bFront, padMesh);
    group.add(targetSpotMesh);

    // Floating Target Direction Arrow (points player which way to park)
    const targetArrow = new THREE.Group();
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x15803d,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const arrowShaft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 1.4), arrowMat);
    arrowShaft.position.set(0, 0.04, 0.3);
    const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 3), arrowMat);
    arrowHead.rotateX(-Math.PI / 2);
    arrowHead.position.set(0, 0.04, -0.7);
    targetArrow.add(arrowShaft, arrowHead);
    targetArrow.position.set(targetPos.x, 0.04, targetPos.z);
    targetArrow.rotation.y = targetPos.rotation;
    group.add(targetArrow);

    // Floating animated 3D "P" Parking Marker icon above bay
    const floatingPIcon = new THREE.Group();
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x2563eb,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });

    const pPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8), pMat);
    pPillar.position.set(-0.35, 0, 0);

    const pLoop = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 8, 16, Math.PI), pMat);
    pLoop.position.set(-0.35, 0.25, 0);
    pLoop.rotation.z = -Math.PI / 2;

    const pBackboard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3 })
    );
    pBackboard.rotation.x = Math.PI / 2;
    pBackboard.position.z = -0.05;

    floatingPIcon.add(pPillar, pLoop, pBackboard);
    floatingPIcon.position.set(targetPos.x, 2.8, targetPos.z);
    group.add(floatingPIcon);

    // Glowing target ring on the ground
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const targetMarkerRing = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.8, 32), ringMat);
    targetMarkerRing.rotateX(-Math.PI / 2);
    targetMarkerRing.position.set(targetPos.x, 0.03, targetPos.z);
    group.add(targetMarkerRing);

    // Animation function
    const updateAnimations = (time: number, isInsideTarget: boolean) => {
      // Bob and rotate floating P icon
      floatingPIcon.position.y = 2.8 + Math.sin(time * 2.5) * 0.25;
      floatingPIcon.rotation.y = time * 1.2;

      // Pulse target ring
      const pulseScale = 1.0 + Math.sin(time * 3.5) * 0.12;
      targetMarkerRing.scale.set(pulseScale, pulseScale, pulseScale);

      // Color shift when inside target zone
      if (isInsideTarget) {
        ringMat.color.setHex(0x10b981);
        ringMat.opacity = 0.8;
        borderMat.color.setHex(0x10b981);
      } else {
        ringMat.color.setHex(0xeab308);
        ringMat.opacity = 0.45;
        borderMat.color.setHex(0x22c55e);
      }
    };

    return {
      group,
      targetSpotMesh,
      targetMarkerRing,
      targetArrow,
      floatingPIcon,
      updateAnimations,
      cleanup: () => {
        // Disposals handled by Three renderer
      },
    };
  }

  private static createObstacleMesh(obs: Obstacle, isUnderground: boolean): THREE.Object3D {
    const group = new THREE.Group();
    group.position.set(obs.x, 0, obs.z);
    if (obs.rotation) group.rotation.y = obs.rotation;

    const h = obs.height || 1.0;

    switch (obs.type) {
      case 'cone': {
        // Traffic Cone with reflective stripe
        const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.55), coneMat);
        base.position.y = 0.03;
        base.castShadow = true;

        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 12), coneMat);
        cone.position.y = 0.38;
        cone.castShadow = true;

        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.18, 12), stripeMat);
        stripe.position.y = 0.4;

        group.add(base, cone, stripe);
        break;
      }

      case 'barrier': {
        // Red and White striped road barrier
        const barMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });

        const beam1 = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 0.25, obs.length), barMat);
        beam1.position.y = 0.65;
        beam1.castShadow = true;

        const beam2 = new THREE.Mesh(new THREE.BoxGeometry(obs.width * 0.95, 0.2, obs.length * 0.9), whiteMat);
        beam2.position.y = 0.35;
        beam2.castShadow = true;

        // Legs
        const legGeo = new THREE.BoxGeometry(0.2, 0.8, obs.length * 1.5);
        const legL = new THREE.Mesh(legGeo, barMat);
        legL.position.set(-obs.width * 0.42, 0.4, 0);
        const legR = new THREE.Mesh(legGeo, barMat);
        legR.position.set(obs.width * 0.42, 0.4, 0);

        group.add(beam1, beam2, legL, legR);
        break;
      }

      case 'pillar': {
        // Concrete building pillar
        const pillarMat = new THREE.MeshStandardMaterial({
          color: isUnderground ? 0x71717a : 0x94a3b8,
          roughness: 0.9,
          metalness: 0.1,
        });

        const pillar = new THREE.Mesh(new THREE.BoxGeometry(obs.width, h, obs.length), pillarMat);
        pillar.position.y = h / 2;
        pillar.castShadow = true;
        pillar.receiveShadow = true;

        // Yellow warning stripe at bottom
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(obs.width + 0.04, 0.4, obs.length + 0.04),
          new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 })
        );
        stripe.position.y = 0.25;

        group.add(pillar, stripe);
        break;
      }

      case 'curb': {
        // Concrete sidewalk / island curb
        const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
        const curb = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 0.28, obs.length), curbMat);
        curb.position.y = 0.14;
        curb.castShadow = true;
        curb.receiveShadow = true;
        group.add(curb);
        break;
      }

      case 'dumpster': {
        // Green waste dumpster
        const dMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, metalness: 0.3 });
        const dumpster = new THREE.Mesh(new THREE.BoxGeometry(obs.width, h, obs.length), dMat);
        dumpster.position.y = h / 2;
        dumpster.castShadow = true;
        group.add(dumpster);
        break;
      }

      case 'wall':
      default: {
        // Perimeter wall / concrete barrier
        const wallMat = new THREE.MeshStandardMaterial({
          color: 0x475569,
          roughness: 0.8,
        });
        const wall = new THREE.Mesh(new THREE.BoxGeometry(obs.width, h, obs.length), wallMat);
        wall.position.y = h / 2;
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);
        break;
      }
    }

    return group;
  }

  private static createStreetlight(x: number, z: number, isNight: boolean): THREE.Group {
    const pole = new THREE.Group();
    pole.position.set(x, 0, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 5, 8), metalMat);
    post.position.y = 2.5;
    post.castShadow = true;

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), metalMat);
    arm.position.set(0.4, 4.9, 0);
    arm.rotation.z = Math.PI / 4;

    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: isNight ? 1.5 : 0.4,
    });
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.4), lampMat);
    lamp.position.set(0.8, 4.6, 0);

    pole.add(post, arm, lamp);
    return pole;
  }

  private static createTree(x: number, z: number): THREE.Group {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
    );
    trunk.position.y = 0.9;
    trunk.castShadow = true;

    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.4, 1),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
    );
    foliage.position.y = 2.6;
    foliage.castShadow = true;

    tree.add(trunk, foliage);
    return tree;
  }

  private static createSpeedLimitSign(x: number, z: number, limit: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Steel post
    const postMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), postMat);
    post.position.y = 1.25;
    post.castShadow = true;
    group.add(post);

    // Create Canvas Texture for European Speed Limit (White circle with thick Red border and black bold number)
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // White inner background
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(128, 128, 120, 0, Math.PI * 2);
      ctx.fill();

      // Thick Red border
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 32;
      ctx.stroke();

      // Black bold text (e.g. 60)
      ctx.fillStyle = '#09090b';
      ctx.font = 'bold 110px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(limit), 128, 134);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.1,
    });

    const signGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.04, 32);
    signGeo.rotateX(Math.PI / 2);
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 2.3, 0);
    signMesh.castShadow = true;
    group.add(signMesh);

    return group;
  }
}
