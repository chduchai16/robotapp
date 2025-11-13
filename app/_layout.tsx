import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RobotProvider } from '@/context/RobotContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

// Expo router config (optional)
export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Redirect dựa trên auth state
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, router]);

  // Hiện loading screen khi đang check auth
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  // Hiện layout tương ứng dựa trên auth state
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        ) : (
          // App Stack
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RobotProvider>
        <RootLayoutNav />
      </RobotProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
