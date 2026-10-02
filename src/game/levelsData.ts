import { LevelData, LevelTheme, Obstacle, ParkedCar, CarModelType } from '../types';

const CAR_MODELS: CarModelType[] = [
  'sedan',
  'coupe',
  'hatchback',
  'suv',
  'muscle',
  'electric',
];

const CAR_COLORS = [
  '#dc2626', // Red
  '#2563eb', // Blue
  '#475569', // Slate
  '#16a34a', // Green
  '#ca8a04', // Yellow
  '#7c3aed', // Purple
  '#ffffff', // White
  '#18181b', // Black
  '#ea580c', // Orange
];

/**
 * Deterministically generates rich, playable parking levels from 1 to 100.
 */
export function getLevelData(lvl: number): LevelData {
  const levelNumber = Math.max(1, Math.min(100, Math.floor(lvl)));

  // Required exact formula: Level 1 = 90s, +5s each level -> Level 100 = 585s
  const timeLimit = 90 + (levelNumber - 1) * 5;
  const baseReward = 100 + (levelNumber - 1) * 20;

  // Cycle themes smoothly
  const themes: LevelTheme[] = [
    'day_lot',
    'supermarket',
    'office',
    'underground',
    'night_city',
    'slalom',
  ];
  const theme = themes[(levelNumber - 1) % themes.length];

  // Pseudo-random deterministic generator using level as seed
  let seed = levelNumber * 12345 + 6789;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const obstacles: Obstacle[] = [];
  const parkedCars: ParkedCar[] = [];
  const streetlights: { x: number; z: number }[] = [];
  const trees: { x: number; z: number }[] = [];

  // Default arena dimensions scale slightly with level complexity
  const arenaWidth = 40 + Math.min(30, Math.floor(levelNumber / 10) * 4);
  const arenaLength = 50 + Math.min(40, Math.floor(levelNumber / 10) * 5);

  const minX = -arenaWidth / 2;
  const maxX = arenaWidth / 2;
  const minZ = -arenaLength / 2;
  const maxZ = arenaLength / 2;

  // Perimeter boundary walls
  obstacles.push(
    { id: 'wall_n', type: 'wall', x: 0, z: minZ, width: arenaWidth + 2, length: 1, height: 1.5 },
    { id: 'wall_s', type: 'wall', x: 0, z: maxZ, width: arenaWidth + 2, length: 1, height: 1.5 },
    { id: 'wall_w', type: 'wall', x: minX, z: 0, width: 1, length: arenaLength + 2, height: 1.5 },
    { id: 'wall_e', type: 'wall', x: maxX, z: 0, width: 1, length: arenaLength + 2, height: 1.5 }
  );

  // Streetlights around corners
  streetlights.push(
    { x: minX + 3, z: minZ + 3 },
    { x: maxX - 3, z: minZ + 3 },
    { x: minX + 3, z: maxZ - 3 },
    { x: maxX - 3, z: maxZ - 3 }
  );

  // Start position for player
  const startPos = {
    x: 0,
    z: maxZ - 8,
    rotation: 0, // facing north (-Z)
  };

  let targetPos = {
    x: 0,
    z: minZ + 10,
    rotation: 0,
    width: 2.7,
    length: 5.4,
  };

  // Target spot becomes slightly tighter as level progresses
  const difficultyFactor = Math.min(1, levelNumber / 100);
  targetPos.width = Math.max(2.3, 2.8 - difficultyFactor * 0.45);
  targetPos.length = Math.max(4.8, 5.5 - difficultyFactor * 0.5);

  // Generate distinct layout archetypes based on level modulo
  const archetype = levelNumber % 8;

  if (levelNumber === 1) {
    // Level 1: Very wide, direct path, friendly starter
    targetPos.x = 0;
    targetPos.z = minZ + 12;
    targetPos.rotation = 0;
    targetPos.width = 3.2;
    targetPos.length = 6.0;

    // A few guiding soft cones
    obstacles.push(
      { id: 'c1', type: 'cone', x: -4, z: 0, width: 0.6, length: 0.6, height: 0.8 },
      { id: 'c2', type: 'cone', x: 4, z: 0, width: 0.6, length: 0.6, height: 0.8 }
    );
  } else if (archetype === 1) {
    // 90-degree Perpendicular Bay on Right side flanked by parked cars
    targetPos.x = 10;
    targetPos.z = minZ + 16;
    targetPos.rotation = Math.PI / 2; // East facing

    // Parked cars on adjacent bays
    parkedCars.push(
      { id: 'pc1', modelType: 'sedan', color: '#dc2626', x: 10, z: minZ + 12.5, rotation: Math.PI / 2, width: 2.0, length: 4.5 },
      { id: 'pc2', modelType: 'suv', color: '#2563eb', x: 10, z: minZ + 19.5, rotation: Math.PI / 2, width: 2.1, length: 4.7 }
    );

    // Island curb divider
    obstacles.push(
      { id: 'curb1', type: 'curb', x: -6, z: 5, width: 2, length: 18, height: 0.3 }
    );
  } else if (archetype === 2) {
    // Parallel parking challenge between 2 parked cars
    targetPos.x = maxX - 4;
    targetPos.z = 0;
    targetPos.rotation = 0;

    parkedCars.push(
      { id: 'pc_front', modelType: 'sedan', color: '#16a34a', x: maxX - 4, z: -6.5, rotation: 0, width: 1.9, length: 4.4 },
      { id: 'pc_rear', modelType: 'coupe', color: '#e11d48', x: maxX - 4, z: 6.5, rotation: 0, width: 1.9, length: 4.3 }
    );

    // Center traffic cones creating chicane
    const numCones = Math.min(8, 3 + Math.floor(levelNumber / 15));
    for (let i = 0; i < numCones; i++) {
      obstacles.push({
        id: `cone_${i}`,
        type: 'cone',
        x: (i % 2 === 0 ? -4 : 2),
        z: 14 - i * 5,
        width: 0.6,
        length: 0.6,
        height: 0.8
      });
    }
  } else if (archetype === 3) {
    // Slalom obstacle course with cones & barriers leading to tight parking slot
    targetPos.x = -8;
    targetPos.z = minZ + 10;
    targetPos.rotation = 0;

    const stages = 4 + Math.floor(levelNumber / 20);
    for (let i = 0; i < stages; i++) {
      const zOffset = maxZ - 14 - i * 6;
      const xOffset = (i % 2 === 0 ? 5 : -5);
      obstacles.push(
        { id: `barrier_${i}`, type: 'barrier', x: xOffset, z: zOffset, width: 4.5, length: 0.6, height: 1.0 },
        { id: `cone_sl_${i}`, type: 'cone', x: -xOffset * 0.7, z: zOffset + 2, width: 0.6, length: 0.6, height: 0.8 }
      );
    }

    parkedCars.push(
      { id: 'pc_slot_r', modelType: 'electric', color: '#06b6d4', x: -4.5, z: minZ + 10, rotation: 0, width: 2.0, length: 4.4 }
    );
  } else if (archetype === 4) {
    // Reverse parking into a dead-end parking bay
    targetPos.x = minX + 7;
    targetPos.z = minZ + 10;
    targetPos.rotation = Math.PI; // Recommended to reverse in!

    // Barrier walls forming parking stall
    obstacles.push(
      { id: 'stall_wall_l', type: 'barrier', x: minX + 4.5, z: minZ + 10, width: 0.4, length: 5.5, height: 1.2 },
      { id: 'stall_wall_b', type: 'barrier', x: minX + 7, z: minZ + 6.8, width: 4.0, length: 0.4, height: 1.2 }
    );

    parkedCars.push(
      { id: 'pc_rev_adj', modelType: 'muscle', color: '#7c3aed', x: minX + 9.8, z: minZ + 10, rotation: 0, width: 2.0, length: 4.7 }
    );

    // Dumpster & curbs on road approach
    obstacles.push(
      { id: 'dump1', type: 'dumpster', x: 4, z: 2, width: 2.2, length: 1.5, height: 1.6 }
    );
  } else if (archetype === 5) {
    // Underground Pillar Grid with tight turns
    targetPos.x = 10;
    targetPos.z = minZ + 12;
    targetPos.rotation = 0;

    // Concrete pillars in grid
    const pillarRows = [-12, -4, 4, 12];
    const pillarCols = [-10, 0, 10];
    pillarRows.forEach((pz, rIdx) => {
      pillarCols.forEach((px, cIdx) => {
        // Don't block target or start
        if (Math.abs(px - targetPos.x) < 3.5 && Math.abs(pz - targetPos.z) < 4) return;
        if (Math.abs(px - startPos.x) < 3.5 && Math.abs(pz - startPos.z) < 4) return;
        if (rIdx % 2 === 0 || cIdx === 1) {
          obstacles.push({
            id: `pillar_${rIdx}_${cIdx}`,
            type: 'pillar',
            x: px,
            z: pz,
            width: 1.2,
            length: 1.2,
            height: 3.5,
          });
        }
      });
    });

    // Parked car beside target
    parkedCars.push(
      { id: 'pc_pillar_adj', modelType: 'suv', color: '#ea580c', x: 6.8, z: minZ + 12, rotation: 0, width: 2.1, length: 4.6 }
    );
  } else if (archetype === 6) {
    // Supermarket double-row parking lot with shopping cart corral & traffic lanes
    targetPos.x = -8;
    targetPos.z = 2;
    targetPos.rotation = Math.PI / 2;

    // Cart return corral
    obstacles.push(
      { id: 'corral', type: 'barrier', x: 0, z: 2, width: 2.2, length: 5, height: 1.0 },
      { id: 'curb_lane', type: 'curb', x: -8, z: 12, width: 14, length: 1.2, height: 0.3 }
    );

    // Parked cars row
    [-15, -1, 6, 13].forEach((zOff, i) => {
      if (Math.abs(zOff - targetPos.z) < 3.0) return;
      parkedCars.push({
        id: `pc_super_${i}`,
        modelType: CAR_MODELS[i % CAR_MODELS.length],
        color: CAR_COLORS[(i + levelNumber) % CAR_COLORS.length],
        x: -8,
        z: zOff,
        rotation: Math.PI / 2,
        width: 1.9,
        length: 4.4,
      });
    });
  } else {
    // Archetype 7 / 0: High difficulty multi-lane curve with parked vehicles on both sides
    targetPos.x = 0;
    targetPos.z = minZ + 8;
    targetPos.rotation = 0;

    // Left and right parked cars
    parkedCars.push(
      { id: 'pc_l', modelType: 'sedan', color: '#3b82f6', x: -3.5, z: minZ + 8, rotation: 0, width: 1.9, length: 4.4 },
      { id: 'pc_r', modelType: 'coupe', color: '#ef4444', x: 3.5, z: minZ + 8, rotation: 0, width: 1.9, length: 4.3 }
    );

    // Intermediate S-bend chicane
    const extraObstacles = Math.min(6, 2 + Math.floor(levelNumber / 15));
    for (let i = 0; i < extraObstacles; i++) {
      const zPos = maxZ - 15 - i * 6;
      obstacles.push({
        id: `chicane_cone_${i}`,
        type: (i % 2 === 0 ? 'barrier' : 'cone'),
        x: Math.sin(i * 1.5) * 5,
        z: zPos,
        width: i % 2 === 0 ? 3.0 : 0.6,
        length: i % 2 === 0 ? 0.6 : 0.6,
        height: 0.9,
      });
    }
  }

  // Add decorative trees strictly OUTSIDE the parking lot perimeter fence in the surrounding garden lawn
  // They provide scenic atmosphere without EVER being inside the parking lot or near parking spaces!
  if (theme === 'day_lot' || theme === 'office' || theme === 'supermarket') {
    trees.push(
      { x: minX - 7.0, z: minZ - 7.0 },
      { x: minX - 7.0, z: 0 },
      { x: minX - 7.0, z: maxZ + 7.0 },
      { x: maxX + 7.0, z: minZ - 7.0 },
      { x: maxX + 7.0, z: 0 },
      { x: maxX + 7.0, z: maxZ + 7.0 },
      { x: 0, z: minZ - 7.0 },
      { x: 0, z: maxZ + 7.0 }
    );
  }

  return {
    levelNumber,
    theme,
    timeLimit,
    baseReward,
    startPos,
    targetPos,
    obstacles,
    parkedCars,
    decorations: {
      streetlights,
      trees,
    },
    boundary: {
      minX,
      maxX,
      minZ,
      maxZ,
    },
    speedLimit: 60,
  };
}

export function getAllLevelsOverview(): { level: number; time: number; reward: number; theme: LevelTheme }[] {
  const list = [];
  for (let i = 1; i <= 100; i++) {
    const time = 90 + (i - 1) * 5;
    const reward = 100 + (i - 1) * 20;
    const themes: LevelTheme[] = [
      'day_lot',
      'supermarket',
      'office',
      'underground',
      'night_city',
      'slalom',
    ];
    list.push({
      level: i,
      time,
      reward,
      theme: themes[(i - 1) % themes.length],
    });
  }
  return list;
}
