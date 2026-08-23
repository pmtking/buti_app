// components/ThreeDViewer.tsx
// location: ./buti_app/components/ThreeDViewer.tsx
//
// Self-contained 3D mesh viewer for Expo built on expo-gl + three.js.
// Renders a face mesh (vertices + faces + JPEG base64 texture) with:
//   - Drag to orbit + pinch to zoom (PanResponder)
//   - Auto-rotate when idle
//   - Auto-fit camera framing based on mesh bounds
//   - Loading overlay + graceful empty state
//   - Optional wireframe overlay
//
// Dependencies: three, expo-gl, jpeg-js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  PanResponder,
  ActivityIndicator,
  Easing,
  Animated as RNAnimated,
  Platform,
} from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import decode from 'jpeg-js';

const IS_WEB = Platform.OS === 'web';

/* =========================================================
   TYPES
========================================================= */

export type ThreeDViewerProps = {
  /** Vertices as flat [x,y,z,...] or nested [[x,y,z],...] */
  vertices?: number[] | number[][];
  /** Triangle indices as flat [a,b,c,...] or nested [[a,b,c],...] */
  faces?: number[] | number[][];
  /** Explicit per-vertex UVs. When provided, AR-filter mode is used:
   *  camera locked front-on, mesh glued onto the photo texture. */
  uvs?: number[] | number[][];
  /** JPEG texture as raw base64 (no data-uri prefix) */
  textureBase64?: string;
  /** Show loading overlay */
  isLoading?: boolean;
  /** Rotate automatically when idle */
  autoRotate?: boolean;
  /** Wireframe overlay on top of the mesh */
  showWireframe?: boolean;
  /** Flip texture vertically if the projection looks upside-down */
  flipTextureY?: boolean;
  /** Scene background color */
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
  for (const row of input as number[][]) {
    out.push(row[0], row[1], row[2]);
  }
  return out;
}

function buildIndices(faces?: number[] | number[][]): Uint16Array {
  if (!faces || faces.length === 0) return new Uint16Array();
  if (typeof faces[0] === 'number') {
    return new Uint16Array(faces as number[]);
  }
  // Fan-triangulate in case backend sends quads/ngons
  const out: number[] = [];
  for (const f of faces as number[][]) {
    for (let i = 1; i < f.length - 1; i++) out.push(f[0], f[i], f[i + 1]);
  }
  return new Uint16Array(out);
}

/** Convert raw base64 into a data-uri (for the web <img> preview). */
function normalizeTextureUri(src: string): string {
  if (/^data:/i.test(src) || /^(file|content|http|https|asset):/i.test(src) || src.startsWith('/')) {
    return src;
  }
  return `data:image/jpeg;base64,${src}`;
}

/** Decode a texture source: raw base64 OR a file/http/content URI. */
async function loadTextureSource(
  src: string
): Promise<{ data: Uint8Array; width: number; height: number } | null> {
  try {
    let base64 = src;
    /* if it looks like a URI, download + convert to base64 first */
    if (/^(file|content|http|https|asset):/i.test(src) || src.startsWith('/')) {
      const resp = await fetch(src);
      const blob = await resp.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      base64 = dataUrl.split(',')[1] || '';
    }
    if (!base64) return null;

    const binary = global.atob
      ? global.atob(base64)
      : Buffer.from(base64, 'base64').toString('binary');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const result = decode.decode(bytes, { useTArray: true, formatAsRGBA: true });
    return {
      data: result.data,
      width: result.width,
      height: result.height,
    };
  } catch (e) {
    console.warn('[ThreeDViewer] texture decode failed:', e);
    return null;
  }
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ThreeDViewer({
  vertices,
  faces,
  textureBase64,
  isLoading = false,
  autoRotate = true,
  showWireframe = false,
  flipTextureY = true,
  backgroundColor = '#101013',
  style,
}: ThreeDViewerProps) {
  /* ---------- three.js refs ---------- */
  const glRef = useRef<any>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number | null>(null);

  /* ---------- interaction ---------- */
  const orbit = useRef({ yaw: 0, pitch: -0.12, distance: 2.6 });
  const velocity = useRef({ yaw: 0, pitch: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartCamDist = useRef(2.6);

  /* ---------- smooth auto-rotate ---------- */
  const spinAnim = useRef(new RNAnimated.Value(0)).current;
  const latestSpin = useRef(0);

  const [ctxReady, setCtxReady] = useState(false);
  const hasGeometry = !!(vertices && vertices.length && faces && faces.length);

  /* =======================================================
     SCENE SETUP
  ======================================================= */

  const startRenderLoop = useCallback(() => {
    if (rafRef.current !== null) return;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick) as unknown as number;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const group = meshGroupRef.current;
      if (!renderer || !scene || !camera || !group) return;

      /* inertia */
      orbit.current.yaw += velocity.current.yaw;
      orbit.current.pitch += velocity.current.pitch;
      velocity.current.yaw *= 0.92;
      velocity.current.pitch *= 0.92;
      orbit.current.pitch = Math.max(-1.2, Math.min(1.2, orbit.current.pitch));

      /* auto rotate + slight tilt from drag */
      group.rotation.y = latestSpin.current;
      group.rotation.x = orbit.current.pitch * 0.55;

      /* orbit camera */
      const d = orbit.current.distance;
      camera.position.set(
        Math.sin(orbit.current.yaw) * Math.cos(orbit.current.pitch) * d,
        Math.sin(orbit.current.pitch) * d,
        Math.cos(orbit.current.yaw) * Math.cos(orbit.current.pitch) * d
      );
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      glRef.current?.endFrameEXP?.();
    };

    rafRef.current = requestAnimationFrame(tick) as unknown as number;
  }, []);

  const onContextCreate = useCallback(
    (gl: any) => {
      glRef.current = gl;

      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      /* expo-gl provides the real GL context; three.js only needs a
         canvas-shaped stub. Modern three.js registers
         'webglcontextlost/restored' listeners on the canvas, which a
         bare object lacks -> provide no-op stubs. */
      const stubCanvas: any = {
        width,
        height,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        getContext: () => null,
      };

      const renderer = new THREE.WebGLRenderer({
        canvas: stubCanvas,
        context: gl,
        antialias: true,
        alpha: false,
      });
      renderer.setSize(width, height, false);
      renderer.setClearColor(new THREE.Color(backgroundColor), 1);
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);
      scene.fog = new THREE.Fog(new THREE.Color(backgroundColor), 5, 11);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(38, width / height, 0.05, 100);
      camera.position.set(0, 0, orbit.current.distance);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      /* soft studio lighting */
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
      meshGroupRef.current = group;

      setCtxReady(true);
      startRenderLoop();
    },
    [backgroundColor, startRenderLoop]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  /* =======================================================
     AUTO-ROTATE DRIVER (JS-driven so render loop can read it)
  ======================================================= */

  useEffect(() => {
    if (!autoRotate) return;
    const id = spinAnim.addListener(({ value }) => {
      latestSpin.current = value;
    });
    const loop = RNAnimated.loop(
      RNAnimated.timing(spinAnim, {
        toValue: Math.PI * 2,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => {
      loop.stop();
      spinAnim.removeListener(id as any);
    };
  }, [autoRotate]);

  /* =======================================================
     BUILD / UPDATE MESH
  ======================================================= */

  const geometryKey = useMemo(
    () =>
      `${vertices?.length ?? 0}_${faces?.length ?? 0}_${
        textureBase64 ? textureBase64.length : 0
      }_${showWireframe ? 1 : 0}`,
    [vertices, faces, textureBase64, showWireframe]
  );

  useEffect(() => {
    const group = meshGroupRef.current;
    if (!group) return;

    let cancelled = false;

    const buildMesh = async () => {
    // dispose previous children
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

    /* ---- bounds ---- */
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
    const scaled = new Float32Array(positionsFlat.length);
    const uvs = new Float32Array(count * 2);

    for (let i = 0, v = 0; i < positionsFlat.length; i += 3, v++) {
      const nx = (positionsFlat[i] - cx) / maxSize;
      const ny = (positionsFlat[i + 1] - cy) / maxSize;
      const nz = (positionsFlat[i + 2] - cz) / maxSize;
      scaled[i] = nx;
      scaled[i + 1] = ny;
      scaled[i + 2] = nz;

      /* planar UV projection using original X/Y extents.
         jpeg-js row 0 = top of photo; with flipY=false, v=0 shows row 0,
         so map top-of-photo to the mesh's "up" axis. */
      let u = (positionsFlat[i] - minX) / sizeX;
      let t = (positionsFlat[i + 1] - minY) / sizeY;
      if (flipTextureY) t = 1 - t;
      uvs[v * 2] = u;
      uvs[v * 2 + 1] = flipTextureY ? t : 1 - t;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(scaled, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    /* ---- material & texture ---- */
    let map: THREE.Texture | null = null;
    if (textureBase64) {
      const img = await loadTextureSource(textureBase64);
      if (cancelled) return;
      if (img) {
        map = new THREE.DataTexture(
          new Uint8Array(img.data.buffer, img.data.byteOffset, img.data.length),
          img.width,
          img.height,
          THREE.RGBAFormat
        );
        map.flipY = false;
        map.magFilter = THREE.LinearFilter;
        map.minFilter = THREE.LinearFilter;
        map.needsUpdate = true;
      }
    }

    const material = new THREE.MeshStandardMaterial({
      map: map ?? undefined,
      color: map ? 0xffffff : 0xd9a8c4,
      roughness: 0.62,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });

    group.add(new THREE.Mesh(geometry, material));

    if (showWireframe) {
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        new THREE.LineBasicMaterial({
          color: 0xe7bcd4,
          transparent: true,
          opacity: 0.25,
        })
      );
      wire.scale.multiplyScalar(1.002);
      group.add(wire);
    }
    };

    buildMesh().catch((e) =>
      console.warn('[ThreeDViewer] mesh build failed:', e)
    );

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

  /* =======================================================
     GESTURES (drag = orbit, pinch = zoom)
  ======================================================= */

  const touchDist = (touches: readonly any[]): number | null => {
    if (touches.length < 2) return null;
    const [a, b] = touches;
    return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (evt) => {
          lastTouch.current = {
            x: evt.nativeEvent.pageX,
            y: evt.nativeEvent.pageY,
          };
          pinchStartDist.current = touchDist(evt.nativeEvent.touches);
          pinchStartCamDist.current = orbit.current.distance;
          velocity.current.yaw = 0;
          velocity.current.pitch = 0;
        },

        onPanResponderMove: (evt) => {
          const t = evt.nativeEvent.touches;

          /* pinch zoom */
          if (t.length >= 2) {
            const d = Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
            if (pinchStartDist.current) {
              const next = pinchStartCamDist.current * (pinchStartDist.current / d);
              orbit.current.distance = Math.max(1.5, Math.min(6, next));
            }
            return;
          }

          /* single finger orbit */
          const prev = lastTouch.current;
          if (!prev) return;
          const dx = evt.nativeEvent.pageX - prev.x;
          const dy = evt.nativeEvent.pageY - prev.y;
          lastTouch.current = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
          orbit.current.yaw += dx * 0.01;
          orbit.current.pitch -= dy * 0.008;
          velocity.current.yaw = dx * 0.0009;
          velocity.current.pitch = -dy * 0.0006;
        },

        onPanResponderRelease: () => {
          lastTouch.current = null;
          pinchStartDist.current = null;
        },

        onPanResponderTerminate: () => {
          lastTouch.current = null;
          pinchStartDist.current = null;
        },
      }),
    []
  );

  /* =======================================================
     UI
  ======================================================= */

  /* ---------- web fallback: no WebGL required ----------
   * expo-gl's web implementation throws when the browser has no
   * (or a blacklisted) WebGL context. Since the 3D pipeline only
   * makes sense with real GL anyway, we render a graceful 2D
   * preview of the texture instead of mounting GLView at all. */
  if (IS_WEB) {
    return (
      <View style={[styles.container, style]}>
        {textureBase64 ? (
          <Image
            source={{ uri: normalizeTextureUri(textureBase64) }}
            style={styles.gl}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.webPlaceholder}>
            <Text style={styles.webPlaceholderIcon}>✦</Text>
            <Text style={styles.webPlaceholderText}>
              نمایش سه‌بعدی فقط در اپلیکیشن موبایل فعال است
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <GLView
        style={styles.gl}
        onContextCreate={onContextCreate}
        {...panResponder.panHandlers}
      />

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
  gl: {
    ...StyleSheet.absoluteFillObject,
  },
  cornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 18,
    height: 18,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(217,154,185,0.55)',
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(217,154,185,0.55)',
    borderTopRightRadius: 6,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 18,
    height: 18,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(217,154,185,0.55)',
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 18,
    height: 18,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(217,154,185,0.55)',
    borderBottomRightRadius: 6,
  },
  hintChip: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(10,10,12,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(217,154,185,0.25)',
  },
  hintText: {
    color: '#E3B1C9',
    fontSize: 9,
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,12,0.45)',
  },
  overlayText: {
    color: '#B9AAB3',
    fontSize: 10,
    marginTop: 10,
  },
  webPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  webPlaceholderIcon: { fontSize: 26, color: '#D99AB9', marginBottom: 10 },
  webPlaceholderText: { color: '#8A8A92', fontSize: 11, textAlign: 'center', lineHeight: 18 },
});
