import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { AssistantState, ThemeMode } from '../types';
import { gestureEngine } from '../services/gestureEngine';

interface HologramSphereProps {
  state: AssistantState;
  audioLevel?: number; // 0.0 to 1.0
  theme?: ThemeMode;
  onTap?: () => void;
  onDoubleTap?: () => void;
}

// Module-scope reusable math helpers to eliminate GC
const _vec3 = new THREE.Vector3();

// Simplified continental landmass bounding boxes [minLat, maxLat, minLon, maxLon] in degrees
const CONTINENT_BOXES = [
  // North America
  { minLat: 15, maxLat: 72, minLon: -168, maxLon: -52 },
  // South America
  { minLat: -55, maxLat: 12, minLon: -81, maxLon: -34 },
  // Europe
  { minLat: 36, maxLat: 71, minLon: -10, maxLon: 40 },
  // Africa
  { minLat: -35, maxLat: 37, minLon: -17, maxLon: 51 },
  // Asia
  { minLat: 8, maxLat: 75, minLon: 40, maxLon: 180 },
  // India subcontinent
  { minLat: 8, maxLat: 36, minLon: 68, maxLon: 90 },
  // Australia
  { minLat: -44, maxLat: -10, minLon: 112, maxLon: 154 },
  // Japan & East Asia Islands
  { minLat: 30, maxLat: 46, minLon: 128, maxLon: 146 },
  // United Kingdom
  { minLat: 50, maxLat: 59, minLon: -8, maxLon: 2 },
];

function isLand(lat: number, lon: number): boolean {
  for (const box of CONTINENT_BOXES) {
    if (lat >= box.minLat && lat <= box.maxLat && lon >= box.minLon && lon <= box.maxLon) {
      return true;
    }
  }
  return false;
}

export const HologramSphere: React.FC<HologramSphereProps> = ({
  state,
  audioLevel = 0,
  theme = 'cobalt-glass',
  onTap,
  onDoubleTap,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AssistantState>(state);
  const audioLevelRef = useRef<number>(audioLevel);
  const themeRef = useRef<ThemeMode>(theme);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020306, 0.04);

    const isMobile = width < 640;
    const baseCameraZ = isMobile ? 8.6 : 6.8;
    let targetCameraZ = baseCameraZ;
    let currentCameraZ = baseCameraZ;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, baseCameraZ);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    // Dynamic light color based on theme
    const getThemeColors = (t: ThemeMode) => {
      switch (t) {
        case 'stark-gold':
          return {
            ambient: 0x2d1a04,
            key: 0xffd580,
            core: 0xffaa11,
            palette: [
              new THREE.Color(0xfff0b3),
              new THREE.Color(0xffbe26),
              new THREE.Color(0xf59e0b),
              new THREE.Color(0xd97706),
              new THREE.Color(0xff8c00),
            ],
            ringColor: 0xffb703,
            accentColor: 0xffd166,
            gridColor: 0xd97706,
          };
        case 'arc-reactor':
          return {
            ambient: 0x041c2d,
            key: 0x67e8f9,
            core: 0x06b6d4,
            palette: [
              new THREE.Color(0xe0f2fe),
              new THREE.Color(0x38bdf8),
              new THREE.Color(0x06b6d4),
              new THREE.Color(0x0284c7),
              new THREE.Color(0x00f5ff),
            ],
            ringColor: 0x00f5ff,
            accentColor: 0x38bdf8,
            gridColor: 0x0284c7,
          };
        case 'obsidian':
          return {
            ambient: 0x0f172a,
            key: 0x94a3b8,
            core: 0xe2e8f0,
            palette: [
              new THREE.Color(0xffffff),
              new THREE.Color(0xcfd8dc),
              new THREE.Color(0x90a4ae),
              new THREE.Color(0xef4444),
              new THREE.Color(0x38bdf8),
            ],
            ringColor: 0xe2e8f0,
            accentColor: 0x94a3b8,
            gridColor: 0x475569,
          };
        case 'cobalt-glass':
        default:
          return {
            ambient: 0x0e172a,
            key: 0x93c5fd,
            core: 0x3b82f6,
            palette: [
              new THREE.Color(0xf0fdfa),
              new THREE.Color(0x67e8f9),
              new THREE.Color(0x60a5fa),
              new THREE.Color(0x818cf8),
              new THREE.Color(0xa855f7),
            ],
            ringColor: 0x38bdf8,
            accentColor: 0x818cf8,
            gridColor: 0x2563eb,
          };
      }
    };

    let curThemeColors = getThemeColors(themeRef.current);

    const ambientLight = new THREE.AmbientLight(curThemeColors.ambient, 1.6);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(curThemeColors.core, 4.2, 14, 1.8);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const keyLight = new THREE.DirectionalLight(curThemeColors.key, 2.2);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // Root Hologram Matrix Group
    const hologramGroup = new THREE.Group();
    scene.add(hologramGroup);

    // 1. Procedural Glowing Particle Texture
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const pCtx = particleCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(0.2, 'rgba(255, 230, 180, 0.95)');
    pGrad.addColorStop(0.5, 'rgba(180, 200, 255, 0.5)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);

    const particleTexture = new THREE.CanvasTexture(particleCanvas);
    particleTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. High-Density Futuristic Hologram Globe Particle Mesh
    const particleCount = isSoftwareGl ? 3500 : 7200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const sphereRadius = 2.0;

    for (let i = 0; i < particleCount; i++) {
      let lat = 0;
      let lon = 0;
      let r = sphereRadius;

      // 45% of particles allocated to Continental landmasses to shape the Earth Globe
      if (i < particleCount * 0.45) {
        let attempts = 0;
        do {
          lat = (Math.random() - 0.5) * 160; // -80 to 80
          lon = (Math.random() - 0.5) * 360; // -180 to 180
          attempts++;
        } while (!isLand(lat, lon) && attempts < 8);
        r = sphereRadius + (Math.random() - 0.5) * 0.05;
      } else if (i < particleCount * 0.75) {
        // Equatorial & Latitudinal orbital bands
        lat = (Math.floor(Math.random() * 7) - 3) * 22; // -66, -44, -22, 0, 22, 44, 66
        lon = Math.random() * 360 - 180;
        r = sphereRadius + (Math.random() - 0.5) * 0.12;
      } else {
        // Uniform spherical shell
        const phi = Math.acos(-1 + (2 * (i - particleCount * 0.75)) / (particleCount * 0.25));
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        lat = 90 - (phi * 180) / Math.PI;
        lon = (theta * 180) / Math.PI;
        r = sphereRadius + (Math.random() - 0.5) * 0.18;
      }

      const phiRad = ((90 - lat) * Math.PI) / 180;
      const thetaRad = ((lon + 180) * Math.PI) / 180;

      const x = -(r * Math.sin(phiRad) * Math.cos(thetaRad));
      const z = r * Math.sin(phiRad) * Math.sin(thetaRad);
      const y = r * Math.cos(phiRad);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      const col = curThemeColors.palette[Math.floor(Math.random() * curThemeColors.palette.length)];
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: isSoftwareGl ? 0.075 : 0.062,
      map: particleTexture,
      transparent: true,
      opacity: 0.92,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleCloud = new THREE.Points(particleGeometry, particleMaterial);
    hologramGroup.add(particleCloud);

    // 3. Globe Latitude / Longitude Coordinate Wireframe
    const globeGridGroup = new THREE.Group();
    hologramGroup.add(globeGridGroup);

    // Parallels (Latitudes)
    const latLines: number[] = [-60, -30, 0, 30, 60];
    latLines.forEach((latDeg) => {
      const latRad = (latDeg * Math.PI) / 180;
      const ringR = sphereRadius * Math.cos(latRad);
      const ringY = sphereRadius * Math.sin(latRad);
      const segments = 64;
      const pts: number[] = [];
      for (let s = 0; s < segments; s++) {
        if (s % 2 === 0) {
          const a1 = (s / segments) * Math.PI * 2;
          const a2 = ((s + 0.8) / segments) * Math.PI * 2;
          pts.push(
            Math.cos(a1) * ringR, ringY, Math.sin(a1) * ringR,
            Math.cos(a2) * ringR, ringY, Math.sin(a2) * ringR
          );
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({
        color: curThemeColors.gridColor,
        transparent: true,
        opacity: latDeg === 0 ? 0.65 : 0.35,
        blending: THREE.AdditiveBlending,
      }));
      globeGridGroup.add(m);
    });

    // Meridians (Longitudes)
    for (let m = 0; m < 6; m++) {
      const rotY = (m * Math.PI) / 6;
      const pts: THREE.Vector3[] = [];
      const numPts = 48;
      for (let j = 0; j <= numPts; j++) {
        const angle = (j / numPts) * Math.PI;
        const y = Math.cos(angle) * sphereRadius;
        const rad = Math.sin(angle) * sphereRadius;
        const x = Math.cos(rotY) * rad;
        const z = Math.sin(rotY) * rad;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: curThemeColors.gridColor,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });
      globeGridGroup.add(new THREE.Line(geom, mat));
    }

    // 4. Intricate Concentric Gyro Rings with Segmented Ticks
    const ringGroup = new THREE.Group();
    hologramGroup.add(ringGroup);

    const createSegmentedRing = (radius: number, segments: number, dashLength: number, color: number, opacity: number) => {
      const linePositions: number[] = [];
      const step = (Math.PI * 2) / segments;

      for (let i = 0; i < segments; i++) {
        const startAngle = i * step;
        const endAngle = startAngle + step * dashLength;

        const x1 = Math.cos(startAngle) * radius;
        const z1 = Math.sin(startAngle) * radius;
        const x2 = Math.cos(endAngle) * radius;
        const z2 = Math.sin(endAngle) * radius;

        linePositions.push(x1, 0, z1, x2, 0, z2);

        if (i % 3 === 0) {
          const tickR = radius + 0.08;
          linePositions.push(x1, 0, z1, Math.cos(startAngle) * tickR, 0, Math.sin(startAngle) * tickR);
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const mat = new THREE.LineSegments(geom, new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
      }));
      return mat;
    };

    const mainGyro = createSegmentedRing(2.15, 72, 0.65, curThemeColors.ringColor, 0.85);
    ringGroup.add(mainGyro);

    const innerRing1 = createSegmentedRing(1.65, 48, 0.7, curThemeColors.accentColor, 0.7);
    ringGroup.add(innerRing1);

    const outerHalo = createSegmentedRing(2.5, 96, 0.45, curThemeColors.gridColor, 0.55);
    ringGroup.add(outerHalo);

    // 5. Orbiting Satellites Around the Futuristic Globe
    const satelliteGroup = new THREE.Group();
    hologramGroup.add(satelliteGroup);

    const satOrbitRadius = 2.4;
    const satCount = 3;
    const satMeshes: THREE.Mesh[] = [];

    for (let s = 0; s < satCount; s++) {
      const satGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const satMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satelliteGroup.add(satMesh);
      satMeshes.push(satMesh);

      const orbitCurve = new THREE.EllipseCurve(0, 0, satOrbitRadius, satOrbitRadius, 0, 2 * Math.PI, false, 0);
      const orbitPoints = orbitCurve.getPoints(64);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y)));
      const orbitLine = new THREE.Line(
        orbitGeo,
        new THREE.LineBasicMaterial({
          color: curThemeColors.accentColor,
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending,
        })
      );
      orbitLine.rotation.x = Math.PI / 3 + (s * Math.PI) / 6;
      orbitLine.rotation.y = (s * Math.PI) / 3;
      satelliteGroup.add(orbitLine);
    }

    // 6. Central Glowing Arc Reactor Core (Iris Vortex)
    const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    hologramGroup.add(coreMesh);

    // Core Corona Shells
    const coronaGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: curThemeColors.core,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    hologramGroup.add(coronaMesh);

    // 7. Reference Image Holographic Matrix Discs (Injected with 3D Additive Blending)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/assets/aistudio/images__1__119ba5b2.jpeg', (refTexture) => {
      refTexture.colorSpace = THREE.SRGBColorSpace;

      const discGeo = new THREE.CircleGeometry(1.92, 48);
      const discMat = new THREE.MeshBasicMaterial({
        map: refTexture,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const disc1 = new THREE.Mesh(discGeo, discMat);
      hologramGroup.add(disc1);

      const disc2 = new THREE.Mesh(discGeo, discMat);
      disc2.rotation.y = Math.PI / 2;
      hologramGroup.add(disc2);

      const disc3 = new THREE.Mesh(discGeo, discMat);
      disc3.rotation.x = Math.PI / 2;
      hologramGroup.add(disc3);
    });

    // 8. Interactive Touch, Mouse & Optical Gesture Controls
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;
    let velocityY = 0;
    let velocityX = 0;
    let lastTapTime = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
      velocityY = 0;
      velocityX = 0;

      // Double-tap wake detection
      const now = Date.now();
      if (now - lastTapTime < 320) {
        onDoubleTap ? onDoubleTap() : onTap?.();
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousPointerX;
      const deltaY = e.clientY - previousPointerY;

      velocityY = deltaX * 0.012;
      velocityX = deltaY * 0.008;

      targetRotationY += velocityY;
      targetRotationX += velocityX;
      targetRotationX = Math.max(-0.7, Math.min(0.7, targetRotationX));

      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    // Multi-touch Pinch to Zoom on Mobile Devices
    let initialPinchDistance = 0;
    let initialPinchCameraZ = targetCameraZ;

    const getTouchDistance = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
        initialPinchCameraZ = targetCameraZ;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistance > 0) {
        const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
        const factor = initialPinchDistance / Math.max(currentDist, 1);
        targetCameraZ = Math.max(4.2, Math.min(12.5, initialPinchCameraZ * factor));
      }
    };

    // Desktop Mouse Wheel Zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCameraZ = Math.max(4.2, Math.min(12.5, targetCameraZ + e.deltaY * 0.005));
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvasDom.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvasDom.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvasDom.addEventListener('wheel', handleWheel, { passive: false });

    // Optical hand gesture subscription (Hands-free Iron Man mode)
    const unsubOpticalGestures = gestureEngine.subscribe((event) => {
      if (event.type === 'optical_swipe_left') {
        targetRotationY -= 1.8;
      } else if (event.type === 'optical_swipe_right') {
        targetRotationY += 1.8;
      } else if (event.type === 'optical_push_zoom_in') {
        targetCameraZ = Math.max(4.5, targetCameraZ - 1.2);
      } else if (event.type === 'optical_pull_zoom_out') {
        targetCameraZ = Math.min(12.0, targetCameraZ + 1.2);
      } else if (event.type === 'optical_wave') {
        onTap?.();
      }
    });

    // 9. Render Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const currentState = stateRef.current;
      const curAudio = audioLevelRef.current;

      // Camera distance smooth zoom damping
      currentCameraZ = THREE.MathUtils.damp(currentCameraZ, targetCameraZ, 6, delta);
      camera.position.z = currentCameraZ;

      // Theme dynamic updates if changed
      const targetTheme = themeRef.current;
      if (curThemeColors !== getThemeColors(targetTheme)) {
        curThemeColors = getThemeColors(targetTheme);
        ambientLight.color.setHex(curThemeColors.ambient);
        coreLight.color.setHex(curThemeColors.core);
        keyLight.color.setHex(curThemeColors.key);
        coronaMat.color.setHex(curThemeColors.core);
      }

      // Inertia momentum decay
      if (!isDragging) {
        velocityY *= 0.94;
        velocityX *= 0.94;
        targetRotationY += velocityY;
        targetRotationX += velocityX;
      }

      // Auto rotation with damping (spinning the futuristic globe)
      targetRotationY += 0.28 * delta;
      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY, 5, delta);
      currentRotationX = THREE.MathUtils.damp(currentRotationX, targetRotationX, 5, delta);

      hologramGroup.rotation.y = currentRotationY;
      hologramGroup.rotation.x = currentRotationX;

      // Independent multi-layer ring rotations
      mainGyro.rotation.y += 0.45 * delta;
      innerRing1.rotation.y -= 0.65 * delta;
      outerHalo.rotation.y -= 0.25 * delta;
      globeGridGroup.rotation.y += 0.15 * delta;

      // Satellite orbital motion
      satMeshes.forEach((mesh, idx) => {
        const satAngle = time * (0.8 + idx * 0.3) + idx * 2.0;
        const inc = Math.PI / 3 + (idx * Math.PI) / 6;
        mesh.position.set(
          Math.cos(satAngle) * satOrbitRadius,
          Math.sin(satAngle) * Math.sin(inc) * satOrbitRadius,
          Math.sin(satAngle) * Math.cos(inc) * satOrbitRadius
        );
      });

      // State-based reactivity and audio pulse
      let pulseAmp = 0;
      let targetCoreScale = 1.0;
      let coreColor = 0xffffff;

      if (currentState === 'listening') {
        pulseAmp = Math.sin(time * 7) * 0.1 + curAudio * 0.45;
        targetCoreScale = 1.25 + curAudio * 0.55;
        coreLight.intensity = 4.8 + curAudio * 3.5;
      } else if (currentState === 'thinking') {
        pulseAmp = Math.sin(time * 12) * 0.14;
        targetCoreScale = 1.15 + Math.sin(time * 10) * 0.2;
        coreColor = 0x67e8f9;
        coreLight.intensity = 4.2;
      } else if (currentState === 'speaking') {
        pulseAmp = Math.sin(time * 8) * 0.1 + curAudio * 0.38;
        targetCoreScale = 1.2 + curAudio * 0.45;
        coreLight.intensity = 4.5 + curAudio * 3.0;
      } else if (currentState === 'executing') {
        pulseAmp = Math.sin(time * 14) * 0.2;
        targetCoreScale = 1.4;
        coreLight.intensity = 6.0;
      } else {
        // Idle
        pulseAmp = Math.sin(time * 2.5) * 0.04;
        targetCoreScale = 1.0 + Math.sin(time * 2) * 0.06;
        coreLight.intensity = 3.2;
      }

      // Smooth core scale & color
      coreMesh.scale.setScalar(THREE.MathUtils.damp(coreMesh.scale.x, targetCoreScale, 6, delta));
      coronaMesh.scale.setScalar(THREE.MathUtils.damp(coronaMesh.scale.x, targetCoreScale * 1.3, 6, delta));
      coreMat.color.setHex(coreColor);

      // Energy wave displacement across the futuristic globe particles
      const posAttr = particleGeometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i += 3) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        _vec3.set(ox, oy, oz);
        const len = _vec3.length();
        const wave = Math.sin(time * 3.5 + oy * 2.5 + ox * 1.8) * (0.04 + pulseAmp);
        _vec3.normalize().multiplyScalar(len + wave);

        posAttr.setXYZ(i, _vec3.x, _vec3.y, _vec3.z);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      unsubOpticalGestures();
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvasDom.removeEventListener('touchstart', handleTouchStart);
      canvasDom.removeEventListener('touchmove', handleTouchMove);
      canvasDom.removeEventListener('wheel', handleWheel);

      cancelAnimationFrame(animationFrameId);

      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      renderer.dispose();

      if (canvasDom.parentElement) {
        canvasDom.parentElement.removeChild(canvasDom);
      }
    };
  }, []);

  // Clamped audio level normalized between 0.0 and 1.0
  const clampedAudio = Math.min(Math.max(audioLevel, 0), 1);

  // Dynamic pulse period (inverse of frequency):
  // At silence (audioLevel=0): period is ~2.2s (relaxed 0.45Hz frequency)
  // At peak speech/audio (audioLevel=1): period drops to ~0.35s (rapid 2.85Hz frequency)
  const pulseDuration = useMemo(() => {
    return Math.max(0.35, 2.2 - clampedAudio * 1.85);
  }, [clampedAudio]);

  // Dynamic peak scale multiplier: expands with audio amplitude
  const dynamicPeakScale = useMemo(() => {
    return 1.0 + 0.03 + clampedAudio * 0.28;
  }, [clampedAudio]);

  // Dynamic theme colors for the Framer Motion holographic energy pulses
  const themeMotionStyles = useMemo(() => {
    switch (theme) {
      case 'stark-gold':
        return {
          glow: 'rgba(245, 158, 11, 0.45)',
          border: 'rgba(251, 191, 36, 0.7)',
          radialGrad: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(217,119,6,0.08) 50%, transparent 75%)',
        };
      case 'arc-reactor':
        return {
          glow: 'rgba(6, 182, 212, 0.5)',
          border: 'rgba(56, 189, 248, 0.75)',
          radialGrad: 'radial-gradient(circle, rgba(6,182,212,0.28) 0%, rgba(2,132,199,0.09) 50%, transparent 75%)',
        };
      case 'obsidian':
        return {
          glow: 'rgba(148, 163, 184, 0.4)',
          border: 'rgba(203, 213, 225, 0.65)',
          radialGrad: 'radial-gradient(circle, rgba(203,213,225,0.22) 0%, rgba(100,116,139,0.06) 50%, transparent 75%)',
        };
      case 'cobalt-glass':
      default:
        return {
          glow: 'rgba(56, 189, 248, 0.45)',
          border: 'rgba(129, 140, 248, 0.7)',
          radialGrad: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(37,99,235,0.08) 50%, transparent 75%)',
        };
    }
  }, [theme]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* 1. Framer Motion Dynamic Audio Pulse Radial Glow Halo */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none select-none z-0"
        style={{
          width: '440px',
          height: '440px',
          background: themeMotionStyles.radialGrad,
        }}
        animate={{
          scale: [1, 1.05 + clampedAudio * 0.4, 1],
          opacity: [0.3, 0.55 + clampedAudio * 0.45, 0.3],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 2. Framer Motion Dynamic Sonic Shockwave Ring (expands size & scales frequency with audioLevel) */}
      <motion.div
        key={`shockwave-${Math.round(clampedAudio * 8)}`}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed pointer-events-none select-none z-0"
        style={{
          width: '380px',
          height: '380px',
          borderColor: themeMotionStyles.border,
          boxShadow: `0 0 ${16 + clampedAudio * 48}px ${themeMotionStyles.glow}`,
        }}
        animate={{
          scale: [0.85, 1.25 + clampedAudio * 0.6],
          opacity: [0.75 + clampedAudio * 0.25, 0],
          rotate: [0, 90],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      {/* 3. Framer Motion Secondary Concentric Harmonic Pulse Ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-t-2 border-b-2 border-l-0 border-r-0 pointer-events-none select-none z-0"
        style={{
          width: '500px',
          height: '500px',
          borderColor: themeMotionStyles.border,
        }}
        animate={{
          scale: [0.96, 1.04 + clampedAudio * 0.22, 0.96],
          rotate: [360, 0],
          opacity: [0.22, 0.5 + clampedAudio * 0.48, 0.22],
        }}
        transition={{
          duration: pulseDuration * 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* 4. Framer Motion Core Hologram Container: dynamically scales pulse frequency and size based on audioLevel */}
      <motion.div
        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto"
        animate={{
          scale: [1, dynamicPeakScale, 1],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          ref={mountRef}
          onClick={onTap}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none z-0"
          style={{ touchAction: 'none' }}
        />
      </motion.div>
    </div>
  );
};
