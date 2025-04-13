import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/components/tokens';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'GraphikLCG-Thin': require('../assets/fonts/GraphikLCG-Thin.ttf'),
    'GraphikLCG-ExtraLight': require('../assets/fonts/GraphikLCG-Extralight.ttf'),
    'GraphikLCG-Light': require('../assets/fonts/GraphikLCG-Light.ttf'),
    'GraphikLCG-Regular': require('../assets/fonts/GraphikLCG-Regular.ttf'),
    'GraphikLCG-Medium': require('../assets/fonts/GraphikLCG-Medium.ttf'),
    'GraphikLCG-Semibold': require('../assets/fonts/GraphikLCG-Semibold.ttf'),
    'GraphikLCG-Bold': require('../assets/fonts/GraphikLCG-Bold.ttf'),
    'GraphikLCG-Black': require('../assets/fonts/GraphikLCG-Black.ttf'),
    'GraphikLCG-Super': require('../assets/fonts/GraphikLCG-Super.ttf'),
  });

  useEffect(() => {
    if (!loaded) {
      return;
    }
    SplashScreen.hideAsync();
  }, [loaded]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.veryLightGray} />
      <Stack>
        <Stack.Screen name="act" options={{ headerShown: false }} />
        <Stack.Screen name="actList" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});
