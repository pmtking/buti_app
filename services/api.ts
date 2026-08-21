// services/api.ts
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  ios: 'http://localhost:8000',
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000'
});

export interface ThreeDResponse {
  status: string;
  image: string;
  three_d: {
    vertices: number[][];
    faces: number[][];
    texture: string;
    num_vertices: number;
    num_faces: number;
  };
  changes: {
    area: string;
    action: string;
    intensity: number;
  };
  description: string;
  intensity: number;
}

export async function sendThreeDRequest(
  imageBase64: string,
  text: string,
  intensity: number = 0.7
): Promise<ThreeDResponse> {
  const formData = new FormData();
  
  const uri = `data:image/jpeg;base64,${imageBase64}`;
  formData.append('file', {
    uri: uri,
    type: 'image/jpeg',
    name: 'photo.jpg'
  } as any);
  
  formData.append('text', text);
  formData.append('intensity', String(intensity));

  const response = await fetch(`${BASE_URL}/api/v1/3d-filter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'خطا در پردازش');
  }

  return response.json();
}