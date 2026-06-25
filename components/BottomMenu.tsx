// src/core/components/FancyBottomMenu.tsx
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Animated, Modal } from 'react-native';

const { width, height } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.45; // ارتفاع منوی فانتزی پایینی

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const FancyBottomMenu: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const translateY = React.useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (isOpen) {
      // انیمیشن نرم و فنری (Spring) برای بالا آمدن منو
      Animated.spring(translateY, {
        toValue: 0,
        bounces: 0.3,
        velocity: 0.8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const handleItemPress = (route: string) => {
    onClose();
    setTimeout(() => onNavigate(route), 250);
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* لایه پشت صحنه برای بستن با کلیک روی فضای خالی */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* بدنه منوی فانتزی پایینی */}
        <Animated.View style={[styles.menuSheet, { transform: [{ translateY }] }]}>
          
          {/* دستگیره بالای منو (برش کپسولی مدرن) */}
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.username}>داشبورد هوشمند مد‌لینک</Text>
            <Text style={styles.role}>امکانات و شخصی‌سازی پلتفرم هوش مصنوعی</Text>
          </View>

          {/* گرید دکمه‌های فانتزی شبیه به کنترل‌سنتر آیفون */}
          <View style={styles.gridContainer}>
            
            <TouchableOpacity style={styles.gridItem} onPress={() => handleItemPress('history')}>
              <Text style={styles.gridIcon}>📜</Text>
              <Text style={styles.gridText}>تاریخچه اسکن</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => handleItemPress('transactions')}>
              <Text style={styles.gridIcon}>💳</Text>
              <Text style={styles.gridText}>کیف پول نوتیف</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => handleItemPress('settings')}>
              <Text style={styles.gridIcon}>⚙️</Text>
              <Text style={styles.gridText}>تنظیمات موتور</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.gridItem, styles.logoutItem]} onPress={onClose}>
              <Text style={styles.gridIcon}>🚪</Text>
              <Text style={[styles.gridText, { color: '#FF3B30' }]}>خروج سریع</Text>
            </TouchableOpacity>

          </View>

          <Text style={styles.footerVersion}>MedLink AI Core - v1.0.2</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 10, 0.65)', // بک‌گراند تاریک سینمایی
    justifyContent: 'end',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuSheet: {
    width: width,
    height: SHEET_HEIGHT,
    backgroundColor: '#13131C', // رنگ پس‌زمینه دارک غنی
    borderTopLeftRadius: 32, // لبه‌های کاملا گرد و مدرن بالایی
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
    paddingHorizontal: 24,
    /* افکت نئونی سایه لبه‌های کارت */
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  handleBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  username: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'YekanBakh-Bold',
  },
  role: {
    color: '#007AFF',
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'YekanBakh-Regular',
  },
  /* چیدمان گرید دو در دو لوکس */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  gridItem: {
    width: (width - 62) / 2, // محاسبه دقیق پهنا برای فیت شدن دو ستونه
    height: 80,
    backgroundColor: '#1E1E2E', // پس‌زمینه کارت‌های داخلی
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  logoutItem: {
    borderColor: 'rgba(255, 59, 48, 0.15)',
  },
  gridIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  gridText: {
    color: '#E5E5EA',
    fontSize: 12,
    fontFamily: 'YekanBakh-Medium',
  },
  footerVersion: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: 10,
    marginTop: 'auto',
    marginBottom: 25,
    fontFamily: 'YekanBakh-Thin',
  }
});