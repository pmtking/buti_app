// FaceAnnotations — مشاوره بصری AI روی صورت
// نقطه لنگر درخشان + خط راهنمای متحرک + کارت شناور با ورود اسپرینگ
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ChevronLeft, X } from 'lucide-react-native';

const { width: W } = Dimensions.get('window');

export type Anno = {
  id: string;
  /** لنگر روی صورت (0..1 نسبی داخل کادر عکس) */
  ax: number;
  ay: number;
  /** کارت سمت چپ یا راست باز شود */
  side: 'left' | 'right';
  by: number;
  icon: string;
  title: string;
  body: string;
  cta?: { label: string; prompt: string };
};

/** ورود مرحله‌ای هر آیتم */
function useEnter(delay: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.spring(v, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay, v]);
  return v;
}

function AnchorDot({ x, y, enter }: { x: number; y: number; enter: Animated.Value }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    l.start();
    return () => l.stop();
  }, [pulse]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${x * 100}%` as any,
        top: `${y * 100}%` as any,
        opacity: enter,
        transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }],
      }}
    >
      {/* حلقه نبض */}
      <Animated.View
        style={{
          position: 'absolute',
          left: -14,
          top: -14,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: 'rgba(240,205,139,0.35)',
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] }) }],
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
        }}
      />
      <View style={styles.dotCore} />
    </Animated.View>
  );
}

export default function FaceAnnotations({
  annos,
  onClose,
  onCta,
}: {
  annos: Anno[];
  onClose?: () => void;
  onCta?: (prompt: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(annos[0]?.id ?? null);
  const H = 1;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {annos.map((a, i) => {
        const enter = useEnterSafe(i * 450);
        const isOpen = openId === a.id;
        const boxRight = a.side === 'right';
        // مختصات لنگر به پیکسل
        const axPx = a.ax * W;
        const ayPx = a.ay * H;
        const cardW = W * 0.46;

        return (
          <View key={a.id} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            {/* ── لایه SVG: خط راهنما ── */}
            <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Circle cx={axPx} cy={ayPx} r={5.5} fill="#F0CD8B" opacity={enter as any} />
              <AnimatedPath d={leaderPath(axPx, ayPx, boxRight, a.by)} enter={enter} />
            </Svg>

            {/* ── نقطه لنگر لمسی ── */}
            <TouchableOpacity
              onPress={() => setOpenId(isOpen ? null : a.id)}
              activeOpacity={0.7}
              style={{
                position: 'absolute',
                left: axPx - 22,
                top: ayPx - 22,
                width: 44,
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AnchorDot x={50} y={50} enter={enter} />
            </TouchableOpacity>

            {/* ── کارت شناور ── */}
            <Animated.View
              pointerEvents={isOpen ? 'auto' : 'none'}
              style={[
                styles.card,
                {
                  width: cardW,
                  top: `${a.by * 100}%` as any,
                  ...(boxRight ? { right: 10 } : { left: 10 }),
                  opacity: enter,
                  transform: [
                    {
                      translateX: enter.interpolate({
                        inputRange: [0, 1],
                        outputRange: [boxRight ? 24 : -24, 0],
                      }),
                    },
                    {
                      scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity activeOpacity={0.95} onPress={() => setOpenId(isOpen ? null : a.id)}>
                <LinearGradient
                  colors={['rgba(26,21,14,0.96)', 'rgba(13,11,9,0.96)']}
                  style={styles.cardGrad}
                >
                  <View style={styles.cardHead}>
                    <Text style={styles.cardIcon}>{a.icon}</Text>
                    <Text style={styles.cardTitle} numberOfLines={1}>{a.title}</Text>
                    {isOpen && onClose && (
                      <TouchableOpacity onPress={onClose} hitSlop={6}>
                        <X size={12} color="rgba(251,246,236,0.45)" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {isOpen && (
                    <>
                      <Text style={styles.cardBody}>{a.body}</Text>
                      {a.cta && (
                        <TouchableOpacity
                          style={styles.cta}
                          activeOpacity={0.85}
                          onPress={() => onCta?.(a.cta!.prompt)}
                        >
                          <Sparkles size={11} color="#241A08" />
                          <Text style={styles.ctaT}>{a.cta.label}</Text>
                          <ChevronLeft size={12} color="#241A08" />
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

/* هوک ایمن داخل map */
function useEnterSafe(delay: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(
      () =>
        Animated.spring(v, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }).start(),
      delay
    );
    return () => clearTimeout(t);
  }, [delay, v]);
  return v;
}

/* مسیر منحنی لنگر→کارت */
function leaderPath(ax: number, ay: number, boxRight: boolean, by: number) {
  const cardW = W * 0.46;
  const endX = boxRight ? W - cardW - 14 : cardW + 14;
  const endY = by * 400 + 18;
  const midX = ax + (endX - ax) * 0.55;
  return `M ${ax} ${ay} Q ${midX} ${ay} ${endX} ${endY}`;
}

/* Path با انیمیشن opacity/dash */
function AnimatedPath({ d, enter }: { d: string; enter: Animated.Value }) {
  return (
    <Path
      d={d}
      stroke="#F0CD8B"
      strokeWidth={1.6}
      strokeDasharray="4 4"
      fill="none"
      opacity={enter as any}
    />
  );
}

const styles = StyleSheet.create({
  dotCore: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#F0CD8B',
    borderWidth: 2,
    borderColor: 'rgba(36,26,8,0.9)',
    shadowColor: '#F0CD8B',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    position: 'absolute',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(240,205,139,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  cardGrad: { padding: 11 },
  cardHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  cardIcon: { fontSize: 13 },
  cardTitle: { flex: 1, color: '#F0CD8B', fontSize: 11, fontWeight: '800', textAlign: 'right' },
  cardBody: {
    color: 'rgba(251,246,236,0.82)', fontSize: 10, lineHeight: 17,
    marginTop: 6, textAlign: 'right',
  },
  cta: {
    marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row-reverse',
    alignItems: 'center', gap: 5, backgroundColor: '#F0CD8B',
    paddingHorizontal: 10, height: 27, borderRadius: 14,
  },
  ctaT: { color: '#241A08', fontSize: 9.5, fontWeight: '800' },
});
