// app/capture360.tsx
// تجربه «چرخش ۳۶۰°» — کاربر سه زاویه می‌گیرد، مدل سه‌بعدی ساخته می‌شود
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated,
  Easing, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import {
  X, RotateCw, Check, ScanFace, Sparkles, ChevronLeft,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: W, height: H } = Dimensions.get('window');

type Step = 0 | 1 | 2; // front / left / right
const STEP_INFO: { title: string; hint: string; angle: number }[] = [
  { title: 'روبرو', hint: 'مستقیم به دوربین نگاه کن', angle: 0 },
  { title: 'نیم‌رخ چپ', hint: 'آروم به چپ بچرخ — حدود ۷۰°', angle: -70 },
  { title: 'نیم‌رخ راست', hint: 'آروم به راست بچرخ — حدود ۷۰°', angle: 70 },
];

export default function Capture360Screen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [step, setStep] = useState<Step>(0);
  const [shots, setShots] = useState<string[]>([]);
  const [building, setBuilding] = useState(false);
  const [progress, setProgress] = useState(0);

  /* حلقه راهنمای چرخش */
  const ringVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (building) return;
    Animated.loop(
      Animated.timing(ringVal, {
        toValue: 1,
        duration: 3600,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    ).start();
  }, [step, building]);

  const sweepDeg = ringVal.interpolate({
    inputRange: [0, 1],
    outputRange: [STEP_INFO[step].angle - 40, STEP_INFO[step].angle + 40],
  });
  const dotDeg = ringVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /* شبیه‌سازی پیشرفت ساخت مدل */
  useEffect(() => {
    if (!building) return;
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 6;
      setProgress(Math.min(96, p));
    }, 320);
    return () => clearInterval(iv);
  }, [building]);

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: '#12081F' }]}>
        <Text style={{ color: '#F0CD8B' }}>در حال آماده‌سازی…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={['#1E1038', '#12081F']} style={styles.center}>
        <ScanFace size={44} color="#F0CD8B" />
        <Text style={styles.permTitle}>برای ساخت مدل سه‌بعدی</Text>
        <Text style={styles.permBody}>باید اجازه دسترسی به دوربین فعال باشد</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnT}>فعال کردن دوربین</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const capture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.9, skipProcessing: false });
      if (!photo?.uri) return;
      const next = [...shots, photo.uri];
      setShots(next);
      if (next.length >= 3) {
        setBuilding(true);
        // TODO: ارسال به buildAvatar3D (services/api)
        setTimeout(() => {
          setProgress(100);
          setTimeout(() => router.replace({ pathname: '/ai', params: { avatarReady: '1' } }), 700);
        }, 2600);
      } else {
        setStep((s) => ((s + 1) % 3) as Step);
      }
    } catch (e) {
      console.log('capture err', e);
    }
  };

  const info = STEP_INFO[step];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#12081F" />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
      {/* تیره‌کننده */}
      <LinearGradient
        colors={['rgba(13,11,9,0.88)', 'transparent', 'rgba(13,11,9,0.92)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {!building ? (
        <SafeAreaView style={styles.safe}>
          {/* هدر */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconChip}>
              <ChevronLeft size={17} color="#FBF6EC" />
            </TouchableOpacity>
            <Text style={styles.hTitle}>مدل سه‌بعدی BUTI</Text>
            <View style={styles.stepPills}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.pill, i <= step && shots.length >= i && styles.pillDone]} />
              ))}
            </View>
          </View>

          {/* عنوان مرحله */}
          <View style={styles.stepHead}>
            <Text style={styles.stepTitle}>{info.title}</Text>
            <Text style={styles.stepHint}>{info.hint}</Text>
          </View>

          {/* ═══ حلقه چرخش ۳۶۰ + کادر صورت ═══ */}
          <View style={styles.ringWrap}>
            {/* حلقه مداری */}
            <Animated.View style={[styles.orbit, { transform: [{ rotate: dotDeg }] }]}>
              <View style={styles.orbitDot} />
            </Animated.View>
            <Svg width={W * 0.82} height={W * 0.82} style={StyleSheet.absoluteFill}>
              <SvgCircle
                cx={(W * 0.82) / 2}
                cy={(W * 0.82) / 2}
                r={(W * 0.82) / 2 - 3}
                stroke="rgba(240,205,139,0.28)"
                strokeWidth={1.5}
                fill="none"
                strokeDasharray="6 8"
              />
            </Svg>

            {/* کادر صورت */}
            <View style={styles.faceFrame}>
              <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
              {/* خط اسکن عمودی */}
              <Animated.View
                style={[
                  styles.scanBar,
                  {
                    transform: [{
                      translateY: ringVal.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-110, 110, -110] }),
                    }],
                  },
                ]}
              />
            </View>

            {/* فلش چرخش */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                bottom: -34,
                transform: [{
                  rotate: sweepDeg.interpolate({
                    inputRange: [-110, 110],
                    outputRange: ['-40deg', '40deg'],
                  }),
                }],
              }}
            >
              <RotateCw size={22} color="#F0CD8B" />
            </Animated.View>
          </View>

          {/* شات‌های گرفته‌شده */}
          <View style={styles.thumbsRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.thumb, shots[i] ? styles.thumbOk : null]}>
                {shots[i]
                  ? <Text style={{ color: '#241A08' }}><Check size={13} /></Text>
                  : <Text style={styles.thumbIdx}>{['ج', 'چ', 'ر'][i]}</Text>}
              </View>
            ))}
          </View>

          {/* دکمه گرفتن */}
          <View style={styles.captureRow}>
            <TouchableOpacity onPress={capture} activeOpacity={0.85}>
              <LinearGradient colors={['#F0CD8B', '#C79A4B']} style={styles.captureBtn}>
                <Sparkles size={19} color="#241A08" />
                <Text style={styles.captureTxt}>ثبت {info.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : (
        /* ═══ حالت ساخت مدل — انیمیشن جذاب ═══ */
        <SafeAreaView style={[styles.safe, styles.centerCol]}>
          <Animated.View
            style={[styles.buildOrb, {
              transform: [{
                rotate: dotDeg,
              }],
            }]}
          >
            <View style={styles.buildOrbInner}>
              <ScanFace size={52} color="#F0CD8B" />
            </View>
          </Animated.View>
          <Text style={styles.buildTitle}>در حال ساخت مدل سه‌بعدی تو…</Text>
          <Text style={styles.buildSub}>۴۶۸ نقطه • بافت واقعی پوست • مش قابل چرخش</Text>

          <View style={styles.progressWrap}>
            <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPct}>{Math.floor(progress)}٪</Text>

          <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()}>
            <Text style={styles.cancelT}>انصراف</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const s: any = { position: 'absolute', width: 30, height: 30, borderColor: '#F0CD8B' };
  if (pos === 'tl') Object.assign(s, { left: 0, top: 0, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderTopLeftRadius: 12 });
  if (pos === 'tr') Object.assign(s, { right: 0, top: 0, borderRightWidth: 2.5, borderTopWidth: 2.5, borderTopRightRadius: 12 });
  if (pos === 'bl') Object.assign(s, { left: 0, bottom: 0, borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderBottomLeftRadius: 12 });
  if (pos === 'br') Object.assign(s, { right: 0, bottom: 0, borderRightWidth: 2.5, borderBottomWidth: 2.5, borderBottomRightRadius: 12 });
  return <View style={s} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#12081F' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  centerCol: { alignItems: 'center', justifyContent: 'center' },

  permTitle: { color: '#FBF6EC', fontSize: 17, fontWeight: '800', marginTop: 14 },
  permBody: { color: 'rgba(251,246,236,0.55)', fontSize: 11, textAlign: 'center', lineHeight: 19 },
  permBtn: { marginTop: 20, backgroundColor: '#F0CD8B', paddingHorizontal: 26, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  permBtnT: { color: '#241A08', fontWeight: '800', fontSize: 12 },

  safe: { flex: 1 },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  iconChip: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  hTitle: { color: '#FBF6EC', fontSize: 15, fontWeight: '800' },
  stepPills: { flexDirection: 'row-reverse', gap: 5 },
  pill: { width: 16, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  pillDone: { backgroundColor: '#F0CD8B' },

  stepHead: { alignItems: 'center', marginTop: 18 },
  stepTitle: { color: '#FBF6EC', fontSize: 21, fontWeight: '900' },
  stepHint: { color: 'rgba(251,246,236,0.55)', fontSize: 11, marginTop: 5 },

  ringWrap: { marginTop: 46, alignSelf: 'center', width: W * 0.82, height: W * 0.82, alignItems: 'center', justifyContent: 'center' },
  orbit: { ...StyleSheet.absoluteFillObject, alignItems: 'center' },
  orbitDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#F0CD8B',
    shadowColor: '#F0CD8B', shadowOpacity: 1, shadowRadius: 12, elevation: 8,
    top: 0,
  },
  faceFrame: { width: W * 0.56, height: W * 0.72, position: 'relative' },
  scanBar: {
    position: 'absolute', left: 10, right: 10, top: '50%', height: 2.5, borderRadius: 2,
    backgroundColor: '#F0CD8B', shadowColor: '#F0CD8B', shadowOpacity: 1, shadowRadius: 12,
  },

  thumbsRow: { flexDirection: 'row-reverse', gap: 10, justifyContent: 'center', marginTop: 58 },
  thumb: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1.5,
    borderColor: 'rgba(240,205,139,0.35)', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  thumbOk: { backgroundColor: '#F0CD8B', borderColor: '#F0CD8B' },
  thumbIdx: { color: 'rgba(251,246,236,0.6)', fontSize: 11, fontWeight: '700' },

  captureRow: { flex: 1, justifyContent: 'flex-end', paddingBottom: 30, alignItems: 'center' },
  captureBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
    paddingHorizontal: 34, height: 54, borderRadius: 27,
    shadowColor: '#F0CD8B', shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  captureTxt: { color: '#241A08', fontSize: 14, fontWeight: '900' },

  buildOrb: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  buildOrbInner: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(240,205,139,0.10)', borderWidth: 1.5,
    borderColor: 'rgba(240,205,139,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  buildTitle: { color: '#FBF6EC', fontSize: 17, fontWeight: '800', marginTop: 22 },
  buildSub: { color: 'rgba(251,246,236,0.5)', fontSize: 10, marginTop: 7 },

  progressWrap: {
    marginTop: 26, width: W * 0.62, height: 7, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#F0CD8B' },
  progressPct: { color: '#F0CD8B', fontSize: 12, fontWeight: '800', marginTop: 10 },
  cancelLink: { marginTop: 26 },
  cancelT: { color: 'rgba(251,246,236,0.4)', fontSize: 11 },
});
