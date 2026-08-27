// ذخیره‌سازی سبک زبان بدون وابستگی خارجی
// (اگر expo-secure-store یا async-storage در آینده اضافه شد، همین‌جا جایگزین شود)
import { Lang } from './translations';

const KEY = 'buti.lang';
let memory: Lang | null = null;

export function saveLang(lang: Lang) {
  memory = lang;
  try {
    const g = globalThis as any;
    if (g.localStorage) g.localStorage.setItem(KEY, lang);
  } catch {}
}

export function loadLang(): Lang | null {
  if (memory) return memory;
  try {
    const g = globalThis as any;
    const v = g.localStorage?.getItem?.(KEY);
    if (v && ['fa', 'en', 'ar'].includes(v)) return v as Lang;
  } catch {}
  return null;
}
