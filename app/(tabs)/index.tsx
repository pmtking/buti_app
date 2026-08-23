// app/(tabs)/index.tsx
// صفحه اصلی — هیرو AI + استوری دکترها + دسترسی سریع + گرید کشف
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Camera,
  ChevronLeft,
  Star,
  MapPin,
  Scan,
} from 'lucide-react-native';
import { TopDoctorsSlider, DoctorStoryItem } from '@/components/TopDoctorsSlider';
import { MOCK_STORIES } from '@/mock/storiesData';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  {
    id: 'sim',
    title: 'شبیه‌سازی زیبایی',
    subtitle: 'قبل از decision ببین',
    icon: <Sparkles size={20} color="#F0CFE0" />,
    colors: ['#C783A5', '#8E5B77'],
    route: '/ai' as const,
  },
  {
    id: 'scan',
    title: 'آنالیز پوست',
    subtitle: 'تحلیل هوشمند چهره',
    icon: <Scan size={20} color="#BFE8D6" />,
    colors: ['#4E9B7E', '#2F6653'],
    route: '/ai' as const,
  },
];

const FEED = [
  {
    id: '1',
    doctor: 'دکتر محمد طاهری',
    specialty: 'متخصص پوست و زیبایی',
    rating: 4.9,
    clinic: 'کلینیک BUTI — سعادت‌آباد',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    title: 'ترکیب فیلر و بوتاکس: نقشه راه جوان‌سازی طبیعی',
    tag: 'تزریقات',
  },
  {
    id: '2',
    doctor: 'دکتر سارا حسینی',
    specialty: 'پوست، مو و زیبایی',
    rating: 4.8,
    clinic: 'کلینیک BUTI — آتشی',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80',
    title: 'پوست شفاف با ۳ مرحله مراقبت ساده',
    tag: 'مراقبت پوست',
  },
  {
    id: '3',
    doctor: 'دکتر رضا رضایی',
    specialty: 'جراح بینی و صورت',
    rating: 4.9,
    clinic: 'بیمارستان BUTI — ونک',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
    title: 'رینوپلاستی اولتراسونیک؛ ریکاوری سریع‌تر',
    tag: 'جراحی',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });

  const handleOpenStory = (story: DoctorStoryItem, index: number) => {
    // TODO: استوری‌ویو
    console.log('story:', story.nameFa, index);
  };

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={styles.content}
      >
        {/* ═══ HERO — AI CTA ═══ */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/ai')}>
          <LinearGradient
            colors={['#3A2434', '#241A28', '#14121A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroBadge}>
              <Sparkles size={11} color="#EFC9DC" />
              <Text style={styles.heroBadgeText}>Beauty AI</Text>
            </View>
            <Text style={styles.heroTitle}>چهره بعدی‌ات رو{'\n'}قبل از تصمیم ببین</Text>
            <Text style={styles.heroSub}>
              عکس بده، بگو چی می‌خوای، نتیجه روی صورت خودت نشسته می‌شه
            </Text>
            <View style={styles.heroCta}>
              <Camera size={15} color="#1A1420" />
              <Text style={styles.heroCtaText}>شروع شبیه‌سازی</Text>
            </View>
            <View style={styles.heroGlow} pointerEvents="none" />
          </LinearGradient>
        </TouchableOpacity>

        {/* ═══ QUICK ACTIONS ═══ */}
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((q) => (
            <TouchableOpacity
              key={q.id}
              activeOpacity={0.85}
              onPress={() => router.push(q.route)}
            >
              <LinearGradient
                colors={q.colors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickCard}
              >
                {q.icon}
                <Text style={styles.quickTitle}>{q.title}</Text>
                <Text style={styles.quickSub}>{q.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══ DOCTOR STORIES ═══ */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>پزشکان BUTI</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>همه</Text>
          </TouchableOpacity>
        </View>
        <TopDoctorsSlider data={MOCK_STORIES} onOpenStory={handleOpenStory} />

        {/* ═══ FEED ═══ */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>مقالات و نتایج</Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={styles.seeAll}>گالری نتایج</Text>
          </TouchableOpacity>
        </View>

        {FEED.map((item) => (
          <TouchableOpacity key={item.id} style={styles.feedCard} activeOpacity={0.9}>
            <Image source={{ uri: item.image }} style={styles.feedImg} />
            <LinearGradient
              colors={['transparent', 'rgba(10,10,14,0.92)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.feedBody}>
              <View style={styles.feedTagWrap}>
                <Text style={styles.feedTag}>{item.tag}</Text>
              </View>
              <Text style={styles.feedTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.feedMeta}>
                <View style={styles.docCol}>
                  <Text style={styles.docName}>{item.doctor}</Text>
                  <View style={styles.docRow}>
                    <MapPin size={9} color="#8A8A92" />
                    <Text style={styles.clinic} numberOfLines={1}>{item.clinic}</Text>
                  </View>
                </View>
                <View style={styles.ratingWrap}>
                  <Star size={10} color="#F5C518" fill="#F5C518" />
                  <Text style={styles.rating}>{item.rating}</Text>
                </View>
              </View>
              <View style={styles.feedCta}>
                <Text style={styles.feedCtaText}>مشاهده</Text>
                <ChevronLeft size={12} color="#E7BCD4" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0F' },
  content: { paddingBottom: 130 },

  /* hero */
  hero: {
    marginHorizontal: 16,
    marginTop: 54,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroBadgeText: { color: '#EFC9DC', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: 14,
    textAlign: 'right',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'right',
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFC9DC',
  },
  heroCtaText: { color: '#1A1420', fontSize: 12, fontWeight: '800' },
  heroGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(216,137,173,0.18)',
  },

  /* quick */
  quickRow: {
    flexDirection: 'row-reverse',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  quickCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    minHeight: 96,
  },
  quickTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'right',
  },
  quickSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    marginTop: 3,
    textAlign: 'right',
  },

  /* sections */
  sectionHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: { color: '#F2F2F5', fontSize: 15, fontWeight: '800' },
  seeAll: { color: '#C783A5', fontSize: 11, fontWeight: '700' },

  /* feed */
  feedCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#16161C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  feedImg: { width: '100%', height: 170 },
  feedBody: { padding: 14, marginTop: -40 },
  feedTagWrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(199,131,165,0.9)',
  },
  feedTag: { color: '#FFF', fontSize: 8, fontWeight: '800' },
  feedTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
    marginTop: 9,
    textAlign: 'right',
  },
  feedMeta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  docCol: { flex: 1, alignItems: 'flex-end' },
  docName: { color: '#D5D5DA', fontSize: 11, fontWeight: '700' },
  docRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 3 },
  clinic: { color: '#77777F', fontSize: 9, maxWidth: 200 },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  rating: { color: '#F5C518', fontSize: 10, fontWeight: '800' },
  feedCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 12,
  },
  feedCtaText: { color: '#E7BCD4', fontSize: 10, fontWeight: '700' },
});
