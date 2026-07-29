import { MedicalPost } from "@/types/post";


export const MOCK_POSTS: MedicalPost[] = [
  {
    id: '1',
    title: 'تکنیک‌های جدید جراحی توراکس',
    doctorName: 'دکتر علیرضا حسینی',
    doctorSpecialty: 'جراح قلب و عروق',
    imageUrl: 'https://picsum.photos/400/600',
    aspectRatio: 400 / 600, // عکس عمودی بلند
    likesCount: 124,
  },
  {
    id: '2',
    title: 'بررسی گرافی ریه در بیماران ICU',
    doctorName: 'دکتر مریم زمانی',
    doctorSpecialty: 'فوق تخصص ریه',
    imageUrl: 'https://picsum.photos/400/400',
    aspectRatio: 1, // عکس مربعی
    likesCount: 89,
  },
  {
    id: '3',
    title: 'چک‌لیست دارویی قبل از عمل surgery',
    doctorName: 'دکتر رضا نوری',
    doctorSpecialty: 'متخصص بیهوشی',
    imageUrl: 'https://picsum.photos/400/550',
    aspectRatio: 400 / 550,
    likesCount: 210,
  },
  {
    id: '4',
    title: 'آنالیز نوار قلب (ECG) پیشرفته',
    doctorName: 'دکتر سارا کاظمی',
    doctorSpecialty: 'متخصص قلب',
    imageUrl: 'https://picsum.photos/400/300',
    aspectRatio: 400 / 300, // عکس افقی
    likesCount: 56,
  },
  {
    id: '5',
    title: 'مراقبت‌های پوست بعد از لیزر',
    doctorName: 'دکتر نیلوفر راد',
    doctorSpecialty: 'پوست و مو',
    imageUrl: 'https://picsum.photos/400/700',
    aspectRatio: 400 / 700, // عکس کاملاً کشیده
    likesCount: 312,
  },
];