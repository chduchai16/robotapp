import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authStorage } from '@/services/authStorage';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check user đã đăng nhập chưa
    const checkAuth = async () => {
      const isLoggedIn = await authStorage.checkUser();
      setIsLoading(false);

      if (!isLoggedIn) {
        router.replace('/(auth)/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Robots',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cube.box.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="voice"
        options={{
          title: 'Điều khiển',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="mic.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
