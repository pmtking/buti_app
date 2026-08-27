// AnimatedBackground — پس‌زمینه زنده: هاله‌های شناور + ذرات درخشان
// سبک و بدون کتابخانه خارجی، فقط Animated ری‌اکتیو نیتیو
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

type Props = {
  /** رنگ هاله ۱ */
  c1?: string;
  /** رنگ هاله ۲ */
  c2?: string;
  /** رنگ هاله ۳ */
  c3?: string;
  /** تعداد ذرات درخشان */
  particles?: number;
};

function makeParticles(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    size: 2 + Math.random() * 3,
    left: Math.random() * 100,
    delay: Math.random() * 6000,
    duration: 7000 + Math.random() * 8000,
    drift: (Math.random() - 0.5) * 60,
    opacity: 0.25 + Math.random() * 0.45,
  }));
}

export default function AnimatedBackground({
  c1 = 'rgba(232,193,112,0.16)',
  c2 = 'rgba(94,219,196,0.10)',
  c3 = 'rgba(255,158,125,0.09)',
  particles = 14,
}: Props) {
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;
  const orb3 = useRef(new Animated.Value(0)).current;
  const dots = useMemo(() => makeParticles(particles), [particles]);

  useEffect(() => {
    const float1 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orb1, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const float2 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, { toValue: 1, duration: 12000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(orb2, { toValue: 0, duration: 12000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const float3 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb3, { toValue: 1, duration: 10500, easing: Easing.inOut(Easing.circle), useNativeDriver: true }),
        Animated.timing(orb3, { toValue: 0, duration: 10500, easing: Easing.inOut(Easing.circle), useNativeDriver: true }),
      ])
    );
    float1.start();
    float2.start();
    float3.start();
    return () => {
      float1.stop();
      float2.stop();
      float3.stop();
    };
  }, [orb1, orb2, orb3]);

  const o1y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, 46] });
  const o1x = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const o2y = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, -56] });
  const o2x = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, 38] });
  const o3s = orb3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.28] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* هاله‌های بزرگ شناور */}
      <Animated.View
        style={[
          styles.orb,
          styles.orbA,
          { backgroundColor: c1, transform: [{ translateY: o1y }, { translateX: o1x }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbB,
          { backgroundColor: c2, transform: [{ translateY: o2y }, { translateX: o2x }] },
        ]}
      />
      <Animated.View
        style={[styles.orb, styles.orbC, { backgroundColor: c3, transform: [{ scale: o3s }] }]}
      />

      {/* ذرات درخشان بالا رونده */}
      {dots.map((d) => {
        const v = useRef(new Animated.Value(0)).current;
        const started = useRef(false);
        if (!started.current) {
          started.current = true;
          setTimeout(() => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(v, {
                  toValue: 1,
                  duration: d.duration,
                  easing: Easing.linear,
                  useNativeDriver: true,
                }),
              ])
            ).start();
          }, d.delay);
        }
        const ty = v.interpolate({ inputRange: [0, 1], outputRange: [H + 20, -40] });
        const tx = v.interpolate({ inputRange: [0, 1], outputRange: [0, d.drift] });
        const fade =
          v.interpolate({
            inputRange: [0, 0.08, 0.85, 1],
            outputRange: [0, d.opacity, d.opacity, 0],
          });
        return (
          <Animated.View
            key={d.id}
            style={{
              position: 'absolute',
              left: `${d.left}%` as any,
              bottom: 0,
              width: d.size,
              height: d.size,
              borderRadius: d.size / 2,
              backgroundColor: '#FFB3E2',
              opacity: fade,
              transform: [{ translateY: ty }, { translateX: tx }],
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', borderRadius: 999 },
  orbA: { width: 300, height: 300, top: -90, right: -80 },
  orbB: { width: 260, height: 260, bottom: 60, left: -100 },
  orbC: { width: 200, height: 200, top: '42%', right: -70 },
});
