import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/auth';
import { FavoritesProvider, useFavorites } from '@/context/favorites';
import { PostsProvider } from '@/context/posts';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { loadFavorites } = useFavorites();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    const timeout = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/login');
      } else if (user && inAuthGroup) {
        router.replace('/');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [user, segments, rootNavigationState]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="register" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="place/[id]" options={{ presentation: 'formSheet', headerShown: false }} />
        <Stack.Screen name="favorites" options={{ title: 'Избранные места', headerBackTitle: 'Назад' }} />
        <Stack.Screen name="my-places" options={{ title: 'Мои места', headerBackTitle: 'Назад' }} />
        <Stack.Screen name="my-reviews" options={{ title: 'Мои отзывы', headerBackTitle: 'Назад' }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Редактировать профиль', headerBackTitle: 'Назад' }} />
        <Stack.Screen name="add-place" options={{ title: 'Добавить место', presentation: 'modal', headerBackTitle: 'Отмена' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <PostsProvider>
          <RootLayoutNav />
        </PostsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
