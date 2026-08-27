// app/(tabs)/profile.tsx
// پروفایل کاربر + تاریخچه + رزروها (تم Aurora Glass سه‌بعدی + چندزبانه)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  ChevronLeft,
  CalendarCheck,
  History,
  Heart,
  Settings,
  ShieldCheck,
  HelpCircle,
  LogOut,
} from 'lucide-react-native';
import { useI18n } from '@/i18n/I18nProvider';
import { Lang } from '@/i18n/translations';

const USER = {
  name: { fa: 'سارا محمدی', en: 'Sara Mohammadi', ar: 'سارة محمدي' },
  phone: '۰۹۱۲ ••• ••۴۵',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
};

const SIM_HISTORY = [
  {
    id: '1',
    area: { fa: 'لب', en: 'Lips', ar: 'الشفاه' },
    change: { fa: '۳ سی‌سی فیلر', en: '3cc filler', ar: '٣ سم فيلر' },
    date: { fa: '۲ روز پیش', en: '2 days ago', ar: 'منذ يومين' },
    img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80',
  },
  {
    id: '2',
    area: { fa: 'گونه', en: 'Cheeks', ar: 'الخدود' },
    change: { fa: 'حجم‌دهی متوسط', en: 'Medium volume', ar: 'حجم متوسط' },
    date: { fa: '۱ هفته پیش', en: '1 week ago', ar: 'منذ أسبوع' },
    img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80',
  },
];

const APPOINTMENTS = [
  {
    id: '1',
    doctor: { fa: 'دکتر محمد طاهری', en: 'Dr. Mohammad Taheri', ar: 'د. محمد طاهري' },
    service: { fa: 'مشاوره فیلر لب', en: 'Lip filler consult', ar: 'استشارة فيلر' },
    when: { fa: 'شنبه، ۱۵:۰۰', en: 'Sat, 15:00', ar: 'السبت، ١٥:٠٠' },
    status: { fa: 'تأیید شده', en: 'Confirmed', ar: 'مؤكد' },
  },
];

export default function ProfileScreen() {
  const { t, lang, isRTL } = useI18n();
  const L = lang as Lang;

  const MENU = [
    { icon: <History size={17} color="#FF6EC7" />, label: t.menuHistory, badge: '۲' },
    { icon: <CalendarCheck size={17} color="#5EDBC4" />, label: t.menuAppts, badge: '۱' },
    { icon: <Heart size={17} color="#E08CA0" />, label: t.menuFavs },
    { icon: <ShieldCheck size={17} color="#B9AEF2" />, label: t.menuPrivacy },
    { icon: <HelpCircle size={17} color="#B8A9E0" />, label: t.menuSupport },
    { icon: <Settings size={17} color="rgba(244,242,248,0.6)" />, label: t.menuSettings },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.glowA} pointerEvents="none" />
      <View style={styles.glowB} pointerEvents="none" />

      {/* header / user card */}
      <View style={styles.userCard}>
        <Image source={{ uri: USER.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{USER.name[L]}</Text>
          <Text style={styles.userPhone}>{USER.phone}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{t.vipMember}</Text>
        </View>
      </View>

      {/* stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>۲</Text>
          <Text style={styles.statLabel}>{t.statSims}</Text>
        </View>
        <View style={[styles.stat, styles.statMid]}>
          <Text style={styles.statNum}>۱</Text>
          <Text style={styles.statLabel}>{t.statAppts}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>۵</Text>
          <Text style={styles.statLabel}>{t.statFavs}</Text>
        </View>
      </View>

      {/* appointments */}
      {APPOINTMENTS.map((a) => (
        <View key={a.id} style={styles.appointment}>
          <View style={styles.apptIcon}>
            <CalendarCheck size={16} color="#5EDBC4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.apptTitle}>{a.service[L]}</Text>
            <Text style={styles.apptSub}>
              {a.doctor[L]} • {a.when[L]}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{a.status[L]}</Text>
          </View>
        </View>
      ))}

      {/* menu */}
      <View style={styles.menuCard}>
        {MENU.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.7}
            style={[styles.menuRow, i === MENU.length - 1 && styles.menuRowLast]}
          >
            <View style={styles.menuIcon}>{item.icon}</View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <ChevronLeft size={15} color="rgba(244,242,248,0.35)" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* logout */}
      <TouchableOpacity style={styles.logout} activeOpacity={0.7}>
        <LogOut size={15} color="#E07A7A" />
        <Text style={styles.logoutText}>{t.logout}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>
        BUTI v1.0.0 — {t.betaVersion}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#12081F' },
  content: { paddingBottom: 120 },

  glowA: {
    position: 'absolute',
    top: -70,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(240,205,139,0.13)',
  },
  glowB: {
    position: 'absolute',
    top: 420,
    left: -110,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(185,174,242,0.09)',
  },

  userCard: {
    marginTop: 54,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(242,169,206,0.22)',
    shadowColor: '#F0CD8B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 9,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#FF6EC7',
  },
  userName: { color: '#FFF', fontSize: 16, fontWeight: '800', textAlign: 'right' },
  userPhone: { color: 'rgba(244,242,248,0.45)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(242,169,206,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(242,169,206,0.28)',
  },
  levelText: { color: '#FF6EC7', fontSize: 9, fontWeight: '800' },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 13 },
  statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statNum: { color: '#FF6EC7', fontSize: 16, fontWeight: '900' },
  statLabel: { color: 'rgba(244,242,248,0.45)', fontSize: 9, marginTop: 3 },

  appointment: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 13,
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 11,
    backgroundColor: 'rgba(127,231,193,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(127,231,193,0.18)',
  },
  apptIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127,231,193,0.12)',
  },
  apptTitle: { color: '#EDEDEF', fontSize: 12, fontWeight: '700', textAlign: 'right' },
  apptSub: { color: 'rgba(244,242,248,0.45)', fontSize: 9, marginTop: 3, textAlign: 'right' },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(127,231,193,0.14)',
  },
  statusText: { color: '#5EDBC4', fontSize: 8, fontWeight: '800' },

  menuCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  menuRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIcon: { width: 26, alignItems: 'center' },
  menuLabel: { flex: 1, color: '#DDD9E6', fontSize: 12, textAlign: 'right' },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0CD8B',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  logout: {
    marginHorizontal: 16,
    marginTop: 14,
    height: 46,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(224,122,122,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(224,122,122,0.2)',
  },
  logoutText: { color: '#E07A7A', fontSize: 12, fontWeight: '700' },

  version: {
    color: 'rgba(244,242,248,0.25)',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 18,
  },
});
