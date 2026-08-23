// app/(tabs)/profile.tsx
// پروفایل کاربر + تاریخچه شبیه‌سازی‌ها + رزروها (نسخه تست با داده نمونه)
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

const USER = {
  name: 'سارا محمدی',
  phone: '۰۹۱۲ ••• ••۴۵',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
};

const SIM_HISTORY = [
  { id: '1', area: 'لب', change: '۳ سی‌سی فیلر', date: '۲ روز پیش', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80' },
  { id: '2', area: 'گونه', change: 'حجم‌دهی متوسط', date: '۱ هفته پیش', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80' },
];

const APPOINTMENTS = [
  { id: '1', doctor: 'دکتر محمد طاهری', service: 'مشاوره فیلر لب', when: 'شنبه، ۱۵:۰۰', status: 'تأیید شده' },
];

const MENU = [
  { icon: <History size={17} color="#C9A0B6" />, label: 'تاریخچه شبیه‌سازی‌ها', badge: '۲' },
  { icon: <CalendarCheck size={17} color="#8FCBB2" />, label: 'نوبت‌های من', badge: '۱' },
  { icon: <Heart size={17} color="#E08CA0" />, label: 'علاقه‌مندی‌ها' },
  { icon: <ShieldCheck size={17} color="#9FB8E8" />, label: 'حریم خصوصی و امنیت' },
  { icon: <HelpCircle size={17} color="#B8A9E0" />, label: 'پشتیبانی و سوالات' },
  { icon: <Settings size={17} color="#9999A1" />, label: 'تنظیمات' },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* header / user card */}
      <View style={styles.userCard}>
        <Image source={{ uri: USER.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{USER.name}</Text>
          <Text style={styles.userPhone}>{USER.phone}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>عضو ویژه</Text>
        </View>
      </View>

      {/* stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>۲</Text>
          <Text style={styles.statLabel}>شبیه‌سازی</Text>
        </View>
        <View style={[styles.stat, styles.statMid]}>
          <Text style={styles.statNum}>۱</Text>
          <Text style={styles.statLabel}>نوبت فعال</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>۵</Text>
          <Text style={styles.statLabel}>علاقه‌مندی</Text>
        </View>
      </View>

      {/* appointments */}
      {APPOINTMENTS.map((a) => (
        <View key={a.id} style={styles.appointment}>
          <View style={styles.apptIcon}>
            <CalendarCheck size={16} color="#82D4AD" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.apptTitle}>{a.service}</Text>
            <Text style={styles.apptSub}>{a.doctor} • {a.when}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{a.status}</Text>
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
              <ChevronLeft size={15} color="#55555C" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* logout */}
      <TouchableOpacity style={styles.logout} activeOpacity={0.7}>
        <LogOut size={15} color="#E07A7A" />
        <Text style={styles.logoutText}>خروج از حساب</Text>
      </TouchableOpacity>

      <Text style={styles.version}>BUTI v1.0.0 — نسخه آزمایشی</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0F' },
  content: { paddingBottom: 120 },

  userCard: {
    marginTop: 54,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(216,137,173,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(216,137,173,0.18)',
  },
  avatar: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: '#C783A5' },
  userName: { color: '#FFF', fontSize: 16, fontWeight: '800', textAlign: 'right' },
  userPhone: { color: '#77777F', fontSize: 10, marginTop: 4, textAlign: 'right' },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(199,131,165,0.2)',
  },
  levelText: { color: '#EFC9DC', fontSize: 9, fontWeight: '800' },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 13 },
  statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statNum: { color: '#E7BCD4', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#77777F', fontSize: 9, marginTop: 3 },

  appointment: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 13,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 11,
    backgroundColor: 'rgba(130,212,173,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(130,212,173,0.16)',
  },
  apptIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(130,212,173,0.12)',
  },
  apptTitle: { color: '#EDEDEF', fontSize: 12, fontWeight: '700', textAlign: 'right' },
  apptSub: { color: '#77777F', fontSize: 9, marginTop: 3, textAlign: 'right' },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(130,212,173,0.15)',
  },
  statusText: { color: '#9FE8C6', fontSize: 8, fontWeight: '800' },

  menuCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  menuRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIcon: { width: 26, alignItems: 'center' },
  menuLabel: { flex: 1, color: '#D5D5DA', fontSize: 12, textAlign: 'right' },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C783A5',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  logout: {
    marginHorizontal: 16,
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(224,122,122,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(224,122,122,0.18)',
  },
  logoutText: { color: '#E07A7A', fontSize: 12, fontWeight: '700' },

  version: { color: '#45454C', fontSize: 9, textAlign: 'center', marginTop: 18 },
});
