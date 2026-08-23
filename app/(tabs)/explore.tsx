// app/(tabs)/explore.tsx
// گالری خدمات زیبایی — قبل/بعد + دسته‌بندی + جستجو
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Search, Sparkles, ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

type ServiceItem = {
  id: string;
  title: string;
  category: string;
  before: string;
  after: string;
  priceFrom: string;
  duration: string;
};

const CATEGORIES = ['همه', 'تزریقات', 'پوست', 'لیزر', 'مو', 'بدن'];

const SERVICES: ServiceItem[] = [
  {
    id: '1',
    title: 'فیلر لب',
    category: 'تزریقات',
    before: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
    priceFrom: '۴.۵ میلیون',
    duration: '۳۰ دقیقه',
  },
  {
    id: '2',
    title: 'ژل گونه',
    category: 'تزریقات',
    before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    priceFrom: '۹ میلیون',
    duration: '۴۰ دقیقه',
  },
  {
    id: '3',
    title: 'جوان‌سازی پوست',
    category: 'پوست',
    before: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    priceFrom: '۲.۸ میلیون',
    duration: '۶۰ دقیقه',
  },
  {
    id: '4',
    title: 'لیزر موهای زائد',
    category: 'لیزر',
    before: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1594824813566-82089efc0d9a?w=400&q=80',
    priceFrom: '۱.۵ میلیون',
    duration: '۴۵ دقیقه',
  },
  {
    id: '5',
    title: 'کاشت مو',
    category: 'مو',
    before: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    priceFrom: '۴۵ میلیون',
    duration: '۶ ساعت',
  },
  {
    id: '6',
    title: 'بوتاکس پیشانی',
    category: 'تزریقات',
    before: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80',
    priceFrom: '۴ میلیون',
    duration: '۲۰ دقیقه',
  },
];

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('همه');

  const filtered = useMemo(() => {
    return SERVICES.filter(
      (s) =>
        (cat === 'همه' || s.category === cat) &&
        (s.title.includes(query.trim()) || query.trim() === '')
    );
  }, [query, cat]);

  return (
    <View style={styles.root}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>گالری نتایج</Text>
        <Text style={styles.subtitle}>قبل و بعدِ واقعیِ درمان‌ها</Text>
      </View>

      {/* search */}
      <View style={styles.searchBox}>
        <Search size={16} color="#8A8A92" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="جستجوی خدمت…"
          placeholderTextColor="#5A5A63"
          style={styles.searchInput}
        />
      </View>

      {/* categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.catRow, { flexDirection: 'row-reverse' }]}
      >
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCat(c)}>
            <Text style={[styles.chip, cat === c && styles.chipActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {filtered.map((s) => (
          <TouchableOpacity key={s.id} style={styles.card} activeOpacity={0.85}>
            <View style={styles.imgRow}>
              <View style={styles.imgWrap}>
                <Image source={{ uri: s.before }} style={styles.img} />
                <Text style={styles.imgTag}>قبل</Text>
              </View>
              <View style={styles.imgWrap}>
                <Image source={{ uri: s.after }} style={styles.img} />
                <Text style={[styles.imgTag, styles.afterTag]}>بعد</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <View style={styles.metaRow}>
                <Sparkles size={11} color="#D99AB9" />
                <Text style={styles.price}>{s.priceFrom} تومان</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.duration}>{s.duration}</Text>
              </View>
              <View style={styles.ctaRow}>
                <Text style={styles.ctaText}>شبیه‌سازی این تغییر</Text>
                <ChevronLeft size={13} color="#E7BCD4" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.empty}>موردی مطابق جستجو پیدا نشد</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0F' },
  header: { paddingHorizontal: 18, paddingTop: 54, paddingBottom: 10 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#77777F', fontSize: 11, marginTop: 4 },

  searchBox: {
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 12, textAlign: 'right' },

  catRow: { paddingHorizontal: 16, gap: 7, paddingVertical: 12 },
  chip: {
    paddingHorizontal: 14,
    height: 30,
    lineHeight: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#A9A9B0',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  chipActive: { backgroundColor: '#C783A5', color: '#FFF' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  card: {
    width: CARD_W,
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  imgRow: { flexDirection: 'row' },
  imgWrap: { width: '50%', aspectRatio: 0.85 },
  img: { width: '100%', height: '100%' },
  imgTag: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    fontSize: 8,
    fontWeight: '700',
    color: '#DDD',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  afterTag: { color: '#9FE8C6' },

  cardBody: { padding: 10 },
  cardTitle: { color: '#F2F2F5', fontSize: 12, fontWeight: '700', textAlign: 'right' },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 6 },
  price: { color: '#82D4AD', fontSize: 10, fontWeight: '800' },
  dot: { color: '#55555C', fontSize: 9 },
  duration: { color: '#77777F', fontSize: 9 },

  ctaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  ctaText: { color: '#E7BCD4', fontSize: 9, fontWeight: '700' },

  empty: { color: '#66666D', fontSize: 11, textAlign: 'center', marginTop: 40, width: '100%' },
});
