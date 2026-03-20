import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getMyPosts, PostSchema } from '@/services/api';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop';

export default function MyPlacesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBackgroundColor = isDark ? '#151718' : '#e5e5e5';
  const cardColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';

  const [places, setPlaces] = useState<PostSchema[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyPosts()
      .then(({ posts }) => setPlaces(posts))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }: { item: PostSchema }) => (
    <TouchableOpacity
      style={[styles.placeCard, { backgroundColor: cardColor }]}
      onPress={() => router.push(`/place/${item.id}`)}
    >
      <Image
        source={item.image_url ?? PLACEHOLDER_IMAGE}
        style={styles.placeImage}
        contentFit="cover"
      />
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
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>Вы еще не добавили ни одного места.</Text>
        }
      />
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
        onPress={() => router.push('/add-place')}
      >
        <IconSymbol name="pencil" size={24} color={isDark ? '#000' : '#fff'} />
        <Text style={[styles.addButtonText, { color: isDark ? '#000' : '#fff' }]}>Добавить место</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 15, paddingBottom: 100 },
  placeCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  placeImage: { width: '100%', height: 150 },
  placeInfo: { padding: 12 },
  placeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  placeDesc: { fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  addButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
