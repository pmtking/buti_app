import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, LayoutChangeEvent } from 'react-native';
import { MedicalPost } from '@/types/post';
import { PostCard } from './PostCard';

export interface PinterestGridProps {
  posts: MedicalPost[];
  onSelectPost?: (post: MedicalPost) => void;
  ListHeaderComponent?: React.ReactNode;
}

const BALANCED_ASPECT_RATIOS = [0.85, 1.0, 0.75, 0.9, 1.1, 0.8];

export const PinterestGrid: React.FC<PinterestGridProps> = ({
  posts = [],
  onSelectPost,
  ListHeaderComponent,
}) => {
  // فیکس حیاتی برای iOS: جلوگیری از صفر شدن ارتفاع اسکرول‌ویو در رندر اولیه
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setContainerHeight(height);
    }
  };

  const columns = useMemo(() => {
    const col1: { post: MedicalPost; aspectRatio: number }[] = [];
    const col2: { post: MedicalPost; aspectRatio: number }[] = [];
    const col3: { post: MedicalPost; aspectRatio: number }[] = [];

    const colHeights = [0, 0, 0];

    posts.forEach((post, index) => {
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
    <View style={styles.wrapper} onLayout={handleLayout}>
      <ScrollView
        style={[styles.container, containerHeight > 0 ? { minHeight: containerHeight } : {}]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
  },
  container: {
    marginTop: 15,
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingBottom: 32,
    flexGrow: 1, // الزامی برای iOS جهت اطمینان از گسترش محتوا
  },
  gridWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    marginHorizontal: 3,
    flexDirection: 'column',
  },
  cardItemHolder: {
    width: '100%',
    marginBottom: 8,
  },
});