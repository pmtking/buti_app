// app/(tabs)/explore.tsx
// گالری خدمات زیبایی — قبل/بعد + دسته‌بندی + جستجو (تم Aurora Glass + چندزبانه)
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
import { useI18n } from '@/i18n/I18nProvider';
import { CatKey, CATEGORIES, CAT_KEYS } from '@/i18n/translations';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

type ServiceItem = {
  id: string;
  title: { fa: string; en: string; ar: string };
  catKey: CatKey;
  before: string;
  after: string;
  priceFrom: string;
  duration: { fa: string; en: string; ar: string };
};

const SERVICES: ServiceItem[] = [
  {
    id: '1',
    title: { fa: 'فیلر لب', en: 'Lip Filler', ar: 'فيلر الشفاه' },
    catKey: 'injections',
    before: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
    priceFrom: '۴.۵',
    duration: { fa: '۳۰ دقیقه', en: '30 min', ar: '٣٠ دقيقة' },
  },
  {
    id: '2',
    title: { fa: 'ژل گونه', en: 'Cheek Filler', ar: 'فيلر الخدود' },
    catKey: 'injections',
    before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    priceFrom: '۹',
    duration: { fa: '۴۰ دقیقه', en: '40 min', ar: '٤٠ دقيقة' },
  },
  {
    id: '3',
    title: { fa: 'جوان‌سازی پوست', en: 'Skin Rejuvenation', ar: 'تجديد البشرة' },
    catKey: 'skin',
    before: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    priceFrom: '۲.۸',
    duration: { fa: '۶۰ دقیقه', en: '60 min', ar: '٦٠ دقيقة' },
  },
  {
    id: '4',
    title: { fa: 'لیزر موهای زائد', en: 'Laser Hair Removal', ar: 'إزالة الشعر بالليزر' },
    catKey: 'laser',
    before: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1594824813566-82089efc0d9a?w=400&q=80',
    priceFrom: '۱.۵',
    duration: { fa: '۴۵ دقیقه', en: '45 min', ar: '٤٥ دقيقة' },
  },
  {
    id: '5',
    title: { fa: 'کاشت مو', en: 'Hair Transplant', ar: 'زراعة الشعر' },
    catKey: 'hair',
    before: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    priceFrom: '۴۵',
    duration: { fa: '۶ ساعت', en: '6 h', ar: '٦ ساعات' },
  },
  {
    id: '6',
    title: { fa: 'بوتاکس پیشانی', en: 'Forehead Botox', ar: 'بوتوكس الجبهة' },
    catKey: 'injections',
    before: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    after: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80',
    priceFrom: '۴',
    duration: { fa: '۲۰ دقیقه', en: '20 min', ar: '٢٠ دقيقة' },
  },
];

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CatKey>('all');
  const { t, lang, isRTL } = useI18n();

  const filtered = useMemo(() => {
    const q = query.trim();
    return SERVICES.filter(
      (s) =>
        (cat === 'all' || s.catKey === cat) &&
        (q === '' || s.title[lang].includes(q) || s.title.en.toLowerCase().includes(q.toLowerCase()))
    );
  }, [query, cat, lang]);

  return (
    <View style={styles.root}>
      <View style={styles.glow} pointerEvents="none" />

      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.tabGallery}</Text>
        <Text style={styles.subtitle}>{isRTL ? 'قبل و بعدِ واقعیِ درمان‌ها' : 'Real before & after results'}</Text>
      </View>

      {/* search */}
      <View style={styles.searchBox}>
        <Search size={16} color="rgba(244,242,248,0.45)" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.searchPh}
          placeholderTextColor="rgba(244,242,248,0.35)"
          style={[styles.searchInput, !isRTL && { textAlign: 'left' }]}
        />
      </View>

      {/* categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.catRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      >
        {CAT_KEYS.map((key) => (
          <TouchableOpacity key={key} onPress={() => setCat(key)}>
            <Text style={[styles.chip, cat === key && styles.chipActive]}>
              {CATEGORIES[lang][key]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {filtered.map((s) => (
          <TouchableOpacity key={s.id} style={styles.card} activeOpacity={0.88}>
            <View style={styles.imgRow}>
              <View style={styles.imgWrap}>
                <Image source={{ uri: s.before }} style={styles.img} />
                <Text style={styles.imgTag}>{t.before}</Text>
              </View>
              <View style={styles.imgWrap}>
                <Image source={{ uri: s.after }} style={styles.img} />
                <Text style={[styles.imgTag, styles.afterTag]}>{t.after}</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{s.title[lang]}</Text>
              <View style={[styles.metaRow, !isRTL && { flexDirection: 'row' }]}>
                <Sparkles size={11} color="#FF6EC7" />
                <Text style={styles.price}>{s.priceFrom} {t.toman}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.duration}>{s.duration[lang]}</Text>
              </View>
              <View style={[styles.ctaRow, !isRTL && { flexDirection: 'row' }]}>
                <Text style={styles.ctaText}>{t.simThis}</Text>
                <ChevronLeft size={13} color="#FF6EC7" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.empty}>{t.notFound}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#12081F' },
  glow: {
    position: 'absolute',
    top: -90,
    left: -110,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(240,205,139,0.12)',
  },

  header: { paddingHorizontal: 18, paddingTop: 54, paddingBottom: 10 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  subtitle: { color: 'rgba(244,242,248,0.45)', fontSize: 11, marginTop: 4 },

  searchBox: {
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: 'rgba(244,242,248,0.65)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  chipActive: {
    backgroundColor: 'rgba(240,205,139,0.9)',
    borderColor: 'rgba(242,169,206,0.5)',
    color: '#FFF',
  },

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
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 7,
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
    color: '#EDEDEF',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  afterTag: { color: '#5EDBC4' },

  cardBody: { padding: 10 },
  cardTitle: { color: '#F4F2F8', fontSize: 12, fontWeight: '700', textAlign: 'right' },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 6 },
  price: { color: '#5EDBC4', fontSize: 10, fontWeight: '800' },
  dot: { color: 'rgba(244,242,248,0.3)', fontSize: 9 },
  duration: { color: 'rgba(244,242,248,0.45)', fontSize: 9 },

  ctaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  ctaText: { color: '#FF6EC7', fontSize: 9, fontWeight: '700' },

  empty: {
    color: 'rgba(244,242,248,0.38)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 40,
    width: '100%',
  },
});
