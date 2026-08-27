// app/(tabs)/avatar.tsx
// 🧊 آواتار سه‌بعدی من — کاربر ۱ تا ۳ عکس (جلو + نیم‌رخ) می‌دهد
// از دوربین یا گالری — و مدل سه‌بعدی دقیق صورتش ساخته و نمایش داده می‌شود.
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  User,
  RotateCcw,
  Sparkles,
  Check,
  Info,
  ImageIcon,
  MoreHorizontal,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThreeDViewer from '../../components/ThreeDViewer';
import { buildAvatar3D, Avatar3DResponse } from '../../services/api';

const { width } = Dimensions.get('window');

type Slot = { uri: string; b64: string } | null;

const VIEWS = [
  { key: 'front', label: 'نمای جلو', hint: 'رو به دوربین، صورت کامل در کادر' },
  { key: 'left', label: 'نیم‌رخ چپ', hint: 'سر ۹۰ درجه به چپ — پروفایل بینی مهم است' },
  { key: 'right', label: 'نیم‌رخ راست', hint: 'اختیاری — دقت را بالاتر می‌برد' },
] as const;

export default function AvatarScreen() {
  const [slots, setSlots] = useState<Slot[]>([null, null, null]);
  const [building, setBuilding] = useState(false);
  const [result, setResult] = useState<Avatar3DResponse | null>(null);
  const [showWire, setShowWire] = useState(false);

  /* ---------- منبع مشترک: دوربین یا گالری ---------- */
  const readB64 = async (uri: string): Promise<string> => {
    const blob = await (await fetch(uri)).blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.readAsDataURL(blob);
    });
  };

  const pickFromGallery = async (idx: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('دسترسی لازم است', 'دسترسی گالری را فعال کنید');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });
    if (res.canceled || !res.assets?.length) return;
    const uri = res.assets[0].uri;
    const b64 = await readB64(uri);
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = { uri, b64 };
      return next;
    });
    setResult(null);
  };

  const pickFromCamera = async (idx: number) => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('دسترسی لازم است', 'دسترسی دوربین را فعال کنید');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });
    if (res.canceled || !res.assets?.length) return;
    const uri = res.assets[0].uri;
    const b64 = await readB64(uri);
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = { uri, b64 };
      return next;
    });
    setResult(null);
  };

  /** انتخاب منبع — iOS: ActionSheet بومی، Android/وب: Alert با دکمه */
  const chooseSource = (idx: number) => {
    const open = (useCamera: boolean) =>
      useCamera ? pickFromCamera(idx) : pickFromGallery(idx);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['انصراف', '📷 دوربین', '🖼️ گالری'],
          cancelButtonIndex: 0,
          userInterfaceStyle: 'dark',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) open(true);
          else if (buttonIndex === 2) open(false);
        }
      );
    } else {
      Alert.alert('عکس را از کجا بگیرم؟', undefined, [
        { text: '📷 دوربین', onPress: () => open(true) },
        { text: '🖼️ گالری', onPress: () => open(false) },
        { text: 'انصراف', style: 'cancel' },
      ]);
    }
  };

  const build = async () => {
    const filled = slots.filter(Boolean).map((s) => s!.b64);
    if (!filled.length) {
      Alert.alert('تصویر لازم است', 'حداقل نمای جلو را انتخاب کن');
      return;
    }
    setBuilding(true);
    try {
      const r = await buildAvatar3D(filled);
      setResult(r);
    } catch (e: any) {
      Alert.alert('خطا', e.message || 'ساخت آواتار ناموفق بود');
    } finally {
      setBuilding(false);
    }
  };

  const reset = () => {
    setSlots([null, null, null]);
    setResult(null);
  };

  const filledCount = slots.filter(Boolean).length;

  return (
    <View style={styles.root}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>آواتار سه‌بعدی من</Text>
        <Text style={styles.subtitle}>
          با ۱ تا ۳ عکس، مدل دقیق صورتت ساخته می‌شود
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ═══ 3D STAGE ═══ */}
        <View style={styles.stageWrap}>
          <ThreeDViewer
            vertices={result?.mesh?.vertices}
            faces={result?.mesh?.faces}
            textureBase64={result?.texture ?? undefined}
            isLoading={building}
            autoRotate={!building}
            showWireframe={showWire}
            style={styles.stage}
          />
          {result && (
            <TouchableOpacity
              style={styles.wireToggle}
              onPress={() => setShowWire(!showWire)}
              activeOpacity={0.8}
            >
              <Info size={11} color="#E7BCD4" />
              <Text style={styles.wireToggleText}>{showWire ? 'مش' : 'چهره'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ═══ RESULT INFO ═══ */}
        {result && (
          <View style={styles.resultBox}>
            <View style={styles.resultRow}>
              <Check size={12} color="#82D4AD" />
              <Text style={styles.resultText}>
                ساخته شد از {result.views_used} نما •{' '}
                {result.mesh?.num_vertices?.toLocaleString('fa-IR')} نقطه •{' '}
                {result.mesh?.num_faces?.toLocaleString('fa-IR')} مثلث
              </Text>
            </View>
            {result.yaws?.length > 1 && (
              <Text style={styles.resultSub}>
                زوایای استفاده‌شده: {result.yaws.map((y) => `${Math.round(y)}°`).join(' ، ')}
              </Text>
            )}
          </View>
        )}

        {/* ═══ PHOTO SLOTS ═══ */}
        {!result && (
          <>
            <Text style={styles.sectionTitle}>عکس‌هایت را انتخاب کن</Text>
            <View style={styles.slotsRow}>
              {VIEWS.map((v, i) => (
                <TouchableOpacity
                  key={v.key}
                  style={[styles.slot, slots[i] && styles.slotFilled]}
                  activeOpacity={0.85}
                  onPress={() => pickFromGallery(i)}
                >
                  {slots[i] ? (
                    <>
                      <Image source={{ uri: slots[i]!.uri }} style={styles.slotImg} />
                      <View style={styles.slotCheck}>
                        <Check size={11} color="#0E1512" />
                      </View>
                    </>
                  ) : (
                    <>
                      {i === 0 ? (
                        <Camera size={20} color="#8A7280" />
                      ) : (
                        <User size={20} color="#6A5A64" />
                      )}
                      <Text style={styles.slotLabel}>{v.label}</Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* hints */}
            <View style={styles.hintBox}>
              {VIEWS.map((v) => (
                <Text key={v.key} style={styles.hintLine}>
                  • <Text style={styles.hintBold}>{v.label}:</Text> {v.hint}
                </Text>
              ))}
            </View>
          </>
        )}

        {/* ═══ ACTIONS ═══ */}
        {!result && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
              <RotateCcw size={14} color="#C9C9CE" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buildBtn, (building || !filledCount) && styles.buildBtnOff]}
              disabled={building || !filledCount}
              onPress={build}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#C783A5', '#966581']} style={styles.buildGrad}>
                {building ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.buildText}>در حال ساخت مدل…</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} color="#FFF" />
                    <Text style={styles.buildText}>ساخت آواتار سه‌بعدی</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {result && (
          <TouchableOpacity style={styles.againBtn} onPress={reset} activeOpacity={0.85}>
            <RotateCcw size={13} color="#E7BCD4" />
            <Text style={styles.againText}>ساخت مجدد با عکس‌های دیگر</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0F' },
  header: { paddingHorizontal: 18, paddingTop: 54, paddingBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#77777F', fontSize: 11, marginTop: 4 },

  stageWrap: {
    marginHorizontal: 16,
    marginTop: 10,
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217,154,185,0.25)',
  },
  stage: { flex: 1 },
  wireToggle: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(10,10,12,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(217,154,185,0.3)',
  },
  wireToggleText: { color: '#E7BCD4', fontSize: 9, fontWeight: '700' },

  resultBox: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(130,212,173,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(130,212,173,0.2)',
  },
  resultRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  resultText: { color: '#B7DEC9', fontSize: 10, fontWeight: '700' },
  resultSub: { color: '#6E8F7E', fontSize: 9, marginTop: 5, textAlign: 'right' },

  sectionTitle: {
    color: '#C9C9CE',
    fontSize: 12,
    fontWeight: '800',
    marginHorizontal: 18,
    marginTop: 18,
    textAlign: 'right',
  },
  slotsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  slot: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    overflow: 'hidden',
  },
  slotFilled: { borderColor: '#C783A5' },
  slotImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  slotCheck: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#82D4AD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLabel: { color: '#8A8A92', fontSize: 9, fontWeight: '700' },

  hintBox: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  hintLine: { color: '#8A8A92', fontSize: 9, lineHeight: 17, textAlign: 'right' },
  hintBold: { color: '#B9AAB3', fontWeight: '800' },

  actions: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  resetBtn: {
    width: 46,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  buildBtn: { flex: 1, height: 48, borderRadius: 14, overflow: 'hidden' },
  buildBtnOff: { opacity: 0.4 },
  buildGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buildText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  againBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginHorizontal: 16,
    marginTop: 16,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(216,137,173,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(216,137,173,0.35)',
  },
  againText: { color: '#E7BCD4', fontSize: 11, fontWeight: '700' },
});
