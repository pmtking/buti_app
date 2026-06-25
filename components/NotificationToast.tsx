// src/core/components/NotificationToast.tsx
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'ai';
  onClose: () => void;
}

export const NotificationToast: React.FC<Props> = ({ visible, title, message, type = 'ai', onClose }) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // انیمیشن ورود از بالای صفحه
      Animated.spring(translateY, {
        toValue: 50,
        useNativeDriver: true,
        
      }).start();

      // بستن خودکار پس از ۴ ثانیه
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  if (!visible) return null;

  // تعیین اموجی و رنگ لبه بر اساس نوع اعلان
  const getBadgeDetails = () => {
    switch (type) {
      case 'ai': return { icon: '✨', color: '#007AFF' };
      case 'success': return { icon: '✅', color: '#34C759' };
      default: return { icon: '🔔', color: '#FF9500' };
    }
  };

  const badge = getBadgeDetails();

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }], borderColor: badge.color }]}>
      <View style={styles.contentRow}>
        <View style={styles.textWrapper}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>
        </View>
        <View style={[styles.iconBadge, { backgroundColor: `${badge.color}20` }]}>
          <Text style={{ fontSize: 18 }}>{badge.icon}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#1C1C24',
    borderRadius: 16,
    borderRightWidth: 4, // خط رنگی عمودی راست‌چین
    padding: 14,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  titleText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    fontFamily: 'YekanBakh-Bold',
  },
  messageText: {
    color: '#A0A0A5',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 3,
    fontFamily: 'YekanBakh-Regular',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});