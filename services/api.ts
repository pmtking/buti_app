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
   🎯 STYLE EDIT — ادیت تخصصی با استایل‌های ناحیه‌ای
   (مثل: بینی قلمی، لب روسی، فک تیز)
========================================================= */

export interface StyleOption {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
}

export interface EditAction {
  id: string;
  name: string;
  description?: string;
}

export interface StyleEditResult {
  status: string;
  image: string;
  description?: string;
  changes?: any;
  processing_time?: number;
  error?: string;
}

export async function getEditStyles(area: string): Promise<{
  status: string;
  area: string;
  styles: StyleOption[];
}> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/edit/styles?area=${encodeURIComponent(area)}`);
  if (!response.ok) throw new Error("خطا در دریافت استایل‌ها");
  return response.json();
}

export async function getEditAreas(): Promise<{
  areas: { key: string; label: string; emoji: string }[];
  actions: EditAction[];
}> {
  const baseUrl = await getBaseUrl();
  const [stylesRes, actionsRes] = await Promise.all([
    fetch(`${baseUrl}/api/v1/edit/styles`),
    fetch(`${baseUrl}/api/v1/edit/actions`),
  ]);
  if (!stylesRes.ok || !actionsRes.ok) throw new Error("خطا در دریافت ابزارها");
  // styles به صورت پیش‌فرض برای هر area لیست می‌دهد، ما areas را استخراج می‌کنیم
  return actionsRes.json() as any;
}

export async function getEditActions(): Promise<{
  status: string;
  actions: EditAction[];
}> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/edit/actions`);
  if (!response.ok) throw new Error("خطا در دریافت اکشن‌ها");
  return response.json();
}

/** ادیت پیشرفته با متن طبیعی (مثل: «بینی کوچیکتر قلمی») */
export async function sendStyleEdit(
  imageBase64: string,
  naturalText: string,
  area?: string,
  action?: string,
  intensity: number = 0.7,
): Promise<StyleEditResult> {
  const formData = new FormData();
  const uri = `data:image/jpeg;base64,${imageBase64}`;
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);
  // متن طبیعی بهترین است — بک‌اند AI آن را می‌فهمد
  let prompt = naturalText;
  if (area && action) {
    prompt = `${area} ${action} ${naturalText}`;
  }
  formData.append("text", prompt);
  formData.append("intensity", String(intensity));
  if (area) formData.append("area", area);
  if (action) formData.append("action", action);

  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/edit`, {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.detail || "خطا در ادیت استایل");
  }
  // پاسخ سرور: {status, message, processing_time} + data.image
  return {
    status: data.status || "success",
    image: data.data?.image || data.image || "",
    description: data.message,
    changes: data.changes,
    processing_time: data.processing_time,
  };
}

/* =========================================================
   🎭 AVATAR 3D
========================================================= */

export interface Avatar3DResponse {
  status: string;
  views_used: number;
  yaws?: number[];
  mesh?: {
    vertices: number[][];
    faces: number[][];
    num_vertices: number;
    num_faces: number;
  };
  texture?: string;
  s3d_url?: string | null;
  three_d?: {
    vertices: number[][];
    uvs?: number[][];
    faces: number[][];
    texture: string;
    num_vertices: number;
    num_faces: number;
  };
  image?: string;
  message?: string;
  error?: string;
}

/** ساخت آواتار سه‌بعدی از عکس‌ها — ورودی آرایه‌ای از base64 تصاویر */
export async function buildAvatar3D(
  images: string[],
): Promise<Avatar3DResponse> {
  const formData = new FormData();
  images.forEach((b64, i) => {
    const names = ["front", "left", "right"];
    const name = names[i] || `view${i}`;
    formData.append(`${name}_image`, {
      uri: `data:image/jpeg;base64,${b64}`,
      type: "image/jpeg",
      name: `${name}.jpg`,
    } as any);
  });

  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/avatar-3d`, {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || data.detail || "خطا در ساخت آواتار");
  }
  // نرمال‌سازی پاسخ به ساختار مورد انتظار اپ
  return {
    status: data.status || "success",
    views_used: data.views_used || images.length,
    yaws: data.yaws || [],
    // سه‌بعدی از three_d استخراج می‌شود
    mesh: data.three_d
      ? {
          vertices: data.three_d.vertices,
          faces: data.three_d.faces,
          num_vertices: data.three_d.num_vertices,
          num_faces: data.three_d.num_faces,
        }
      : data.mesh,
    texture: data.three_d?.texture || data.texture,
    s3d_url: data.s3d_url,
    image: data.image,
    message: data.message,
  };
}

export async function sendAvatar3DRequest(
  imageBase64: string,
  text: string,
  intensity: number = 0.7,
): Promise<ThreeDResponse> {
  const formData = new FormData();
  const uri = `data:image/jpeg;base64,${imageBase64}`;
  formData.append("file", { uri, type: "image/jpeg", name: "photo.jpg" } as any);
  formData.append("text", text);
  formData.append("intensity", String(intensity));

  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/avatar-3d`, {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "خطا در ساخت آواتار");
  }
  return response.json();
}
