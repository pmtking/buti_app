// BUTI i18n — کانتکست و هوک استفاده از زبان
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import { DICTS, Dict, Lang } from './translations';

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  isRTL: boolean;
};

const Ctx = createContext<I18nCtx>({
  lang: 'fa',
  setLang: () => {},
  t: DICTS.fa,
  isRTL: true,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fa');

  // بازیابی زبان ذخیره‌شده
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { loadLang } = require('./storage');
      const saved = loadLang();
      if (saved && ['fa', 'en', 'ar'].includes(saved)) setLangState(saved as Lang);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { saveLang } = require('./storage');
      saveLang(l);
    } catch {}
    // عربی/فارسی راست‌به‌چپ هستند؛ فعلاً چیدمان دستی است، فقط جهت را گزارش می‌کنیم
    I18nManager.allowRTL(l !== 'en');
  };

  const value = useMemo<I18nCtx>(
    () => ({ lang, setLang, t: DICTS[lang], isRTL: lang !== 'en' }),
    [lang]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
