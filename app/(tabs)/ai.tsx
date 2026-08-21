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
} from 'lucide-react-native';

// ✅ ایمپورت سرویس API
import { sendThreeDRequest, ThreeDResponse } from '../../services/api';
import ThreeDViewer from '../../components/ThreeDViewer';

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
};

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

  const [threeDData, setThreeDData] = useState<ThreeDResponse['three_d'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ThreeDResponse | null>(null);

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
          text: 'تحلیل اولیه چهره انجام شد. حالا می‌توانی تغییر موردنظرت را برای Beauty AI توضیح بدهی.',
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
        setThreeDData(result.three_d);
        setApiResponse(result);
        setAnalysisDone(true);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'ai',
            text: `✅ ${result.description}\n\n📊 تغییرات:\n• ناحیه: ${result.changes.area}\n• عمل: ${result.changes.action}\n• شدت: ${Math.round(result.changes.intensity * 100)}%`,
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
        setThreeDData(null);

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
        setThreeDData(null);

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
    setThreeDData(null);
    setApiResponse(null);

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

  const handleSendPrompt = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        text: cleanPrompt,
      },
    ]);

    setIsAIProcessing(true);
    setPrompt('');

    if (capturedImage) {
      await handleSendToBackend(capturedImage, cleanPrompt);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1300));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          text: 'متوجه شدم. لطفاً ابتدا یک تصویر آپلود کنید تا بتوانم تغییرات را شبیه‌سازی کنم.',
        },
      ]);
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
        text: 'شبیه‌سازی بصری اعمال شد. این نتیجه صرفاً برای مشاهده تقریبی تغییرات است.',
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
        <ActivityIndicator size="large" color="#D99AB9" />
        <Text style={styles.permissionText}>در حال آماده‌سازی دوربین...</Text>
      </View>
    );
  }

  /* =======================================================
     PERMISSION DENIED
  ======================================================= */

  if (!cameraPermission.granted) {
    return (
      <LinearGradient colors={['#0B0B0D', '#151117', '#0A0A0C']} style={styles.container}>
        <SafeAreaView style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Camera size={38} color="#D99AB9" />
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
        <StatusBar barStyle="light-content" backgroundColor="#050507" />
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
              <ScanFace size={14} color="#D99AB9" />
              <Text style={styles.faceDetectionText}>
                {faceDetected ? 'Face detected' : 'Looking for face...'}
              </Text>
              {faceDetected && <Check size={12} color="#82D4AD" />}
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
              <Sparkles size={12} color="#D99AB9" />
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
        <LinearGradient colors={['#0A0A0E', '#131018', '#0A0A0E']} style={StyleSheet.absoluteFill} />
        {/* ambient top glow */}
        <View style={styles.ambientGlow} pointerEvents="none" />
        <SafeAreaView style={styles.safeArea}>
          {/* HEADER */}
          <View style={styles.analysisHeader}>
            <TouchableOpacity style={styles.headerIconButton} onPress={resetAll} activeOpacity={0.7}>
              <View style={styles.headerIconChip}>
                <ArrowLeft size={15} color="#E7C6D8" strokeWidth={2} />
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
                colors={['rgba(217,154,185,0.45)', 'rgba(217,154,185,0.06)', 'rgba(130,212,173,0.25)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.stageBorder}
              />
              <View style={styles.stageInner}>
                {capturedImage ? (
                  <ThreeDViewer
                    vertices={threeDData?.vertices}
                    faces={threeDData?.faces}
                    textureBase64={
                      showBefore ? capturedImage : threeDData?.texture || capturedImage
                    }
                    isLoading={isLoading || isScanning}
                    autoRotate={analysisDone && !showBefore}
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
                    <ActivityIndicator size={8} color="#D99AB9" />
                    <Text style={styles.stageStatusText}>Scanning…</Text>
                  </>
                ) : analysisDone ? (
                  <>
                    <Check size={10} color="#82D4AD" />
                    <Text style={[styles.stageStatusText, { color: '#A9DEC6' }]}>3D Ready</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={10} color="#D99AB9" />
                    <Text style={styles.stageStatusText}>Waiting</Text>
                  </>
                )}
              </View>
            </View>

            {/* before/after badge */}
            {analysisDone && (
              <View style={styles.completedBadge}>
                <Check size={11} color="#DCA9C1" />
                <Text style={styles.completedText}>Face Scan Complete</Text>
              </View>
            )}
          </View>

          {/* ACTIONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.smallAction, showBefore && styles.smallActionActive]}
              onPress={() => setShowBefore(!showBefore)}
              activeOpacity={0.75}
            >
              <Eye size={13} color={showBefore ? '#E7BCD4' : '#B9B9C0'} />
              <Text style={[styles.smallActionText, showBefore && styles.smallActionTextActive]}>
                {showBefore ? 'نتیجه' : 'اصلی'}
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

          {!isScanning && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* AI CHAT HEADER */}
              <View style={styles.aiChatHeader}>
                <View style={styles.aiChatIcon}>
                  <Brain size={17} color="#E3B1C9" />
                </View>
                <View style={styles.aiChatTitleArea}>
                  <Text style={styles.aiChatTitle}>Beauty AI</Text>
                  <Text style={styles.aiChatSubtitle}>توضیح بده چه تغییری می‌خواهی</Text>
                </View>
                <View style={styles.aiOnlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>ONLINE</Text>
                </View>
              </View>

              {/* SUGGESTIONS */}
              {showSuggestions && (
                <View style={styles.suggestionsSection}>
                  <View style={styles.suggestionsHeader}>
                    <View>
                      <Text style={styles.suggestionsTitle}>پیشنهادهای سریع</Text>
                      <Text style={styles.suggestionsSubtitle}>برای شروع یکی را انتخاب کن</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                      <ChevronDown size={17} color="#777780" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    inverted
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestionScroll}
                  >
                    {AI_SUGGESTIONS.map((suggestion) => {
                      const active = activeSuggestion === suggestion.id;
                      return (
                        <TouchableOpacity
                          key={suggestion.id}
                          activeOpacity={0.85}
                          onPress={() => selectSuggestion(suggestion)}
                          style={[styles.suggestionCard, active && styles.suggestionCardActive]}
                        >
                          <View style={styles.suggestionIcon}>
                            <Text style={styles.suggestionEmoji}>{suggestion.icon}</Text>
                          </View>
                          <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                          <Text style={styles.suggestionDescription} numberOfLines={2}>
                            {suggestion.description}
                          </Text>
                          {suggestion.gel !== undefined && (
                            <View style={styles.gelBadge}>
                              <Text style={styles.gelBadgeText}>{suggestion.gel} cc</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* MESSAGES */}
              {messages.length > 0 && (
                <View style={styles.messagesContainer}>
                  {messages.slice(-4).map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.messageBubble,
                        message.type === 'user' ? styles.userMessage : styles.aiMessage,
                      ]}
                    >
                      {message.type === 'ai' && <Sparkles size={12} color="#D99AB9" />}
                      <Text style={styles.messageText}>{message.text}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* PROMPT */}
              <View style={styles.promptContainer}>
                <View style={styles.promptHeader}>
                  <View style={styles.promptLabelRow}>
                    <MessageCircle size={13} color="#D99AB9" />
                    <Text style={styles.promptLabel}>توضیح تغییر موردنظر</Text>
                  </View>
                  <Text style={styles.promptHint}>AI understands Persian</Text>
                </View>
                <View style={styles.promptInputWrapper}>
                  <TextInput
                    value={prompt}
                    onChangeText={setPrompt}
                    placeholder="مثلاً لب‌ها کمی پرتر و خوش‌فرم‌تر شوند..."
                    placeholderTextColor="#595960"
                    multiline
                    textAlign="right"
                    textAlignVertical="top"
                    style={styles.promptInput}
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, !prompt.trim() && styles.sendButtonDisabled]}
                    disabled={!prompt.trim() || isAIProcessing}
                    onPress={handleSendPrompt}
                  >
                    {isAIProcessing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Send size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.promptDisclaimer}>
                  این بخش برای شبیه‌سازی بصری است و جایگزین تشخیص یا توصیه پزشک نیست.
                </Text>
              </View>

              {/* SIMULATION */}
              <View style={styles.simulationPanel}>
                <View style={styles.simulationHeader}>
                  <View style={styles.simulationTitleRow}>
                    <Rotate3D size={15} color="#D99AB9" />
                    <Text style={styles.simulationTitle}>Simulation Parameters</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.simulationToggle, simulationMode && styles.simulationToggleActive]}
                    onPress={() => setSimulationMode(!simulationMode)}
                  >
                    <View
                      style={[styles.simulationToggleDot, simulationMode && styles.simulationToggleDotActive]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.simulationInfo}>
                  <Text style={styles.simulationPart}>ناحیه:</Text>
                  <Text style={styles.simulationPartValue}>{selectedPartInfo?.title}</Text>
                </View>
                {selectedPart === 'lips' && (
                  <View style={styles.gelControl}>
                    <View>
                      <Text style={styles.gelTitle}>حجم شبیه‌سازی</Text>
                      <Text style={styles.gelSubtitle}>فقط پارامتر بصری</Text>
                    </View>
                    <View style={styles.gelStepper}>
                      <TouchableOpacity
                        style={styles.gelButton}
                        onPress={() => setGelAmount(Math.max(0, gelAmount - 0.5))}
                      >
                        <Minus size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.gelValue}>
                        <Text style={styles.gelNumber}>{gelAmount.toFixed(1)}</Text>
                        <Text style={styles.gelUnit}>cc</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.gelButton}
                        onPress={() => setGelAmount(Math.min(5, gelAmount + 0.5))}
                      >
                        <Plus size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* FACE AREAS */}
              <View style={styles.partSection}>
                <View style={styles.partHeader}>
                  <View>
                    <Text style={styles.partHeaderTitle}>Face Areas</Text>
                    <Text style={styles.partHeaderSubtitle}>Select an area to customize</Text>
                  </View>
                  <TouchableOpacity style={styles.filterButton} onPress={() => setShowTools(!showTools)}>
                    <SlidersHorizontal size={15} color="#D99AB9" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  inverted
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.partScroll}
                >
                  {PARTS.map((part) => {
                    const active = selectedPart === part.id;
                    return (
                      <TouchableOpacity
                        key={part.id}
                        style={[styles.partCard, active && styles.partCardActive]}
                        onPress={() => selectPart(part.id)}
                      >
                        <Text style={[styles.partIcon, active && styles.partIconActive]}>{part.icon}</Text>
                        <Text style={[styles.partName, active && styles.partNameActive]}>{part.title}</Text>
                        <Text style={styles.partEnglish}>{part.subtitle}</Text>
                        {active && (
                          <View style={styles.activeMark}>
                            <Check size={8} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* CONTROLS */}
              {showTools && (
                <View style={styles.controls}>
                  <View style={styles.controlsHeader}>
                    <TouchableOpacity onPress={resetSelectedPart}>
                      <RotateCcw size={14} color="#9999A0" />
                    </TouchableOpacity>
                    <View>
                      <Text style={styles.controlsTitle}>{selectedPartInfo?.title}</Text>
                      <Text style={styles.controlsSub}>{selectedPartInfo?.subtitle}</Text>
                    </View>
                  </View>
                  <BeautyControl
                    title="Width"
                    value={settings[selectedPart].width}
                    onMinus={() => changeSetting('width', -0.05)}
                    onPlus={() => changeSetting('width', 0.05)}
                  />
                  <BeautyControl
                    title="Height"
                    value={settings[selectedPart].height}
                    onMinus={() => changeSetting('height', -0.05)}
                    onPlus={() => changeSetting('height', 0.05)}
                  />
                  <BeautyControl
                    title="Projection"
                    value={settings[selectedPart].projection}
                    onMinus={() => changeSetting('projection', -0.05)}
                    onPlus={() => changeSetting('projection', 0.05)}
                  />
                  <BeautyControl
                    title="Rotation"
                    value={settings[selectedPart].rotation}
                    onMinus={() => changeSetting('rotation', -0.05)}
                    onPlus={() => changeSetting('rotation', 0.05)}
                  />
                </View>
              )}

              {/* AI PROCESSING */}
              {isAIProcessing && (
                <View style={styles.aiProcessing}>
                  <Animated.View style={{ transform: [{ scale: aiPulse }] }}>
                    <Sparkles size={18} color="#D99AB9" />
                  </Animated.View>
                  <View>
                    <Text style={styles.processingTitle}>Beauty AI در حال پردازش...</Text>
                    <Text style={styles.processingSubtitle}>
                      در حال تبدیل توضیحات شما به پارامترهای شبیه‌سازی
                    </Text>
                  </View>
                </View>
              )}

              {/* SAFETY */}
              <View style={styles.safetyCard}>
                <ShieldCheck size={17} color="#82D4AD" />
                <View style={styles.safetyContent}>
                  <Text style={styles.safetyTitle}>Visual Simulation Only</Text>
                  <Text style={styles.safetyText}>
                    نتیجه نمایش‌داده‌شده یک شبیه‌سازی بصری است و نتیجه واقعی درمان را تضمین نمی‌کند.
                  </Text>
                </View>
              </View>

              {/* BOTTOM ACTIONS */}
              <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.resetAllButton} onPress={resetAll}>
                  <Layers size={15} color="#BFC0C6" />
                  <Text style={styles.resetAllText}>تصویر جدید</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.simulateButton} activeOpacity={0.9} onPress={applySimulation}>
                  <LinearGradient colors={['#C783A5', '#966581']} style={styles.simulateGradient}>
                    <Wand2 size={16} color="#FFFFFF" />
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

function BeautyControl({ title, value, onMinus, onPlus }: { title: string; value: number; onMinus: () => void; onPlus: () => void }) {
  const percentage = Math.min(100, Math.max(0, ((value - 0.5) / 1) * 100));

  return (
    <View style={styles.beautyControl}>
      <TouchableOpacity style={styles.controlCircle} onPress={onMinus}>
        <Text style={styles.minusText}>−</Text>
      </TouchableOpacity>
      <View style={styles.sliderArea}>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
        </View>
      </View>
      <TouchableOpacity style={styles.controlCircle} onPress={onPlus}>
        <Text style={styles.plusText}>+</Text>
      </TouchableOpacity>
      <View style={styles.valueArea}>
        <Text style={styles.controlName}>{title}</Text>
        <Text style={styles.controlValue}>{value.toFixed(2)}</Text>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090A0C' },
  cameraRoot: { flex: 1, backgroundColor: '#050507' },
  safeArea: { flex: 1 },
  cameraSafeArea: { flex: 1 },
  scrollContent: { paddingBottom: 30 },

  permissionScreen: {
    flex: 1,
    backgroundColor: '#090A0C',
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
    backgroundColor: 'rgba(216,137,173,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(216,137,173,0.25)',
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
  liveGreenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#80D4AB' },
  liveStatusText: { color: '#D4D4D8', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  liveCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  liveFaceFrame: {
    width: width * 0.72,
    height: height * 0.48,
    borderRadius: width * 0.36,
    borderWidth: 1,
    borderColor: 'rgba(220,170,195,0.35)',
  },
  frameCornerTL: {
    position: 'absolute',
    width: 35,
    height: 35,
    left: -1,
    top: -1,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: '#D99AB9',
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
    borderColor: '#D99AB9',
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
    borderColor: '#D99AB9',
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
    borderColor: '#D99AB9',
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
  modeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#82D4AD' },
  modeText: { color: '#77777F', fontSize: 7 },
  closeButton: { width: 31, height: 31, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  ambientGlow: {
    position: 'absolute',
    top: -140,
    alignSelf: 'center',
    width: width * 1.1,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(216,137,173,0.07)',
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
  stageInner: { flex: 1, borderRadius: 27, overflow: 'hidden', backgroundColor: '#101013' },
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
  smallActionTextActive: { color: '#E7BCD4' },

  faceStage: { height: 360, alignItems: 'center', justifyContent: 'center' },
  emptyFace: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanLineNew: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#DDA2C1', shadowColor: '#DDA2C1', shadowOpacity: 1, shadowRadius: 12 },
  completedBadge: { position: 'absolute', bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 15, backgroundColor: 'rgba(8,8,10,0.75)' },
  completedText: { color: '#D7D7DB', fontSize: 8 },

  faceMarker: { position: 'absolute', width: 17, height: 17, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(220,160,190,0.8)', alignItems: 'center', justifyContent: 'center' },
  faceMarkerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D99AB9' },

  simulationLips: { position: 'absolute', left: '50%', top: '62%', width: 65, height: 35, marginLeft: -32, marginTop: -17, alignItems: 'center', justifyContent: 'center' },
  lipUpper: { position: 'absolute', width: 48, height: 12, borderRadius: 20, backgroundColor: 'rgba(220,105,145,0.42)', top: 7 },
  lipLower: { position: 'absolute', width: 54, height: 14, borderRadius: 20, backgroundColor: 'rgba(230,116,154,0.46)', bottom: 3 },
  cheekGlow: { position: 'absolute', width: 50, height: 30, borderRadius: 30, backgroundColor: 'rgba(230,130,170,0.25)' },
  cheekLeft: { left: '13%', top: '50%' },
  cheekRight: { right: '13%', top: '50%' },
  jawOverlay: { position: 'absolute', left: '17%', right: '17%', bottom: '19%', height: 25, borderBottomWidth: 4, borderColor: 'rgba(220,145,180,0.30)', borderRadius: 50 },
  chinOverlay: { position: 'absolute', left: '40%', top: '69%', width: 50, height: 35, marginLeft: -25, borderRadius: 25, backgroundColor: 'rgba(215,145,175,0.22)' },
  noseOverlay: { position: 'absolute', left: '43%', top: '46%', width: 34, height: 45, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(220,160,190,0.24)' },
  eyeGlow: { position: 'absolute', width: 42, height: 17, borderRadius: 20, backgroundColor: 'rgba(210,170,200,0.22)' },
  eyeLeft: { left: '18%', top: '36%' },
  eyeRight: { right: '18%', top: '36%' },
  fullFaceOverlay: { position: 'absolute', left: '9%', right: '9%', top: '7%', bottom: '7%', borderRadius: 150, borderWidth: 2, borderColor: 'rgba(220,160,190,0.18)' },

  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  smallAction: { height: 35, paddingHorizontal: 12, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.055)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  smallActionActive: { backgroundColor: 'rgba(216,137,173,0.15)', borderColor: 'rgba(216,137,173,0.35)' },
  smallActionText: { color: '#C7C7CC', fontSize: 8, fontWeight: '700' },

  aiChatHeader: { marginHorizontal: 16, marginTop: 5, padding: 12, borderRadius: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(216,137,173,0.07)', borderWidth: 1, borderColor: 'rgba(216,137,173,0.16)' },
  aiChatIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: 'rgba(216,137,173,0.12)', alignItems: 'center', justifyContent: 'center' },
  aiChatTitleArea: { flex: 1, marginLeft: 10 },
  aiChatTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'right' },
  aiChatSubtitle: { color: '#77777F', fontSize: 7, marginTop: 3, textAlign: 'right' },
  aiOnlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlineDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#80D4AB' },
  onlineText: { color: '#72727A', fontSize: 6, fontWeight: '800' },

  suggestionsSection: { marginTop: 12 },
  suggestionsHeader: { paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggestionsTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', textAlign: 'right' },
  suggestionsSubtitle: { color: '#66666D', fontSize: 7, marginTop: 2, textAlign: 'right' },
  suggestionScroll: { paddingHorizontal: 16, gap: 8, marginTop: 9 },
  suggestionCard: { width: 130, minHeight: 108, borderRadius: 16, padding: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', position: 'relative' },
  suggestionCardActive: { backgroundColor: 'rgba(216,137,173,0.13)', borderColor: 'rgba(216,137,173,0.45)' },
  suggestionIcon: { width: 31, height: 31, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  suggestionEmoji: { fontSize: 16 },
  suggestionTitle: { color: '#E4E4E8', fontSize: 9, fontWeight: '800', textAlign: 'right' },
  suggestionDescription: { color: '#707078', fontSize: 7, lineHeight: 12, marginTop: 4, textAlign: 'right' },
  gelBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(216,137,173,0.18)' },
  gelBadgeText: { color: '#DCA7C0', fontSize: 6, fontWeight: '800' },

  messagesContainer: { marginHorizontal: 16, marginTop: 10, gap: 6 },
  messageBubble: { maxWidth: '90%', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 6 },
  userMessage: { alignSelf: 'flex-start', backgroundColor: 'rgba(216,137,173,0.12)', borderBottomLeftRadius: 4 },
  aiMessage: { alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.045)', borderBottomRightRadius: 4 },
  messageText: { flex: 1, color: '#BFC0C6', fontSize: 8, lineHeight: 14, textAlign: 'right' },

  promptContainer: { marginHorizontal: 16, marginTop: 11, padding: 11, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  promptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  promptLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promptLabel: { color: '#D8D8DD', fontSize: 9, fontWeight: '800' },
  promptHint: { color: '#5C5C64', fontSize: 6 },
  promptInputWrapper: { minHeight: 78, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.20)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.055)', padding: 9 },
  promptInput: { color: '#FFFFFF', fontSize: 10, lineHeight: 17, minHeight: 55, paddingRight: 3, paddingBottom: 28 },
  sendButton: { position: 'absolute', left: 8, bottom: 8, width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B87598' },
  sendButtonDisabled: { opacity: 0.35 },
  promptDisclaimer: { color: '#55555C', fontSize: 6, lineHeight: 10, marginTop: 7, textAlign: 'right' },

  simulationPanel: { marginHorizontal: 16, marginTop: 10, padding: 11, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.065)' },
  simulationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  simulationTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  simulationTitle: { color: '#D8D8DD', fontSize: 9, fontWeight: '800' },
  simulationToggle: { width: 28, height: 16, borderRadius: 8, padding: 2, backgroundColor: '#323237' },
  simulationToggleActive: { backgroundColor: 'rgba(216,137,173,0.4)' },
  simulationToggleDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#77777D' },
  simulationToggleDotActive: { alignSelf: 'flex-end', backgroundColor: '#D99AB9' },
  simulationInfo: { marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  simulationPart: { color: '#68686F', fontSize: 7 },
  simulationPartValue: { color: '#D99AB9', fontSize: 8, fontWeight: '800' },
  gelControl: { marginTop: 10, paddingTop: 9, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gelTitle: { color: '#D0D0D5', fontSize: 8, fontWeight: '800', textAlign: 'right' },
  gelSubtitle: { color: '#5E5E65', fontSize: 6, marginTop: 3, textAlign: 'right' },
  gelStepper: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  gelButton: { width: 25, height: 25, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  gelValue: { minWidth: 48, alignItems: 'center' },
  gelNumber: { color: '#D99AB9', fontSize: 13, fontWeight: '900' },
  gelUnit: { color: '#66666D', fontSize: 6, marginTop: -1 },

  partSection: { paddingTop: 13 },
  partHeader: { paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  partHeaderTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  partHeaderSubtitle: { color: '#68686F', fontSize: 7, marginTop: 2 },
  filterButton: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.055)' },
  partScroll: { gap: 7, paddingHorizontal: 16 },
  partCard: { width: 65, height: 62, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.065)', position: 'relative' },
  partCardActive: { backgroundColor: 'rgba(216,137,173,0.13)', borderColor: 'rgba(216,137,173,0.45)' },
  partIcon: { color: '#85858C', fontSize: 17 },
  partIconActive: { color: '#D99AB9' },
  partName: { color: '#9A9AA1', fontSize: 8, marginTop: 4 },
  partNameActive: { color: '#E1B0C8', fontWeight: '800' },
  partEnglish: { color: '#55555B', fontSize: 6, marginTop: 1 },
  activeMark: { position: 'absolute', right: 4, top: 4, width: 12, height: 12, borderRadius: 6, backgroundColor: '#C783A5', alignItems: 'center', justifyContent: 'center' },

  controls: { marginHorizontal: 16, marginTop: 9, padding: 10, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  controlsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  controlsTitle: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', textAlign: 'right' },
  controlsSub: { color: '#66666D', fontSize: 6, marginTop: 2, textAlign: 'right' },
  beautyControl: { height: 29, flexDirection: 'row', alignItems: 'center', gap: 6 },
  controlCircle: { width: 23, height: 23, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  minusText: { color: '#FFFFFF', fontSize: 14 },
  plusText: { color: '#FFFFFF', fontSize: 14 },
  sliderArea: { flex: 1 },
  sliderTrack: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  sliderFill: { height: '100%', borderRadius: 2, backgroundColor: '#C783A5' },
  valueArea: { width: 55, alignItems: 'flex-end' },
  controlName: { color: '#9999A1', fontSize: 7 },
  controlValue: { color: '#D99AB9', fontSize: 7, fontWeight: '800' },

  aiProcessing: { marginHorizontal: 16, marginTop: 11, padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(216,137,173,0.07)', borderWidth: 1, borderColor: 'rgba(216,137,173,0.15)' },
  processingTitle: { color: '#D8D8DD', fontSize: 8, fontWeight: '800', textAlign: 'right' },
  processingSubtitle: { color: '#696970', fontSize: 6, marginTop: 3, textAlign: 'right' },

  safetyCard: { marginHorizontal: 16, marginTop: 11, padding: 11, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: 'rgba(130,212,173,0.055)', borderWidth: 1, borderColor: 'rgba(130,212,173,0.12)' },
  safetyContent: { flex: 1 },
  safetyTitle: { color: '#B7DEC9', fontSize: 8, fontWeight: '800', textAlign: 'right' },
  safetyText: { color: '#646F69', fontSize: 6, lineHeight: 10, marginTop: 3, textAlign: 'right' },

  bottomActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 8 : 12 },
  resetAllButton: { width: 105, height: 44, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  resetAllText: { color: '#D0D0D5', fontSize: 8, fontWeight: '700' },
  simulateButton: { flex: 1, height: 44, borderRadius: 14, overflow: 'hidden' },
  simulateGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  simulateText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
});