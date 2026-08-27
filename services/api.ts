// services/api.ts
import { Platform } from "react-native";

/* ---------------------------------------------------------
   Backend base URL — خودکار!
   IP از hostUri اکسپو کشف می‌شود و با پروب تست می‌شود.
   دیگه لازم نیست با عوض شدن Wi-Fi دستی تغییرش بدید.
---------------------------------------------------------- */
import { getBaseUrl, currentBaseUrl } from "./apiConfig";

/** برای سازگاری — URL اولیه قبل از پروب (ترجیحاً از currentBaseUrl استفاده کنید) */
export const BACKEND_URL = currentBaseUrl();

export interface DoctorInfo {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  rating: number;
  review_count: number;
  experience_years: number;
  avatar_url?: string | null;
  bio?: string;
}

export interface Recommendation {
  service?: {
    area: string;
    title: string;
    note?: string;
    sessions: number;
    duration_min: number;
    recovery_days: number;
  };
  estimated_price?: {
    min: number;
    max: number;
    label?: string;
    currency: string;
  };
  gel_cc?: number | null;
  doctor?: DoctorInfo;
  message?: string;
  cta?: { text: string; deeplink: string };
}

export interface ThreeDResponse {
  status: string;
  image: string;
  /** 🆕 2D Snapchat-style filtered photo (base64 JPEG) — the REAL result */
  filtered_image?: string | null;
  /** 🆕 عکس اصلی کوچک‌شده — برای نمایش «قبل» */
  original_image?: string | null;
  three_d?: {
    vertices: number[][];
    uvs?: number[][];
    faces: number[][];
    texture: string;
    num_vertices: number;
    num_faces: number;
  };
  changes: {
    area: string | null;
    action: string | null;
    intensity: number;
  };
  description: string;
  intensity: number;
  recommendation?: Recommendation | null;
}

export async function sendThreeDRequest(
  imageBase64: string,
  text: string,
  intensity: number = 0.7,
): Promise<ThreeDResponse> {
  const formData = new FormData();

  const uri = `data:image/jpeg;base64,${imageBase64}`;
  formData.append("file", {
    uri: uri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);

  formData.append("text", text);
  formData.append("intensity", String(intensity));

  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/3d-filter`, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "خطا در پردازش");
  }

  return response.json();
}

/* =========================================================
   🎨 RETOUCH — ابزارهای ادیت حرفه‌ای
========================================================= */

export interface RetouchPreset {
  id: string;
  name: string;
  emoji: string;
  adjustments: Record<string, number>;
}

export interface RetouchTool {
  key: string;
  name: string;
  icon: string;
}

export async function sendRetouchRequest(
  imageBase64: string,
  adjustments: Record<string, number>,
): Promise<{ status: string; image: string; applied: Record<string, number> }> {
  const formData = new FormData();
  const uri = `data:image/jpeg;base64,${imageBase64}`;
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);
  formData.append("adjustments", JSON.stringify(adjustments));

  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/retouch`, {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "خطا در پردازش رتوش");
  }
  return response.json();
}

export async function getRetouchPresets(): Promise<{
  presets: RetouchPreset[];
  tools: RetouchTool[];
}> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/retouch/presets`);
  if (!response.ok) throw new Error("خطا در دریافت پریست‌ها");
  return response.json();
}

/* =========================================================
   🎛️ MANUAL EDIT — اسلایدر حجم نواحی صورت
========================================================= */

export async function sendManualEditRequest(
  imageBase64: string,
  edits: Record<string, number>,
): Promise<{
  status: string;
  image: string;
  applied: Record<string, number>;
  labels: Record<string, string>;
}> {
  const formData = new FormData();
  const uri = `data:image/jpeg;base64,${imageBase64}`;
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);
  formData.append("edits", JSON.stringify(edits));

  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/manual-edit`, {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "خطا در ادیت دستی");
  }
  return response.json();
}

/* =========================================================
   🧊 AVATAR 3D — بازسازی سه‌بعدی از چند زاویه
========================================================= */

export interface Avatar3DResponse {
  status: string;
  views_used: number;
  yaws: number[];
  mesh: {
    vertices: number[][];
    uvs: number[][];
    faces: number[][];
    num_vertices: number;
    num_faces: number;
  };
  texture: string | null;
  preview: string | null;
  message: string;
}

/**
 * imagesB64: [جلو (اجباری), نیم‌رخ چپ (اختیاری), نیم‌رخ راست (اختیاری)]
 */
export async function buildAvatar3D(
  imagesB64: string[],
): Promise<Avatar3DResponse> {
  const formData = new FormData();
  imagesB64.slice(0, 4).forEach((b64, i) => {
    const uri = `data:image/jpeg;base64,${b64}`;
    formData.append("files", {
      uri,
      type: "image/jpeg",
      name: `view_${i}.jpg`,
    } as any);
  });

  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/avatar-3d`, {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "خطا در ساخت آواتار سه‌بعدی");
  }
  return response.json();
}
