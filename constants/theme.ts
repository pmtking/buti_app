// BUTI — پالت Aurora Rose ✨
// Dark: بنفش سینمایی + صورتی نئونی / Light: صدفی روشن + رزگلد
// الهام از ref_pin (گرادیان صورتی-نارنجی) + ref2 (مشکی گرم)

export type Mode = 'dark' | 'light';

export interface Palette {
  mode: Mode;
  /* زمینه */
  bg: string;
  bgSoft: string;
  card: string;
  cardBorder: string;
  glass: string;
  glassStrong: string;

  /* متن */
  text: string;
  textDim: string;
  textFaint: string;

  /* اکسنت‌ها */
  primary: string;
  primarySoft: string;
  primaryDeep: string;
  onPrimary: string;
  success: string;
  coral: string;
  star: string;

  /* گرادیان‌ها */
  gradHero: [string, string, string];
  gradCard: [string, string];
  gradPrimary: [string, string];
  storyRing: [string, string];

  /* ناوبری */
  navBg: string;
  navBorder: string;
}

export const DARK: Palette = {
  mode: 'dark',
  bg: '#12081F',
  bgSoft: '#1A0E2E',
  card: '#211438',
  cardBorder: 'rgba(255,110,199,0.20)',
  glass: 'rgba(255,220,245,0.06)',
  glassStrong: 'rgba(255,220,245,0.11)',
  text: '#FDF6FF',
  textDim: 'rgba(253,246,255,0.64)',
  textFaint: 'rgba(253,246,255,0.38)',
  primary: '#FF6EC7',
  primarySoft: '#FFB3E2',
  primaryDeep: '#B84DD8',
  onPrimary: '#33091F',
  success: '#4FE8C4',
  coral: '#FF8E7A',
  star: '#FFD166',
  gradHero: ['#2A1147', '#1B0C33', '#12081F'],
  gradCard: ['rgba(255,110,199,0.12)', 'rgba(122,90,248,0.05)'],
  gradPrimary: ['#FF6EC7', '#9D5CF6'],
  storyRing: ['#FF6EC7', '#4FD8EB'],
  navBg: 'rgba(26,14,46,0.88)',
  navBorder: 'rgba(255,110,199,0.28)',
};

export const LIGHT: Palette = {
  mode: 'light',
  bg: '#FCF6FF',
  bgSoft: '#F4EAFD',
  card: '#FFFFFF',
  cardBorder: 'rgba(184,77,216,0.16)',
  glass: 'rgba(90,50,140,0.04)',
  glassStrong: 'rgba(90,50,140,0.08)',
  text: '#251439',
  textDim: 'rgba(37,20,57,0.66)',
  textFaint: 'rgba(37,20,57,0.40)',
  primary: '#D6449E',
  primarySoft: '#B84DD8',
  primaryDeep: '#8A2BB8',
  onPrimary: '#FFF5FC',
  success: '#1FA98C',
  coral: '#E4673F',
  star: '#DE9E1F',
  gradHero: ['#FFE9F8', '#F1E4FF', '#FCF6FF'],
  gradCard: ['#FFFFFF', '#FBF1FF'],
  gradPrimary: ['#FF6EC7', '#B84DD8'],
  storyRing: ['#D6449E', '#4FBEE8'],
  navBg: 'rgba(255,250,255,0.94)',
  navBorder: 'rgba(184,77,216,0.22)',
};

/** سازگاری با کدهای قدیمی (تم پیش‌فرض = تاریک) */
export const Theme = {
  ...DARK,
  background: DARK.bg,
  radius: { sm: 14, md: 20, lg: 26, xl: 32 },
};

import { Platform } from 'react-native';

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
