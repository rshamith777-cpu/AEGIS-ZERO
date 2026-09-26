import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { EcosystemNode, CourierTransit } from '../../types/aegis';
import { DotMatrixText } from '../Common/DotMatrixText';

interface ThreeWorldProps {
  nodes: EcosystemNode[];
  couriers: CourierTransit[];
  selectedNodeId: string | null;
  onSelectNode: (node: EcosystemNode) => void;
  disruptionActive: boolean;
  cameraMode: 'orbit' | 'godseye' | 'tracking';
}

export const ThreeWorld: React.FC<ThreeWorldProps> = ({
  nodes,
  couriers,
  selectedNodeId,
  onSelectNode,
  disruptionActive,
  cameraMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const courierGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const splineMeshRef = useRef<THREE.Group | null>(null);
  const waveRingsRef = useRef<THREE.Mesh[]>([]);
  const animFrameId = useRef<number>(0);

  // Mouse interaction state for camera controls
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitStateRef = useRef<{ azimuth: number; elevation: number; distance: number; target: THREE.Vector3 }>({
    azimuth: 0.75,
    elevation: 0.65,
    distance: 24,
    target: new THREE.Vector3(0, 0, 0)
  });

  // Screen projected coordinates for tactical Nothing OS HUD overlay tags
  const [screenCoords, setScreenCoords] = useState<Array<{
    id: string;
    name: string;
    code: string;
    type: string;
    x: number;
    y: number;
    status: string;
    temp?: number;
    meals: number;
    crowd?: number;
  }>>([]);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene Setup - Nothing OS Light Theme
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xececeb);
    scene.fog = new THREE.FogExp2(0xececeb, 0.016);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
    camera.position.set(16, 15, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting: Cyberpunk / Digital Twin Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main key light (Clean white)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(20, 32, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 80;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    scene.add(keyLight);

    // Neutral rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
    rimLight.position.set(-18, 12, -18);
    scene.add(rimLight);

    // Nothing red accent spotlight from high elevation
    const accentSpot = new THREE.SpotLight(0xd71921, 2.4, 50, Math.PI / 6, 0.4);
    accentSpot.position.set(-8, 22, -6);
    accentSpot.target.position.set(-4.5, 0, -2.5);
    scene.add(accentSpot);
    scene.add(accentSpot.target);

    // 5. Floor Architecture: Light Paper Plane
    const floorPlateGeo = new THREE.PlaneGeometry(80, 80);
    const floorPlateMat = new THREE.MeshStandardMaterial({
      color: 0xececeb,
      roughness: 0.9,
      metalness: 0.1
    });
    const floorPlate = new THREE.Mesh(floorPlateGeo, floorPlateMat);
    floorPlate.rotation.x = -Math.PI / 2;
    floorPlate.position.y = -0.05;
    floorPlate.receiveShadow = true;
    scene.add(floorPlate);

    // Major grid lines (Subtle grey grid)
    const gridMajor = new THREE.GridHelper(60, 30, 0xd0d0d0, 0xdddddd);
    gridMajor.position.y = -0.03;
    scene.add(gridMajor);

    // Sub-matrix dot array (Digital grid points)
    const dotCountX = 40;
    const dotCountZ = 40;
    const dotSpacing = 1.5;
    const dotTotal = dotCountX * dotCountZ;
    const dotGeo = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(dotTotal * 3);
    let dotIdx = 0;
    for (let ix = 0; ix < dotCountX; ix++) {
      for (let iz = 0; iz < dotCountZ; iz++) {
        dotPositions[dotIdx * 3] = (ix - dotCountX / 2) * dotSpacing;
        dotPositions[dotIdx * 3 + 1] = -0.02;
        dotPositions[dotIdx * 3 + 2] = (iz - dotCountZ / 2) * dotSpacing;
        dotIdx++;
      }
    }
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xd71921,
      size: 0.06,
      transparent: true,
      opacity: 0.8
    });
    const dotField = new THREE.Points(dotGeo, dotMat);
    scene.add(dotField);

    // Tactical Radar Range Rings (Concentric circles with degree marks)
    [8, 14, 20].forEach((radius, rIdx) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.03, radius + 0.03, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        color: rIdx === 1 ? 0xd71921 : 0xaaaaaa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -0.025;
      scene.add(ringMesh);
    });

    // 6. Atmospheric Micro-Telemetry Particulates
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 36;
      particlePositions[i + 1] = Math.random() * 8 + 0.2;
      particlePositions[i + 2] = (Math.random() - 0.5) * 36;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x4a6280,
      size: 0.06,
      transparent: true,
      opacity: 0.55
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(dustParticles);

    // 7. Shock Propagation Wave Rings (Radiate from Cold Hub during anomaly)
    const waveRings: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const wGeo = new THREE.RingGeometry(0.15, 0.35, 64);
      const wMat = new THREE.MeshBasicMaterial({
        color: 0xad314d,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const wMesh = new THREE.Mesh(wGeo, wMat);
      wMesh.rotation.x = Math.PI / 2;
      wMesh.position.set(-4.5, 0.02, -2.5);
      scene.add(wMesh);
      waveRings.push(wMesh);
    }
    waveRingsRef.current = waveRings;

    // 8. Interactive Mouse Orbit & Pan
    const domEl = renderer.domElement;
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      orbitStateRef.current.azimuth -= dx * 0.006;
      orbitStateRef.current.elevation = Math.max(0.15, Math.min(1.45, orbitStateRef.current.elevation + dy * 0.006));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      orbitStateRef.current.distance = Math.max(10, Math.min(45, orbitStateRef.current.distance + e.deltaY * 0.02));
    };

    // Raycaster for Node Click Focus
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);

      const interactiveMeshes: THREE.Object3D[] = [];
      nodeGroupsRef.current.forEach((grp) => {
        grp.traverse((child) => {
          if (child instanceof THREE.Mesh) interactiveMeshes.push(child);
        });
      });

      const hits = raycaster.intersectObjects(interactiveMeshes);
      if (hits.length > 0) {
        let rootGrp: THREE.Object3D | null = hits[0].object;
        while (rootGrp && rootGrp.parent && rootGrp.parent !== scene) {
          rootGrp = rootGrp.parent;
        }
        if (rootGrp && rootGrp.userData?.nodeId) {
          const found = nodes.find((n) => n.id === rootGrp?.userData.nodeId);
          if (found) {
            onSelectNode(found);
            // Smoothly pan target to selected node
            orbitStateRef.current.target.set(found.position[0], 0, found.position[2]);
          }
        }
      }
    };

    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('wheel', handleWheel, { passive: true });
    domEl.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Engine
    const clock = new THREE.Clock();
    const tempProj = new THREE.Vector3();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Atmospheric dust upward swirl
      const pArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pArr[i] += delta * 0.18;
        if (pArr[i] > 8) pArr[i] = 0.2;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Animate shock wave rings radiating outward
      waveRingsRef.current.forEach((ring, idx) => {
        if (disruptionActive) {
          const phase = (time * 1.4 + idx * 0.6) % 2.8;
          const scale = phase * 4.8;
          ring.scale.set(scale, scale, scale);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, 0.8 - phase / 2.8);
          ring.visible = true;
        } else {
          ring.visible = false;
        }
      });

      // Rotating rooftop exhaust fans and pulsing beacons
      nodeGroupsRef.current.forEach((grp) => {
        const fan = grp.getObjectByName('turbineFan');
        if (fan) fan.rotation.y += delta * 4.0;

        const beacon = grp.getObjectByName('beacon');
        if (beacon) {
          beacon.rotation.y += delta * 0.8;
          beacon.position.y = 2.1 + Math.sin(time * 2.5) * 0.08;
        }

        const hazardRing = grp.getObjectByName('hazardGlow');
        if (hazardRing && disruptionActive) {
          const s = 1 + Math.sin(time * 6) * 0.15;
          hazardRing.scale.set(s, s, s);
        }
      });

      // Flowing particle pulses along logistics spline tracks
      if (splineMeshRef.current) {
        splineMeshRef.current.children.forEach((child, cIdx) => {
          if (child instanceof THREE.Points) {
            const posAttr = child.geometry.attributes.position;
            const pts = posAttr.array as Float32Array;
            for (let p = 0; p < pts.length; p += 3) {
              pts[p + 1] = 0.08 + Math.sin(time * 3 + p * 0.5 + cIdx) * 0.04;
            }
            posAttr.needsUpdate = true;
          }
        });
      }

      // Dynamic Camera Trajectory
      if (cameraMode === 'godseye') {
        camera.position.lerp(new THREE.Vector3(0, 28, 0.001), 0.05);
        camera.lookAt(0, 0, 0);
      } else if (cameraMode === 'tracking' && couriers.length > 0) {
        const lead = courierGroupsRef.current.get(couriers[0].id);
        if (lead) {
          const chase = new THREE.Vector3().copy(lead.position).add(new THREE.Vector3(4, 5.5, 4));
          camera.position.lerp(chase, 0.06);
          camera.lookAt(lead.position);
        }
      } else {
        // Orbit mode with smooth inertia & user control
        if (!isDraggingRef.current) {
          // Slow ambient drift
          orbitStateRef.current.azimuth += delta * 0.04;
        }

        const { azimuth, elevation, distance, target } = orbitStateRef.current;
        const cx = target.x + distance * Math.cos(elevation) * Math.sin(azimuth);
        const cy = target.y + distance * Math.sin(elevation);
        const cz = target.z + distance * Math.cos(elevation) * Math.cos(azimuth);

        camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.08);
        camera.lookAt(target);
      }

      // Project 3D Node positions to 2D Screen for Nothing OS HUD Overlays
      if (mountRef.current && renderer) {
        const rect = mountRef.current.getBoundingClientRect();
        const coords = nodes.map((n) => {
          tempProj.set(n.position[0], n.position[1] + 2.4, n.position[2]);
          tempProj.project(camera);
          const x = (tempProj.x * 0.5 + 0.5) * rect.width;
          const y = (-(tempProj.y * 0.5) + 0.5) * rect.height;
          return {
            id: n.id,
            name: n.name,
            code: n.code,
            type: n.type,
            x,
            y,
            status: n.status,
            temp: n.temperatureC,
            meals: n.inventoryMeals,
            crowd: n.crowdDensityPct
          };
        });
        setScreenCoords(coords);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('mousedown', handleMouseDown);
      domEl.removeEventListener('wheel', handleWheel);
      domEl.removeEventListener('click', handleClick);
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [disruptionActive]);

  // Rebuild Procedural Architectural Structures for all Ecosystem Nodes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    nodeGroupsRef.current.forEach((grp) => scene.remove(grp));
    nodeGroupsRef.current.clear();

    nodes.forEach((node) => {
      const group = new THREE.Group();
      group.position.set(...node.position);
      group.userData = { nodeId: node.id };

      const isCritical = node.status === 'critical';
      const isWarning = node.status === 'warning';
      const isSelected = selectedNodeId === node.id;

      // Color coding: Nothing Red for Anomaly, Signal Cyan for Cryo, Emerald for Prep, Slate for Pavilions
      const accentHex = isCritical
        ? 0xff2a4b
        : isWarning
        ? 0xf59e0b
        : node.type === 'depot'
        ? 0x00f0ff
        : node.type === 'kitchen'
        ? 0x00e599
        : 0x8a99ad;

      // --- 1. Dark Tech Foundation Plinth ---
      const plinthGeo = new THREE.BoxGeometry(2.4, 0.22, 2.4);
      const plinthMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9
      });
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.y = 0.11;
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      group.add(plinth);

      // Plinth Perimeter Hairline Wireframe (Nothing OS precision)
      const plinthEdges = new THREE.EdgesGeometry(plinthGeo);
      const plinthLine = new THREE.LineSegments(
        plinthEdges,
        new THREE.LineBasicMaterial({ color: isCritical ? 0xd71921 : 0xc8c8c2, linewidth: 1 })
      );
      plinthLine.position.y = 0.11;
      group.add(plinthLine);

      // --- 2. Procedural Architectural Building Typologies ---
      if (node.type === 'depot') {
        // [CENTRAL COLD-CHAIN CRYOGENIC DEPOT]
        // Central Core (Dark glassy tech)
        const coreGeo = new THREE.BoxGeometry(1.6, 1.3, 1.4);
        const coreMat = new THREE.MeshStandardMaterial({
          color: isCritical ? 0x991b1b : 0x0f172a,
          metalness: 0.9,
          roughness: 0.1,
          transparent: true,
          opacity: 0.85
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 0.87;
        core.castShadow = true;
        group.add(core);

        // Core Edge Highlights
        const coreEdges = new THREE.EdgesGeometry(coreGeo);
        const coreLine = new THREE.LineSegments(
          coreEdges,
          new THREE.LineBasicMaterial({ color: isCritical ? 0xd71921 : 0x0284c7, transparent: true, opacity: 0.8 })
        );
        coreLine.position.y = 0.87;
        group.add(coreLine);

        // 4 Pressurized Cryo-Coolant Canisters (Anodized Aluminum)
        const canisterPositions = [
          [-0.6, 0.9, 0.5],
          [0.6, 0.9, 0.5],
          [-0.6, 0.9, -0.5],
          [0.6, 0.9, -0.5]
        ];
        canisterPositions.forEach(([cx, cy, cz]) => {
          const canGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.4, 20);
          const canMat = new THREE.MeshStandardMaterial({
            color: isCritical ? 0xef4444 : 0x38bdf8,
            metalness: 0.8,
            roughness: 0.2,
            emissive: isCritical ? 0x7f1d1d : 0x0284c7,
            emissiveIntensity: 0.5
          });
          const canister = new THREE.Mesh(canGeo, canMat);
          canister.position.set(cx, cy, cz);
          canister.castShadow = true;
          group.add(canister);

          // Glowing Cap
          const capGeo = new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          const capMat = new THREE.MeshBasicMaterial({ color: isCritical ? 0xd71921 : 0x0284c7 });
          const cap = new THREE.Mesh(capGeo, capMat);
          cap.position.set(cx, cy + 0.7, cz);
          group.add(cap);
        });

        // Rooftop Heat Exchange Turbine with Animated Fan Blades
        const ventBaseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.2, 24);
        const ventBaseMat = new THREE.MeshStandardMaterial({ color: 0xe0e0dc, metalness: 0.5 });
        const ventBase = new THREE.Mesh(ventBaseGeo, ventBaseMat);
        ventBase.position.set(0, 1.62, 0);
        group.add(ventBase);

        // Fan Blades
        const fanGroup = new THREE.Group();
        fanGroup.name = 'turbineFan';
        fanGroup.position.set(0, 1.74, 0);
        for (let b = 0; b < 4; b++) {
          const bladeGeo = new THREE.BoxGeometry(0.08, 0.02, 0.5);
          const bladeMat = new THREE.MeshStandardMaterial({ color: isCritical ? 0xd71921 : 0x64748b, metalness: 0.7 });
          const blade = new THREE.Mesh(bladeGeo, bladeMat);
          blade.rotation.y = (b * Math.PI) / 2;
          fanGroup.add(blade);
        }
        group.add(fanGroup);

      } else if (node.type === 'kitchen') {
        // [AUTOMATED PRODUCTION KITCHEN / HIGH-SPEED FAB]
        // Stepped Cantilevered Factory Floor
        const btmGeo = new THREE.BoxGeometry(1.8, 0.7, 1.3);
        const btmMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f2, metalness: 0.1, roughness: 0.25 });
        const btm = new THREE.Mesh(btmGeo, btmMat);
        btm.position.y = 0.57;
        btm.castShadow = true;
        group.add(btm);

        // Upper automated gantry tier
        const topGeo = new THREE.BoxGeometry(1.2, 0.55, 1.1);
        const topMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.15, roughness: 0.2 });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.set(-0.25, 1.15, 0);
        top.castShadow = true;
        group.add(top);

        // Glowing Conveyor Loading Dock Tunnel
        const dockGeo = new THREE.BoxGeometry(0.5, 0.3, 0.4);
        const dockMat = new THREE.MeshBasicMaterial({ color: 0x059669 });
        const dock = new THREE.Mesh(dockGeo, dockMat);
        dock.position.set(0.65, 0.35, 0.4);
        group.add(dock);

        // High-bay illuminated windows
        const winGeo = new THREE.PlaneGeometry(0.9, 0.15);
        const winMat = new THREE.MeshBasicMaterial({ color: 0x059669, transparent: true, opacity: 0.85 });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(-0.25, 1.2, 0.56);
        group.add(win);

      } else {
        // [FACETED CAMPUS QUAD / RESILIENCE SHELTER]
        const pavGeo = new THREE.CylinderGeometry(0.9, 1.2, 1.1, 6);
        const pavMat = new THREE.MeshStandardMaterial({
          color: node.type === 'ngo' ? 0xffffff : 0xdddddd,
          metalness: 0.2,
          roughness: 0.8,
          transparent: true,
          opacity: 0.8
        });
        const pav = new THREE.Mesh(pavGeo, pavMat);
        pav.position.y = 0.77;
        pav.castShadow = true;
        group.add(pav);

        // Pavilion Wireframe Architecture
        const pavEdges = new THREE.EdgesGeometry(pavGeo);
        const pavLine = new THREE.LineSegments(
          pavEdges,
          new THREE.LineBasicMaterial({ color: node.type === 'ngo' ? 0x999999 : 0xbbbbbb, linewidth: 1 })
        );
        pavLine.position.y = 0.77;
        group.add(pavLine);

        // Central communications mast
        const mastGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.8, 8);
        const mastMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.2 });
        const mast = new THREE.Mesh(mastGeo, mastMat);
        mast.position.y = 1.7;
        group.add(mast);
      }

      // --- 3. Nothing OS Floating Diamond Beacon ---
      const beaconGeo = new THREE.OctahedronGeometry(0.18, 0);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: accentHex,
        wireframe: true
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.name = 'beacon';
      beacon.position.y = 2.1;
      group.add(beacon);

      // --- 4. Anomaly Hazard Floor Aura ---
      if (isCritical) {
        const hazardGeo = new THREE.RingGeometry(1.4, 1.7, 48);
        const hazardMat = new THREE.MeshBasicMaterial({
          color: 0xd71921,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const hazardMesh = new THREE.Mesh(hazardGeo, hazardMat);
        hazardMesh.name = 'hazardGlow';
        hazardMesh.rotation.x = Math.PI / 2;
        hazardMesh.position.y = 0.03;
        group.add(hazardMesh);

        // Warm ominous glow into floor
        const hazardLight = new THREE.PointLight(0xd71921, 2.8, 8);
        hazardLight.position.set(0, 1.2, 0);
        group.add(hazardLight);
      }

      // --- 5. Selection Focus Ring ---
      if (isSelected) {
        const selGeo = new THREE.RingGeometry(1.8, 1.95, 48);
        const selMat = new THREE.MeshBasicMaterial({
          color: 0x111111,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95
        });
        const selMesh = new THREE.Mesh(selGeo, selMat);
        selMesh.rotation.x = Math.PI / 2;
        selMesh.position.y = 0.04;
        group.add(selMesh);
      }

      scene.add(group);
      nodeGroupsRef.current.set(node.id, group);
    });

    // --- 6. Inter-Node Logistics Spline Ribbons & Flowing Light Streams ---
    if (splineMeshRef.current) {
      scene.remove(splineMeshRef.current);
    }

    const splineGroup = new THREE.Group();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nA = nodes[i];
        const nB = nodes[j];
        const dist = Math.hypot(nA.position[0] - nB.position[0], nA.position[2] - nB.position[2]);

        if (dist < 10) {
          // Curved 3D spline corridor
          const midX = (nA.position[0] + nB.position[0]) / 2;
          const midZ = (nA.position[2] + nB.position[2]) / 2;
          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(nA.position[0], 0.05, nA.position[2]),
            new THREE.Vector3(midX, 0.35, midZ),
            new THREE.Vector3(nB.position[0], 0.05, nB.position[2])
          );

          // Solid hairline spline
          const points = curve.getPoints(32);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({
            color: disruptionActive ? 0xd71921 : 0x888888,
            transparent: true,
            opacity: 0.8
          });
          const splineLine = new THREE.Line(lineGeo, lineMat);
          splineGroup.add(splineLine);

          // Flowing particle stream along spline
          const flowPointsGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(12));
          const flowPointsMat = new THREE.PointsMaterial({
            color: disruptionActive ? 0xd71921 : 0x111111,
            size: 0.1,
            transparent: true,
            opacity: 0.75
          });
          const flowPoints = new THREE.Points(flowPointsGeo, flowPointsMat);
          splineGroup.add(flowPoints);
        }
      }
    }
    scene.add(splineGroup);
    splineMeshRef.current = splineGroup;
  }, [nodes, selectedNodeId, disruptionActive]);

  // Rebuild Autonomous Courier Transport Pods
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    courierGroupsRef.current.forEach((grp) => scene.remove(grp));
    courierGroupsRef.current.clear();

    couriers.forEach((courier) => {
      const fromNode = nodes.find((n) => n.id === courier.fromNodeId);
      const toNode = nodes.find((n) => n.id === courier.toNodeId);
      if (!fromNode || !toNode) return;

      const group = new THREE.Group();
      group.userData = { courierId: courier.id };

      // Interpolate position along straight or curved line
      const curX = THREE.MathUtils.lerp(fromNode.position[0], toNode.position[0], courier.progress);
      const curZ = THREE.MathUtils.lerp(fromNode.position[2], toNode.position[2], courier.progress);
      const curY = 0.35 + Math.sin(courier.progress * Math.PI) * 0.25;
      group.position.set(curX, curY, curZ);

      // Rotate towards destination
      const angle = Math.atan2(toNode.position[0] - fromNode.position[0], toNode.position[2] - fromNode.position[2]);
      group.rotation.y = angle;

      const isRerouted = courier.status === 'rerouted';
      const courierColor = isRerouted ? 0xd71921 : 0x111111;

      // Aerodynamic High-Tech Hover Drone Pod
      // Fuselage Body
      const bodyGeo = new THREE.BoxGeometry(0.38, 0.16, 0.72);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.9
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      group.add(body);

      // Fuselage Edge Highlight
      const bodyEdges = new THREE.EdgesGeometry(bodyGeo);
      const bodyLine = new THREE.LineSegments(
        bodyEdges,
        new THREE.LineBasicMaterial({ color: courierColor })
      );
      group.add(bodyLine);

      // Cryo-Cargo Pod Container (Internal glow)
      const cargoGeo = new THREE.BoxGeometry(0.24, 0.1, 0.38);
      const cargoMat = new THREE.MeshBasicMaterial({ color: courierColor });
      const cargo = new THREE.Mesh(cargoGeo, cargoMat);
      cargo.position.set(0, 0.05, -0.06);
      group.add(cargo);

      // Dual Rear Thruster Exhaust Beams
      [-0.12, 0.12].forEach((tx) => {
        const thrusterGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.18, 12);
        const thrusterMat = new THREE.MeshBasicMaterial({ color: courierColor });
        const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
        thruster.rotation.x = Math.PI / 2;
        thruster.position.set(tx, 0, -0.42);
        group.add(thruster);
      });

      // Forward Sensor Ray Spotlight
      const sensorLight = new THREE.PointLight(courierColor, 1.2, 3);
      sensorLight.position.set(0, 0, 0.45);
      group.add(sensorLight);

      scene.add(group);
      courierGroupsRef.current.set(courier.id, group);
    });
  }, [couriers, nodes]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-space)' }}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Floating Tactical Nothing OS Holographic Node Overlays */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {screenCoords.map((coord) => {
          if (coord.x < 30 || coord.x > window.innerWidth || coord.y < 30 || coord.y > window.innerHeight) {
            return null;
          }
          const isCritical = coord.status === 'critical';
          const isWarning = coord.status === 'warning';
          const isSelected = selectedNodeId === coord.id;

          return (
            <div
              key={coord.id}
              style={{
                position: 'absolute',
                left: `${coord.x}px`,
                top: `${coord.y}px`,
                transform: 'translate(-50%, -100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                pointerEvents: 'auto',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onClick={() => {
                const node = nodes.find((n) => n.id === coord.id);
                if (node) onSelectNode(node);
              }}
            >
              {/* Nothing OS Hairline Technical Card (Paper-White) */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${
                    isCritical
                      ? 'var(--nothing-red)'
                      : isWarning
                      ? 'var(--state-amber)'
                      : isSelected
                      ? '#111111'
                      : 'var(--border-muted)'
                  }`,
                  padding: '5px 12px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: isCritical ? '0 0 16px rgba(215, 25, 33, 0.25)' : '0 4px 14px rgba(0,0,0,0.08)'
                }}
              >
                {/* Status Dot */}
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: isCritical
                      ? 'var(--nothing-red-bright)'
                      : isWarning
                      ? 'var(--state-amber)'
                      : coord.type === 'depot'
                      ? 'var(--signal-cyan)'
                      : coord.type === 'kitchen'
                      ? 'var(--state-green)'
                      : '#94a3b8',
                    boxShadow: isCritical ? '0 0 6px rgba(255, 42, 75, 0.9)' : undefined
                  }}
                />

                {/* Node Code */}
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: 'var(--signal-white)'
                  }}
                >
                  {coord.code}
                </span>

                {/* Telemetry Metric (Nothing OS Dot-Matrix Text) */}
                {coord.temp !== undefined ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '8px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-muted)' }}>T:</span>
                    <DotMatrixText
                      text={`${coord.temp > 0 ? `+${coord.temp}` : coord.temp}°C`}
                      size={11}
                      color={isCritical ? 'var(--nothing-red-bright)' : 'var(--signal-cyan)'}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '8px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-muted)' }}>M:</span>
                    <DotMatrixText
                      text={coord.meals}
                      size={11}
                      color="var(--signal-white)"
                    />
                  </div>
                )}
              </div>

              {/* Hairline vertical leader down to node */}
              <div
                style={{
                  width: '1px',
                  height: '12px',
                  backgroundColor: isCritical ? 'var(--nothing-red-bright)' : 'var(--border-strong)'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Top Left Watermark: Nothing OS Technical Badge */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="nothing-dot-red" />
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-data)', letterSpacing: '0.14em', color: 'var(--signal-text-muted)', textTransform: 'uppercase' }}>
            REGIONAL TWIN TELEMETRY
          </span>
          <span
            style={{
              fontSize: '8.5px',
              fontFamily: 'var(--font-data)',
              padding: '1px 6px',
              borderRadius: '999px',
              border: '1px solid var(--border-muted)',
              color: 'var(--signal-cyan)',
              background: 'rgba(8, 11, 17, 0.8)'
            }}
          >
            ACTIVE (60 FPS)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--signal-white)' }}>
            PHYSICAL DIGITAL TWIN
          </span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-dim)' }}>•</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-muted)' }}>
            PROCEDURAL CYBER-PHYSICAL MESH
          </span>
        </div>
      </div>

      {/* Bottom Left Camera Instructions Hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '20px',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '9px',
          fontFamily: 'var(--font-data)',
          color: 'var(--signal-text-dim)'
        }}
      >
        <span>DRAG TO ORBIT</span>
        <span>•</span>
        <span>SCROLL TO ZOOM</span>
        <span>•</span>
        <span>CLICK NODE TO FOCUS</span>
      </div>
    </div>
  );
};
