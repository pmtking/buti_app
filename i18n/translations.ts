// BUTI i18n — ترجمه‌ها (fa / en / ar)
export type Lang = 'fa' | 'en' | 'ar';

export const LANGS: { code: Lang; label: string; flag: string[] }[] = [
  { code: 'fa', label: 'فارسی', flag: ['#22C55E', '#FFFFFF', '#EF4444'] },
  { code: 'en', label: 'English', flag: ['#3C3B6E', '#B22234', '#FFFFFF'] },
  { code: 'ar', label: 'العربية', flag: ['#007A3D', '#FFFFFF', '#000000'] },
];

const fa = {
  appName: 'BUTI',
  tabHome: 'خانه',
  tabGallery: 'گالری',
  tabProfile: 'پروفایل',
  tabAvatar: 'آواتار ۳بعدی',
  language: 'زبان',

  heroBadge: 'Beauty AI',
  heroTitle1: 'چهره بعدی‌ات رو',
  heroTitle2: 'قبل از تصمیم ببین',
  heroSub: 'عکس بده، بگو چی می‌خوای، نتیجه روی صورت خودت نشسته می‌شه',
  heroCta: 'شروع شبیه‌سازی',

  quickSimTitle: 'شبیه‌سازی زیبایی',
  quickSimSub: 'قبل از تصمیم ببین',
  quickScanTitle: 'آنالیز پوست',
  quickScanSub: 'تحلیل هوشمند چهره',

  sectionDoctors: 'پزشکان BUTI',
  seeAll: 'همه',
  sectionFeed: 'مقالات و نتایج',
  galleryResults: 'گالری نتایج',
  view: 'مشاهده',

  searchPh: 'جستجوی خدمت…',
  catAll: 'همه',
  before: 'قبل',
  after: 'بعد',
  toman: 'تومان',
  simThis: 'شبیه‌سازی این تغییر',
  notFound: 'موردی مطابق جستجو پیدا نشد',

  vipMember: 'عضو ویژه',
  statSims: 'شبیه‌سازی',
  statAppts: 'نوبت فعال',
  statFavs: 'علاقه‌مندی',
  menuHistory: 'تاریخچه شبیه‌سازی‌ها',
  menuAppts: 'نوبت‌های من',
  menuFavs: 'علاقه‌مندی‌ها',
  menuPrivacy: 'حریم خصوصی و امنیت',
  menuSupport: 'پشتیبانی و سوالات',
  menuSettings: 'تنظیمات',
  logout: 'خروج از حساب',
  betaVersion: 'نسخه آزمایشی',
};

export type Dict = typeof fa;

const en: Dict = {
  appName: 'BUTI',
  tabHome: 'Home',
  tabGallery: 'Gallery',
  tabProfile: 'Profile',
  tabAvatar: '3D Avatar',
  language: 'Language',

  heroBadge: 'Beauty AI',
  heroTitle1: 'See your next face',
  heroTitle2: 'before you decide',
  heroSub: 'Upload a photo, say what you want, preview it on your own face',
  heroCta: 'Start Simulation',

  quickSimTitle: 'Beauty Simulation',
  quickSimSub: 'Preview before deciding',
  quickScanTitle: 'Skin Analysis',
  quickScanSub: 'Smart face analysis',

  sectionDoctors: 'BUTI Doctors',
  seeAll: 'All',
  sectionFeed: 'Articles & Results',
  galleryResults: 'Results Gallery',
  view: 'View',

  searchPh: 'Search services…',
  catAll: 'All',
  before: 'Before',
  after: 'After',
  toman: 'Toman',
  simThis: 'Simulate this change',
  notFound: 'No results found',

  vipMember: 'VIP Member',
  statSims: 'Simulations',
  statAppts: 'Active visits',
  statFavs: 'Favorites',
  menuHistory: 'Simulation History',
  menuAppts: 'My Appointments',
  menuFavs: 'Favorites',
  menuPrivacy: 'Privacy & Security',
  menuSupport: 'Support & FAQ',
  menuSettings: 'Settings',
  logout: 'Log out',
  betaVersion: 'Beta version',
};

const ar: Dict = {
  appName: 'بوتي',
  tabHome: 'الرئيسية',
  tabGallery: 'المعرض',
  tabProfile: 'الملف',
  tabAvatar: 'أفاتار ثلاثي',
  language: 'اللغة',

  heroBadge: 'بيوتي AI',
  heroTitle1: 'شاهد ملامحك القادمة',
  heroTitle2: 'قبل أن تقرر',
  heroSub: 'أرسل صورة، أخبرنا بما تريد، وشاهد النتيجة على وجهك',
  heroCta: 'ابدأ المحاكاة',

  quickSimTitle: 'محاكاة الجمال',
  quickSimSub: 'عاين قبل القرار',
  quickScanTitle: 'تحليل البشرة',
  quickScanSub: 'تحليل ذكي للوجه',

  sectionDoctors: 'أطباء بوتي',
  seeAll: 'الكل',
  sectionFeed: 'مقالات و نتائج',
  galleryResults: 'معرض النتائج',
  view: 'عرض',

  searchPh: 'ابحث عن خدمة…',
  catAll: 'الكل',
  before: 'قبل',
  after: 'بعد',
  toman: 'تومان',
  simThis: 'محاكاة هذا التغيير',
  notFound: 'لا توجد نتائج',

  vipMember: 'عضوية مميزة',
  statSims: 'محاكاة',
  statAppts: 'زيارات نشطة',
  statFavs: 'المفضلة',
  menuHistory: 'سجل المحاكاة',
  menuAppts: 'مواعيدي',
  menuFavs: 'المفضلة',
  menuPrivacy: 'الخصوصية والأمان',
  menuSupport: 'الدعم والأسئلة',
  menuSettings: 'الإعدادات',
  logout: 'تسجيل الخروج',
  betaVersion: 'نسخة تجريبية',
};

export const DICTS: Record<Lang, Dict> = { fa, en, ar };

export const CAT_KEYS = ['all', 'injections', 'skin', 'laser', 'hair', 'body'] as const;
export type CatKey = (typeof CAT_KEYS)[number];

export const CATEGORIES: Record<Lang, Record<CatKey, string>> = {
  fa: { all: 'همه', injections: 'تزریقات', skin: 'پوست', laser: 'لیزر', hair: 'مو', body: 'بدن' },
  en: { all: 'All', injections: 'Injections', skin: 'Skin', laser: 'Laser', hair: 'Hair', body: 'Body' },
  ar: { all: 'الكل', injections: 'حقن', skin: 'البشرة', laser: 'ليزر', hair: 'الشعر', body: 'الجسم' },
};
