// ChatSkeleton — لودینگ دوستانه: حباب‌های اسکلتی با موج طلایی
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

function usePulse() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return v;
}

export default function ChatSkeleton() {
  const wave = usePulse();

  const shimmer = (delay: number) => ({
    opacity: wave.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] }),
    transform: [
      {
        translateX: wave.interpolate({
          inputRange: [0, 1],
          outputRange: [0, delay % 2 === 0 ? -8 : 8],
        }),
      },
    ],
  });

  return (
    <View style={styles.wrap}>
      {/* پیام خوش‌آمد اسکلتی */}
      <View style={styles.row}>
        <Animated.View style={[styles.avatar, shimmer(0)]} />
        <View style={styles.bubble}>
          <Animated.View style={[styles.line, { width: '88%' }, shimmer(1)]} />
          <Animated.View style={[styles.line, { width: '64%' }, shimmer(2)]} />
        </View>
      </View>

      {/* سه‌نقطه تایپینگ */}
      <View style={[styles.row, styles.later]}>
        <View style={styles.bubbleSmall}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: wave.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, i === 1 ? 1 : 0.6],
                  }),
                  transform: [
                    {
                      translateY: wave.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, i === 1 ? -4 : 0],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* چیپ‌های پیشنهاد اسکلتی */}
      <View style={styles.chipRow}>
        {[52, 74, 60].map((w, i) => (
          <Animated.View key={i} style={[styles.chip, { width: w }, shimmer(i + 1)]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  later: { marginTop: 2 },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(232,193,112,0.25)',
  },
  bubble: {
    backgroundColor: 'rgba(255,244,224,0.06)',
    borderColor: 'rgba(232,193,112,0.16)',
    borderWidth: 1,
    borderRadius: 16,
    borderBottomLeftRadius: 5,
    padding: 12,
    gap: 8,
  },
  bubbleSmall: {
    backgroundColor: 'rgba(255,244,224,0.06)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 5,
    marginLeft: 34,
  },
  line: { height: 9, borderRadius: 5, backgroundColor: 'rgba(232,193,112,0.28)' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF6EC7' },
  chipRow: { flexDirection: 'row-reverse', gap: 8 },
  chip: {
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,244,224,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(232,193,112,0.18)',
  },
});
