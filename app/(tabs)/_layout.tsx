import React, { useMemo } from 'react';
import { Tabs, useRouter } from 'expo-router';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Home, Image as GalleryIcon, LayoutGrid } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BAR_HEIGHT = 65;
const FAB_SIZE = 56;
const CURVE_RADIUS = 36;
const HORIZONTAL_MARGIN = 16;
const SVG_WIDTH = SCREEN_WIDTH - HORIZONTAL_MARGIN * 2;

const createBarPath = (width: number, height: number): string => {
  const center = width / 2;
  const r = CURVE_RADIUS;

  return `
    M 20 0
    H ${center - r - 8}
    C ${center - r} 0, ${center - r + 4} ${r * 0.75}, ${center - r + 12} ${r * 0.75}
    C ${center - 14} ${r * 0.8}, ${center - 14} ${r * 0.82}, ${center} ${r * 0.82}
    C ${center + 14} ${r * 0.82}, ${center + 14} ${r * 0.8}, ${center + r - 12} ${r * 0.75}
    C ${center + r - 4} ${r * 0.75}, ${center + r} 0, ${center + r + 8} 0
    H ${width - 20}
    Q ${width} 0, ${width} 20
    V ${height - 16}
    Q ${width} ${height}, ${width - 20} ${height}
    H 20
    Q 0 ${height}, 0 ${height - 16}
    V 20
    Q 0 0, 20 0
    Z
  `;
};

export default function TabLayout() {
  const router = useRouter();
  const svgPath = useMemo(() => createBarPath(SVG_WIDTH, BAR_HEIGHT), []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={({ state, navigation }) => {
          const activeRouteName = state.routes[state.index].name;

          // اگر کاربر روی صفحه ai بود، نوار ناوبری پایین را کلاً مخفی کن تا روی چت نیفتد
          if (activeRouteName === 'ai') {
            return null;
          }

          return (
            <View style={styles.container}>
              {/* ۱. پس‌زمینه منحنی SVG سفید با سایه نرم */}
              <View style={styles.svgWrapper}>
                <Svg width={SVG_WIDTH} height={BAR_HEIGHT}>
                  <Path d={svgPath} fill="#FFFFFF" />
                </Svg>
              </View>

              {/* ۲. محتوای ناوبری و دکمه‌ها */}
              <View style={styles.navBarContent}>
                {/* بخش ۱ (چپ): آواتار پزشک */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => navigation.navigate('profile')}
                  activeOpacity={0.8}
                >
                  <View style={styles.avatarBorder}>
                    <Image
                      source={{ uri: 'https://via.placeholder.com/150' }}
                      style={styles.avatarImage}
                    />
                  </View>
                  <Text style={styles.avatarText} numberOfLines={1}>
                    Dr.mohammad
                  </Text>
                </TouchableOpacity>

                {/* بخش ۲: خانه */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => navigation.navigate('index')}
                  activeOpacity={0.7}
                >
                  <Home
                    size={26}
                    color={activeRouteName === 'index' ? '#1E293B' : '#64748B'}
                    strokeWidth={2.2}
                  />
                </TouchableOpacity>

                {/* بخش ۳ (مرکز): هدایت مستقیم به صفحه AI */}
                <View style={styles.centerFabWrapper}>
                  <TouchableOpacity
                    style={styles.fabButton}
                    onPress={() => router.push('/ai')}
                    activeOpacity={0.85}
                  >
                    <LayoutGrid size={28} color="#0284C7" strokeWidth={2.2} />
                  </TouchableOpacity>
                  <Text style={styles.aiLabel}>Ai</Text>
                </View>

                {/* بخش ۴: گالری/پست‌ها */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => navigation.navigate('explore')}
                  activeOpacity={0.7}
                >
                  <GalleryIcon
                    size={26}
                    color={activeRouteName === 'explore' ? '#1E293B' : '#64748B'}
                    strokeWidth={2.2}
                  />
                </TouchableOpacity>

                {/* بخش ۵ (راست): زبان */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => {}}
                  activeOpacity={0.7}
                >
                  <View style={styles.flagBox}>
                    <View style={[styles.flagStripe, { backgroundColor: '#22C55E' }]} />
                    <View style={[styles.flagStripe, { backgroundColor: '#FFFFFF' }]} />
                    <View style={[styles.flagStripe, { backgroundColor: '#EF4444' }]} />
                  </View>
                  <Text style={styles.languageText}>زبان</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'خانه' }} />
        <Tabs.Screen name="explore" options={{ title: 'گالری' }} />
        <Tabs.Screen name="profile" options={{ title: 'پروفایل' }} />
        <Tabs.Screen name="ai" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  svgWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
  },
  navBarContent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SVG_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  avatarBorder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#22C55E',
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  centerFabWrapper: {
    position: 'relative',
    top: -16,
    alignItems: 'center',
    justifyContent: 'center',
    width: FAB_SIZE,
  },
  fabButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  flagBox: {
    width: 22,
    height: 14,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
  },
  flagStripe: {
    flex: 1,
    width: '100%',
  },
  languageText: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
  },
});