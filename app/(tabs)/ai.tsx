import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Image as RNImage,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Sliders, X, RotateCcw, ArrowLeft, Activity, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function AiScreen() {
  const [inputText, setInputText] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showEditTools, setShowEditTools] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  // پارامترهای تغییرات آناتومیک
  const [noseScale, setNoseScale] = useState(1);
  const [lipScale, setLipScale] = useState(1);
  const [jawScale, setJawScale] = useState(1);
  const [chinScale, setChinScale] = useState(1);

  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      // شبیه‌سازی اتمام اسکن بعد از ۳ ثانیه و نمایش باکس‌های پیشنهاد AI
      const timer = setTimeout(() => {
        setIsScanning(false);
        setAnalysisDone(true);
      }, 3000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: height * 0.45,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => clearTimeout(timer);
    } else {
      scanAnim.setValue(0);
    }
  }, [isScanning]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
        setIsScanning(true);
        setAnalysisDone(false);
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setIsScanning(false);
    setAnalysisDone(false);
    setShowEditTools(false);
    setNoseScale(1);
    setLipScale(1);
    setJawScale(1);
    setChinScale(1);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    setInputText('');
  };

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.fixedImageContainer}>
          <RNImage 
            source={{ uri: capturedImage }} 
            style={styles.fullScreenImage} 
            resizeMode="cover" 
          />

          <View style={[styles.faceOverlayMock, { transform: [{ scale: (noseScale + lipScale + jawScale + chinScale) / 4 }] }]} />

          {isScanning && (
            <Animated.View
              style={[
                styles.scannerLineContainer,
                { transform: [{ translateY: scanAnim }] },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(56, 189, 248, 0.9)', 'transparent']}
                style={styles.scannerLine}
              />
            </Animated.View>
          )}

          <LinearGradient
            colors={['rgba(15, 23, 42, 0.75)', 'transparent', 'rgba(15, 23, 42, 0.96)']}
            style={styles.gradientOverlay}
          />

          <SafeAreaView style={styles.safeArea}>
            {/* هدر بالایی */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backHomeButton} onPress={handleReset}>
                <ArrowLeft size={18} color="#FFFFFF" />
                <Text style={styles.backHomeText}>بازگشت به صفحه اصلی</Text>
              </TouchableOpacity>

              <View style={styles.headerRightActions}>
                <View style={styles.clinicalBadge}>
                  <Activity size={12} color="#38BDF8" />
                  <Text style={styles.clinicalBadgeText}>شبیه‌ساز تخصصی Paceart</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.iconButton, showEditTools && { borderColor: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.25)' }]} 
                  onPress={() => setShowEditTools(!showEditTools)}
                >
                  <Sliders size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* پنل ابزار جراحی / تنظیمات */}
            {showEditTools && (
              <View style={styles.clinicalEditPanel}>
                <View style={styles.panelHeader}>
                  <TouchableOpacity onPress={() => setShowEditTools(false)} style={styles.closePanelBtn}>
                    <X size={16} color="#94A3B8" />
                  </TouchableOpacity>
                  <Text style={styles.panelTitle}>ماژول اصلاح آناتومی</Text>
                </View>

                <View style={styles.toolItem}>
                  <Text style={styles.toolLabel}>پل و نوک بینی</Text>
                  <Text style={styles.toolValue}>{noseScale.toFixed(2)}x</Text>
                  <View style={styles.toolControls}>
                    <TouchableOpacity onPress={() => setNoseScale(Math.max(0.7, noseScale - 0.05))} style={styles.toolBtn}><Text style={styles.toolBtnText}>-</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setNoseScale(Math.min(1.4, noseScale + 0.05))} style={styles.toolBtn}><Text style={styles.toolBtnText}>+</Text></TouchableOpacity>
                  </View>
                </View>

                <View style={styles.toolItem}>
                  <Text style={styles.toolLabel}>حجم لب (ژل/تزریق)</Text>
                  <Text style={styles.toolValue}>{lipScale.toFixed(2)}x</Text>
                  <View style={styles.toolControls}>
                    <TouchableOpacity onPress={() => setLipScale(Math.max(0.7, lipScale - 0.05))} style={styles.toolBtn}><Text style={styles.toolBtnText}>-</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setLipScale(Math.min(1.4, lipScale + 0.05))} style={styles.toolBtn}><Text style={styles.toolBtnText}>+</Text></TouchableOpacity>
                  </View>
                </View>

                <View style={styles.toolItem}>
                  <Text style={styles.toolLabel}>زاویه فک (Jawline)</Text>
                  <Text style={styles.toolValue}>{jawScale.toFixed(2)}x</Text>
                  <View style={styles.toolControls}>
                    <TouchableOpacity onPress={() => setJawScale(Math.max(0.7, jawScale - 0.05))} style={styles.toolBtn}><Text style={styles.toolBtnText}>-</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setJawScale(Math.min(1.4, jawScale + 0.05))} style={styles.toolBtn}><Text style={styles.toolBtnText}>+</Text></TouchableOpacity>
                  </View>
                </View>

                <View style={styles.toolItem}>
                  <Text style={styles.toolLabel}>پروژکشن چانه</Text>
                  <Text style={styles.toolValue}>{chinScale.toFixed(2)}x</Text>
                  <View style={styles.toolControls}>
                    <TouchableOpacity onPress={() => setChinScale(Math.max(0.7, chinScale - 0.05))} style={styles.toolBtn}><Text style={styles.toolBtnText}>-</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setChinScale(Math.min(1.4, chinScale + 0.05))} style={styles.toolBtn}><Text style={styles.toolBtnText}>+</Text></TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.resetToolsBtn}
                  onPress={() => { setNoseScale(1); setLipScale(1); setJawScale(1); setChinScale(1); }}
                >
                  <RotateCcw size={13} color="#94A3B8" />
                  <Text style={styles.resetToolsText}>بازنشانی فیلترها</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* بخش محتوای پایین صفحه شامل باکس‌های پیشنهادی هوش مصنوعی */}
            <View style={styles.bottomContent}>
              {/* باکس‌های پیشنهاد تخصصی هوش مصنوعی بعد از اتمام اسکن */}
              {analysisDone && !isScanning && (
                <View style={styles.recommendationsContainer}>
                  <View style={styles.recommendationsHeader}>
                    <Sparkles size={14} color="#38BDF8" />
                    <Text style={styles.recommendationsTitle}>توصیه‌های آنالیز هوش مصنوعی (AI Prescription)</Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
                    {/* باکس ۱: پیشنهاد تزریق ژل لب */}
                    <View style={styles.recommendationCard}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>بخش لب (Filler)</Text>
                        <CheckCircle2 size={14} color="#10B981" />
                      </View>
                      <Text style={styles.cardHighlight}>1.2 الی 1.5 سی‌سی</Text>
                      <Text style={styles.cardDesc}>برند پیشنهادی: فرمدهی طبیعی و تقارن‌سازی حاشیه‌ها</Text>
                    </View>

                    {/* باکس ۲: پیشنهاد زاویه فک */}
                    <View style={styles.recommendationCard}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>زاویه فک (Jawline)</Text>
                        <CheckCircle2 size={14} color="#10B981" />
                      </View>
                      <Text style={styles.cardHighlight}>2.5 سی‌سی (هر طرف)</Text>
                      <Text style={styles.cardDesc}>جهت تقویت زاویه گونیون و رفع افتادگی ماریونت</Text>
                    </View>

                    {/* باکس ۳: آنالیز بینی */}
                    <View style={styles.recommendationCard}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>آنالیز بینی (Rhinoplasty)</Text>
                        <CheckCircle2 size={14} color="#10B981" />
                      </View>
                      <Text style={styles.cardHighlight}>کاهش 8٪ حجم نوک</Text>
                      <Text style={styles.cardDesc}>مناسب جهت فیکس کردن چرخش زاویه بین‌لب و بینی</Text>
                    </View>
                  </ScrollView>
                </View>
              )}

              <View style={styles.chatBubbleContainer}>
                <View style={styles.chatBubble}>
                  <Text style={styles.chatText}>
                    {isScanning 
                      ? "در حال پردازش شبکه‌های عصبی و نقشه‌برداری چهره..." 
                      : "آنالیز کامل شد. مقادیر پیشنهادی سی‌سی ژل و اصلاحات در کارت‌های بالا قابل مشاهده است."}
                  </Text>
                </View>
                <View style={styles.aiAvatarBox}>
                  <ShieldCheck size={18} color="#38BDF8" />
                </View>
              </View>

              <View style={styles.mainActionRow}>
                <TouchableOpacity 
                  style={styles.galleryButton} 
                  onPress={handlePickImage}
                  activeOpacity={0.8}
                >
                  <Ionicons name="images-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.inputBar}>
                  <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.textInput}
                    placeholder="پرسش در مورد دوز پیشنهادی یا جزئیات..."
                    placeholderTextColor="#94A3B8"
                    value={inputText}
                    onChangeText={setInputText}
                    textAlign="right"
                  />
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      ) : (
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#0F172A']}
          style={styles.emptyContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          >
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <View style={styles.clinicalBadge}>
                  <View style={[styles.liveDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.clinicalBadgeText}>سیستم آماده بارگذاری</Text>
                </View>
              </View>

              <View style={styles.centerUploadContainer}>
                <View style={styles.uploadCard}>
                  <MaterialCommunityIcons name="face-recognition" size={48} color="#38BDF8" />
                  <Text style={styles.uploadTitle}>آپلود پرونده تصویربرداری صورت</Text>
                  <Text style={styles.uploadSubtitle}>جهت دریافت دوزهای دقیق تزریق و شبیه‌سازی، تصویر سوژه را انتخاب کنید.</Text>
                  
                  <TouchableOpacity 
                    style={styles.bigUploadButton} 
                    onPress={handlePickImage}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="images-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.bigUploadButtonText}>انتخاب از گالری دستگاه</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bottomContent}>
                <View style={styles.chatBubbleContainer}>
                  <View style={styles.chatBubble}>
                    <Text style={styles.chatText}>
                      برای شروع آنالیز هوشمند و دریافت دوز مصرفی، تصویر خود را انتخاب کنید.
                    </Text>
                  </View>
                  <View style={styles.aiAvatarBox}>
                    <ShieldCheck size={18} color="#38BDF8" />
                  </View>
                </View>

                <View style={styles.mainActionRow}>
                  <TouchableOpacity 
                    style={styles.galleryButton} 
                    onPress={handlePickImage}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="images-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                      <Ionicons name="send" size={16} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TextInput
                      style={styles.textInput}
                      placeholder="پیام یا دستور سیستم..."
                      placeholderTextColor="#94A3B8"
                      value={inputText}
                      onChangeText={setInputText}
                      textAlign="right"
                    />
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  emptyContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fixedImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: '#0F172A',
  },
  fullScreenImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  headerRightActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  backHomeButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  backHomeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  clinicalBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  clinicalBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  centerUploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  uploadCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    gap: 12,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  uploadSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  bigUploadButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
  },
  bigUploadButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  scannerLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    zIndex: 5,
  },
  scannerLine: {
    width: '100%',
    height: 4,
  },
  clinicalEditPanel: {
    position: 'absolute',
    top: 64,
    right: 16,
    width: 170,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    gap: 10,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 6,
  },
  panelTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  closePanelBtn: {
    padding: 2,
  },
  toolItem: {
    gap: 3,
  },
  toolLabel: {
    color: '#E2E8F0',
    fontSize: 10,
    textAlign: 'right',
  },
  toolValue: {
    color: '#38BDF8',
    fontSize: 9,
    textAlign: 'right',
    fontWeight: '600',
  },
  toolControls: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 6,
  },
  toolBtn: {
    flex: 1,
    height: 24,
    backgroundColor: '#0284C7',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  resetToolsBtn: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetToolsText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  faceOverlayMock: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  bottomContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  /* استایل‌های بخش باکس‌های پیشنهادی هوش مصنوعی */
  recommendationsContainer: {
    marginBottom: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  recommendationsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  recommendationsTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  cardsScroll: {
    gap: 8,
    paddingHorizontal: 2,
  },
  recommendationCard: {
    width: 160,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  cardHighlight: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  cardDesc: {
    color: '#94A3B8',
    fontSize: 9,
    textAlign: 'right',
    lineHeight: 14,
  },
  chatBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: 10,
    gap: 8,
  },
  chatBubble: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 10,
    maxWidth: '78%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'right',
    lineHeight: 16,
  },
  aiAvatarBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  mainActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  galleryButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 24,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    paddingHorizontal: 8,
    height: 38,
  },
});