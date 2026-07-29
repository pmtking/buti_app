import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { MedicalPost } from '@/types/post';
import { PostCard } from './PostCard';

export interface PinterestGridProps {
  posts: MedicalPost[];
  onSelectPost?: (post: MedicalPost) => void;
  ListHeaderComponent?: React.ReactNode;
}

// مقادیر بزرگ‌تر = ارتفاع کمتر کارت‌ها (کوتاه‌تر شدن پین‌ها)
// 1.0 (مربع)، 1.15 (افقی و کوتاه)، 0.75 (عمودی استاندارد و متناسب)
const BALANCED_ASPECT_RATIOS = [0.85, 1.0, 0.75, 0.9, 1.1, 0.8];

export const PinterestGrid: React.FC<PinterestGridProps> = ({
  posts = [],
  onSelectPost,
  ListHeaderComponent,
}) => {
  // محاسبه و توزیع متوازن آیتم‌ها در ۳ ستون (Masonry Algorithm)
  const columns = useMemo(() => {
    const col1: { post: MedicalPost; aspectRatio: number }[] = [];
    const col2: { post: MedicalPost; aspectRatio: number }[] = [];
    const col3: { post: MedicalPost; aspectRatio: number }[] = [];

    const colHeights = [0, 0, 0];

    posts.forEach((post, index) => {
      // استفاده از نسبت تصویر استانداردتر برای کاهش ارتفاع کارت‌ها
      const assignedRatio =
        post.aspectRatio || BALANCED_ASPECT_RATIOS[index % BALANCED_ASPECT_RATIOS.length];

      const estimatedHeight = 1 / assignedRatio;

      const minHeightIndex = colHeights.indexOf(Math.min(...colHeights));

      if (minHeightIndex === 0) {
        col1.push({ post, aspectRatio: assignedRatio });
        colHeights[0] += estimatedHeight;
      } else if (minHeightIndex === 1) {
        col2.push({ post, aspectRatio: assignedRatio });
        colHeights[1] += estimatedHeight;
      } else {
        col3.push({ post, aspectRatio: assignedRatio });
        colHeights[2] += estimatedHeight;
      }
    });

    return [col1, col2, col3];
  }, [posts]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {ListHeaderComponent}

      <View style={styles.gridWrapper}>
        {columns.map((colItems, colIndex) => (
          <View key={`col-${colIndex}`} style={styles.column}>
            {colItems.map(({ post, aspectRatio }) => (
              <View key={post.id} style={styles.cardItemHolder}>
                <PostCard
                  item={{ ...post, aspectRatio }}
                  onPress={onSelectPost}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  gridWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  column: {
    flex: 1,
    marginHorizontal: 3,
  },
  cardItemHolder: {
    width: '100%',
    marginBottom: 8, // فاصله عمودی بین کارت‌ها
  },
});