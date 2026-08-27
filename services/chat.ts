// services/chat.ts
// 💬 سرویس چت با «بوتی» — مغز مکالمه سمت سرور + fallback محلی
import { getBaseUrl } from './apiConfig';

export interface ChatResponse {
  status: string;
  reply: string | null;
  intent: string;
  is_edit_request: boolean;
  engine?: 'local' | 'llm' | 'error';
}

/** شناسه پایدار دستگاه برای حافظه مکالمه */
export async function getUserId(): Promise<string> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    let id = await AsyncStorage.getItem('buti_uid');
    if (!id) {
      id = `u_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      await AsyncStorage.setItem('buti_uid', id);
    }
    return id;
  } catch {
    return 'anon_device';
  }
}

/**
 * پیام کاربر را به بوتی میدهد.
 * اگر سرور در دسترس نبود، جواب محلی دوستانه برمی‌گردد تا چت هیچوقت خشک نشود.
 */
export async function sendChatMessage(
  text: string,
  opts?: { hasPhoto?: boolean; lastResultOk?: boolean }
): Promise<ChatResponse & { offline: boolean }> {
  const userId = await getUserId();
  try {
    const baseUrl = await getBaseUrl();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${baseUrl}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        text,
        has_photo: opts?.hasPhoto ?? false,
        last_result_ok: opts?.lastResultOk ?? null,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`http ${res.status}`);
    const data: ChatResponse = await res.json();
    return { ...data, offline: false };
  } catch {
    return { ...offlineReply(text), offline: true };
  }
}

/* ---------- پاسخ‌های آفلاین دوستانه ---------- */
const OFFLINE_GREET = [
  'سلام رفیق! 🌸 الان نت ضعیفه ولی من همین‌جام — یه عکس بفرست ببینیم چی میشه!',
  'های! 😍 اتصال سرور یکم کُنده، ولی می‌تونم همین الان کمکت کنم — عکست رو انتخاب کن.',
];
const OFFLINE_FALLBACK =
  'الان دماغم به سرور نمیرسه 😅 ولی اگه یه عکس بفرستی، مستقیم پردازشش می‌کنم!';

function offlineReply(text: string): ChatResponse & { offline: boolean } {
  const t = text.trim().toLowerCase();
  const isGreet = /سلام|درود|hi|hello|های/.test(t);
  const isEdit =
    /(کن\b|بشه|بزن|باریک|پهن|پرتر|تیز|بالا|پایین|روسی|فانتزی|عروسکی|گوشتی|قوز|قلمی)/.test(t);
  return {
    status: 'success',
    reply: isGreet
      ? OFFLINE_GREET[Math.floor(Math.random() * OFFLINE_GREET.length)]
      : OFFLINE_FALLBACK,
    intent: isEdit ? 'edit' : isGreet ? 'greeting' : 'chat',
    is_edit_request: isEdit,
    engine: 'error',
    offline: true,
  };
}
