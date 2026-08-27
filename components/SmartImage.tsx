// SmartImage — عکس هوشمند: اگه لود نشد، جایگزین گرادیانی خوشگل نشون میده
// دیگه هیچ‌وقت جای خالی سفید نمی‌بینید
import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, Text, ImageStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';

type Props = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** حرف/ایموجی وسط placeholder */
  fallbackLabel?: string;
};

export default function SmartImage({ uri, style, resizeMode = 'cover', fallbackLabel }: Props) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  // اگر uri عوض شد دوباره لود کن
  useEffect(() => {
    setState('loading');
  }, [uri]);

  if (state === 'error') {
    return (
      <View style={[styles.fallbackWrap, style as any]}>
        <LinearGradient
          colors={['rgba(232,193,112,0.35)', 'rgba(199,122,75,0.25)', 'rgba(255,158,125,0.30)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.fallbackInner}>
          <Sparkles size={22} color="rgba(255,248,235,0.9)" />
          {!!fallbackLabel && (
            <Text style={styles.fallbackText} numberOfLines={1}>
              {fallbackLabel}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[style as any, styles.clipWrap]}>
      {state === 'loading' && (
        <LinearGradient
          colors={['rgba(232,193,112,0.14)', 'rgba(255,244,224,0.05)']}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Image
        source={{ uri }}
        onError={() => setState('error')}
        onLoad={() => setState('ok')}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
        resizeMode={resizeMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clipWrap: { overflow: 'hidden', backgroundColor: 'rgba(232,193,112,0.08)' },
  fallbackWrap: { overflow: 'hidden', backgroundColor: 'rgba(232,193,112,0.15)' },
  fallbackInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
  },
  fallbackText: {
    color: 'rgba(255,250,240,0.95)',
    fontSize: 11,
    fontWeight: '700',
  },
});
