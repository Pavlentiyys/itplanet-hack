import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth';

const MENU_ITEMS = [
  { id: 'places', title: 'Мои места', icon: 'location.fill' as const },
  { id: 'favorites', title: 'Избранные места', icon: 'heart' as const },
  { id: 'reviews', title: 'Мои отзывы', icon: 'bubble.right' as const },
  { id: 'edit', title: 'Редактировать профиль', icon: 'pencil' as const },
];

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBackgroundColor = isDark ? '#151718' : '#e5e5e5';
  const cardColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';

  const { user, signOut } = useAuth();
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || '—';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBackgroundColor }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
          <Image
            source={user?.avatar_url ?? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop'}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: textColor }]}>{fullName}</Text>
            <Text style={[styles.profileEmail, { color: secondaryTextColor }]}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: cardColor }]}
              onPress={() => {
                if (item.id === 'places') router.push('/my-places');
                else if (item.id === 'favorites') router.push('/favorites');
                else if (item.id === 'reviews') router.push('/my-reviews');
                else if (item.id === 'edit') router.push('/edit-profile');
              }}
            >
              <View style={styles.menuItemLeft}>
                <IconSymbol name={item.icon} size={22} color={textColor} />
                <Text style={[styles.menuItemText, { color: textColor }]}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardColor }]}
            onPress={signOut}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={22} color="#ff4444" />
              <Text style={[styles.menuItemText, { color: '#ff4444' }]}>Выйти</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: { padding: 15 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  profileEmail: { fontSize: 13 },
  menuContainer: { gap: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuItemText: { fontSize: 15, fontWeight: '500' },
});
