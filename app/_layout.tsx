import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { I18nProvider } from '@/i18n/I18nProvider';
import { ThemeModeProvider } from '@/hooks/useTheme';
import React from 'react';
import { ActivityIndicator, Text as RNText, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

// تم تیره سه‌بعدی (Aurora Glass)
const LightAppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6EC7',
    background: '#12081F',
    card: '#0C0C14',
    text: '#F4F2F8',
    border: 'rgba(255,255,255,0.12)',
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'YekanBakh-Thin': require('../assets/fonts/YekanBakh-Thin.otf'),
    'YekanBakh-Light': require('../assets/fonts/YekanBakh-Light.otf'),
    'YekanBakh-Regular': require('../assets/fonts/YekanBakh-Regular.otf'),
    'YekanBakh-SemiBold': require('../assets/fonts/YekanBakh-SemiBold.otf'),
    'YekanBakh-Bold': require('../assets/fonts/YekanBakh-Bold.otf'),
    'YekanBakh-ExtraBold': require('../assets/fonts/YekanBakh-ExtraBold.otf'),
    'YekanBakh-Black': require('../assets/fonts/YekanBakh-Black.otf'),
    'YekanBakh-ExtraBlack': require('../assets/fonts/YekanBakh-ExtraBlack.otf'),
  });

  if (fontsLoaded) {
    // @ts-ignore
    if (!RNText.defaultProps) RNText.defaultProps = {};
    // @ts-ignore
    RNText.defaultProps.style = [{ fontFamily: 'YekanBakh-Regular' }, RNText.defaultProps.style];
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F2A9CE" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#12081F' }}>
      <I18nProvider>
      <ThemeModeProvider>
      <HeroUINativeProvider>
        <ThemeProvider value={LightAppTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#12081F' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </HeroUINativeProvider>
      </ThemeModeProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#12081F',
  },
});