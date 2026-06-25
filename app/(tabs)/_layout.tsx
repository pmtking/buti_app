import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { FancyBottomMenu } from '@/components/BottomMenu';
// import { FancyBottomMenu } from '../../src/core/components/FancyBottomMenu'; // مسیر کامپوننت منوی فانتزی

const { width } = Dimensions.get('window');

export default function TabLayout() {
  // استیت کنترل باز و بسته شدن منوی فانتزی پایینی
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0C' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        // استفاده از پروپ tabBar برای جایگزینی کلاینت پیش‌فرض با ناوبری سفارشی نئونی شما
        tabBar={({ state, navigation }) => {
          return (
            <View style={styles.container}>
              <View style={styles.navBar}>
                
                {/* ۱. تب پروفایل */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => navigation.navigate('profile')}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="person" 
                    size={22} 
                    color={state.index === 1 ? '#007AFF' : 'rgba(255, 255, 255, 0.4)'} 
                  />
                  <Text style={[styles.tabText, state.index === 1 && styles.activeText]}>پروفایل</Text>
                </TouchableOpacity>

                {/* ۲. دکمه مرکزی دایره‌ای فانتزی برای تریگر کردن منوی کنترل‌سنتر پلتفرم */}
                <View style={styles.centerTabContainer}>
                  <TouchableOpacity
                    style={[styles.centerButton, isMenuOpen && styles.activeCenterButton]}
                    onPress={() => setIsMenuOpen(true)} // باز کردن منوی فانتزی پایینی
                    activeOpacity={0.85}
                  >
                    <Ionicons name="apps" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={[styles.tabText, { marginTop: 4 }]}>منو خدمات</Text>
                </View>

                {/* ۳. تب جستجو و پزشکان */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => navigation.navigate('explore')}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="search" 
                    size={22} 
                    color={state.index === 0 ? '#007AFF' : 'rgba(255, 255, 255, 0.4)'} 
                  />
                  <Text style={[styles.tabText, state.index === 0 && styles.activeText]}>جستجو</Text>
                </TouchableOpacity>

                {/* ۴. تب خانه */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => navigation.navigate('index')}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="home" 
                    size={22} 
                    color={state.index === 2 ? '#007AFF' : 'rgba(255, 255, 255, 0.4)'} 
                  />
                  <Text style={[styles.tabText, state.index === 2 && styles.activeText]}>خانه</Text>
                </TouchableOpacity>

              </View>
            </View>
          );
        }}
      >
        <Tabs.Screen name="explore" options={{ title: 'جستجو' }} />
        <Tabs.Screen name="profile" options={{ title: 'پروفایل' }} />
        <Tabs.Screen name="index" options={{ title: 'خانه' }} />
      </Tabs>

      {/* تزریق هم‌تراز منوی فانتزی پایینی به بدنه ناوبری اصلی */}
      <FancyBottomMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={(route) => {
          console.log(`هدایت هوشمند به بخش: ${route}`);
          // در صورت نیاز به روت‌زدن خارج از تب‌بار می‌توانی از router.push استفاده کنی
        }}
      />
    </View>
  );
}

// استایل‌های پیشرفته کپسولی و نئون‌دار
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  navBar: {
    flexDirection: 'row',
    width: width * 0.90,          // ایجاد حالت معلق و کپسولی فوق‌العاده ترند
    height: 72,
    backgroundColor: '#14141C',   // رنگ تیره و عمیق هماهنگ با تم دارک
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    bottom: 25,                   // فاصله تعلیق از کف اسکرین
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 10,
    fontFamily: 'YekanBakh-Medium',
    marginTop: 3,
  },
  activeText: {
    color: '#007AFF', // تم رنگی اختصاصی مدیکال پلتفرم شما
  },
  /* پوزیشن و انیمیشن بصری دکمه فانتزی میانی */
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -18,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E1E2E',
    borderWidth: 3,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  activeCenterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#00E5FF',
  },
});