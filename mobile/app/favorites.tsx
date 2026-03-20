import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMyFavoritePosts, PostSchema } from '@/services/api';
import { useFavorites } from '@/context/favorites';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop';

export default function FavoritesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBackgroundColor = isDark ? '#151718' : '#e5e5e5';
  const cardColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';

  const { favoritedIds } = useFavorites();
  const [places, setPlaces] = useState<PostSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyFavoritePosts()
      .then(({ posts }) => setPlaces(posts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [favoritedIds]);

  const renderItem = ({ item }: { item: PostSchema }) => (
    <TouchableOpacity
      style={[styles.placeCard, { backgroundColor: cardColor }]}
      onPress={() => router.push(`/place/${item.id}`)}
    >
      <Image source={item.image_url ?? PLACEHOLDER_IMAGE} style={styles.placeImage} contentFit="cover" />
      <View style={styles.placeInfo}>
        <Text style={[styles.placeTitle, { color: textColor }]}>{item.title}</Text>
        <Text style={[styles.placeDesc, { color: secondaryTextColor }]} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeBackgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeBackgroundColor }]}>
      <FlatList
        data={places}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>Вы еще не добавили ни одного места в избранное.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 15 },
  placeCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  placeImage: { width: 100, height: 100 },
  placeInfo: { flex: 1, padding: 15, justifyContent: 'center' },
  placeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  placeDesc: { fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
});
