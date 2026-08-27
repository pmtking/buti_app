// app/(tabs)/_layout.tsx
// نوار پایین شیشه‌ای مدرن + سوییچر زبان (fa/en/ar)
import React, { useMemo, useState } from 'react';
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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Image as GalleryIcon, LayoutGrid, Check } from 'lucide-react-native';
import { useI18n } from '@/i18n/I18nProvider';
import { LANGS, Lang } from '@/i18n/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BAR_HEIGHT = 68;
const FAB_SIZE = 58;
const CURVE_RADIUS = 36;
const HORIZONTAL_MARGIN = 14;
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
  const { t, lang, setLang } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const svgPath = useMemo(() => createBarPath(SVG_WIDTH, BAR_HEIGHT), []);

  return (
    <View style={{ flex: 1, backgroundColor: '#12081F' }}>
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
              {/* منوی انتخاب زبان */}
              {langOpen && (
                <View style={styles.langMenu} pointerEvents="box-none">
                  {LANGS.map((l) => (
                    <TouchableOpacity
                      key={l.code}
                      style={styles.langItem}
                      activeOpacity={0.8}
                      onPress={() => {
                        setLang(l.code as Lang);
                        setLangOpen(false);
                      }}
                    >
                      <View style={styles.flagBoxBig}>
                        {l.flag.map((c) => (
                          <View key={c} style={[styles.flagStripeBig, { backgroundColor: c }]} />
                        ))}
                      </View>
                      <Text style={styles.langLabel}>{l.label}</Text>
                      {lang === l.code && <Check size={14} color="#FF6EC7" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* پس‌زمینه شیشه‌ای منحنی */}
              <View style={styles.svgWrapper} pointerEvents="none">
                <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
                <Svg width={SVG_WIDTH} height={BAR_HEIGHT} style={StyleSheet.absoluteFill}>
                  <Path d={svgPath} fill="rgba(21,18,14,0.78)" />
                </Svg>
              </View>

              {/* حاشیه نورانی بالای منحنی */}
              <View style={styles.topEdgeGlow} pointerEvents="none" />

              {/* محتوای ناوبری و دکمه‌ها */}
              <View style={styles.navBarContent}>
                {/* بخش ۱ (چپ): آواتار پزشک → پروفایل */}
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
                    size={25}
                    color={activeRouteName === 'index' ? '#FF6EC7' : 'rgba(244,242,248,0.55)'}
                    strokeWidth={2.2}
                  />
                </TouchableOpacity>

                {/* بخش ۳ (مرکز): دکمه AI */}
                <View style={styles.centerFabWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push('/ai')}
                  >
                    <LinearGradient
                      colors={['#E58BB8', '#9C5580']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.fabButton}
                    >
                      <LayoutGrid size={27} color="#FFF" strokeWidth={2.2} />
                    </LinearGradient>
                  </TouchableOpacity>
                  <Text style={styles.aiLabel}>AI</Text>
                </View>

                {/* بخش ۴: گالری/پست‌ها */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => navigation.navigate('explore')}
                  activeOpacity={0.7}
                >
                  <GalleryIcon
                    size={25}
                    color={activeRouteName === 'explore' ? '#5EDBC4' : 'rgba(244,242,248,0.55)'}
                    strokeWidth={2.2}
                  />
                </TouchableOpacity>

                {/* بخش ۵ (راست): سوییچ زبان */}
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => setLangOpen((v) => !v)}
                  activeOpacity={0.7}
                >
                  <View style={styles.flagBox}>
                    {(LANGS.find((l) => l.code === lang) ?? LANGS[0]).flag.map((c) => (
                      <View key={c} style={[styles.flagStripe, { backgroundColor: c }]} />
                    ))}
                  </View>
                  <Text style={styles.languageText}>{t.language}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      >
        <Tabs.Screen name="index" options={{ title: t.tabHome }} />
        <Tabs.Screen name="explore" options={{ title: t.tabGallery }} />
        <Tabs.Screen name="profile" options={{ title: t.tabProfile }} />
        <Tabs.Screen name="avatar" options={{ title: t.tabAvatar }} />
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

  /* منوی زبان */
  langMenu: {
    position: 'absolute',
    bottom: BAR_HEIGHT + 14,
    right: HORIZONTAL_MARGIN + 6,
    backgroundColor: 'rgba(24,20,15,0.97)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 6,
    minWidth: 170,
    shadowColor: '#E58BB8',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  langItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  flagBoxBig: {
    width: 26,
    height: 17,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  flagStripeBig: { flex: 1, width: '100%' },
  langLabel: { flex: 1, color: '#F4F2F8', fontSize: 13, fontWeight: '600', textAlign: 'right' },

  svgWrapper: {
    width: SVG_WIDTH,
    height: BAR_HEIGHT,
    overflow: 'hidden',
    borderRadius: CURVE_RADIUS,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  topEdgeGlow: {
    position: 'absolute',
    top: BAR_HEIGHT - 1.5,
    left: HORIZONTAL_MARGIN + 30,
    right: HORIZONTAL_MARGIN + 30,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(242,169,206,0.35)',
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
    borderColor: '#FF6EC7',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: {
    fontSize: 9,
    color: 'rgba(244,242,248,0.65)',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#E58BB8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6EC7',
    marginTop: 2,
  },
  flagBox: {
    width: 22,
    height: 14,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  flagStripe: { flex: 1, width: '100%' },
  languageText: {
    fontSize: 9,
    color: 'rgba(244,242,248,0.65)',
    marginTop: 2,
  },
});
