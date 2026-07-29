import React, { memo, useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MedicalPost } from '@/types/post';

interface PostCardProps {
  item: MedicalPost;
  onPress?: (item: MedicalPost) => void;
}

const DEFAULT_ASPECT_RATIO = 0.8;

const PostCardComponent: React.FC<PostCardProps> = ({ item, onPress }) => {
  const doctorAvatar = item.doctorAvatar || item.imageUrl;

  const [aspectRatio, setAspectRatio] = useState<number>(
    item.aspectRatio && item.aspectRatio > 0 ? item.aspectRatio : DEFAULT_ASPECT_RATIO
  );

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;

    if (item.aspectRatio && item.aspectRatio > 0) {
      setAspectRatio(item.aspectRatio);
      return;
    }

    if (item.imageUrl) {
      Image.getSize(
        item.imageUrl,
        (width, height) => {
          if (isMounted.current && width > 0 && height > 0) {
            const calculatedRatio = width / height;
            if (Number.isFinite(calculatedRatio)) {
              setAspectRatio(calculatedRatio);
            }
          }
        },
        () => {
          if (isMounted.current) {
            setAspectRatio(DEFAULT_ASPECT_RATIO);
          }
        }
      );
    }

    return () => {
      isMounted.current = false;
    };
  }, [item.imageUrl, item.aspectRatio]);

  // اعمال aspectRatio مستقیماً روی کانتینر والد تا iOS ارتفاع را درست بشناسد
  const containerStyle = useMemo(
    () => [styles.cardContainer, { aspectRatio }],
    [aspectRatio]
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(item)}
      style={containerStyle}
    >
      {/* عکس اصلی */}
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* گرادینت تیره پایین کارت */}
      <LinearGradient
        colors={['transparent', 'rgba(15, 23, 42, 0.85)']}
        style={styles.gradientOverlay}
      />

      {/* کارت اطلاعات پزشک */}
      <View style={styles.badgeOverlay}>
        <View style={styles.textWrapper}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {item.doctorName || 'پزشک متخصص'}
          </Text>
          {!!item.doctorSpecialty && (
            <Text style={styles.specialtyText} numberOfLines={1}>
              {item.doctorSpecialty}
            </Text>
          )}
        </View>

        <View style={styles.avatarBorder}>
          <Image
            source={{ uri: doctorAvatar }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const PostCard = memo(PostCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.imageUrl === nextProps.item.imageUrl &&
    prevProps.item.aspectRatio === nextProps.item.aspectRatio &&
    prevProps.item.doctorName === nextProps.item.doctorName &&
    prevProps.item.doctorSpecialty === nextProps.item.doctorSpecialty &&
    prevProps.item.doctorAvatar === nextProps.item.doctorAvatar
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    position: 'relative',
    marginBottom: 10,
    // در iOS داشتن aspectRatio روی این والد الزامی است تا ارتفاع کارت مشخص شود
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  textWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  specialtyText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#38BDF8',
    textAlign: 'right',
    marginTop: 1,
  },
  avatarBorder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#10B981',
    overflow: 'hidden',
    backgroundColor: '#334155',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});