// app/(tabs)/index.tsx
// فید سوشال‌مدیایی BUTI — استوری + پست‌ها + اکسپلور گرید | تم دوحالته
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles, Camera, Star, MapPin, Heart, MessageCircle,
  Bookmark, MoreHorizontal, Plus, Sun, Moon, Search, Send,
} from 'lucide-react-native';
import SmartImage from '@/components/SmartImage';
import { useTheme } from '@/hooks/useTheme';
import { MOCK_STORIES } from '@/mock/storiesData';

const { width } = Dimensions.get('window');
const POST_H = width * 1.05;

type Post = {
  id: string;
  doctor: { fa: string; en: string };
  handle: string;
  verified?: boolean;
  clinic: { fa: string; en: string };
  image: string;
  likes: number;
  comments: number;
  caption: { fa: string; en: string };
  tag: { fa: string; en: string };
};

const POSTS: Post[] = [
  {
    id: 'p1',
    doctor: { fa: 'دکتر محمد طاهری', en: 'Dr. Mohammad Taheri' },
    handle: '@dr.taheri',
    verified: true,
    clinic: { fa: 'کلینیک BUTI — سعادت‌آباد', en: 'BUTI Clinic — Saadatabad' },
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    likes: 2843,
    comments: 164,
    caption: {
      fa: 'ترکیب فیلر و بوتاکس با نقشه راه طبیعی — نتیجه بعد از دو هفته. نظرتون چیه؟',
      en: 'Natural filler+botox roadmap — 2 weeks result. Thoughts?',
    },
    tag: { fa: 'تزریقات', en: 'Injectables' },
  },
  {
    id: 'p2',
    doctor: { fa: 'دکتر سارا حسینی', en: 'Dr. Sara Hosseini' },
    handle: '@dr.sara.h',
    verified: true,
    clinic: { fa: 'کلینیک BUTI — آتشی', en: 'BUTI Clinic — Atishi' },
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80',
    likes: 1926,
    comments: 98,
    caption: {
      fa: 'پوست شفاف فقط با ۳ مرحله مراقبت ساده! صبح و شب تکرار کنید ✨',
      en: 'Glowing skin with just 3 simple steps! Morning & night ✨',
    },
    tag: { fa: 'مراقبت پوست', en: 'Skincare' },
  },
  {
    id: 'p3',
    doctor: { fa: 'دکتر رضا رضایی', en: 'Dr. Reza Rezaei' },
    handle: '@rezaei.rhinoplasty',
    verified: true,
    clinic: { fa: 'بیمارستان BUTI — ونک', en: 'BUTI Hospital — Vanak' },
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
    likes: 4317,
    comments: 342,
    caption: {
      fa: 'رینوپلاستی اولتراسونیک؛ تورم کمتر، ریکاوری سریع‌تر. روز چهارم بعد از عمل 📅',
      en: 'Ultrasonic rhinoplasty; less swelling, faster recovery. Day 4 post-op 📅',
    },
    tag: { fa: 'جراحی بینی', en: 'Rhinoplasty' },
  },
];

const EXPLORE = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
];

function fmt(n: number) {
  return n > 999 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

export default function HomeScreen() {
  const router = useRouter();
  const { p, mode, toggle } = useTheme();
  const [tab, setTab] = useState<'feed' | 'explore'>('feed');
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBg = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.root, { backgroundColor: p.bg }]}>
      {/* ═══ HEADER شیشه‌ای چسبان ═══ */}
      <View style={styles.headerWrap} pointerEvents="box-none">
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: mode === 'dark' ? 'rgba(13,11,9,0.85)' : 'rgba(250,246,238,0.92)',
              opacity: headerBg,
            },
          ]}
          pointerEvents="none"
        />
        <View style={styles.headerRow}>
          <Text style={[styles.logo, { color: p.text }]}>
            BUTI<Sep />
            <Text style={{ color: p.primary }}>AI</Text>
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/ai')}>
              <Search size={20} color={p.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={toggle}>
              {mode === 'dark'
                ? <Sun size={21} color={p.primary} strokeWidth={2} />
                : <Moon size={21} color={p.primarySoft} strokeWidth={2} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ═══ HERO — شبیه‌سازی AI (فقط بالای فید) ═══ */}
        {tab === 'feed' && (
          <TouchableOpacity activeOpacity={0.94} onPress={() => router.push('/ai')} style={{ marginTop: 108 }}>
            <LinearGradient colors={p.gradHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <View style={[styles.heroBadge, { borderColor: p.cardBorder }]}>
                <Sparkles size={11} color={p.primary} />
                <Text style={[styles.heroBadgeText, { color: p.primary }]}>{'Beauty AI'}</Text>
              </View>
              <Text style={[styles.heroTitle, { color: p.text }]}>
                {'چهره بعدی‌ات رو\nقبل از تصمیم ببین'}
              </Text>
              <View style={[styles.heroCta, !p.mode && null]}>
                <LinearGradient colors={p.gradPrimary} style={styles.heroCtaGrad}>
                  <Camera size={15} color={p.onPrimary} />
                  <Text style={[styles.heroCtaText, { color: p.onPrimary }]}>شروع شبیه‌سازی</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ═══ STORIES ═══ */}
        {tab === 'feed' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stories} contentContainerStyle={styles.storiesInner}>
            <StoryAdd />
            {MOCK_STORIES.map((s: any, i: number) => (
              <StoryRing key={i} uri={s.avatarUrl ?? ''} label={s.nameFa ?? ''} />
            ))}
          </ScrollView>
        )}
        {tab === 'explore' && (
          /* ═══ EXPLORE GRID ═══ */
          <View style={styles.explore}>
            {EXPLORE.map((uri, i) => (
              <SmartImage key={i} uri={uri} style={[styles.exploreCell]} fallbackLabel="✦" />
            ))}
          </View>
        )}

        {/* ═══ FEED POSTS ═══ */}
        {tab === 'feed' &&
          POSTS.map((post) => <PostCard key={post.id} post={post} />)}

        {/* ═══ TAB SWITCHER پایین ═══ */}
      </Animated.ScrollView>

      {/* سوییچر فید/اکسپلور شناور */}
      <View style={[styles.floatTabs, { backgroundColor: mode === 'dark' ? 'rgba(26,23,20,0.92)' : 'rgba(255,255,255,0.95)', borderColor: p.cardBorder }]}>
        <TabBtn active={tab === 'feed'} onPress={() => setTab('feed')} icon={<Heart size={17} color={tab === 'feed' ? p.onPrimary : p.textDim} />} label="فید" p={p} />
        <TabBtn active={tab === 'explore'} onPress={() => setTab('explore')} icon={<Search size={17} color={tab === 'explore' ? p.onPrimary : p.textDim} />} label="اکسپلور" p={p} />
      </View>
    </View>
  );
}

/* ─────────── زیر-کامپوننت‌ها ─────────── */

function Sep() {
  return null;
}

function StoryAdd() {
  const { p } = useTheme();
  return (
    <View style={styles.storyItem}>
      <View style={[styles.ring, { borderColor: p.textFaint, padding: 2 }]}>
        <View style={[styles.storyImgWrap, { backgroundColor: p.glassStrong }]}>
          <Plus size={18} color={p.primary} />
        </View>
      </View>
      <Text style={[styles.storyLabel, { color: p.textDim }]} numberOfLines={1}>Your story</Text>
    </View>
  );
}

function StoryRing({ uri, label }: { uri: string; label: string }) {
  const { p } = useTheme();
  return (
    <View style={styles.storyItem}>
      <LinearGradient colors={p.storyRing} style={styles.ring}>
        <View style={[styles.storyImgWrap, { borderWidth: 2, borderColor: p.bg === '#12081F' ? '#12081F' : '#FAF6EE' }]}>
          <SmartImage uri={uri} style={StyleSheet.absoluteFill} fallbackLabel={label.slice(0, 1)} />
        </View>
      </LinearGradient>
      <Text style={[styles.storyLabel, { color: p.text }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function PostCard({ post }: { post: Post }) {
  const { p } = useTheme();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <View style={[styles.postCard, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
      {/* header */}
      <View style={styles.postHead}>
        <LinearGradient colors={p.storyRing} style={styles.postAvatarRing}>
          <View style={[styles.postAvatar, { borderColor: p.card }]}>
            <SmartImage uri={post.image} style={StyleSheet.absoluteFill} fallbackLabel="Dr" />
          </View>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={styles.handleRow}>
            <Text style={[styles.doctorName, { color: p.text }]} numberOfLines={1}>{post.doctor.fa}</Text>
            {post.verified && (
              <View style={[styles.vBadge, { backgroundColor: p.primary }]}>
                <Text style={[styles.vBadgeT, { color: p.onPrimary }]}>✓</Text>
              </View>
            )}
          </View>
          <Text style={[styles.clinicLine, { color: p.textDim }]} numberOfLines={1}>{post.clinic.fa}</Text>
        </View>
        <TouchableOpacity><MoreHorizontal size={18} color={p.textDim} /></TouchableOpacity>
      </View>

      {/* image */}
      <TouchableOpacity activeOpacity={0.96} onPress={() => setLiked((v) => !v)}>
        <SmartImage uri={post.image} style={{ width: '100%', height: POST_H }} fallbackLabel="BUTI ✦" />
        <View style={styles.tagOverlay} pointerEvents="none">
          <View style={[styles.tagPill, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
            <Text style={styles.tagPillT}>{post.tag.fa}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* actions */}
      <View style={styles.actionBar}>
        <View style={styles.actionLeft}>
          <TouchableOpacity onPress={() => setLiked((v) => !v)} style={styles.actBtn}>
            <Heart size={22} color={liked ? p.coral : p.text} fill={liked ? p.coral : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actBtn}><MessageCircle size={21} color={p.text} /></TouchableOpacity>
          <TouchableOpacity style={styles.actBtn}><Send size={20} color={p.text} /></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setSaved((v) => !v)}>
          <Bookmark size={20} color={saved ? p.primary : p.text} fill={saved ? p.primary : 'transparent'} />
        </TouchableOpacity>
      </View>

      {/* meta */}
      <View style={styles.metaWrap}>
        <Text style={[styles.likes, { color: p.text }]}>
          {fmt(post.likes + (liked ? 1 : 0))} لایک
        </Text>
        <Text style={[styles.caption, { color: p.text }]} numberOfLines={2}>
          <Text style={{ fontWeight: '800' }}>{post.handle}</Text> {post.caption.fa}
        </Text>
        <TouchableOpacity><Text style={[styles.commentsLink, { color: p.textDim }]}>دیدن همه {post.comments} نظر</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function TabBtn({ active, onPress, icon, label, p }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active && { backgroundColor: p.primaryDeep }]}>
      {icon}
      <Text style={[styles.tabBtnT, { color: active ? p.onPrimary : p.textDim }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 },
  headerRow: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 54, paddingBottom: 10,
  },
  logo: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  headerActions: { flexDirection: 'row', gap: 14 },
  iconBtn: { padding: 2 },

  hero: { marginHorizontal: 16, borderRadius: 26, padding: 20, overflow: 'hidden', marginBottom: 14 },
  heroBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(232,193,112,0.12)',
  },
  heroBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: { fontSize: 21, fontWeight: '900', lineHeight: 32, marginTop: 12, textAlign: 'right' },
  heroCta: { alignSelf: 'flex-end', marginTop: 14 },
  heroCtaGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18,
    height: 42, borderRadius: 21,
  },
  heroCtaText: { fontSize: 12, fontWeight: '800' },

  stories: { marginTop: 4 },
  storiesInner: { paddingHorizontal: 12, gap: 12, paddingVertical: 6 },
  storyItem: { alignItems: 'center', width: 72 },
  ring: { padding: 2.5, borderRadius: 36 },
  storyImgWrap: { width: 58, height: 58, borderRadius: 29, overflow: 'hidden' },
  storyLabel: { fontSize: 9, marginTop: 5 },

  explore: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 1, paddingTop: 112, gap: 1 },
  exploreCell: { width: (width - 4) / 3, height: (width - 4) / 3 },

  postCard: { marginHorizontal: 12, marginBottom: 16, borderRadius: 22, overflow: 'hidden', borderWidth: 1 },
  postHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 12 },
  postAvatarRing: { padding: 2, borderRadius: 27 },
  postAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2 },
  handleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  doctorName: { fontSize: 13, fontWeight: '800' },
  vBadge: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  vBadgeT: { fontSize: 8, fontWeight: '900' },
  clinicLine: { fontSize: 9, marginTop: 2 },

  tagOverlay: { position: 'absolute', top: 10, left: 10 },
  tagPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  tagPillT: { color: '#FFF', fontSize: 8, fontWeight: '700' },

  actionBar: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10 },
  actionLeft: { flexDirection: 'row-reverse', gap: 14 },
  actBtn: { padding: 2 },
  metaWrap: { paddingHorizontal: 12, paddingBottom: 14, gap: 5, marginTop: 2 },
  likes: { fontSize: 12, fontWeight: '800' },
  caption: { fontSize: 11, lineHeight: 18 },
  commentsLink: { fontSize: 10 },

  floatTabs: {
    position: 'absolute', bottom: 96, alignSelf: 'center',
    flexDirection: 'row-reverse', gap: 6, padding: 5, borderRadius: 26,
    borderWidth: 1,
  },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, height: 38, borderRadius: 21 },
  tabBtnT: { fontSize: 11, fontWeight: '800' },
});
