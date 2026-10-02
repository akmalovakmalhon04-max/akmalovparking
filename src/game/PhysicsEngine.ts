import { CarConfig, InputState, LevelData } from '../types';

export interface CarPhysicsState {
  x: number;
  z: number;
  rotation: number; // in radians (0 = facing -Z)
  velocity: number; // forward/backward speed
  steerAngle: number; // current front wheel turn angle
  isGrounded: boolean;
  hasCollided: boolean;
  collidedWith?: string;
  isInsideParking: boolean;
  alignmentPercent: number; // 0 - 100%
  parkingHoldTime: number; // seconds held stationary in target spot
  isParkedSuccessfully: boolean;
}

export class PhysicsEngine {
  private config: CarConfig;
  private level: LevelData;
  public state: CarPhysicsState;

  // Tuned vehicle parameters
  private maxSpeed: number;
  private maxReverseSpeed: number;
  private accelRate: number;
  private brakeRate: number;
  private steerSpeed: number;
  private maxSteerAngle: number;
  private friction: number;

  constructor(config: CarConfig, level: LevelData) {
    this.config = config;
    this.level = level;

    // Scale physics attributes from 1-10 stats (Allows hitting 60+ KM/H speed limit)
    this.maxSpeed = 12.5 + (config.stats.speed / 10) * 8.0; // 13.3 to 20.5 m/s (~48 to 74 KM/H)
    this.maxReverseSpeed = 5.5 + (config.stats.speed / 10) * 3.0; // 5.8 to 8.5 m/s
    this.accelRate = 9.0 + (config.stats.acceleration / 10) * 9.0;
    this.brakeRate = 18.0 + (config.stats.braking / 10) * 14.0;
    this.maxSteerAngle = 0.52 + (config.stats.handling / 10) * 0.16; // ~30 to ~39 degrees
    this.steerSpeed = 3.0 + (config.stats.handling / 10) * 2.0;
    this.friction = 4.2; // Natural rolling resistance

    this.state = {
      x: level.startPos.x,
      z: level.startPos.z,
      rotation: level.startPos.rotation,
      velocity: 0,
      steerAngle: 0,
      isGrounded: true,
      hasCollided: false,
      isInsideParking: false,
      alignmentPercent: 0,
      parkingHoldTime: 0,
      isParkedSuccessfully: false,
    };
  }

  public reset(config?: CarConfig, level?: LevelData) {
    if (config) this.config = config;
    if (level) this.level = level;

    this.state = {
      x: this.level.startPos.x,
      z: this.level.startPos.z,
      rotation: this.level.startPos.rotation,
      velocity: 0,
      steerAngle: 0,
      isGrounded: true,
      hasCollided: false,
      isInsideParking: false,
      alignmentPercent: 0,
      parkingHoldTime: 0,
      isParkedSuccessfully: false,
    };
  }

  public update(dt: number, input: InputState): CarPhysicsState {
    if (this.state.hasCollided || this.state.isParkedSuccessfully) {
      return this.state;
    }

    // Clamp delta time to avoid large physics steps
    const delta = Math.min(dt, 0.05);

    // 1. Steering computation
    let targetSteer = 0;
    if (input.steerValue !== 0) {
      targetSteer = input.steerValue * this.maxSteerAngle;
    } else if (input.steerLeft) {
      targetSteer = this.maxSteerAngle; // Left turn (positive angle)
    } else if (input.steerRight) {
      targetSteer = -this.maxSteerAngle; // Right turn (negative angle)
    }

    // Smooth steering transition towards target angle
    const steerDiff = targetSteer - this.state.steerAngle;
    this.state.steerAngle += Math.sign(steerDiff) * Math.min(Math.abs(steerDiff), this.steerSpeed * delta);

    // 2. Acceleration / Braking (Supports Automatic & Manual transmission)
    const isManual = input.gear !== undefined;
    const currentGear = input.gear !== undefined ? input.gear : 1;

    if (input.handbrake) {
      // Active handbrake
      if (Math.abs(this.state.velocity) > 0.05) {
        const brakeDir = -Math.sign(this.state.velocity);
        this.state.velocity += brakeDir * this.brakeRate * 1.4 * delta;
        if (Math.sign(this.state.velocity) !== -brakeDir) {
          this.state.velocity = 0;
        }
      } else {
        this.state.velocity = 0;
      }
    } else if (isManual) {
      // MANUAL TRANSMISSION (Mexanika)
      if (currentGear === 0) {
        // NEUTRAL (N): Engine revs, but wheels coast with friction
        if (Math.abs(this.state.velocity) > 0.02) {
          const frictionDir = -Math.sign(this.state.velocity);
          this.state.velocity += frictionDir * this.friction * delta;
        } else {
          this.state.velocity = 0;
        }
      } else if (currentGear === -1) {
        // REVERSE (R): Gas moves vehicle backward
        if (input.gas) {
          this.state.velocity -= this.accelRate * 0.75 * delta;
          if (this.state.velocity < -this.maxReverseSpeed) {
            this.state.velocity = -this.maxReverseSpeed;
          }
        } else if (input.reverse) {
          // Brake pedal in manual reverse
          if (this.state.velocity < 0) {
            this.state.velocity += this.brakeRate * delta;
            if (this.state.velocity > 0) this.state.velocity = 0;
          }
        } else {
          // Coasting friction
          if (Math.abs(this.state.velocity) > 0.02) {
            this.state.velocity += -Math.sign(this.state.velocity) * this.friction * delta;
          } else {
            this.state.velocity = 0;
          }
        }
      } else {
        // FORWARD GEARS (1, 2, 3, 4, 5)
        const gearSpeedCaps: Record<number, number> = {
          1: 6.8,  // ~24.5 KM/H (super steady precision parking gear!)
          2: 12.5, // ~45 KM/H
          3: 18.0, // ~65 KM/H (speed limit gear)
          4: 22.0, // ~79 KM/H
          5: 25.0, // ~90 KM/H
        };
        const gearMaxSpeed = Math.min(this.maxSpeed, gearSpeedCaps[currentGear] || this.maxSpeed);
        const torqueMultiplier = currentGear === 1 ? 1.3 : currentGear === 2 ? 1.0 : 0.8;

        if (input.gas) {
          if (this.state.velocity < gearMaxSpeed) {
            this.state.velocity += this.accelRate * torqueMultiplier * delta;
            if (this.state.velocity > gearMaxSpeed) {
              this.state.velocity = gearMaxSpeed;
            }
          }
        } else if (input.reverse) {
          // Brake pedal while in forward gear
          if (this.state.velocity > 0) {
            this.state.velocity -= this.brakeRate * delta;
            if (this.state.velocity < 0) this.state.velocity = 0;
          }
        } else {
          // Coasting friction
          if (Math.abs(this.state.velocity) > 0.02) {
            this.state.velocity += -Math.sign(this.state.velocity) * this.friction * delta;
          } else {
            this.state.velocity = 0;
          }
        }
      }
    } else {
      // AUTOMATIC TRANSMISSION (Avtomat: Drive / Reverse)
      if (input.gas) {
        if (this.state.velocity >= -0.5) {
          // Forward acceleration
          this.state.velocity += this.accelRate * delta;
          if (this.state.velocity > this.maxSpeed) {
            this.state.velocity = this.maxSpeed;
          }
        } else {
          // Braking while in reverse
          this.state.velocity += this.brakeRate * delta;
        }
      } else if (input.reverse) {
        if (this.state.velocity <= 0.5) {
          // Reverse acceleration
          this.state.velocity -= this.accelRate * 0.7 * delta;
          if (this.state.velocity < -this.maxReverseSpeed) {
            this.state.velocity = -this.maxReverseSpeed;
          }
        } else {
          // Braking while going forward
          this.state.velocity -= this.brakeRate * delta;
        }
      } else {
        // Passive rolling resistance friction
        if (Math.abs(this.state.velocity) > 0.02) {
          const frictionDir = -Math.sign(this.state.velocity);
          this.state.velocity += frictionDir * this.friction * delta;
          if (Math.abs(this.state.velocity) < 0.05) {
            this.state.velocity = 0;
          }
        } else {
          this.state.velocity = 0;
        }
      }
    }

    // 3. Bicycle kinematics model for vehicle movement
    const wheelbase = this.config.dimensions.length * 0.65;
    if (Math.abs(this.state.velocity) > 0.001) {
      // Angular velocity depends on speed and steer angle
      const angularVelocity = (this.state.velocity / wheelbase) * Math.tan(this.state.steerAngle);
      this.state.rotation += angularVelocity * delta;

      // Normalize rotation angle (-PI to PI)
      while (this.state.rotation > Math.PI) this.state.rotation -= Math.PI * 2;
      while (this.state.rotation < -Math.PI) this.state.rotation += Math.PI * 2;

      // Update position along vehicle heading vector:
      // Note: In Three.js with standard vehicle orientation, 0 angle faces -Z
      const forwardX = -Math.sin(this.state.rotation);
      const forwardZ = -Math.cos(this.state.rotation);

      this.state.x += forwardX * this.state.velocity * delta;
      this.state.z += forwardZ * this.state.velocity * delta;
    }

    // 4. Collision Detection
    this.checkCollisions();

    // 5. Parking Spot Detection & Alignment calculation
    this.checkParkingLogic(delta);

    return this.state;
  }

  /**
   * Fair, accurate Oriented Bounding Box (OBB) & Circle collision detection
   */
  private checkCollisions() {
    const { width, length } = this.config.dimensions;
    // Slightly inset collision hitbox (90%) for fair play and preventing corner snags
    const carHalfW = (width * 0.88) / 2;
    const carHalfL = (length * 0.90) / 2;

    const carCorners = this.getRotatedBoxCorners(
      this.state.x,
      this.state.z,
      carHalfW * 2,
      carHalfL * 2,
      this.state.rotation
    );

    // Check perimeter boundary limits
    const { boundary } = this.level;
    const margin = 0.2;
    for (const pt of carCorners) {
      if (
        pt.x < boundary.minX + margin ||
        pt.x > boundary.maxX - margin ||
        pt.z < boundary.minZ + margin ||
        pt.z > boundary.maxZ - margin
      ) {
        this.state.hasCollided = true;
        this.state.collidedWith = 'Perimeter Wall';
        return;
      }
    }

    // Check obstacles
    for (const obs of this.level.obstacles) {
      if (obs.type === 'cone') {
        // Circle collision for round cones
        const coneRadius = 0.35;
        if (this.checkPointNearBox(obs.x, obs.z, coneRadius, this.state.x, this.state.z, carHalfW, carHalfL, this.state.rotation)) {
          this.state.hasCollided = true;
          this.state.collidedWith = 'Traffic Cone';
          return;
        }
      } else {
        // Box vs Box collision for walls, curbs, barriers, dumpsters
        const obsCorners = this.getRotatedBoxCorners(
          obs.x,
          obs.z,
          obs.width * 0.92,
          obs.length * 0.92,
          obs.rotation || 0
        );

        if (this.doPolygonsIntersect(carCorners, obsCorners)) {
          if (obs.type === 'curb' && Math.abs(this.state.velocity) < 2.5) {
            // Low-speed curb touch (wheel hits curb bumper / parking block):
            // Stops velocity naturally and allows player to easily reverse away!
            const moveDir = Math.sign(this.state.velocity);
            this.state.velocity = 0;
            // Slight separation so car is not stuck inside geometry
            this.state.x += Math.sin(this.state.rotation) * 0.08 * moveDir;
            this.state.z += Math.cos(this.state.rotation) * 0.08 * moveDir;
            continue;
          }

          this.state.hasCollided = true;
          this.state.collidedWith = obs.type;
          return;
        }
      }
    }

    // Check parked cars
    for (const pc of this.level.parkedCars) {
      const pcCorners = this.getRotatedBoxCorners(
        pc.x,
        pc.z,
        pc.width * 0.90,
        pc.length * 0.90,
        pc.rotation
      );

      if (this.doPolygonsIntersect(carCorners, pcCorners)) {
        this.state.hasCollided = true;
        this.state.collidedWith = 'Parked Vehicle';
        return;
      }
    }
  }

  /**
   * Validates if car is parked in target slot
   */
  private checkParkingLogic(delta: number) {
    const { targetPos } = this.level;
    const { width: carW, length: carL } = this.config.dimensions;

    // Get 4 corners of player car
    const carCorners = this.getRotatedBoxCorners(
      this.state.x,
      this.state.z,
      carW * 0.85,
      carL * 0.85,
      this.state.rotation
    );

    // Get parking slot polygon
    const slotCorners = this.getRotatedBoxCorners(
      targetPos.x,
      targetPos.z,
      targetPos.width + 0.3,
      targetPos.length + 0.3,
      targetPos.rotation
    );

    // 1. Position Check: Are all 4 car corners inside the parking slot?
    let insideCount = 0;
    for (const pt of carCorners) {
      if (this.isPointInsidePolygon(pt, slotCorners)) {
        insideCount++;
      }
    }
    const isInside = insideCount === 4;
    this.state.isInsideParking = isInside;

    // 2. Alignment Check: Rotation difference between car and parking slot
    let angleDiff = Math.abs(this.state.rotation - targetPos.rotation);
    // Normalize angle to [0, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    angleDiff = Math.abs(angleDiff);

    // Also allow reverse parking (180 degrees difference) if player reverses in
    const reverseDiff = Math.abs(angleDiff - Math.PI);
    const minAngleDiff = Math.min(angleDiff, reverseDiff);

    // Tolerance: within 22 degrees (0.38 rad)
    const angleTolerance = 0.38;
    const angleOk = minAngleDiff < angleTolerance;

    // Calculate alignment percentage for HUD gauge
    const posFactor = (insideCount / 4) * 50; // 0 to 50%
    const angleFactor = Math.max(0, 1 - minAngleDiff / (Math.PI / 4)) * 50; // 0 to 50%
    this.state.alignmentPercent = Math.min(100, Math.round(posFactor + angleFactor));

    // 3. Stopped Check: Speed must be close to zero
    const isStopped = Math.abs(this.state.velocity) < 0.15;

    // If completely inside, aligned, and stopped: accumulate hold time
    if (isInside && angleOk && isStopped) {
      this.state.parkingHoldTime += delta;
      // Hold for 0.8 seconds to confirm deliberate parking
      if (this.state.parkingHoldTime >= 0.8) {
        this.state.isParkedSuccessfully = true;
      }
    } else {
      this.state.parkingHoldTime = Math.max(0, this.state.parkingHoldTime - delta * 2);
    }
  }

  // --- Geometric SAT & Polygon helpers ---

  private getRotatedBoxCorners(cx: number, cz: number, w: number, l: number, rot: number) {
    const hw = w / 2;
    const hl = l / 2;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    const corners = [
      { x: -hw, z: -hl },
      { x: hw, z: -hl },
      { x: hw, z: hl },
      { x: -hw, z: hl },
    ];

    return corners.map((c) => ({
      x: cx + (c.x * cos - c.z * sin),
      z: cz + (c.x * sin + c.z * cos),
    }));
  }

  private doPolygonsIntersect(a: { x: number; z: number }[], b: { x: number; z: number }[]): boolean {
    const polygons = [a, b];
    for (let i = 0; i < polygons.length; i++) {
      const polygon = polygons[i];
      for (let i1 = 0; i1 < polygon.length; i1++) {
        const i2 = (i1 + 1) % polygon.length;
        const p1 = polygon[i1];
        const p2 = polygon[i2];

        // Normal vector to edge
        const normal = { x: p2.z - p1.z, z: p1.x - p2.x };

        // Project polygon A
        let minA = Infinity, maxA = -Infinity;
        for (const p of a) {
          const projected = normal.x * p.x + normal.z * p.z;
          if (projected < minA) minA = projected;
          if (projected > maxA) maxA = projected;
        }

        // Project polygon B
        let minB = Infinity, maxB = -Infinity;
        for (const p of b) {
          const projected = normal.x * p.x + normal.z * p.z;
          if (projected < minB) minB = projected;
          if (projected > maxB) maxB = projected;
        }

        if (maxA < minB || maxB < minA) {
          return false; // Separating axis found
        }
      }
    }
    return true;
  }

  private checkPointNearBox(
    px: number,
    pz: number,
    radius: number,
    cx: number,
    cz: number,
    hw: number,
    hl: number,
    rot: number
  ): boolean {
    // Transform point to box local space
    const dx = px - cx;
    const dz = pz - cz;
    const cos = Math.cos(-rot);
    const sin = Math.sin(-rot);

    const localX = dx * cos - dz * sin;
    const localZ = dx * sin + dz * cos;

    // Find closest point on AABB
    const clampedX = Math.max(-hw, Math.min(hw, localX));
    const clampedZ = Math.max(-hl, Math.min(hl, localZ));

    const distX = localX - clampedX;
    const distZ = localZ - clampedZ;

    return distX * distX + distZ * distZ < radius * radius;
  }

  private isPointInsidePolygon(point: { x: number; z: number }, vs: { x: number; z: number }[]): boolean {
    const x = point.x, z = point.z;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].x, zi = vs[i].z;
      const xj = vs[j].x, zj = vs[j].z;
      const intersect = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
}
