import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DoctorStoryItem {
  id: string;
  nameEn?: string;
  nameFa: string;
  specialty: string;
  imageUrl: string;
  avatarUrl: string;
  hasUnseenStory?: boolean;
}

interface Props {
  data?: DoctorStoryItem[];
  onOpenStory?: (story: DoctorStoryItem, index: number) => void;
}

const CARD_WIDTH = 84;
const CARD_HEIGHT = 145;
const SPACING = -12;
const ITEM_FULL_WIDTH = CARD_WIDTH + SPACING;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

const AnimatedCard = ({
  item,
  index,
  scrollX,
  onPress,
}: {
  item: DoctorStoryItem;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const position = index * ITEM_FULL_WIDTH;
    const distance = scrollX.value - position;
    const value = distance / ITEM_FULL_WIDTH;

    // دامنه گسترش یافته تا 4- و 4+ برای دیده شدن تعداد کارت‌های بیشتر
    const scale = interpolate(
      value,
      [-4, -3, -2, -1, 0, 1, 2, 3, 4],
      [0.42, 0.55, 0.68, 0.82, 1.0, 0.82, 0.68, 0.55, 0.42],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      value,
      [-4, -3, -2, -1, 0, 1, 2, 3, 4],
      [40, 32, 22, 12, 0, 12, 22, 32, 40],
      Extrapolation.CLAMP
    );

    const zIndex = Math.round(
      interpolate(
        value,
        [-4, -3, -2, -1, 0, 1, 2, 3, 4],
        [5, 10, 20, 30, 40, 30, 20, 10, 5],
        Extrapolation.CLAMP
      )
    );

    const opacity = interpolate(
      value,
      [-4, -3, -2, -1, 0, 1, 2, 3, 4],
      [0.4, 0.6, 0.78, 0.9, 1.0, 0.9, 0.78, 0.6, 0.4],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
      zIndex,
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          styles.cardContainer,
          item.hasUnseenStory && styles.unseenStoryBorder,
        ]}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.storyImage} />

        <View style={styles.badgeOverlay}>
          <View style={styles.textWrapper}>
            <Text style={styles.doctorNameEn} numberOfLines={1}>
              {item.nameEn || 'Dr.mohammad'}
            </Text>
            <Text style={styles.doctorNameFa} numberOfLines={1}>
              {item.nameFa || 'دکتر محمد'}
            </Text>
            <Text style={styles.specialtyText} numberOfLines={1}>
              {item.specialty || 'متخصص پوست'}
            </Text>
          </View>

          <View style={styles.avatarBorder}>
            <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const TopDoctorsSlider: React.FC<Props> = ({ data = [], onOpenStory }) => {
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const centerIndex = Math.floor(data.length / 2);

  useEffect(() => {
    if (data.length > 0) {
      const initialOffset = centerIndex * ITEM_FULL_WIDTH;
      scrollX.value = initialOffset;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialOffset,
          animated: false,
        });
      }, 50);
    }
  }, [data.length]);

  if (!data || data.length === 0) {
    return null;
  }

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.outerContainer}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={ITEM_FULL_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
          alignItems: 'center',
        }}
        style={styles.scrollViewStyle}
      >
        {data.map((item, index) => (
          <AnimatedCard
            key={item.id || index.toString()}
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={() => onOpenStory?.(item, index)}
          />
        ))}
      </Animated.ScrollView>

      <View style={styles.bottomIndicatorBar} />
    </View>
  );
};

export default TopDoctorsSlider;

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#E7EEFA',
    borderRadius: 28,
    paddingTop: 14,
    paddingBottom: 10,
    marginHorizontal: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewStyle: {
    width: SCREEN_WIDTH - 16,
    height: CARD_HEIGHT,
  },
  cardWrapper: {
    width: ITEM_FULL_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  unseenStoryBorder: {
    borderColor: '#2563EB',
    borderWidth: 1.8,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 2,
  },
  doctorNameEn: {
    color: '#FFFFFF',
    fontSize: 6.5,
    fontWeight: '600',
    textAlign: 'right',
  },
  doctorNameFa: {
    color: '#CBD5E1',
    fontSize: 5.5,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 0.5,
  },
  specialtyText: {
    color: '#94A3B8',
    fontSize: 4.5,
    textAlign: 'right',
    marginTop: 0.5,
  },
  avatarBorder: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1,
    borderColor: '#22C55E',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bottomIndicatorBar: {
    width: 100,
    height: 3.5,
    backgroundColor: '#0F172A',
    borderRadius: 2,
    marginTop: 10,
  },
});