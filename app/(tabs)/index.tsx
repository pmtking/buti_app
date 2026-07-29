import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TopDoctorsSlider, DoctorStoryItem } from '@/components/TopDoctorsSlider';
import { FancyBottomMenu } from '@/components/BottomMenu';
import { MOCK_STORIES } from '@/mock/storiesData';
import { MOCK_POSTS } from '@/mock/mockPost';
import { PinterestGrid } from '@/components/posts/Posts';

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOpenStory = (story: DoctorStoryItem, index: number) => {
    console.log('استوری باز شد:', story.name, index);
  };

  const MOCK_PINTEREST_POSTS = [
    { id: '1', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/64/400/600', aspectRatio: 0.65 },
    { id: '2', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/65/400/550', aspectRatio: 0.7 },
    { id: '3', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/1025/400/600', aspectRatio: 0.65 },
    { id: '4', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/338/400/750', aspectRatio: 0.5 },
    { id: '5', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/342/400/800', aspectRatio: 0.48 },
    { id: '6', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/1062/400/600', aspectRatio: 0.65 },
    { id: '7', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/1074/400/580', aspectRatio: 0.68 },
    { id: '7', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/1074/400/580', aspectRatio: 0.68 },
    { id: '7', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/1074/400/580', aspectRatio: 0.68 },
    { id: '7', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/1074/400/580', aspectRatio: 0.68 },
    { id: '7', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/1074/400/580', aspectRatio: 0.68 },
    { id: '7', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/1074/400/580', aspectRatio: 0.68 },
    { id: '7', doctorName: 'Dr.mohammad', doctorSpecialty: 'متخصص پوست و جراح زیبایی', imageUrl: 'https://picsum.photos/id/1074/400/580', aspectRatio: 0.68 },
  ];

  return (
    <View style={styles.container}>
      {/* اسلایدر استوری‌ها با ارتفاع ذاتی خود */}
      <TopDoctorsSlider
        data={MOCK_STORIES}
        onOpenStory={handleOpenStory}
      />

      {/* گرید پست‌ها که باید flex: 1 داشته باشد تا در iOS کل فضای زیر استوری را بگیرد */}
      <PinterestGrid 
        posts={MOCK_PINTEREST_POSTS} 
        style={styles.gridContainer} // اگر درون PinterestGrid استایل container دارید، این بخش را پوشش می‌دهد
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDE9F8',
  },
  gridContainer: {
    flex: 1, // <--- حیاتی برای iOS جهت محاسبه درست ارتفاع اسکرول
  },
});