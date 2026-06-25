import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'YekanBakh-Thin':       require('../assets/fonts/YekanBakh-Thin.otf'),
    'YekanBakh-Light':      require('../assets/fonts/YekanBakh-Light.otf'),
    'YekanBakh-Regular':    require('../assets/fonts/YekanBakh-Regular.otf'),
    'YekanBakh-SemiBold':   require('../assets/fonts/YekanBakh-SemiBold.otf'),
    'YekanBakh-Bold':       require('../assets/fonts/YekanBakh-Bold.otf'),
    'YekanBakh-ExtraBold':  require('../assets/fonts/YekanBakh-ExtraBold.otf'),
    'YekanBakh-Black':      require('../assets/fonts/YekanBakh-Black.otf'),
    'YekanBakh-ExtraBlack': require('../assets/fonts/YekanBakh-ExtraBlack.otf'),
  });

  const colorScheme = useColorScheme();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}