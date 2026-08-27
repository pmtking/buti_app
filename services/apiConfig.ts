// services/apiConfig.ts
// کشف خودکار IP بک‌اند — دیگه نیازی به تغییر دستی IP نیست
// منطق:
//  1) در حالت dev از hostUri اکسپو (IP سیستم میزبان) استفاده کن
//  2) کاندیدها را با یک درخواست سبک /docs پروب کن؛ اولینی که جواب داد برنده است
//  3) نتیجه کش می‌شود تا سرعت حفظ شود
import { Platform } from "react-native";
import Constants from "expo-constants";

const PORT = 8000;

/** استخراج هاست از hostUri اکسپو مثل «192.168.1.5:8081» */
function expoHost(): string | null {
  try {
    const anyConst = Constants as any;
    const uri: string | undefined =
      anyConst?.expoConfig?.hostUri ??
      anyConst?.manifest2?.extra?.expoGo?.debuggerHost ??
      anyConst?.manifest?.debuggerHost;
    if (!uri) return null;
    const host = uri.split("//").pop()?.split(":")[0] ?? null;
    return host || null;
  } catch {
    return null;
  }
}

/** آیا این IP احتمالاً شبیه‌ساز اندروید است؟ */
function isAndroidEmulator(host: string | null): boolean {
  return (
    Platform.OS === "android" &&
    (__DEV__ === true && (host === null || host === "localhost" || host === "10.0.2.2"))
  );
}

/** لیست IPهای کاندید به ترتیب اولویت */
export function candidateUrls(): string[] {
  const host = expoHost();
  const list: string[] = [];

  // ۱) IP واقعی سیستم میزبان از اکسپو (بهترین گزینه برای گوشی روی Wi-Fi)
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    list.push(`http://${host}:${PORT}`);
  }
  // ۲) وب یا همان ماشین
  if (Platform.OS === "web") {
    list.unshift("http://localhost:" + PORT);
  }
  // ۳) شبیه‌ساز اندروید
  if (isAndroidEmulator(host)) {
    list.push("http://10.0.2.2:" + PORT);
  }
  // ۴) لوکال به عنوان آخرین شانس
  list.push("http://localhost:" + PORT);

  // حذف تکراری
  return [...new Set(list)];
}

/** URL پیش‌فرض هم‌زمان (قبل از پروب) — برای سازگاری فوری */
export const BACKEND_URL_INITIAL: string =
  Platform.select({
    web: `http://localhost:${PORT}`,
    default: (() => {
      const host = expoHost();
      if (Platform.OS === "android" && isAndroidEmulator(host)) return `http://10.0.2.2:${PORT}`;
      if (host) return `http://${host}:${PORT}`;
      return `http://localhost:${PORT}`;
    })(),
  }) ?? `http://localhost:${PORT}`;

let resolvedUrl: string | null = null;
let resolving: Promise<string> | null = null;

/** یک URL را با درخواست HEAD سبک تست کن (timeout کوتاه) */
async function probe(url: string, timeoutMs = 1200): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(`${url}/docs`, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(timer);
    return res.status < 500;
  } catch {
    return false;
  }
}

/**
 * بهترین URL بک‌اند را برگردان (با کش).
 * اگر قبلاً resolve شده همان برمی‌گردد؛ وگرنه کاندیدها را پروب می‌کند.
 */
export async function getBaseUrl(forceRefresh = false): Promise<string> {
  if (resolvedUrl && !forceRefresh) return resolvedUrl;
  if (resolving) return resolving;

  resolving = (async () => {
    const candidates = candidateUrls();
    for (const url of candidates) {
      if (await probe(url)) {
        console.log("✅ Backend discovered:", url);
        resolvedUrl = url;
        return url;
      }
    }
    // هیچ‌کدام جواب نداد — اولین کاندید را برگردان تا خطای معنادار بالا بیاید
    console.warn("⚠️ هیچ بک‌اندی پیدا نشد، استفاده از:", candidates[0]);
    resolvedUrl = candidates[0];
    return candidates[0];
  })();

  try {
    return await resolving;
  } finally {
    resolving = null;
  }
}

/** URL فعلی (حتی اگر هنوز probe نشده) */
export function currentBaseUrl(): string {
  return resolvedUrl ?? BACKEND_URL_INITIAL;
}
