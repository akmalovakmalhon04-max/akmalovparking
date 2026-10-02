import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CameraViewMode, CarConfig, GraphicsQuality, InputState, LevelData } from '../types';
import { Car3DObject, CarModelBuilder } from './CarModelBuilder';
import { EnvironmentBuilder, EnvironmentScene } from './EnvironmentBuilder';
import { PhysicsEngine } from './PhysicsEngine';
import { audio } from '../utils/audio';

interface GameCanvasProps {
  levelData: LevelData;
  carConfig: CarConfig;
  inputState: InputState;
  graphicsQuality: GraphicsQuality;
  isPaused: boolean;
  onCrash: (obstacleName: string) => void;
  onWin: (timeTaken: number) => void;
  onTick: (speedKmh: number, alignmentPercent: number, isReversing: boolean) => void;
  cameraResetTrigger?: number;
  resetTrigger?: number;
  cameraViewMode?: CameraViewMode;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  levelData,
  carConfig,
  inputState,
  graphicsQuality,
  isPaused,
  onCrash,
  onWin,
  onTick,
  cameraResetTrigger,
  resetTrigger,
  cameraViewMode = 'third_person',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References to keep across re-renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const carObjectRef = useRef<Car3DObject | null>(null);
  const envSceneRef = useRef<EnvironmentScene | null>(null);
  const physicsRef = useRef<PhysicsEngine | null>(null);

  // Camera Orbit / Touch controls
  const cameraYawRef = useRef<number>(0); // manual orbit yaw offset
  const cameraPitchRef = useRef<number>(0.35); // camera pitch
  const cameraDistRef = useRef<number>(7.5);
  const isDraggingRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Game timing
  const startTimeRef = useRef<number>(performance.now());
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameIdRef = useRef<number | null>(null);
  const hasEndedRef = useRef<boolean>(false);

  // Camera View Mode Ref for live reactive loop reading
  const cameraViewModeRef = useRef<CameraViewMode>(cameraViewMode);
  useEffect(() => {
    cameraViewModeRef.current = cameraViewMode;
    cameraYawRef.current = 0;
    cameraPitchRef.current = 0.35;
  }, [cameraViewMode]);

  // Collision shake
  const shakeRef = useRef<number>(0);

  // Initialize Three.js scene and rebuild on level or car change
  useEffect(() => {
    if (!containerRef.current) return;
    hasEndedRef.current = false;
    startTimeRef.current = performance.now();
    lastTimeRef.current = performance.now();
    shakeRef.current = 0;
    cameraYawRef.current = 0;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Sky / Fog based on theme
    const isUnderground = levelData.theme === 'underground';
    const isNight = levelData.theme === 'night_city';

    if (isUnderground) {
      scene.background = new THREE.Color(0x18181b);
      scene.fog = new THREE.FogExp2(0x18181b, 0.025);
    } else if (isNight) {
      scene.background = new THREE.Color(0x090d16);
      scene.fog = new THREE.FogExp2(0x090d16, 0.015);
    } else {
      scene.background = new THREE.Color(0x93c5fd); // Clear blue daytime sky
      scene.fog = new THREE.Fog(0x93c5fd, 40, 95);
    }

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.2, 180);
    cameraRef.current = camera;

    // 3. Renderer with quality tuning
    const renderer = new THREE.WebGLRenderer({
      antialias: graphicsQuality !== 'low',
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;

    const maxPixelRatio = graphicsQuality === 'high' ? 2.0 : graphicsQuality === 'med' ? 1.5 : 1.0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isNight ? 1.2 : 1.0;

    if (graphicsQuality !== 'low') {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = graphicsQuality === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    }

    // Attach to DOM
    containerRef.current.replaceChildren(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(
      isUnderground ? 0xffffff : isNight ? 0x64748b : 0xffffff,
      isUnderground ? 0.7 : isNight ? 0.4 : 0.85
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, isNight ? 0.4 : 1.2);
    sunLight.position.set(15, 25, 20);
    if (graphicsQuality !== 'low') {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = graphicsQuality === 'high' ? 2048 : 1024;
      sunLight.shadow.mapSize.height = graphicsQuality === 'high' ? 2048 : 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 70;
      const d = 35;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    // 5. Environment
    const envScene = EnvironmentBuilder.build(levelData);
    envSceneRef.current = envScene;
    scene.add(envScene.group);

    // 6. Player Car placed at spawn
    const carObj = CarModelBuilder.createCar(carConfig);
    carObj.root.position.set(levelData.startPos.x, 0, levelData.startPos.z);
    carObj.root.rotation.y = levelData.startPos.rotation;
    carObjectRef.current = carObj;
    scene.add(carObj.root);

    // Initial camera placement behind spawn
    const initDist = 7.5;
    const initPitch = 0.35;
    const initH = initDist * Math.sin(initPitch) + 1.2;
    const initHDist = initDist * Math.cos(initPitch);
    camera.position.set(
      levelData.startPos.x + Math.sin(levelData.startPos.rotation) * initHDist,
      initH,
      levelData.startPos.z + Math.cos(levelData.startPos.rotation) * initHDist
    );
    camera.lookAt(levelData.startPos.x, 0.8, levelData.startPos.z);

    // 7. Physics
    const physics = new PhysicsEngine(carConfig, levelData);
    physicsRef.current = physics;

    // Start engine audio
    audio.startEngine();

    // 8. Resize Listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      audio.stopEngine();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
    };
  }, [levelData, carConfig, graphicsQuality]);

  // Full Respawn / Reset Trigger (when car gets stuck or restart is pressed)
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      hasEndedRef.current = false;
      startTimeRef.current = performance.now();
      lastTimeRef.current = performance.now();
      shakeRef.current = 0;
      cameraYawRef.current = 0;
      cameraPitchRef.current = 0.35;
      cameraDistRef.current = 7.5;

      // 1. Reset physics engine back to startPos
      if (physicsRef.current) {
        physicsRef.current.reset(carConfig, levelData);
      }

      // 2. Put 3D car mesh back at spawn
      if (carObjectRef.current) {
        carObjectRef.current.root.position.set(levelData.startPos.x, 0, levelData.startPos.z);
        carObjectRef.current.root.rotation.y = levelData.startPos.rotation;
        carObjectRef.current.updateWheels(0, 0);
        carObjectRef.current.setBraking(false);
      }

      // 3. Reset camera back behind spawn
      if (cameraRef.current) {
        const camDist = 7.5;
        const camPitch = 0.35;
        const camH = camDist * Math.sin(camPitch) + 1.2;
        const camHDist = camDist * Math.cos(camPitch);
        const heading = levelData.startPos.rotation;

        cameraRef.current.position.set(
          levelData.startPos.x + Math.sin(heading) * camHDist,
          camH,
          levelData.startPos.z + Math.cos(heading) * camHDist
        );
        cameraRef.current.lookAt(levelData.startPos.x, 0.8, levelData.startPos.z);
      }

      // 4. Ensure engine audio is active
      audio.startEngine();
      audio.updateEngine(0, false);
    }
  }, [resetTrigger, levelData, carConfig]);

  // Reset Camera angle when requested
  useEffect(() => {
    if (cameraResetTrigger) {
      cameraYawRef.current = 0;
      cameraPitchRef.current = 0.35;
      cameraDistRef.current = 7.5;
    }
  }, [cameraResetTrigger]);

  // Animation & Physics Loop
  useEffect(() => {
    const loop = () => {
      animFrameIdRef.current = requestAnimationFrame(loop);

      const now = performance.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPaused || hasEndedRef.current) return;

      const physics = physicsRef.current;
      const carObj = carObjectRef.current;
      const env = envSceneRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;

      if (!physics || !carObj || !scene || !camera || !renderer) return;

      // Update Physics
      const pState = physics.update(dt, inputState);

      // Speed in KM/H (scaled realistically for parking)
      const speedKmh = Math.abs(pState.velocity * 3.6);
      const isReversing = pState.velocity < -0.1;

      // Audio engine update
      audio.updateEngine(speedKmh / 50, isReversing);

      // Inform parent UI for HUD
      onTick(speedKmh, pState.alignmentPercent, isReversing);

      // Update 3D car position & orientation
      carObj.root.position.set(pState.x, 0, pState.z);
      carObj.root.rotation.y = pState.rotation;

      // Update wheels rotation and steering
      const travelDist = pState.velocity * dt;
      carObj.updateWheels(pState.steerAngle, travelDist);

      // Brake lights activation
      const isBraking = inputState.handbrake || (pState.velocity > 0.2 && inputState.reverse) || (pState.velocity < -0.2 && inputState.gas);
      carObj.setBraking(isBraking);

      // Turn signals & side blinkers activation
      const isBlinkerFlash = Math.floor(now / 380) % 2 === 0;
      const leftBlink = (inputState.turnSignal === 'left' || inputState.turnSignal === 'hazard') && isBlinkerFlash;
      const rightBlink = (inputState.turnSignal === 'right' || inputState.turnSignal === 'hazard') && isBlinkerFlash;
      carObj.setBlinkers(leftBlink, rightBlink);

      // Environment target animation
      env?.updateAnimations(now / 1000, pState.isInsideParking);

      // Check Crash
      if (pState.hasCollided && !hasEndedRef.current) {
        hasEndedRef.current = true;
        shakeRef.current = 1.0;
        audio.playCrash();
        onCrash(pState.collidedWith || 'Obstacle');
        return;
      }

      // Check Win
      if (pState.isParkedSuccessfully && !hasEndedRef.current) {
        hasEndedRef.current = true;
        const timeTaken = (now - startTimeRef.current) / 1000;
        audio.playWin();
        onWin(timeTaken);
        return;
      }

      const carHeading = pState.rotation;

      // 1ST PERSON (Cockpit / Driver's view) vs 3RD PERSON (Chase camera)
      if (cameraViewModeRef.current === 'first_person') {
        const cosH = Math.cos(carHeading);
        const sinH = Math.sin(carHeading);

        // Driver eye position in world space
        const lx = carObj.cockpitOffset.x;
        const ly = carObj.cockpitOffset.y;
        const lz = carObj.cockpitOffset.z;

        const driverEyeX = pState.x + (lx * cosH - lz * sinH);
        const driverEyeY = ly;
        const driverEyeZ = pState.z + (lx * sinH + lz * cosH);

        // Position camera directly at driver's head
        camera.position.set(driverEyeX, driverEyeY, driverEyeZ);

        // Look forward through the windshield with slight manual look control
        const lookYaw = carHeading + cameraYawRef.current * 0.4;
        const lookDist = 12.0;
        const lookX = driverEyeX - Math.sin(lookYaw) * lookDist;
        const lookZ = driverEyeZ - Math.cos(lookYaw) * lookDist;
        const lookY = driverEyeY - 0.15 + (cameraPitchRef.current - 0.35) * 3.5;

        camera.lookAt(lookX, lookY, lookZ);
      } else {
        // 3rd Person Follow Chase Camera with Orbit & Shake
        const totalYaw = carHeading + cameraYawRef.current;

        const camDist = cameraDistRef.current;
        const camHeight = camDist * Math.sin(cameraPitchRef.current) + 1.2;
        const camHorizontalDist = camDist * Math.cos(cameraPitchRef.current);

        // Follow behind the vehicle
        const targetCamX = pState.x + Math.sin(totalYaw) * camHorizontalDist;
        const targetCamZ = pState.z + Math.cos(totalYaw) * camHorizontalDist;
        const targetCamY = camHeight;

        // Smooth camera interpolation
        const camLerpFactor = 0.12;
        camera.position.x += (targetCamX - camera.position.x) * camLerpFactor;
        camera.position.z += (targetCamZ - camera.position.z) * camLerpFactor;
        camera.position.y += (targetCamY - camera.position.y) * camLerpFactor;

        // Apply screen shake on impact
        if (shakeRef.current > 0.01) {
          camera.position.x += (Math.random() - 0.5) * shakeRef.current;
          camera.position.y += (Math.random() - 0.5) * shakeRef.current;
          shakeRef.current *= 0.85;
        }

        // Camera look target (car center + slight forward lookahead)
        const lookAhead = 0.8;
        const lookX = pState.x - Math.sin(carHeading) * lookAhead;
        const lookZ = pState.z - Math.cos(carHeading) * lookAhead;
        camera.lookAt(lookX, 0.8, lookZ);
      }

      // Render
      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [inputState, isPaused, onCrash, onWin, onTick]);

  // Touch and Mouse Drag to Orbit Camera
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    // Orbit camera yaw
    cameraYawRef.current -= dx * 0.008;

    // Pitch limit
    cameraPitchRef.current = Math.max(0.12, Math.min(1.1, cameraPitchRef.current + dy * 0.005));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom on wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraDistRef.current = Math.max(4.0, Math.min(14.0, cameraDistRef.current + e.deltaY * 0.01));
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className="absolute inset-0 w-full h-full overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    />
  );
};
