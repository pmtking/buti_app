// components/ThreeDViewer.web.tsx
// location: ./buti_app/components/ThreeDViewer.web.tsx
//
// WEB-ONLY implementation of ThreeDViewer.
// Expo/Metro picks this file over `ThreeDViewer.tsx` when bundling for web.
//
// Why a separate file? expo-gl's web GLView throws "Browser does not support
// WebGL" inside its own canvas bootstrap. Browsers themselves support WebGL
// fine — so here we skip expo-gl entirely and hand three.js a REAL <canvas>
// element. Same visual result as the native version:
//   - Drag to orbit, scroll/pinch to zoom
//   - Auto-rotate when idle
//   - Textured face mesh from backend data
//   - Loading overlay / empty states / wireframe option

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as THREE from 'three';

/* =========================================================
   TYPES (keep in sync with native props)
========================================================= */

export type ThreeDViewerProps = {
  vertices?: number[] | number[][];
  faces?: number[] | number[][];
  /** Optional explicit UVs (u,v per vertex, 0..1). When provided the mesh
   *  is rendered as an AR-style overlay: camera locked front-facing and
   *  each vertex samples its own pixel from the texture. */
  uvs?: number[] | number[][];
  textureBase64?: string; // raw base64 JPEG or data-uri/file/http URI
  isLoading?: boolean;
  autoRotate?: boolean;
  showWireframe?: boolean;
  flipTextureY?: boolean;
  backgroundColor?: string;
  style?: object;
};

/* =========================================================
   HELPERS
========================================================= */

function flattenPositions(input?: number[] | number[][]): number[] {
  if (!input || input.length === 0) return [];
  if (typeof input[0] === 'number') return input as number[];
  const out: number[] = [];
  for (const row of input as number[][]) out.push(row[0], row[1], row[2]);
  return out;
}

function buildIndices(faces?: number[] | number[][]): Uint16Array {
  if (!faces || faces.length === 0) return new Uint16Array();
  if (typeof faces[0] === 'number') return new Uint16Array(faces as number[]);
  const out: number[] = [];
  for (const f of faces as number[][]) {
    for (let i = 1; i < f.length - 1; i++) out.push(f[0], f[i], f[i + 1]);
  }
  return new Uint16Array(out);
}

/** Flatten `[[u,v],...]` or `[u,v,u,v,...]` into a flat number[]. */
function flattenPairs(input?: number[] | number[][]): number[] {
  if (!input || input.length === 0) return [];
  if (typeof input[0] === 'number') return input as number[];
  const out: number[] = [];
  for (const row of input as number[][]) out.push(row[0], row[1]);
  return out;
}

function normalizeTextureUri(src: string): string {
  if (/^data:/i.test(src) || /^(file|content|http|https|asset):/i.test(src) || src.startsWith('/')) {
    return src;
  }
  return `data:image/jpeg;base64,${src}`;
}

/* =========================================================
   MAIN COMPONENT (WEB)
========================================================= */

export default function ThreeDViewer({
  vertices,
  faces,
  uvs,
  textureBase64,
  isLoading = false,
  autoRotate = true,
  showWireframe = false,
  flipTextureY = true,
  backgroundColor = '#101013',
  style,
}: ThreeDViewerProps) {
  const hostRef = useRef<any>(null);       // div hosting the <canvas>
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number | null>(null);

  const spinRef = useRef(0);
  const orbit = useRef({ yaw: 0, pitch: -0.12, distance: 2.6 });
  const velocity = useRef({ yaw: 0, pitch: 0 });
  /* true while rendering the AR-filter view (mesh glued onto the photo).
     Kept in a ref so the render loop can read it without re-subscribing. */
  const arModeRef = useRef(false);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [ctxReady, setCtxReady] = useState(false);
  const hasGeometry = !!(vertices && vertices.length && faces && faces.length);

  /* -------------------------------------------------------
     Measure host so the canvas matches its box exactly
  ------------------------------------------------------- */

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const measure = () => {
      const w = el?.clientWidth ?? 0;
      const h = el?.clientHeight ?? 0;
      if (w > 0 && h > 0) setSize((prev) =>
        prev.w === w && prev.h === h ? prev : { w, h }
      );
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* -------------------------------------------------------
     Scene bootstrap (runs once canvas size is known)
  ------------------------------------------------------- */

  useEffect(() => {
    const host = hostRef.current;
    if (!host || size.w === 0 || size.h === 0) return;
    if (rendererRef.current) return;

    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      touchAction: 'none',
      display: 'block',
    });
    host.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size.w, size.h, false);
    renderer.setClearColor(new THREE.Color(backgroundColor), 1);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(new THREE.Color(backgroundColor), 5, 11);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, size.w / size.h, 0.05, 100);
    camera.position.set(0, 0, orbit.current.distance);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const ambient = new THREE.AmbientLight(0xffffff, 1.15);
    const keyLight = new THREE.DirectionalLight(0xfff0f4, 1.35);
    keyLight.position.set(-2, 2.4, 3.2);
    const fillLight = new THREE.DirectionalLight(0xe8d7ff, 0.55);
    fillLight.position.set(2.6, -0.8, 2.2);
    const rimLight = new THREE.DirectionalLight(0xffc9e0, 0.75);
    rimLight.position.set(0, 1.4, -3);
    scene.add(ambient, keyLight, fillLight, rimLight);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    /* ---- pointer controls (orbit + wheel zoom) ---- */
    let dragging = false;
    let lastX = 0, lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velocity.current.yaw = 0;
      velocity.current.pitch = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      orbit.current.yaw += dx * 0.01;
      orbit.current.pitch -= dy * 0.008;
      velocity.current.yaw = dx * 0.0009;
      velocity.current.pitch = -dy * 0.0006;
    };
    const onPointerUp = () => { dragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = orbit.current.distance * (1 + Math.sign(e.deltaY) * 0.08);
      orbit.current.distance = Math.max(1.5, Math.min(6, next));
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    setCtxReady(true);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const r = rendererRef.current;
      const s = sceneRef.current;
      const c = cameraRef.current;
      const g = groupRef.current;
      if (!r || !s || !c || !g) return;

      if (arModeRef.current) {
        /* ---- FILTER VIEW: locked, full photo framed, NO fisheye ----
           Long lens (small fov) = flat, flattering perspective like the
           original photo. Zoom out until BOTH axes of the [-1,1] plane
           are inside the frustum. */
        c.fov = 22;
        c.updateProjectionMatrix();
        const vFov = (c.fov * Math.PI) / 180;
        const halfH = Math.tan(vFov / 2);
        const dForHeight = 1 / halfH;
        const dForWidth = 1 / (halfH * c.aspect);
        const dist = Math.max(dForHeight, dForWidth) * 1.02;
        c.position.set(0, 0, dist);
        c.up.set(0, 1, 0);
        c.lookAt(0, 0, 0);
      } else {
        /* ---- FREE-ORBIT VIEW ---- */
        orbit.current.yaw += velocity.current.yaw;
        orbit.current.pitch += velocity.current.pitch;
        velocity.current.yaw *= 0.92;
        velocity.current.pitch *= 0.92;
        orbit.current.pitch = Math.max(-1.2, Math.min(1.2, orbit.current.pitch));

        g.rotation.y = spinRef.current;
        g.rotation.x = orbit.current.pitch * 0.55;

        const d = orbit.current.distance;
        c.position.set(
          Math.sin(orbit.current.yaw) * Math.cos(orbit.current.pitch) * d,
          Math.sin(orbit.current.pitch) * d,
          Math.cos(orbit.current.yaw) * Math.cos(orbit.current.pitch) * d
        );
        c.lookAt(0, 0, 0);
      }

      r.render(s, c);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      groupRef.current = null;
      ctxReadyRef.current = false;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h]);

  // mirror of ctxReady so cleanup can reset it safely
  const ctxReadyRef = useRef(false);

  /* -------------------------------------------------------
     Auto-rotate driver
  ------------------------------------------------------- */

  useEffect(() => {
    if (!autoRotate) return;
    let id: number;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      spinRef.current += dt * 0.4; // rad/s
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [autoRotate]);

  /* -------------------------------------------------------
     Build / update mesh when data changes
  ------------------------------------------------------- */

  const geometryKey = useMemo(
    () =>
      `${vertices?.length ?? 0}_${faces?.length ?? 0}_${
        textureBase64 ? textureBase64.length : 0
      }_${showWireframe ? 1 : 0}_${uvs ? 'u' : 'n'}`,
    [vertices, faces, textureBase64, showWireframe, uvs]
  );

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    let cancelled = false;

    const buildMesh = async () => {
      while (group.children.length) {
        const child = group.children.pop() as any;
        child.traverse?.((n: any) => {
          n.geometry?.dispose?.();
          n.material?.map?.dispose?.();
          n.material?.dispose?.();
        });
      }

      const positionsFlat = flattenPositions(vertices);
      const indices = buildIndices(faces);

      if (!positionsFlat.length || !indices.length) {
        addPlaceholderMesh(group);
        return;
      }

      /* ---- AR-filter mode vs free-orbit mode ----
       * Backend vertices already live in [-1,1] normalized image space and
       * backend UVs map 1:1 onto the photo texture. In AR mode we do NOT
       * renormalize positions; instead the camera is fitted to the mesh and
       * locked front-on so the 3D layer sits exactly on the photo face. */
      const arMode = !!uvs;
      arModeRef.current = arMode;
      const scaled = new Float32Array(positionsFlat.length);
      let uvArray: Float32Array;

      if (arMode && uvs) {
        scaled.set(positionsFlat);
        uvArray = new Float32Array(flattenPairs(uvs));
      } else {
        /* free-orbit mode: normalize to unit box + planar UVs */
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (let i = 0; i < positionsFlat.length; i += 3) {
          minX = Math.min(minX, positionsFlat[i]);
          maxX = Math.max(maxX, positionsFlat[i]);
          minY = Math.min(minY, positionsFlat[i + 1]);
          maxY = Math.max(maxY, positionsFlat[i + 1]);
          minZ = Math.min(minZ, positionsFlat[i + 2]);
          maxZ = Math.max(maxZ, positionsFlat[i + 2]);
        }
        const sizeX = maxX - minX || 1;
        const sizeY = maxY - minY || 1;
        const maxSize = Math.max(sizeX, sizeY, maxZ - minZ || 1);
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const cz = (minZ + maxZ) / 2;

        const count = positionsFlat.length / 3;
        uvArray = new Float32Array(count * 2);

        for (let i = 0, v = 0; i < positionsFlat.length; i += 3, v++) {
          scaled[i] = (positionsFlat[i] - cx) / maxSize;
          scaled[i + 1] = (positionsFlat[i + 1] - cy) / maxSize;
          scaled[i + 2] = (positionsFlat[i + 2] - cz) / maxSize;

          let u = (positionsFlat[i] - minX) / sizeX;
          let t = (positionsFlat[i + 1] - minY) / sizeY;
          uvArray[v * 2] = u;
          uvArray[v * 2 + 1] = flipTextureY ? 1 - t : t;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(scaled, 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      geometry.computeVertexNormals();

      let map: THREE.Texture | null = null;
      if (textureBase64) {
        map = await new Promise<THREE.Texture | null>((resolve) => {
          const loader = new THREE.TextureLoader();
          loader.load(
            normalizeTextureUri(textureBase64),
            (tex) => resolve(tex),
            undefined,
            () => resolve(null)
          );
        });
      }
      if (cancelled) {
        map?.dispose();
        geometry.dispose();
        return;
      }
      if (map) {
        map.colorSpace = THREE.SRGBColorSpace;
        map.magFilter = THREE.LinearFilter;
        map.minFilter = THREE.LinearFilter;
      }

      /* AR mode = photorealistic filter overlay:
         MeshBasicMaterial is UNLIT so the photo's own colors pass through
         untouched — the 3D effect comes purely from vertex displacement.
         OPAQUE (not transparent) so mesh pixels cleanly replace backdrop
         pixels instead of double-blending at the seams. */
      const material = arMode
        ? new THREE.MeshBasicMaterial({
            map: map ?? undefined,
            color: map ? 0xffffff : 0xd9a8c4,
            side: THREE.DoubleSide,
          })
        : new THREE.MeshStandardMaterial({
            map: map ?? undefined,
            color: map ? 0xffffff : 0xd9a8c4,
            roughness: 0.62,
            metalness: 0.08,
            side: THREE.DoubleSide,
          });

      const mesh = new THREE.Mesh(geometry, material);

      if (arMode) {
        /* Container applies the photo's TRUE aspect ratio so the face is
           never stretched. Both backdrop and mesh live inside it, staying
           perfectly aligned. Portrait 4:5 -> x squeezed to 0.8. */
        const imgW = (map as any)?.image?.width ?? 1;
        const imgH = (map as any)?.image?.height ?? 1;
        const aspect = imgW / imgH || 1;
        const arContainer = new THREE.Group();
        arContainer.scale.set(Math.min(1, aspect), Math.min(1, 1 / aspect), 1);

        /* FIX occlusion: backdrop must sit BEHIND the deepest mesh vertex,
           otherwise face parts with z < backdrop get hidden (chopped face). */
        let minZ = Infinity;
        for (let i = 2; i < positionsFlat.length; i += 3) {
          if (positionsFlat[i] < minZ) minZ = positionsFlat[i];
        }
        const backdrop = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2),
          new THREE.MeshBasicMaterial({
            map: map ?? undefined,
            color: map ? 0xffffff : 0x101013,
          })
        );
        backdrop.position.z = Math.min(-0.35, minZ - 0.04);
        backdrop.renderOrder = -1;

        arContainer.add(backdrop);
        arContainer.add(mesh);
        group.add(arContainer);
      } else {
        group.add(mesh);
      }

      if (showWireframe) {
        const wire = new THREE.LineSegments(
          new THREE.WireframeGeometry(geometry),
          new THREE.LineBasicMaterial({ color: 0xe7bcd4, transparent: true, opacity: 0.25 })
        );
        wire.scale.multiplyScalar(1.002);
        group.add(wire);
      }
    };

    buildMesh().catch((e) => console.warn('[ThreeDViewer web] mesh build failed:', e));

    return () => {
      cancelled = true;
    };
  }, [geometryKey, ctxReady, flipTextureY]);

  function addPlaceholderMesh(group: THREE.Group) {
    const geo = new THREE.SphereGeometry(0.85, 48, 48);
    geo.scale(0.78, 1.05, 0.9);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2a2129,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.65,
    });
    group.add(new THREE.Mesh(geo, mat));
  }

  /* -------------------------------------------------------
     UI — RNW renders this View as a real <div>, so we can
     attach the canvas imperatively via ref.
  ------------------------------------------------------- */

  const attachHost = useCallback((node: any) => {
    // react-native-web gives us the underlying HTMLElement
    hostRef.current = node;
    ctxReadyRef.current = ctxReady;
  }, []);

  return (
    <View ref={attachHost} style={[styles.container, style]}>
      {/* corner accents */}
      <View style={styles.cornerTL} pointerEvents="none" />
      <View style={styles.cornerTR} pointerEvents="none" />
      <View style={styles.cornerBL} pointerEvents="none" />
      <View style={styles.cornerBR} pointerEvents="none" />

      {/* hint chip */}
      {hasGeometry && !isLoading && (
        <View style={styles.hintChip} pointerEvents="none">
          <Text style={styles.hintText}>بچرخان ✦</Text>
        </View>
      )}

      {/* loading overlay */}
      {(isLoading || !hasGeometry) && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="small" color="#D99AB9" />
          <Text style={styles.overlayText}>
            {isLoading ? 'در حال ساخت مدل سه‌بعدی...' : 'منتظر داده...'}
          </Text>
        </View>
      )}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101013',
    borderRadius: 24,
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute', top: 10, left: 10, width: 18, height: 18,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderColor: 'rgba(217,154,185,0.55)', borderTopLeftRadius: 6,
  },
  cornerTR: {
    position: 'absolute', top: 10, right: 10, width: 18, height: 18,
    borderTopWidth: 2, borderRightWidth: 2,
    borderColor: 'rgba(217,154,185,0.55)', borderTopRightRadius: 6,
  },
  cornerBL: {
    position: 'absolute', bottom: 10, left: 10, width: 18, height: 18,
    borderBottomWidth: 2, borderLeftWidth: 2,
    borderColor: 'rgba(217,154,185,0.55)', borderBottomLeftRadius: 6,
  },
  cornerBR: {
    position: 'absolute', bottom: 10, right: 10, width: 18, height: 18,
    borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: 'rgba(217,154,185,0.55)', borderBottomRightRadius: 6,
  },
  hintChip: {
    position: 'absolute', bottom: 14, alignSelf: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(10,10,12,0.62)',
    borderWidth: 1, borderColor: 'rgba(217,154,185,0.25)',
  },
  hintText: { color: '#E3B1C9', fontSize: 9, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,12,0.45)',
  },
  overlayText: { color: '#B9AAB3', fontSize: 10, marginTop: 10 },
});
