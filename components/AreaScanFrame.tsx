// AreaScanFrame — قاب اسکن هوشمند ناحیه‌ای
// وقتی کاربر مثلاً میگه «دماغم»، فقط روی بینی قفل میشه با انیمیشن AI Scan طلایی
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Scan, Sparkles } from 'lucide-react-native';

const { width: W } = Dimensions.get('window');

/** موقعیت نسبی هر ناحیه روی صورت (درصد داخل کادر دوربین) */
const AREA_POS: Record<string, { top: string; left: string; w: number; h: number; label: string }> = {
  nose:     { top: '48%', left: '50%', w: 0.20, h: 0.16, label: 'AI SCAN • NOSE' },
  lips:     { top: '66%', left: '50%', w: 0.22, h: 0.10, label: 'AI SCAN • LIPS' },
  eyes:     { top: '36%', left: '50%', w: 0.44, h: 0.12, label: 'AI SCAN • EYES' },
  forehead: { top: '24%', left: '50%', w: 0.34, h: 0.13, label: 'AI SCAN • FOREHEAD' },
  cheeks:   { top: '52%', left: '50%', w: 0.46, h: 0.14, label: 'AI SCAN • CHEEKS' },
  jaw:      { top: '74%', left: '50%', w: 0.40, h: 0.14, label: 'AI SCAN • JAW' },
  chin:     { top: '82%', left: '50%', w: 0.20, h: 0.09, label: 'AI SCAN • CHIN' },
  face:     { top: '50%', left: '50%', w: 0.62, h: 0.56, label: 'AI SCAN • FULL FACE' },
};

export default function AreaScanFrame({
  area,
  scanning,
}: {
  area: string;
  scanning?: boolean;
}) {
  const pos = AREA_POS[area] ?? AREA_POS.face;
  const boxW = W * pos.w;
  const boxH = W * pos.h * 1.35;

  // خط اسکن عمودی رفت‌وبرگشتی
  const scanY = useRef(new Animated.Value(0)).current;
  // نبض حلقه گوشه‌ها
  const pulse = useRef(new Animated.Value(1)).current;
  // درخشش پس‌زمینه
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!scanning) return;
    const line = Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scanY, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const pl = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const gl = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.35, duration: 1600, useNativeDriver: true }),
      ])
    );
    line.start(); pl.start(); gl.start();
    return () => { line.stop(); pl.stop(); gl.stop(); };
  }, [scanning, scanY, pulse, glow]);

  const translateY = scanY.interpolate({ inputRange: [0, 1], outputRange: [-boxH / 2 + 8, boxH / 2 - 8] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          top: pos.top as any,
          left: pos.left as any,
          width: boxW,
          height: boxH,
          marginLeft: -boxW / 2,
          marginTop: -boxH / 2,
        }}
      >
        {/* درخشش داخلی */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowOpacity }]}>
          <LinearGradient
            colors={['rgba(240,205,139,0.0)', 'rgba(240,205,139,0.25)', 'rgba(240,205,139,0.0)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* 🔲 شبکه مش — نقاط قفل روی هدف */}
        <View style={styles.meshWrap} pointerEvents="none">
          {MESH_DOTS.map((d, i) => (
            <MeshDot key={i} x={d.x} y={d.y} delay={d.delay} active={!!scanning} />
          ))}
        </View>

        {/* قاب گوشه‌دار با نبض */}
        <Animated.View style={[styles.frame, { transform: [{ scale: pulse }] }]}>
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />
        </Animated.View>

        {/* خط اسکن */}
        {scanning && (
          <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
        )}

        {/* برچسب AI SCAN */}
        <View style={styles.labelRow}>
          <Scan size={9} color="#F0CD8B" />
          <Text style={styles.labelText}>{pos.label}</Text>
          <Sparkles size={9} color="#F0CD8B" />
        </View>
      </View>
    </View>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base: any = {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: '#F0CD8B',
  };
  if (pos === 'tl') Object.assign(base, { left: -2, top: -2, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderTopLeftRadius: 7 });
  if (pos === 'tr') Object.assign(base, { right: -2, top: -2, borderRightWidth: 2.5, borderTopWidth: 2.5, borderTopRightRadius: 7 });
  if (pos === 'bl') Object.assign(base, { left: -2, bottom: -2, borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderBottomLeftRadius: 7 });
  if (pos === 'br') Object.assign(base, { right: -2, bottom: -2, borderRightWidth: 2.5, borderBottomWidth: 2.5, borderBottomRightRadius: 7 });
  return <View style={base} />;
}

/* 🔲 شبکه مش — ۴×۵ نقطه با موج قفل‌شدن */
const MESH_COLS = 4;
const MESH_ROWS = 5;
const MESH_DOTS: { x: number; y: number; delay: number }[] = (() => {
  const arr: { x: number; y: number; delay: number }[] = [];
  for (let r = 0; r < MESH_ROWS; r++) {
    for (let c = 0; c < MESH_COLS; c++) {
      arr.push({
        x: ((c + 0.5) / MESH_COLS) * 100,
        y: ((r + 0.5) / MESH_ROWS) * 100,
        delay: (r + c) * 90,
      });
    }
  }
  return arr;
})();

function MeshDot({ x, y, delay, active }: { x: number; y: number; delay: number; active: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const t = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 1100, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.4, duration: 1100, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, [active, delay, v]);

  const opacity = active ? v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) : 0.3;
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.25] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%` as any,
        top: `${y}%` as any,
        width: 5,
        height: 5,
        marginLeft: -2.5,
        marginTop: -2.5,
        borderRadius: 2.5,
        backgroundColor: '#F0CD8B',
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  frame: { ...StyleSheet.absoluteFillObject },
  meshWrap: { ...StyleSheet.absoluteFillObject },
  scanLine: {
    position: 'absolute',
    left: 3,
    right: 3,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#F0CD8B',
    shadowColor: '#F0CD8B',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  labelRow: {
    position: 'absolute',
    bottom: -24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 11,
    backgroundColor: 'rgba(13,11,9,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(240,205,139,0.45)',
  },
  labelText: {
    color: '#F0CD8B',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
