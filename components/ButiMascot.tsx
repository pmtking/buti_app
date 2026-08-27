// ButiMascot — ماسکات سه‌بعدی BUTI: یک قلب شناور طلایی با چشم و حالت
// با react-three-fiber رندر میشه (سبک، بدون asset خارجی)
import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

type Mood = 'idle' | 'happy' | 'thinking' | 'wink';

function HeartMesh({ mood }: { mood: Mood }) {
  const group = useRef<THREE.Group>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);

  // شکل قلب با Shape سه‌جی‌اس
  const heartGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.5);
    s.bezierCurveTo(0, 0.8, -0.5, 0.9, -0.5, 0.4);
    s.bezierCurveTo(-0.5, 0.05, -0.1, -0.2, 0, -0.55);
    s.bezierCurveTo(0.1, -0.2, 0.5, 0.05, 0.5, 0.4);
    s.bezierCurveTo(0.5, 0.9, 0, 0.8, 0, 0.5);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 6,
      bevelSize: 0.08,
      bevelThickness: 0.08,
      curveSegments: 24,
    });
    geo.center();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!group.current) return;

    // شناوری نرم
    group.current.position.y = Math.sin(t * 1.6) * 0.12;
    // نگاه به چپ و راست مثل موجود زنده
    group.current.rotation.y = Math.sin(t * 0.7) * 0.45;
    group.current.rotation.z = Math.sin(t * 0.9) * 0.06;

    if (mood === 'happy') {
      const bounce = Math.abs(Math.sin(t * 3)) * 0.15;
      group.current.scale.setScalar(1 + bounce);
    } else if (mood === 'thinking') {
      group.current.rotation.y = Math.sin(t * 2.2) * 0.12;
    }

    // پلک زدن هر ~۳ ثانیه
    const blink = Math.abs(Math.sin(t * 1.05)) > 0.97 ? 0.12 : 1;
    [leftEye.current, rightEye.current].forEach((e) => e?.scale.setY(blink));
  });

  return (
    <group ref={group}>
      {/* بدنه قلب */}
      <mesh geometry={heartGeo} scale={0.85}>
        <meshStandardMaterial color="#F0CD8B" metalness={0.65} roughness={0.22} />
      </mesh>
      {/* چشم‌ها */}
      <mesh ref={leftEye} position={[-0.16, 0.18, 0.32]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#241A08" />
      </mesh>
      <mesh ref={rightEye} position={[0.16, 0.18, 0.32]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#241A08" />
      </mesh>
      {/* لپ‌ها */}
      <mesh position={[-0.26, 0.02, 0.28]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#FF9E7D" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.26, 0.02, 0.28]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#FF9E7D" transparent opacity={0.55} />
      </mesh>
      {/* دهان */}
      {mood !== 'thinking' ? (
        <mesh position={[0, 0.04, 0.33]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.09, 0.022, 10, 16, Math.PI]} />
          <meshStandardMaterial color="#241A08" />
        </mesh>
      ) : (
        <mesh position={[0.03, 0.02, 0.33]}>
          <circleGeometry args={[0.035, 14]} />
          <meshStandardMaterial color="#241A08" />
        </mesh>
      )}
    </group>
  );
}

export default function ButiMascot({
  mood = 'idle',
  size,
}: {
  mood?: Mood;
  size?: number;
}) {
  const s = size ?? Dimensions.get('window').width * 0.34;

  return (
    <View style={[styles.wrap, { width: s, height: s }]}>
      {/* هاله پشت ماسکات */}
      <View style={[styles.glow, { borderRadius: s / 2 }]} />
      <Canvas
        style={{ width: s, height: s }}
        camera={{ position: [0, 0, 3.1], fov: 45 }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 4]} intensity={1.4} color="#FFF3DC" />
        <pointLight position={[-2, -1, 2]} intensity={0.7} color="#FF9E7D" />
        <HeartMesh mood={mood} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(240,205,139,0.20)',
  },
});
