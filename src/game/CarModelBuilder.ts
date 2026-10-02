import * as THREE from 'three';
import { CarConfig } from '../types';

export interface Car3DObject {
  root: THREE.Group;
  frontLeftWheel: THREE.Group;
  frontRightWheel: THREE.Group;
  rearLeftWheel: THREE.Group;
  rearRightWheel: THREE.Group;
  brakeLightMesh: THREE.Mesh;
  headlightMesh: THREE.Mesh;
  cockpitOffset: THREE.Vector3;
  setBraking: (braking: boolean) => void;
  updateWheels: (steerAngle: number, travelDist: number) => void;
  setBlinkers: (left: boolean, right: boolean) => void;
}

export class CarModelBuilder {
  /**
   * Generates a detailed 3D car mesh with steerable/rotating wheels and reactive brake lights.
   */
  public static createCar(config: CarConfig): Car3DObject {
    const root = new THREE.Group();
    root.name = `car_${config.id}`;

    const { width, length, height } = config.dimensions;
    const bodyColor = new THREE.Color(config.primaryColor);
    const darkColor = new THREE.Color(config.secondaryColor);
    const rimColor = new THREE.Color(config.rimColor);
    const accentColor = new THREE.Color(config.accentColor);

    // Common materials
    const paintMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.25,
      metalness: 0.6,
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: darkColor,
      roughness: 0.3,
      metalness: 0.4,
    });

    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.8,
      metalness: 0.1,
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
      color: rimColor,
      roughness: 0.2,
      metalness: 0.8,
    });

    const headLightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffbeb,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });

    const brakeLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      emissive: 0x450a0a,
      emissiveIntensity: 0.2,
      roughness: 0.2,
    });

    // 1. Lower Chassis
    const chassisHeight = height * 0.4;
    const chassisGeo = new THREE.BoxGeometry(width, chassisHeight, length);
    const chassisMesh = new THREE.Mesh(chassisGeo, paintMaterial);
    chassisMesh.position.y = chassisHeight / 2 + 0.2;
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    root.add(chassisMesh);

    // 2. Cabin / Greenhouse (Upper Body)
    if (config.modelType !== 'formula') {
      const cabinWidth = width * 0.88;
      const cabinLength = length * (config.modelType === 'hatchback' ? 0.65 : 0.52);
      const cabinHeight = height * 0.45;

      const cabinGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
      const cabinMesh = new THREE.Mesh(cabinGeo, roofMaterial);

      // Offset cabin towards rear slightly for sports/sedan
      const cabinZOffset = config.modelType === 'hatchback' ? 0.2 : 0.3;
      cabinMesh.position.set(0, chassisMesh.position.y + chassisHeight / 2 + cabinHeight / 2, cabinZOffset);
      cabinMesh.castShadow = true;
      root.add(cabinMesh);

      // Windshield (Front Glass)
      const wsGeo = new THREE.BoxGeometry(cabinWidth * 0.94, cabinHeight * 0.8, 0.1);
      const wsMesh = new THREE.Mesh(wsGeo, windowMaterial);
      wsMesh.position.set(0, cabinMesh.position.y, cabinMesh.position.z - cabinLength / 2 - 0.02);
      wsMesh.rotation.x = -0.3;
      root.add(wsMesh);

      // Rear Glass
      const rwGeo = new THREE.BoxGeometry(cabinWidth * 0.94, cabinHeight * 0.8, 0.1);
      const rwMesh = new THREE.Mesh(rwGeo, windowMaterial);
      rwMesh.position.set(0, cabinMesh.position.y, cabinMesh.position.z + cabinLength / 2 + 0.02);
      rwMesh.rotation.x = config.modelType === 'hatchback' ? 0.1 : 0.35;
      root.add(rwMesh);
    } else {
      // Formula Racer cockpit & nosecone
      const noseGeo = new THREE.ConeGeometry(width * 0.3, length * 0.4, 4);
      const noseMesh = new THREE.Mesh(noseGeo, paintMaterial);
      noseMesh.rotation.x = Math.PI / 2;
      noseMesh.rotation.y = Math.PI / 4;
      noseMesh.position.set(0, 0.35, -length * 0.45);
      root.add(noseMesh);

      // Front Wing
      const frontWing = new THREE.Mesh(
        new THREE.BoxGeometry(width * 1.1, 0.08, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.5 })
      );
      frontWing.position.set(0, 0.2, -length * 0.55);
      root.add(frontWing);
    }

    // Rear Spoiler (for sports / hypercars / drift / formula)
    if (['coupe', 'muscle', 'supercar', 'drift', 'formula', 'hypercar'].includes(config.modelType)) {
      const spoiler = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.9, 0.08, 0.35),
        new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.2 })
      );
      spoiler.position.set(0, height + 0.05, length * 0.46);
      spoiler.castShadow = true;
      root.add(spoiler);

      // Spoiler pillars
      const pL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.1), roofMaterial);
      pL.position.set(-width * 0.3, height - 0.08, length * 0.46);
      const pR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.1), roofMaterial);
      pR.position.set(width * 0.3, height - 0.08, length * 0.46);
      root.add(pL, pR);
    }

    // 3. Headlights (Front: -Z direction)
    const hlGeo = new THREE.BoxGeometry(width * 0.22, 0.12, 0.1);
    const hlMeshL = new THREE.Mesh(hlGeo, headLightMaterial);
    hlMeshL.position.set(-width * 0.35, chassisMesh.position.y + 0.05, -length / 2 - 0.01);
    const hlMeshR = new THREE.Mesh(hlGeo, headLightMaterial);
    hlMeshR.position.set(width * 0.35, chassisMesh.position.y + 0.05, -length / 2 - 0.01);
    root.add(hlMeshL, hlMeshR);

    // 4. Brake Lights (Rear: +Z direction)
    const blGeo = new THREE.BoxGeometry(width * 0.25, 0.12, 0.1);
    const blMeshL = new THREE.Mesh(blGeo, brakeLightMaterial);
    blMeshL.position.set(-width * 0.35, chassisMesh.position.y + 0.05, length / 2 + 0.01);
    const blMeshR = new THREE.Mesh(blGeo, brakeLightMaterial);
    blMeshR.position.set(width * 0.35, chassisMesh.position.y + 0.05, length / 2 + 0.01);
    root.add(blMeshL, blMeshR);

    // 4.5 Side Mirrors (Bokovoy ko'zgular) & Turn Signal Blinkers
    const blinkerMatL = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: 0x451a03,
      emissiveIntensity: 0.1,
      roughness: 0.3,
    });
    const blinkerMatR = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: 0x451a03,
      emissiveIntensity: 0.1,
      roughness: 0.3,
    });
    const mirrorReflectMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.05,
    });

    // Left Side Mirror
    const mirrorHousingL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.14, 0.16), paintMaterial);
    mirrorHousingL.position.set(-width / 2 - 0.12, height * 0.58, -length * 0.15);
    const mirrorGlassL = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), mirrorReflectMat);
    mirrorGlassL.position.set(-width / 2 - 0.12, height * 0.58, -length * 0.15 + 0.085);
    mirrorGlassL.rotation.y = -0.15;
    const blinkerStripL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.16), blinkerMatL);
    blinkerStripL.position.set(-width / 2 - 0.22, height * 0.58, -length * 0.15);
    root.add(mirrorHousingL, mirrorGlassL, blinkerStripL);

    // Right Side Mirror
    const mirrorHousingR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.14, 0.16), paintMaterial);
    mirrorHousingR.position.set(width / 2 + 0.12, height * 0.58, -length * 0.15);
    const mirrorGlassR = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), mirrorReflectMat);
    mirrorGlassR.position.set(width / 2 + 0.12, height * 0.58, -length * 0.15 + 0.085);
    mirrorGlassR.rotation.y = 0.15;
    const blinkerStripR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.16), blinkerMatR);
    blinkerStripR.position.set(width / 2 + 0.22, height * 0.58, -length * 0.15);
    root.add(mirrorHousingR, mirrorGlassR, blinkerStripR);

    // 5. Wheels
    const wheelRadius = config.modelType === 'suv' ? 0.42 : 0.34;
    const wheelWidth = config.modelType === 'formula' ? 0.32 : 0.24;

    const createWheel = () => {
      const wheelGroup = new THREE.Group();

      // Tire
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 20);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMesh = new THREE.Mesh(tireGeo, tireMaterial);
      tireMesh.castShadow = true;
      wheelGroup.add(tireMesh);

      // Rim
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, wheelWidth + 0.01, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, rimMaterial);
      wheelGroup.add(rimMesh);

      // Center Hub Nut
      const hubGeo = new THREE.CylinderGeometry(wheelRadius * 0.2, wheelRadius * 0.2, wheelWidth + 0.02, 8);
      hubGeo.rotateZ(Math.PI / 2);
      const hubMesh = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({ color: 0x09090b }));
      wheelGroup.add(hubMesh);

      return wheelGroup;
    };

    const wheelX = width / 2;
    const wheelZ = length * 0.32;
    const wheelY = wheelRadius;

    // Four wheel anchor groups for steering and rolling
    const flGroup = new THREE.Group();
    flGroup.position.set(-wheelX, wheelY, -wheelZ);
    const flWheel = createWheel();
    flGroup.add(flWheel);
    root.add(flGroup);

    const frGroup = new THREE.Group();
    frGroup.position.set(wheelX, wheelY, -wheelZ);
    const frWheel = createWheel();
    frGroup.add(frWheel);
    root.add(frGroup);

    const rlGroup = new THREE.Group();
    rlGroup.position.set(-wheelX, wheelY, wheelZ);
    const rlWheel = createWheel();
    rlGroup.add(rlWheel);
    root.add(rlGroup);

    const rrGroup = new THREE.Group();
    rrGroup.position.set(wheelX, wheelY, wheelZ);
    const rrWheel = createWheel();
    rrGroup.add(rrWheel);
    root.add(rrGroup);

    let totalWheelRoll = 0;

    const setBraking = (braking: boolean) => {
      if (braking) {
        brakeLightMaterial.emissive.setHex(0xef4444);
        brakeLightMaterial.emissiveIntensity = 2.0;
      } else {
        brakeLightMaterial.emissive.setHex(0x450a0a);
        brakeLightMaterial.emissiveIntensity = 0.2;
      }
    };

    const updateWheels = (steerAngle: number, travelDist: number) => {
      // Steer front wheels around Y
      flGroup.rotation.y = steerAngle;
      frGroup.rotation.y = steerAngle;

      // Roll wheels around X
      const rollAngle = travelDist / wheelRadius;
      totalWheelRoll += rollAngle;

      flWheel.rotation.x = totalWheelRoll;
      frWheel.rotation.x = totalWheelRoll;
      rlWheel.rotation.x = totalWheelRoll;
      rrWheel.rotation.x = totalWheelRoll;
    };

    const cockpitOffset = new THREE.Vector3(
      -width * 0.22,
      height * 0.72,
      -length * 0.08
    );

    const setBlinkers = (left: boolean, right: boolean) => {
      if (left) {
        blinkerMatL.emissive.setHex(0xf59e0b);
        blinkerMatL.emissiveIntensity = 2.5;
      } else {
        blinkerMatL.emissive.setHex(0x451a03);
        blinkerMatL.emissiveIntensity = 0.1;
      }

      if (right) {
        blinkerMatR.emissive.setHex(0xf59e0b);
        blinkerMatR.emissiveIntensity = 2.5;
      } else {
        blinkerMatR.emissive.setHex(0x451a03);
        blinkerMatR.emissiveIntensity = 0.1;
      }
    };

    return {
      root,
      frontLeftWheel: flGroup,
      frontRightWheel: frGroup,
      rearLeftWheel: rlGroup,
      rearRightWheel: rrGroup,
      brakeLightMesh: blMeshL,
      headlightMesh: hlMeshL,
      cockpitOffset,
      setBraking,
      updateWheels,
      setBlinkers,
    };
  }

  /**
   * Helper to create parked AI cars with static models
   */
  public static createParkedCarMesh(
    modelType: CarConfig['modelType'],
    color: string,
    width: number,
    length: number
  ): THREE.Group {
    const group = new THREE.Group();
    const bodyColor = new THREE.Color(color);

    const paint = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.3,
      metalness: 0.4,
    });

    const glass = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.8,
    });

    const wheelsMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8,
    });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, 0.65, length), paint);
    body.position.y = 0.55;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 0.85, 0.55, length * 0.55), glass);
    roof.position.set(0, 1.15, 0.1);
    roof.castShadow = true;
    group.add(roof);

    // Simple 4 wheels
    const wR = 0.32;
    const wGeo = new THREE.CylinderGeometry(wR, wR, 0.2, 12);
    wGeo.rotateZ(Math.PI / 2);
    [
      [-width / 2, -length * 0.3],
      [width / 2, -length * 0.3],
      [-width / 2, length * 0.3],
      [width / 2, length * 0.3],
    ].forEach(([wx, wz]) => {
      const wMesh = new THREE.Mesh(wGeo, wheelsMat);
      wMesh.position.set(wx, wR, wz);
      group.add(wMesh);
    });

    return group;
  }
}
