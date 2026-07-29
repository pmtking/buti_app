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
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Sliders } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function AiScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [inputText, setInputText] = useState('');
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showEditTools, setShowEditTools] = useState(false);

  const [noseScale, setNoseScale] = useState(1);
  const [lipScale, setLipScale] = useState(1);

  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: height * 0.45,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [isScanning]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>دسترسی به دوربین برای آنالیز هوش مصنوعی نیاز است.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>اعطای دسترسی به دوربین</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo?.uri) {
          setCapturedImage(photo.uri);
          setIsScanning(true);
        }
      } catch (error) {
        console.log("Error taking picture:", error);
      }
    }
  };

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
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsScanning(false);
    setShowEditTools(false);
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

          <View style={[styles.faceOverlayMock, { transform: [{ scale: (noseScale + lipScale) / 2 }] }]} />

          {isScanning && (
            <Animated.View
              style={[
                styles.scannerLineContainer,
                { transform: [{ translateY: scanAnim }] },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(56, 189, 248, 0.8)', 'transparent']}
                style={styles.scannerLine}
              />
            </Animated.View>
          )}

          <LinearGradient
            colors={['rgba(15, 23, 42, 0.6)', 'transparent', 'rgba(15, 23, 42, 0.95)']}
            style={styles.gradientOverlay}
          />

          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.liveToggleButton} onPress={handleRetake}>
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>عکاسی / انتخاب مجدد</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.iconButton, showEditTools && { borderColor: '#38BDF8' }]} 
                onPress={() => setShowEditTools(!showEditTools)}
              >
                <Sliders size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {showEditTools && (
              <View style={styles.editToolsPanel}>
                <Text style={styles.panelTitle}>ویرایش دستی اجزای صورت</Text>
                
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>بزرگی بینی: {noseScale.toFixed(1)}x</Text>
                  <View style={styles.sliderButtons}>
                    <TouchableOpacity onPress={() => setNoseScale(Math.max(0.8, noseScale - 0.1))} style={styles.miniBtn}><Text style={styles.miniBtnText}>-</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setNoseScale(Math.min(1.5, noseScale + 0.1))} style={styles.miniBtn}><Text style={styles.miniBtnText}>+</Text></TouchableOpacity>
                  </View>
                </View>

                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>حالت لب: {lipScale.toFixed(1)}x</Text>
                  <View style={styles.sliderButtons}>
                    <TouchableOpacity onPress={() => setLipScale(Math.max(0.8, lipScale - 0.1))} style={styles.miniBtn}><Text style={styles.miniBtnText}>-</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setLipScale(Math.min(1.5, lipScale + 0.1))} style={styles.miniBtn}><Text style={styles.miniBtnText}>+</Text></TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.bottomContent}>
              <View style={styles.chatBubbleContainer}>
                <View style={styles.chatBubble}>
                  <Text style={styles.chatText}>
                    تصویر بارگذاری شد. می‌توانید جزئیات را دستی ویرایش کنید یا سوال بپرسید.
                  </Text>
                </View>
                <View style={styles.aiAvatarBox}>
                  <MaterialCommunityIcons name="robot-outline" size={20} color="#38BDF8" />
                </View>
              </View>

              <View style={styles.mainActionRow}>
                <TouchableOpacity 
                  style={styles.captureButton} 
                  onPress={handleRetake}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.inputBar}>
                  <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.textInput}
                    placeholder="سوال در مورد نتیجه..."
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
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.6)', 'transparent', 'rgba(15, 23, 42, 0.95)']}
            style={styles.gradientOverlay}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          >
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <View style={styles.liveToggleButton}>
                  <View style={[styles.liveDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.aiBadgeText}>آماده برای آنالیز</Text>
                </View>

                <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                  <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomContent}>
                <View style={styles.chatBubbleContainer}>
                  <View style={styles.chatBubble}>
                    <Text style={styles.chatText}>
                      لطفاً عکس بگیرید یا عکسی از گالری انتخاب کنید.
                    </Text>
                  </View>
                  <View style={styles.aiAvatarBox}>
                    <MaterialCommunityIcons name="robot-outline" size={20} color="#38BDF8" />
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

                  <TouchableOpacity 
                    style={styles.captureButton} 
                    onPress={handleTakePhoto}
                    activeOpacity={0.8}
                  >
                    <View style={styles.captureInnerCircle} />
                  </TouchableOpacity>

                  <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                      <Ionicons name="send" size={16} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TextInput
                      style={styles.textInput}
                      placeholder="پیام یا دستور..."
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
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  camera: {
    flex: 1,
    width: '100%',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  liveToggleButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  editToolsPanel: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    gap: 10,
    zIndex: 20,
  },
  panelTitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 4,
  },
  sliderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#0284C7',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
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
  chatBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  chatBubble: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '78%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 18,
  },
  aiAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  captureInnerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  inputBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
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
    fontSize: 13,
    paddingHorizontal: 8,
    height: 40,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});