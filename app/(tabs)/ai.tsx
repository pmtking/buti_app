// location: ./buti_app/app/(tabs)/ai.tsx
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
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  StatusBar,
  Image as RNImage,
} from 'react-native';

import {
  CameraView,
  CameraType,
  useCameraPermissions,
} from 'expo-camera';

import * as ImagePicker from 'expo-image-picker';

import { LinearGradient } from 'expo-linear-gradient';

import {
  ArrowLeft,
  X,
  Camera,
  RotateCcw,
  Sparkles,
  ScanFace,
  Wand2,
  Eye,
  Check,
  ChevronDown,
  SlidersHorizontal,
  Send,
  MessageCircle,
  Layers,
  Rotate3D,
  Brain,
  Plus,
  Minus,
  RefreshCw,
  Image as ImageIcon,
  ShieldCheck,
  Stethoscope,
  Star,
  CalendarCheck,
  Sparkle,
  Clock,
} from 'lucide-react-native';

// ✅ ایمپورت سرویس API
import { useRouter } from 'expo-router';
import AnimatedBackground from '../../components/AnimatedBackground';
import ChatSkeleton from '../../components/ChatSkeleton';
import AreaScanFrame from '../../components/AreaScanFrame';
import { sendThreeDRequest, ThreeDResponse, Recommendation, sendManualEditRequest } from '../../services/api';
import { sendChatMessage } from '../../services/chat';

/* =========================================================
   HELPERS
========================================================= */

/** 12150000 → «۱۲.۲ میلیون تومان» */
function formatToman(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v.toFixed(1).replace(/\.0$/, '')} میلیون تومان`;
  }
  return `${n.toLocaleString('fa-IR')} تومان`;
}

const AREA_FA: Record<string, string> = {
  lip: 'لب',
  nose: 'بینی',
  jaw: 'فک و چانه',
  cheek: 'گونه',
  eye: 'اطراف چشم',
  forehead: 'پیشانی',
};

const { width, height } = Dimensions.get('window');

/* =========================================================
   TYPES
========================================================= */

type FacePart =
  | 'face'
  | 'forehead'
  | 'eyes'
  | 'nose'
  | 'lips'
  | 'cheeks'
  | 'jaw'
  | 'chin';

type FaceSettings = {
  width: number;
  height: number;
  projection: number;
  rotation: number;
};

type Suggestion = {
  id: string;
  title: string;
  description: string;
  icon: string;
  part: FacePart;
  prompt: string;
  gel?: number;
};

type AIMessage = {
  id: string;
  type: 'user' | 'ai';
  text: string;
  time?: string; // ⏰ ساعت ارسال (مثل ۲۳:۴۵)
  /** 🖼️ تصویر داخل حباب (base64 بدون پیشوند یا URI) — نتیجه تولید */
  image?: string;
  /** 🎛️ برچسب کوچک زیر تصویر (مثلاً «بینی قلمی • شدت ۷۰٪») */
  imageLabel?: string;
};

/** ⏰ زمان فعلی به فرمت فارسی HH:MM */
function nowFa(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/* ═══════════════════════════════════════════════════
   💬 QUICK REPLIES — پاسخ‌های سریع زیر اینپوت
   کاربر بدون تایپ، یک ضربه تا درخواست
═══════════════════════════════════════════════════ */
const QUICK_REPLIES = [
  { emoji: '👄', label: 'لب پرتر', prompt: 'لب‌هام رو پرتر و خوش‌فرم کن' },
  { emoji: '⌁', label: 'بینی قلمی', prompt: 'دماغم رو قلمی کن' },
  { emoji: '🌸', label: 'گونه برجسته', prompt: 'گونه‌هام رو برجسته‌تر کن' },
  { emoji: '◇', label: 'فک تیز', prompt: 'خط فکمو تیزتر کن' },
  { emoji: '✨', label: 'بهبود طبیعی', prompt: 'یه بهبود کلی طبیعی روی چهره اعمال کن' },
];

type CameraMode = 'live' | 'photo';

type SimulationState = {
  active: boolean;
  intensity: number;
};

/* =========================================================
   FACE PARTS
========================================================= */

const PARTS: {
  id: FacePart;
  title: string;
  subtitle: string;
  icon: string;
}[] = [
  {
    id: 'face',
    title: 'کل صورت',
    subtitle: 'Face',
    icon: '✦',
  },
  {
    id: 'forehead',
    title: 'پیشانی',
    subtitle: 'Forehead',
    icon: '◯',
  },
  {
    id: 'eyes',
    title: 'چشم‌ها',
    subtitle: 'Eyes',
    icon: '◉',
  },
  {
    id: 'nose',
    title: 'بینی',
    subtitle: 'Nose',
    icon: '⌁',
  },
  {
    id: 'lips',
    title: 'لب‌ها',
    subtitle: 'Lips',
    icon: '♡',
  },
  {
    id: 'cheeks',
    title: 'گونه',
    subtitle: 'Cheeks',
    icon: '✧',
  },
  {
    id: 'jaw',
    title: 'فک',
    subtitle: 'Jaw',
    icon: '◇',
  },
  {
    id: 'chin',
    title: 'چانه',
    subtitle: 'Chin',
    icon: '△',
  },
];

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS: FaceSettings = {
  width: 1,
  height: 1,
  projection: 1,
  rotation: 0,
};

/* =========================================================
   AI SUGGESTIONS
========================================================= */

const AI_SUGGESTIONS: Suggestion[] = [
  {
    id: 'lips-natural',
    title: 'لب طبیعی و پرتر',
    description: 'افزایش حجم ظاهری لب با نتیجه طبیعی',
    icon: '👄',
    part: 'lips',
    prompt: 'لب‌ها را کمی پرتر و خوش‌فرم‌تر کن، اما نتیجه طبیعی باقی بماند.',
  },
  {
    id: 'lips-3cc',
    title: 'شبیه‌سازی ۳ سی‌سی لب',
    description: 'سناریوی بصری افزایش حجم لب',
    icon: '💉',
    part: 'lips',
    prompt: 'یک شبیه‌سازی بصری از افزایش حجم لب با پارامتر ۳ سی‌سی ایجاد کن.',
    gel: 3,
  },
  {
    id: 'cheek',
    title: 'گونه برجسته',
    description: 'فرم‌دهی و برجسته‌تر شدن گونه',
    icon: '✨',
    part: 'cheeks',
    prompt: 'گونه‌ها را کمی برجسته‌تر و خوش‌فرم‌تر نمایش بده.',
  },
  {
    id: 'jaw',
    title: 'فک مشخص‌تر',
    description: 'نمایش خط فک واضح‌تر',
    icon: '◈',
    part: 'jaw',
    prompt: 'خط فک را مشخص‌تر و کمی زاویه‌دارتر نمایش بده.',
  },
  {
    id: 'chin',
    title: 'فرم چانه',
    description: 'اصلاح ظاهری فرم چانه',
    icon: '◇',
    part: 'chin',
    prompt: 'چانه را کمی متناسب‌تر و متقارن‌تر نمایش بده.',
  },
  {
    id: 'nose',
    title: 'فرم بینی',
    description: 'شبیه‌سازی تغییر ظاهری بینی',
    icon: '⌁',
    part: 'nose',
    prompt: 'یک تغییر ظریف و طبیعی در فرم ظاهری بینی شبیه‌سازی کن.',
  },
  {
    id: 'eyes',
    title: 'چشم‌ها',
    description: 'تغییر ظریف اطراف چشم',
    icon: '◉',
    part: 'eyes',
    prompt: 'ناحیه اطراف چشم را کمی شاداب‌تر و متعادل‌تر نمایش بده.',
  },
  {
    id: 'natural',
    title: 'Beauty طبیعی',
    description: 'بهبود کلی بدون تغییر شدید',
    icon: '🌸',
    part: 'face',
    prompt: 'یک بهبود بسیار طبیعی در چهره ایجاد کن و هویت فرد حفظ شود.',
  },
];

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function AiScreen() {
  const router = useRouter();

  /* =======================================================
     CAMERA
  ======================================================= */

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<CameraType>('front');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('live');
  const cameraRef = useRef<CameraView | null>(null);

  /* =======================================================
     IMAGE
  ======================================================= */

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  /** 🎯 ناحیه هدف اسکن — از متن درخواست کاربر تشخیص داده میشه */
  const [scanTarget, setScanTarget] = useState<FacePart | null>(null);

  /* =======================================================
     ANALYSIS
  ======================================================= */

  const [isScanning, setIsScanning] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  /* =======================================================
     UI
  ======================================================= */

  const [showBefore, setShowBefore] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [selectedPart, setSelectedPart] = useState<FacePart>('face');
  const [lighting, setLighting] = useState(true);

  /* =======================================================
     AI
  ======================================================= */

  const [prompt, setPrompt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  /* ═══ 💬 CHAT UX — اسکرول خودکار + انیمیشن تایپینگ ═══ */
  const chatScrollRef = useRef<ScrollView | null>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  /** هر پیام جدید یا حالت تایپینگ → نرم به آخر چت اسکرول کن */
  useEffect(() => {
    // کمی صفر تا رندر پیام کامل شود، بعد اسکرول
    const t = setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(t);
  }, [messages, isAIProcessing]);

  /** سه‌نقطه «در حال نوشتن…» با موج نرم */
  useEffect(() => {
    if (!isAIProcessing) {
      typingDots.stopAnimation();
      typingDots.setValue(0);
      return;
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingDots, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(typingDots, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    return () => typingDots.stopAnimation();
  }, [isAIProcessing, typingDots]);

  /* =======================================================
     BEAUTY
  ======================================================= */

  const [gelAmount, setGelAmount] = useState(0);
  const [simulationMode, setSimulationMode] = useState(true);
  const [simulation, setSimulation] = useState<SimulationState>({
    active: false,
    intensity: 0.5,
  });

  /* =======================================================
     SETTINGS
  ======================================================= */

  const [settings, setSettings] = useState<Record<FacePart, FaceSettings>>({
    face: { ...DEFAULT_SETTINGS },
    forehead: { ...DEFAULT_SETTINGS },
    eyes: { ...DEFAULT_SETTINGS },
    nose: { ...DEFAULT_SETTINGS },
    lips: { ...DEFAULT_SETTINGS },
    cheeks: { ...DEFAULT_SETTINGS },
    jaw: { ...DEFAULT_SETTINGS },
    chin: { ...DEFAULT_SETTINGS },
  });

  /* =======================================================
     ✅ STATE برای API
  ======================================================= */

  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ThreeDResponse | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  /** 🆕 base64 of the 2D filtered photo (Snapchat-style result) */
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  /** 🆕 base64 عکس اصلی کوچک‌شده از سرور — برای دکمه قبل/بعد */
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  /** 🆕 پیش‌نمایش سه‌بعدی (وقتی عکس نیم‌رخ باشد) */
  const [threeDPreview, setThreeDPreview] = useState<string | null>(null);

  /* ═══ MANUAL EDIT — اسلایدرهای حجم نواحی ═══ */
  const EDIT_AREAS = [
    { key: 'lip', label: 'لب', emoji: '👄' },
    { key: 'cheek', label: 'گونه', emoji: '🌸' },
    { key: 'nose', label: 'بینی', emoji: '⌁' },
    { key: 'jaw', label: 'فک', emoji: '◇' },
    { key: 'eye', label: 'چشم', emoji: '◉' },
    { key: 'forehead', label: 'پیشانی', emoji: '◯' },
  ] as const;

  const [showEditPanel, setShowEditPanel] = useState(false);
  const [manualEdits, setManualEdits] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editBase, setEditBase] = useState<string | null>(null); // عکس پایه برای ادیت

  const changeEdit = (key: string, delta: number) => {
    setManualEdits((prev) => {
      const next = Math.max(-100, Math.min(100, (prev[key] ?? 0) + delta));
      return { ...prev, [key]: next };
    });
  };

  const resetEdits = () => {
    setManualEdits({});
    if (editBase) setFilteredImage(editBase);
  };

  const applyManualEdits = async () => {
    const active = Object.fromEntries(
      Object.entries(manualEdits).filter(([, v]) => Math.abs(v) >= 1)
    );
    if (!Object.keys(active).length || !capturedImage) return;

    setIsEditing(true);
    try {
      // عکس پایه: آخرین نتیجه یا عکس اصلی
      let baseB64: string;
      if (editBase) {
        baseB64 = editBase;
      } else {
        const resp = await fetch(capturedImage);
        const blob = await resp.blob();
        baseB64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1]);
          reader.readAsDataURL(blob);
        });
        setEditBase(baseB64);
      }

      const result = await sendManualEditRequest(baseB64, active);
      if (result.status === 'success') {
        setFilteredImage(result.image);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'ai',
            text: `🎛️ ادیت دستی اعمال شد: ${Object.entries(result.labels)
              .map(([k, v]) => `${v} ${result.applied[k] > 0 ? '+' : ''}${result.applied[k]}`)
              .join('، ')}`,
          },
        ]);
      }
    } catch (e: any) {
      Alert.alert('خطا', e.message || 'ادیت ناموفق بود');
    } finally {
      setIsEditing(false);
    }
  };

  /* =======================================================
     ANIMATIONS
  ======================================================= */

  const scanAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const aiPulse = useRef(new Animated.Value(1)).current;
  const simulationAnimation = useRef(new Animated.Value(0)).current;

  /* =======================================================
     CAMERA PERMISSION
  ======================================================= */

  useEffect(() => {
    if (!cameraPermission) {
      requestCameraPermission();
    }
  }, [cameraPermission, requestCameraPermission]);

  /* =======================================================
     FAKE FACE DETECTION
  ======================================================= */

  useEffect(() => {
    if (!cameraReady) return;
    const timer = setTimeout(() => {
      setFaceDetected(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [cameraReady]);

  /* =======================================================
     SCAN ANIMATION
  ======================================================= */

  useEffect(() => {
    if (!isScanning) {
      scanAnimation.stopAnimation();
      scanAnimation.setValue(0);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      setIsScanning(false);
      setAnalysisDone(true);
      setMessages([
        {
          id: 'analysis',
          type: 'ai',
          text: 'سلام! 🌸 من بوتی‌ام — مشاور زیبایی تو.\nچهره‌ات رو تحلیل کردم و آماده‌ام هر تغییری رو قبل از تصمیم واقعی روی صورتت شبیه‌سازی کنم.\nبگو چی تو ذهنته؟',
          time: nowFa(),
        },
      ]);
    }, 3400);

    return () => {
      clearTimeout(timer);
      scanAnimation.stopAnimation();
    };
  }, [isScanning]);

  /* =======================================================
     HOME PULSE
  ======================================================= */

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.04,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    return () => pulseAnimation.stopAnimation();
  }, []);

  /* =======================================================
     AI PULSE
  ======================================================= */

  useEffect(() => {
    if (!isAIProcessing) {
      aiPulse.stopAnimation();
      aiPulse.setValue(1);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(aiPulse, {
          toValue: 1.08,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(aiPulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => aiPulse.stopAnimation();
  }, [isAIProcessing]);

  /* =======================================================
     SIMULATION ANIMATION
  ======================================================= */

  useEffect(() => {
    Animated.timing(simulationAnimation, {
      toValue: simulation.active ? simulation.intensity : 0,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [simulation.active, simulation.intensity]);

  /* =======================================================
     ✅ HANDLE SEND TO BACKEND
  ======================================================= */

  const handleSendToBackend = async (imageUri: string, text: string) => {
    if (!imageUri) {
      Alert.alert('خطا', 'لطفاً ابتدا یک تصویر انتخاب کنید');
      return;
    }

    setIsLoading(true);
    setIsScanning(true);

    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      const result = await sendThreeDRequest(base64, text, 0.7);

      if (result.status === 'success') {
        setApiResponse(result);
        setRecommendation(result.recommendation ?? null);
        // ✅ نتیجه ادیت + عکس اصلی کوچک‌شده برای دکمه قبل/بعد
        setFilteredImage(result.filtered_image ?? result.image ?? null);
        setOriginalImage(result.original_image ?? null);
        setShowBefore(false); // همیشه اول «بعد» را نشان بده
        setAnalysisDone(true);

        let msg = `✅ ${result.description}`;
        // 🆕 گزارش تغییرات چندگانه
        const applied = (result as any).applied_changes as any[] | undefined;
        if (applied && applied.length > 1) {
          const names: Record<string, string> = {
            upturned_tip: 'نوک بالا', hump_reduction: 'برداشتن قوز',
            narrower: 'باریک‌سازی', fleshy: 'گوشتی', doll_tip: 'عروسکی',
            fantasy: 'فانتزی', filler: 'فیلر', russian: 'روسی',
            fuller: 'حجم‌دهی', sharper: 'تیزکردن',
          };
          msg += `\n🎛️ ${applied.length} تغییر اعمال شد: ${applied
            .map((c) => names[c.action] ?? c.action)
            .join(' + ')}`;
        }
        // 🆕 اگر عکس نیم‌رخ بود، پیش‌نمایش سه‌بعدی ساخته شده
        const preview = (result as any).three_d_preview as string | null | undefined;
        if (preview) {
          setThreeDPreview(preview);
          msg += '\n🧊 پیش‌نمایش سه‌بعدی از نیم‌رخ ساخته شد';
        }
        const engine = (result as any).engine as string | undefined;
        if (engine === 'remote-gpu') {
          msg += '\n⚡ این نسخه با موتور مولد رندر شده — واقعی‌ترین حالت!';
        }
        if (!result.filtered_image) {
          msg += '\n\n⚠️ تغییر بصری اعمال نشد — لطفاً درخواست را دقیق‌تر بنویس (مثلاً: لب روسی، بینی گوشتی، نوک بالا)';
        }
        const rec = result.recommendation;
        if (rec?.estimated_price) {
          msg += `\n\n💰 برآورد هزینه: ${formatToman(rec.estimated_price.min)} تا ${formatToman(rec.estimated_price.max)}`;
        }
        if (rec?.doctor) {
          msg += `\n👨‍⚕️ ${rec.doctor.name} آماده مشاوره است`;
        }

        // 🖼️ پیام AI همراه با خودِ تصویر تولیدشده داخل حباب چت
        const resultImg = result.filtered_image ?? result.image ?? null;
        const areaFa = rec?.service ? AREA_FA[rec.service.area] : undefined;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'ai',
            text: msg,
            time: nowFa(),
            image: resultImg ?? undefined,
            imageLabel: areaFa ? `${areaFa} • شبیه‌سازی بوتی` : 'شبیه‌سازی بوتی ✨',
          },
        ]);
      } else {
        Alert.alert('خطا', 'پردازش با مشکل مواجه شد');
      }
    } catch (error: any) {
      Alert.alert('خطا', error.message || 'مشکل در ارتباط با سرور');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          text: `❌ خطا: ${error.message}`,
          time: nowFa(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  /* =======================================================
     OPEN GALLERY
  ======================================================= */

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('دسترسی لازم است', 'برای انتخاب تصویر، دسترسی گالری را فعال کنید.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.95,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        setCapturedImage(uri);
        setCameraMode('photo');
        setIsScanning(true);
        setAnalysisDone(false);
        setMessages([]);

        const defaultText = prompt.trim() || 'تحلیل و بهبود چهره';
        await handleSendToBackend(uri, defaultText);
      }
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  /* =======================================================
     TAKE LIVE PHOTO
  ======================================================= */

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setCapturedImage(photo.uri);
        setCameraMode('photo');
        setIsScanning(true);
        setAnalysisDone(false);
        setMessages([]);

        const defaultText = prompt.trim() || 'تحلیل و بهبود چهره';
        await handleSendToBackend(photo.uri, defaultText);
      }
    } catch (error) {
      console.log('Capture error:', error);
    }
  };

  /* =======================================================
     SWITCH CAMERA
  ======================================================= */

  const switchCamera = () => {
    setCameraFacing((current) => (current === 'front' ? 'back' : 'front'));
    setFaceDetected(false);
    setTimeout(() => {
      setFaceDetected(true);
    }, 900);
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetAll = () => {
    setCapturedImage(null);
    setCameraMode('live');
    setIsScanning(false);
    setAnalysisDone(false);
    setShowBefore(false);
    setShowTools(false);
    setPrompt('');
    setMessages([]);
    setGelAmount(0);
    setActiveSuggestion(null);
    setSimulation({ active: false, intensity: 0.5 });
    setFaceDetected(false);
    setApiResponse(null);
    setRecommendation(null);
    setFilteredImage(null);
    setOriginalImage(null);
    setThreeDPreview(null);
    setManualEdits({});
    setEditBase(null);
    setShowEditPanel(false);

    setTimeout(() => {
      setFaceDetected(true);
    }, 1200);
  };

  /* =======================================================
     SELECT PART
  ======================================================= */

  const selectPart = (part: FacePart) => {
    setSelectedPart(part);
    setShowTools(true);
  };

  /* =======================================================
     SETTINGS
  ======================================================= */

  const changeSetting = (key: keyof FaceSettings, amount: number) => {
    setSettings((prev) => {
      const current = prev[selectedPart];
      const nextValue = Math.min(1.5, Math.max(0.5, current[key] + amount));
      return {
        ...prev,
        [selectedPart]: {
          ...current,
          [key]: nextValue,
        },
      };
    });
  };

  /* =======================================================
     RESET SELECTED PART
  ======================================================= */

  const resetSelectedPart = () => {
    setSettings((prev) => ({
      ...prev,
      [selectedPart]: { ...DEFAULT_SETTINGS },
    }));
  };

  /* =======================================================
     AI SUGGESTION
  ======================================================= */

  const selectSuggestion = (suggestion: Suggestion) => {
    setActiveSuggestion(suggestion.id);
    setSelectedPart(suggestion.part);
    setPrompt(suggestion.prompt);
    if (suggestion.gel !== undefined) {
      setGelAmount(suggestion.gel);
    }
    setShowTools(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        text: suggestion.prompt,
      },
    ]);
  };

  /* =======================================================
     SEND AI PROMPT
  ======================================================= */

  /* 🎯 تشخیص ناحیه هدف از متن کاربر — برای قاب AI Scan روی همان ناحیه */
  const detectScanTarget = (text: string): FacePart | null => {
    const t = text.toLowerCase();
    if (/بینی|دماغ|نوک|پل بینی|nose|tip/.test(t)) return 'nose';
    if (/لب|فیلر لب|lip/.test(t)) return 'lips';
    if (/گونه|چهره گونه|cheek/.test(t)) return 'cheeks';
    if (/چشم|اطراف چشم|eye/.test(t)) return 'eyes';
    if (/پیشانی|forehead/.test(t)) return 'forehead';
    if (/فک|jaw/.test(t)) return 'jaw';
    if (/چانه|chin/.test(t)) return 'chin';
    if (/صورت|کل چهره|face|پوست|جوان/.test(t)) return 'face';
    return null;
  };

  const handleSendPrompt = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        text: cleanPrompt,
        time: nowFa(),
      },
    ]);

    setIsAIProcessing(true);
    setPrompt('');

    // 🎯 اگر کاربر ناحیه خاصی گفت، اسکن فقط روی همان ناحیه قفل شود
    setScanTarget(detectScanTarget(cleanPrompt));

    if (capturedImage) {
      await handleSendToBackend(capturedImage, cleanPrompt);
    } else {
      // 💬 مغز مکالمه سمت سرور — سلام/سؤال/شوخی/... جواب دوستانه میگیرد
      const chatRes = await sendChatMessage(cleanPrompt, { hasPhoto: false });
      if (chatRes.reply && !chatRes.is_edit_request) {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), type: 'ai', text: chatRes.reply!, time: nowFa() },
        ]);
      } else {
        // fallback محلی (سرور نبود یا درخواست ادیت بدون عکس بود)
        await new Promise((resolve) => setTimeout(resolve, 1300));
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            text: 'اوکی رفیق! 🙌\nفقط یه عکس ازت لازم دارم — بگیر از خودت یه سلفی یا از گالری انتخاب کن، بذار ببینیم قراره چی بشی! 😍',
            time: nowFa(),
          },
        ]);
      }
    }

    setIsAIProcessing(false);
  };

  /* =======================================================
     APPLY SIMULATION
  ======================================================= */

  const applySimulation = async () => {
    setIsAIProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsAIProcessing(false);

    setSimulation({
      active: true,
      intensity: 0.72,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'ai',
        text: 'تمومه! اینم از نتیجه ✨\nچطوره؟ اگه دوستش نداری بگو دوباره بزنم — ولی نظر خودت مهمه، پزشک فقط آخرش تأیید نهایی رو میده 😉',
        time: nowFa(),
      },
    ]);
  };

  /* =======================================================
     SELECTED PART INFO
  ======================================================= */

  const selectedPartInfo = useMemo(
    () => PARTS.find((item) => item.id === selectedPart),
    [selectedPart]
  );

  /* =======================================================
     PERMISSION LOADING
  ======================================================= */

  if (!cameraPermission) {
    return (
      <View style={styles.permissionScreen}>
        <ActivityIndicator size="large" color="#FF6EC7" />
        <Text style={styles.permissionText}>در حال آماده‌سازی دوربین...</Text>
      </View>
    );
  }

  /* =======================================================
     PERMISSION DENIED
  ======================================================= */

  if (!cameraPermission.granted) {
    return (
      <LinearGradient colors={['#1E1038', '#2A1846', '#12081F']} style={styles.container}>
        <SafeAreaView style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Camera size={38} color="#FF6EC7" />
          </View>
          <Text style={styles.permissionTitle}>دسترسی به دوربین</Text>
          <Text style={styles.permissionDescription}>
            برای استفاده از Live Beauty Studio باید اجازه دسترسی به دوربین را فعال کنید.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>فعال کردن دوربین</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  /* =======================================================
     START / CAMERA SCREEN
  ======================================================= */

  if (!capturedImage && cameraMode === 'live') {
    return (
      <View style={styles.cameraRoot}>
        <StatusBar barStyle="light-content" backgroundColor="#12081F" />
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={cameraFacing}
          onCameraReady={() => setCameraReady(true)}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.72)', 'transparent', 'rgba(0,0,0,0.85)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <SafeAreaView style={styles.cameraSafeArea}>
          {/* HEADER */}
          <View style={styles.liveHeader}>
            <View>
              <Text style={styles.liveLogo}>BUTI</Text>
              <Text style={styles.liveLogoSub}>BEAUTY INTELLIGENCE</Text>
            </View>
            <View style={styles.liveStatus}>
              <View style={styles.liveGreenDot} />
              <Text style={styles.liveStatusText}>LIVE AI</Text>
            </View>
          </View>

          {/* FACE FRAME */}
          <View style={styles.liveCenter}>
            <Animated.View
              style={[
                styles.liveFaceFrame,
                {
                  transform: [{ scale: pulseAnimation }],
                },
              ]}
            >
              <View style={styles.frameCornerTL} />
              <View style={styles.frameCornerTR} />
              <View style={styles.frameCornerBL} />
              <View style={styles.frameCornerBR} />
            </Animated.View>
            <View style={styles.faceDetectionBadge}>
              <ScanFace size={14} color="#FF6EC7" />
              <Text style={styles.faceDetectionText}>
                {faceDetected ? 'Face detected' : 'Looking for face...'}
              </Text>
              {faceDetected && <Check size={12} color="#5EDBC4" />}
            </View>
          </View>

          {/* CAMERA CONTROLS */}
          <View style={styles.cameraBottom}>
            <TouchableOpacity style={styles.cameraSecondaryButton} onPress={handlePickImage}>
              <ImageIcon size={19} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture} activeOpacity={0.8}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraSecondaryButton} onPress={switchCamera}>
              <RefreshCw size={19} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.liveBottomText}>
              <Sparkles size={12} color="#FF6EC7" />
              <Text style={styles.liveBottomTextValue}>چهره را داخل کادر قرار بده</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  /* =======================================================
     PHOTO / STUDIO
  ======================================================= */

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <LinearGradient colors={['#1C0F33', '#281748', '#12081F']} style={StyleSheet.absoluteFill} />
        {/* ✨ پس‌زمینه زنده: هاله‌های شناور + ذرات درخشان */}
        <AnimatedBackground particles={12} />
        {/* ambient top glow */}
        <View style={styles.ambientGlow} pointerEvents="none" />
        <SafeAreaView style={styles.safeArea}>
          {/* HEADER */}
          <View style={styles.analysisHeader}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => {
                resetAll();
                router.back();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.headerIconChip}>
                <ArrowLeft size={15} color="#FFB3E2" strokeWidth={2} />
              </View>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.analysisTitle}>BUTI AI Studio</Text>
              <View style={styles.analysisMode}>
                <View style={[styles.modeDot, isScanning && styles.modeDotBusy]} />
                <Text style={styles.modeText}>
                  {isScanning ? 'Analyzing…' : analysisDone ? '3D Model Ready' : 'AI Beauty Studio'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={resetAll} activeOpacity={0.7}>
              <X size={15} color="#C9C9CE" />
            </TouchableOpacity>
          </View>

          {/* 3D STAGE */}
          <View style={styles.faceStage}>
            <View style={styles.stageCard}>
              {/* gradient border glow */}
              <LinearGradient
                colors={['rgba(232,193,112,0.45)', 'rgba(232,193,112,0.06)', 'rgba(94,219,196,0.25)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.stageBorder}
              />
              <View style={styles.stageInner}>
                {(filteredImage ?? originalImage) ? (
                  /* ✅ BEFORE/AFTER: «اصلی» = عکس خام، «نتیجه» = ادیت‌شده */
                  <RNImage
                    source={{
                      uri:
                        showBefore
                          ? (originalImage
                              ? `data:image/jpeg;base64,${originalImage}`
                              : (capturedImage ?? ''))
                          : `data:image/jpeg;base64,${filteredImage ?? originalImage}`,
                    }}
                    style={styles.filteredPhoto}
                    resizeMode="cover"
                  />
                ) : capturedImage ? (
                  /* scan-only state: show the original photo while waiting */
                  <RNImage
                    source={{ uri: capturedImage }}
                    style={styles.filteredPhoto}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.emptyFace}>
                    <Camera size={36} color="#4A4A52" />
                    <Text style={styles.emptyFaceText}>هنوز تصویری انتخاب نشده</Text>
                  </View>
                )}

                {/* scan line */}
                {isScanning && (
                  <Animated.View
                    style={[styles.scanLineNew, {
                      transform: [{
                        translateY: scanAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-170, 170],
                        }),
                      }],
                    }]}
                    pointerEvents="none"
                  />
                )}

                {/* face markers */}
                {!isScanning && analysisDone && !showBefore && (
                  <>
                    <FaceMarker style={{ top: '36%', left: '25%' }} />
                    <FaceMarker style={{ top: '36%', right: '25%' }} />
                    <FaceMarker style={{ top: '53%', left: '47%' }} />
                    <FaceMarker style={{ top: '64%', left: '42%' }} />
                  </>
                )}

                {/* simulation overlay */}
                {simulation.active && simulationMode && (
                  <SimulationOverlay part={selectedPart} intensity={simulation.intensity} />
                )}
              </View>

              {/* status pill on top of stage */}
              <View style={styles.stageStatusPill} pointerEvents="none">
                {isScanning ? (
                  <>
                    <ActivityIndicator size={8} color="#FF6EC7" />
                    <Text style={styles.stageStatusText}>Scanning…</Text>
                  </>
                ) : analysisDone ? (
                  <>
                    <Check size={10} color="#5EDBC4" />
                    <Text style={[styles.stageStatusText, { color: '#A8F0E2' }]}>3D Ready</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={10} color="#FF6EC7" />
                    <Text style={styles.stageStatusText}>Waiting</Text>
                  </>
                )}
              </View>
            </View>

            {/* before/after badge */}
            {analysisDone && (
              <View style={styles.completedBadge}>
                <Check size={11} color="#FF6EC7" />
                <Text style={styles.completedText}>Face Scan Complete</Text>
              </View>
            )}
          </View>

          {/* ACTIONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.smallAction, showBefore && styles.smallActionActive]}
              onPress={() => setShowBefore(!showBefore)}
              onPressIn={() => setShowBefore(true)}          // ✅ نگه‌دار = قبل
              onPressOut={() => setShowBefore(false)}        // ✅ رها کن = بعد
              onLongPress={() => setShowBefore(true)}
              activeOpacity={0.75}
              disabled={!(filteredImage ?? originalImage)}
            >
              <Eye size={13} color={showBefore ? '#FFB3E2' : '#B9B9C0'} />
              <Text style={[styles.smallActionText, showBefore && styles.smallActionTextActive]}>
                {showBefore ? 'قبل از ادیت' : 'بعد از ادیت'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallAction, showEditPanel && styles.smallActionActive]}
              onPress={() => setShowEditPanel(!showEditPanel)}
              activeOpacity={0.75}
            >
              <SlidersHorizontal size={13} color={showEditPanel ? '#FFB3E2' : '#B9B9C0'} />
              <Text style={[styles.smallActionText, showEditPanel && styles.smallActionTextActive]}>
                ادیت دستی
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallAction} onPress={handlePickImage} activeOpacity={0.75}>
              <ImageIcon size={13} color="#B9B9C0" />
              <Text style={styles.smallActionText}>گالری</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallAction} onPress={switchCamera} activeOpacity={0.75}>
              <RefreshCw size={13} color="#B9B9C0" />
              <Text style={styles.smallActionText}>دوربین</Text>
            </TouchableOpacity>
          </View>

          {/* ═══ MANUAL EDIT PANEL ═══ */}
          {showEditPanel && capturedImage && (
            <View style={styles.editPanel}>
              <View style={styles.editPanelHead}>
                <Text style={styles.editPanelTitle}>ادیت دستی</Text>
                <TouchableOpacity onPress={resetEdits}>
                  <RotateCcw size={13} color="#9999A0" />
                </TouchableOpacity>
              </View>

              {EDIT_AREAS.map((area) => {
                const val = manualEdits[area.key] ?? 0;
                return (
                  <View key={area.key} style={styles.editRow}>
                    <Text style={styles.editLabel}>
                      {area.emoji} {area.label}
                    </Text>
                    {/* stepper: − / value / + */}
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => changeEdit(area.key, -10)}
                        activeOpacity={0.6}
                      >
                        <Minus size={12} color="#FFF" />
                      </TouchableOpacity>
                      <View style={styles.trackWrap}>
                        {/* track */}
                        <View style={styles.track} pointerEvents="none" />
                        {/* center notch */}
                        <View style={styles.notch} pointerEvents="none" />
                        {/* fill from center */}
                        <View
                          style={[
                            styles.fill,
                            val >= 0 ? styles.fillRight : styles.fillLeft,
                            { width: `${Math.abs(val) / 2}%` },
                          ]}
                          pointerEvents="none"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => changeEdit(area.key, 10)}
                        activeOpacity={0.6}
                      >
                        <Plus size={12} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={[
                        styles.editVal,
                        val > 0 && styles.editValPos,
                        val < 0 && styles.editValNeg,
                      ]}
                    >
                      {val > 0 ? `+${val}` : val}
                    </Text>
                  </View>
                );
              })}

              <TouchableOpacity
                style={[styles.applyEditBtn, isEditing && styles.sendButtonDisabled]}
                disabled={isEditing || !Object.values(manualEdits).some((v) => Math.abs(v) >= 1)}
                onPress={applyManualEdits}
                activeOpacity={0.85}
              >
                {isEditing ? (
                  <ActivityIndicator size="small" color="#1A1420" />
                ) : (
                  <>
                    <Wand2 size={13} color="#1A1420" />
                    <Text style={styles.applyEditText}>اعمال تغییرات</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!isScanning && (
            <ScrollView
              ref={chatScrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* ═══ 💬 CHAT HEADER — معرفی مشاور ═══ */}
              <View style={styles.chatHeaderCard}>
                <View style={styles.aiAvatarWrap}>
                  <LinearGradient
                    colors={['#F0CD8B', '#B08040']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiAvatarGradient}
                  >
                    <Sparkles size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.aiOnlineDot} />
                </View>
                <View style={styles.chatHeaderTextWrap}>
                  <Text style={styles.chatHeaderName}>بوتی‌ام</Text>
                  <Text style={styles.chatHeaderStatus}>
                    {isAIProcessing ? 'دارم فکر می‌کنم… 🤔' : 'رفیق زیبایی‌ت • همیشه آنلاین 💬'}
                  </Text>
                </View>
                <Clock size={12} color="#55555C" />
              </View>

              {/* ═══ SUGGESTIONS — compact chips, single row ═══ */}
              {showSuggestions && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.suggestionScroll}
                >
                  {AI_SUGGESTIONS.map((s) => {
                    const active = activeSuggestion === s.id;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        activeOpacity={0.8}
                        onPress={() => selectSuggestion(s)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={styles.chipEmoji}>{s.icon}</Text>
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {s.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* ═══ ⏳ SKELETON — لودینگ دوستانه موقع اسکن اولیه ═══ */}
              {isScanning && messages.length === 0 && <ChatSkeleton />}

              {/* ═══ MESSAGES — full history, avatar + timestamp ═══ */}
              {!isScanning && messages.length > 0 && (
                <View style={styles.messagesContainer}>
                  {messages.map((message) => {
                    const isUser = message.type === 'user';
                    return (
                      <View
                        key={message.id}
                        style={[
                          styles.messageRow,
                          isUser ? styles.userRow : styles.aiRow,
                        ]}
                      >
                        {!isUser && (
                          <View style={styles.msgAiAvatar}>
                            <Sparkle size={10} color="#FFB3E2" />
                          </View>
                        )}
                        <View
                          style={[
                            styles.messageBubble,
                            isUser ? styles.userMessage : styles.aiMessage,
                            message.image && styles.messageWithImage,
                          ]}
                        >
                          {/* 🖼️ تصویر تولیدشده داخل حباب */}
                          {message.image && (
                            <>
                              <RNImage
                                source={{
                                  uri: message.image.startsWith('data:')
                                    ? message.image
                                    : `data:image/jpeg;base64,${message.image}`,
                                }}
                                style={styles.bubbleImage}
                                resizeMode="cover"
                              />
                              {message.imageLabel && (
                                <View style={styles.bubbleImageTag}>
                                  <Sparkles size={8} color="#F0CD8B" />
                                  <Text style={styles.bubbleImageTagText}>
                                    {message.imageLabel}
                                  </Text>
                                </View>
                              )}
                            </>
                          )}

                          <Text
                            style={[
                              styles.messageText,
                              isUser ? styles.userMessageText : styles.aiMessageText,
                            ]}
                          >
                            {message.text}
                          </Text>
                          <Text style={styles.messageTime}>{message.time ?? ''}</Text>
                        </View>
                      </View>
                    );
                  })}

                  {/* ⌨️ TYPING INDICATOR — سه‌نقطه موج‌دار */}
                  {isAIProcessing && (
                    <View style={styles.aiRow}>
                      <View style={styles.msgAiAvatar}>
                        <Sparkle size={10} color="#FFB3E2" />
                      </View>
                      <View style={[styles.messageBubble, styles.aiMessage]}>
                        <View style={styles.typingRow}>
                          {[0, 1, 2].map((i) => (
                            <Animated.View
                              key={i}
                              style={[
                                styles.typingDot,
                                {
                                  opacity: typingDots.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.25, 1],
                                  }),
                                  transform: [
                                    {
                                      translateY: typingDots.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -3 * Math.sin((Math.PI * i) / 2)],
                                      }),
                                    },
                                  ],
                                },
                              ]}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* ═══ 💬 QUICK REPLIES — یک ضربه تا درخواست ═══ */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickReplyScroll}
              >
                {QUICK_REPLIES.map((q) => (
                  <TouchableOpacity
                    key={q.label}
                    style={styles.quickReplyChip}
                    activeOpacity={0.75}
                    onPress={() => {
                      setPrompt(q.prompt);
                    }}
                  >
                    <Text style={styles.quickReplyEmoji}>{q.emoji}</Text>
                    <Text style={styles.quickReplyLabel}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* ═══ PROMPT — floating composer ═══ */}
              <View style={styles.promptContainer}>
                <TextInput
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="مثلاً: لب‌هام رو پرتر کن…"
                  placeholderTextColor="#5A5A63"
                  multiline
                  textAlign="right"
                  textAlignVertical="top"
                  style={styles.promptInput}
                  onSubmitEditing={handleSendPrompt}
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!prompt.trim() || isAIProcessing) && styles.sendButtonDisabled]}
                  disabled={!prompt.trim() || isAIProcessing}
                  onPress={handleSendPrompt}
                  activeOpacity={0.85}
                >
                  {isAIProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Send size={15} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>

              {/* ═══ AI PROCESSING — slim inline indicator ═══ */}
              {isAIProcessing && (
                <View style={styles.aiProcessingRow}>
                  <ActivityIndicator size="small" color="#FF6EC7" />
                  <Text style={styles.aiProcessingText}>چند لحظه صبر کن، داری قشنگ‌تر میشی… ✨</Text>
                </View>
              )}

              {/* ═══ DOCTOR RECOMMENDATION — conversion card ═══ */}
              {recommendation?.doctor && (
                <DoctorCard
                  recommendation={recommendation}
                  areaFa={recommendation.service ? AREA_FA[recommendation.service.area] ?? recommendation.service.area : undefined}
                  onPressCta={() => {
                    const d = recommendation.doctor!;
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        type: 'user',
                        text: 'می‌خوام مشاوره رایگان رزرو کنم',
                      },
                      {
                        id: (Date.now() + 1).toString(),
                        type: 'ai',
                        text: `عالیه! درخواست مشاوره شما با ${d.name} ثبت شد ✅\nکلینیک: ${d.clinic}\nبه‌زودی با شما تماس می‌گیریم تا زمان مشاوره حضوری رو هماهنگ کنیم. 🌸`,
                      },
                    ]);
                  }}
                />
              )}

              {/* ═══ SAFETY — minimal footer note ═══ */}
              <View style={styles.safetyNote}>
                <ShieldCheck size={12} color="#4E8578" />
                <Text style={styles.safetyNoteText}>
                  شبیه‌سازی بصری است و جایگزین نظر پزشک نمی‌شود
                </Text>
              </View>

              {/* ═══ BOTTOM ACTIONS ═══ */}
              <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.resetAllButton} onPress={resetAll}>
                  <Layers size={14} color="#BFC0C6" />
                  <Text style={styles.resetAllText}>تصویر جدید</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.simulateButton, filteredImage && styles.simulateButtonHidden]}
                  activeOpacity={0.9}
                  onPress={applySimulation}
                >
                  <LinearGradient colors={['#FF6EC7', '#B84DD8']} style={styles.simulateGradient}>
                    <Wand2 size={15} color="#FFFFFF" />
                    <Text style={styles.simulateText}>اعمال شبیه‌سازی</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   DOCTOR CARD — پیشنهاد پزشک + برآورد هزینه + CTA رزرو
========================================================= */

function DoctorCard({
  recommendation,
  areaFa,
  onPressCta,
}: {
  recommendation: Recommendation;
  areaFa?: string;
  onPressCta: () => void;
}) {
  const { doctor, service, estimated_price, gel_cc } = recommendation;
  if (!doctor) return null;

  return (
    <View style={styles.docCard}>
      {/* header */}
      <View style={styles.docHeader}>
        <View style={styles.docBadge}>
          <Stethoscope size={13} color="#FFB3E2" />
          <Text style={styles.docBadgeText}>پیشنهاد متخصص</Text>
        </View>
        {areaFa && <Text style={styles.docArea}>{areaFa}</Text>}
      </View>

      {/* doctor row */}
      <View style={styles.docRow}>
        <View style={styles.docAvatar}>
          <Text style={styles.docAvatarText}>{doctor.name.replace('دکتر ', 'د.').slice(0, 2)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.docName}>{doctor.name}</Text>
          <Text style={styles.docSpec}>{doctor.specialty}</Text>
          <View style={styles.docMetaRow}>
            <Star size={10} color="#F5C518" fill="#F5C518" />
            <Text style={styles.docRating}>{doctor.rating.toFixed(1)}</Text>
            <Text style={styles.docReviews}>({doctor.review_count} نظر)</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.docExp}>{doctor.experience_years} سال تجربه</Text>
          </View>
        </View>
      </View>

      {/* service + price */}
      {service && (
        <View style={styles.serviceBox}>
          <View style={styles.serviceRow}>
            <Sparkles size={11} color="#FF6EC7" />
            <Text style={styles.serviceTitle}>{service.title}</Text>
          </View>
          <View style={styles.priceRow}>
            {gel_cc ? (
              <Text style={styles.priceLabel}>
                {gel_cc.toLocaleString('fa-IR')} سی‌سی — جلسه واحد
              </Text>
            ) : (
              <Text style={styles.priceLabel}>
                {service.sessions} جلسه • ~{service.duration_min} دقیقه
              </Text>
            )}
            {estimated_price && (
              <Text style={styles.priceValue}>
                {formatToman(estimated_price.min)} تا {formatToman(estimated_price.max)}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={onPressCta}>
        <LinearGradient colors={['#FF6EC7', '#B84DD8']} style={styles.ctaGradient}>
          <CalendarCheck size={15} color="#FFFFFF" />
          <Text style={styles.ctaText}>{recommendation.cta?.text ?? 'رزرو مشاوره رایگان'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.docDisclaimer}>
        مشاوره اولیه رایگان است؛ قیمت نهایی پس از معاینه حضوری اعلام می‌شود.
      </Text>
    </View>
  );
}

/* =========================================================
   SIMULATION OVERLAY
========================================================= */

function SimulationOverlay({ part, intensity }: { part: FacePart; intensity: number }) {
  const opacity = Math.min(0.65, 0.15 + intensity * 0.45);

  if (part === 'lips') {
    return (
      <View pointerEvents="none" style={styles.simulationLips}>
        <View
          style={[
            styles.lipUpper,
            {
              opacity,
              transform: [{ scaleX: 1 + intensity * 0.12 }],
            },
          ]}
        />
        <View
          style={[
            styles.lipLower,
            {
              opacity,
              transform: [{ scaleX: 1 + intensity * 0.16 }, { scaleY: 1 + intensity * 0.08 }],
            },
          ]}
        />
      </View>
    );
  }

  if (part === 'cheeks') {
    return (
      <>
        <View
          pointerEvents="none"
          style={[styles.cheekGlow, styles.cheekLeft, { opacity, transform: [{ scale: 1 + intensity * 0.15 }] }]}
        />
        <View
          pointerEvents="none"
          style={[styles.cheekGlow, styles.cheekRight, { opacity, transform: [{ scale: 1 + intensity * 0.15 }] }]}
        />
      </>
    );
  }

  if (part === 'jaw') {
    return <View pointerEvents="none" style={[styles.jawOverlay, { opacity }]} />;
  }

  if (part === 'chin') {
    return (
      <View
        pointerEvents="none"
        style={[styles.chinOverlay, { opacity, transform: [{ scale: 1 + intensity * 0.12 }] }]}
      />
    );
  }

  if (part === 'nose') {
    return <View pointerEvents="none" style={[styles.noseOverlay, { opacity }]} />;
  }

  if (part === 'eyes') {
    return (
      <>
        <View pointerEvents="none" style={[styles.eyeGlow, styles.eyeLeft, { opacity }]} />
        <View pointerEvents="none" style={[styles.eyeGlow, styles.eyeRight, { opacity }]} />
      </>
    );
  }

  return <View pointerEvents="none" style={[styles.fullFaceOverlay, { opacity }]} />;
}

/* =========================================================
   FACE MARKER
========================================================= */

function FaceMarker({ style }: { style: any }) {
  return (
    <View style={[styles.faceMarker, style]}>
      <View style={styles.faceMarkerDot} />
    </View>
  );
}

/* =========================================================
   BEAUTY CONTROL
========================================================= */

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12081F' },
  cameraRoot: { flex: 1, backgroundColor: '#12081F' },
  safeArea: { flex: 1 },
  cameraSafeArea: { flex: 1 },
  scrollContent: { paddingBottom: 30 },

  permissionScreen: {
    flex: 1,
    backgroundColor: '#12081F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: { color: '#A8A8AE', fontSize: 12, marginTop: 14 },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  permissionIcon: {
    width: 85,
    height: 85,
    borderRadius: 28,
    backgroundColor: 'rgba(232,193,112,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(232,193,112,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 22 },
  permissionDescription: { color: '#77777F', fontSize: 11, lineHeight: 20, textAlign: 'center', marginTop: 10 },
  permissionButton: {
    marginTop: 25,
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B87598',
  },
  permissionButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  liveHeader: { paddingHorizontal: 22, paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveLogo: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  liveLogoSub: { color: '#A3A3AA', fontSize: 7, letterSpacing: 2, marginTop: 3 },
  liveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  liveGreenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5EDBC4' },
  liveStatusText: { color: '#D4D4D8', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  liveCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  liveFaceFrame: {
    width: width * 0.72,
    height: height * 0.48,
    borderRadius: width * 0.36,
    borderWidth: 1,
    borderColor: 'rgba(232,193,112,0.35)',
  },
  frameCornerTL: {
    position: 'absolute',
    width: 35,
    height: 35,
    left: -1,
    top: -1,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: '#FF6EC7',
    borderTopLeftRadius: 14,
  },
  frameCornerTR: {
    position: 'absolute',
    width: 35,
    height: 35,
    right: -1,
    top: -1,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: '#FF6EC7',
    borderTopRightRadius: 14,
  },
  frameCornerBL: {
    position: 'absolute',
    width: 35,
    height: 35,
    left: -1,
    bottom: -1,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FF6EC7',
    borderBottomLeftRadius: 14,
  },
  frameCornerBR: {
    position: 'absolute',
    width: 35,
    height: 35,
    right: -1,
    bottom: -1,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FF6EC7',
    borderBottomRightRadius: 14,
  },
  faceDetectionBadge: {
    marginTop: 22,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.48)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  faceDetectionText: { color: '#E3E3E6', fontSize: 9 },
  cameraBottom: { alignItems: 'center', paddingBottom: 20 },
  cameraSecondaryButton: {
    position: 'absolute',
    bottom: 22,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  captureButton: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF' },
  liveBottomText: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  liveBottomTextValue: { color: '#C9C9CE', fontSize: 8 },

  analysisHeader: { height: 58, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCenter: { alignItems: 'center' },
  analysisTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  analysisMode: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  modeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#5EDBC4' },
  modeText: { color: '#77777F', fontSize: 7 },
  closeButton: { width: 31, height: 31, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  ambientGlow: {
    position: 'absolute',
    top: -140,
    alignSelf: 'center',
    width: width * 1.1,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(232,193,112,0.07)',
  },
  headerIconButton: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  headerIconChip: { alignItems: 'center', justifyContent: 'center' },
  stageCard: {
    width: width * 0.86,
    height: 340,
    borderRadius: 28,
    padding: 1.5,
    position: 'relative',
  },
  stageBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 28 },
  stageInner: { flex: 1, borderRadius: 27, overflow: 'hidden', backgroundColor: '#191512' },
  filteredPhoto: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  stageStatusPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(8,8,10,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  stageStatusText: { color: '#C9C9CE', fontSize: 8, fontWeight: '800' },
  emptyFaceText: { color: '#55555C', fontSize: 9, marginTop: 10 },
  modeDotBusy: { backgroundColor: '#E7BC5A' },
  smallActionTextActive: { color: '#FFB3E2' },

  faceStage: { height: 360, alignItems: 'center', justifyContent: 'center' },
  emptyFace: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanLineNew: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#FF6EC7', shadowColor: '#FF6EC7', shadowOpacity: 1, shadowRadius: 12 },
  completedBadge: { position: 'absolute', bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 15, backgroundColor: 'rgba(8,8,10,0.75)' },
  completedText: { color: '#D7D7DB', fontSize: 8 },

  faceMarker: { position: 'absolute', width: 17, height: 17, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(232,193,112,0.8)', alignItems: 'center', justifyContent: 'center' },
  faceMarkerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF6EC7' },

  simulationLips: { position: 'absolute', left: '50%', top: '62%', width: 65, height: 35, marginLeft: -32, marginTop: -17, alignItems: 'center', justifyContent: 'center' },
  lipUpper: { position: 'absolute', width: 48, height: 12, borderRadius: 20, backgroundColor: 'rgba(240,205,139,0.42)', top: 7 },
  lipLower: { position: 'absolute', width: 54, height: 14, borderRadius: 20, backgroundColor: 'rgba(255,158,125,0.46)', bottom: 3 },
  cheekGlow: { position: 'absolute', width: 50, height: 30, borderRadius: 30, backgroundColor: 'rgba(255,158,125,0.25)' },
  cheekLeft: { left: '13%', top: '50%' },
  cheekRight: { right: '13%', top: '50%' },
  jawOverlay: { position: 'absolute', left: '17%', right: '17%', bottom: '19%', height: 25, borderBottomWidth: 4, borderColor: 'rgba(240,205,139,0.30)', borderRadius: 50 },
  chinOverlay: { position: 'absolute', left: '40%', top: '69%', width: 50, height: 35, marginLeft: -25, borderRadius: 25, backgroundColor: 'rgba(240,205,139,0.22)' },
  noseOverlay: { position: 'absolute', left: '43%', top: '46%', width: 34, height: 45, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(232,193,112,0.24)' },
  eyeGlow: { position: 'absolute', width: 42, height: 17, borderRadius: 20, backgroundColor: 'rgba(243,221,174,0.22)' },
  eyeLeft: { left: '18%', top: '36%' },
  eyeRight: { right: '18%', top: '36%' },
  fullFaceOverlay: { position: 'absolute', left: '9%', right: '9%', top: '7%', bottom: '7%', borderRadius: 150, borderWidth: 2, borderColor: 'rgba(232,193,112,0.18)' },

  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  smallAction: { height: 35, paddingHorizontal: 12, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.055)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  smallActionActive: { backgroundColor: 'rgba(232,193,112,0.15)', borderColor: 'rgba(232,193,112,0.35)' },
  smallActionText: { color: '#C7C7CC', fontSize: 8, fontWeight: '700' },

  /* ═══ NEW CLEAN UI ═══ */
  suggestionScroll: { paddingHorizontal: 16, gap: 7, marginTop: 10, paddingBottom: 2 },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: {
    backgroundColor: 'rgba(232,193,112,0.16)',
    borderColor: 'rgba(232,193,112,0.5)',
  },
  chipEmoji: { fontSize: 12 },
  chipText: { color: '#B9B9C0', fontSize: 9, fontWeight: '600' },
  chipTextActive: { color: '#FFB3E2' },

  /* ═══ 💬 PRO CHAT UI ═══ */
  chatHeaderCard: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(232,193,112,0.18)',
  },
  aiAvatarWrap: { position: 'relative' },
  aiAvatarGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiOnlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#5EDBC4',
    borderWidth: 2,
    borderColor: '#211438',
  },
  chatHeaderTextWrap: { flex: 1 },
  chatHeaderName: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', textAlign: 'right' },
  chatHeaderStatus: { color: '#8A8A92', fontSize: 9, marginTop: 2, textAlign: 'right' },

  messagesContainer: { marginHorizontal: 16, marginTop: 12, gap: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  userRow: { justifyContent: 'flex-start' },
  aiRow: { justifyContent: 'flex-start' },
  msgAiAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(201,154,75,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(201,154,75,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: 6,
    borderRadius: 16,
  },
  messageWithImage: { maxWidth: '88%', padding: 8, paddingTop: 8 },
  bubbleImage: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 12,
    backgroundColor: '#191512',
    marginBottom: 8,
  },
  bubbleImageTag: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(10,8,6,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(240,205,139,0.35)',
  },
  bubbleImageTagText: { color: '#F0CD8B', fontSize: 7.5, fontWeight: '800' },
  userMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232,193,112,0.16)',
    borderColor: 'rgba(232,193,112,0.28)',
    borderWidth: 1,
    borderBottomLeftRadius: 5,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderBottomLeftRadius: 5,
  },
  messageText: { fontSize: 11, lineHeight: 19, textAlign: 'right' },
  userMessageText: { color: '#FBF3E2' },
  aiMessageText: { color: '#D6D6DC' },
  messageTime: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 7,
    textAlign: 'left',
    marginTop: 4,
  },

  typingRow: { flexDirection: 'row', gap: 4, paddingVertical: 4, paddingHorizontal: 2 },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6EC7',
  },

  quickReplyScroll: { paddingHorizontal: 16, gap: 7, marginTop: 12 },
  quickReplyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(94,219,196,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(94,219,196,0.22)',
  },
  quickReplyEmoji: { fontSize: 12 },
  quickReplyLabel: { color: '#A8F0E2', fontSize: 10, fontWeight: '700' },

  /* ═══ PROMPT COMPOSER ═══ */
  promptContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 10,
    paddingRight: 52,
    position: 'relative',
  },
  promptInput: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 18,
    minHeight: 40,
    maxHeight: 96,
    padding: 0,
    textAlignVertical: 'center',
  },
  sendButton: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6EC7',
  },

  aiProcessingRow: {
    marginHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  aiProcessingText: { color: '#A89C88', fontSize: 9 },

  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 24,
  },
  safetyNoteText: { color: '#4E8578', fontSize: 8, textAlign: 'center' },

  sendButtonDisabled: { opacity: 0.35 },
  simulateButtonHidden: { opacity: 0.45 },

  /* ═══ MANUAL EDIT PANEL ═══ */
  editPanel: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 13,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(232,193,112,0.25)',
  },
  editPanelHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  editPanelTitle: { color: '#F2F2F5', fontSize: 12, fontWeight: '800' },
  editRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 9,
    height: 38,
  },
  editLabel: { color: '#C9C9CE', fontSize: 10, width: 62, textAlign: 'right' },
  stepper: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  trackWrap: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  track: { ...StyleSheet.absoluteFillObject },
  notch: {
    position: 'absolute',
    left: '50%',
    top: -2,
    width: 2,
    height: 10,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: '#FF6EC7',
  },
  fillRight: { left: '50%' },
  fillLeft: { right: '50%' },
  editVal: { width: 34, fontSize: 10, fontWeight: '800', textAlign: 'center', color: '#88888F' },
  editValPos: { color: '#5EDBC4' },
  editValNeg: { color: '#E08CA0' },
  applyEditBtn: {
    marginTop: 12,
    height: 40,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#F0CD8B',
  },
  applyEditText: { color: '#1A1420', fontSize: 12, fontWeight: '800' },

  safetyCard: { marginHorizontal: 16, marginTop: 11, padding: 11, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: 'rgba(94,219,196,0.055)', borderWidth: 1, borderColor: 'rgba(94,219,196,0.12)' },

  docCard: { marginHorizontal: 16, marginTop: 14, padding: 13, borderRadius: 20, backgroundColor: 'rgba(232,193,112,0.06)', borderWidth: 1, borderColor: 'rgba(232,193,112,0.22)' },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  docBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(232,193,112,0.14)' },
  docBadgeText: { color: '#FFB3E2', fontSize: 8, fontWeight: '800' },
  docArea: { color: '#FF6EC7', fontSize: 10, fontWeight: '800' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(201,154,75,0.25)', borderWidth: 1.5, borderColor: '#FF6EC7', alignItems: 'center', justifyContent: 'center' },
  docAvatarText: { color: '#FFB3E2', fontSize: 13, fontWeight: '800' },
  docName: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  docSpec: { color: '#9A9AA1', fontSize: 8, marginTop: 2 },
  docMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  docRating: { color: '#F5C518', fontSize: 8, fontWeight: '800' },
  docReviews: { color: '#6B6B73', fontSize: 7 },
  dot: { color: '#55555C', fontSize: 7 },
  docExp: { color: '#8A8A92', fontSize: 7 },
  serviceBox: { marginTop: 11, padding: 10, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.25)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  serviceTitle: { color: '#E3E3E8', fontSize: 9, fontWeight: '700', flex: 1 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 },
  priceLabel: { color: '#77777F', fontSize: 8 },
  priceValue: { color: '#5EDBC4', fontSize: 9, fontWeight: '800' },
  ctaButton: { marginTop: 12, borderRadius: 14, overflow: 'hidden' },
  ctaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44 },
  ctaText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  docDisclaimer: { color: '#55555C', fontSize: 7, lineHeight: 11, textAlign: 'right', marginTop: 9 },
  safetyContent: { flex: 1 },
  safetyTitle: { color: '#A8F0E2', fontSize: 8, fontWeight: '800', textAlign: 'right' },
  safetyText: { color: '#4E8578', fontSize: 6, lineHeight: 10, marginTop: 3, textAlign: 'right' },

  bottomActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 8 : 12 },
  resetAllButton: { width: 105, height: 44, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  resetAllText: { color: '#D0D0D5', fontSize: 8, fontWeight: '700' },
  simulateButton: { flex: 1, height: 44, borderRadius: 14, overflow: 'hidden' },
  simulateGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  simulateText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
});