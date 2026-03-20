import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, Platform, StatusBar as RNStatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFavorites } from '@/context/favorites';
import { PostSchema } from '@/services/api';
import { usePosts } from '@/context/posts';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop';

type CategoryKey = 'historical' | 'nature' | 'entertainment' | 'recreational' | 'cultural';

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'historical',    label: 'Исторические\nместа' },
  { key: 'nature',        label: 'Природные\nместа' },
  { key: 'entertainment', label: 'Развлека-\nтельные места' },
  { key: 'recreational',  label: 'Рекреацион-\nные места' },
  { key: 'cultural',      label: 'Культурные\nместа' },
];

const TAG_LABELS: Record<string, string> = {
  // historical
  castle: 'Замок', monument: 'Монумент', palace: 'Дворец', fortress: 'Крепость',
  // nature
  mountains: 'Горы', lake: 'Озеро', forest: 'Лес', volcano: 'Вулкан',
  geyser: 'Гейзер', park: 'Парк', reserve: 'Заповедник',
  // entertainment
  restaurant: 'Ресторан', cafe: 'Кафе', theater: 'Театр',
  // cultural
  sight: 'Достопримечательность', museum: 'Музей', art: 'Искусство', architecture: 'Архитектура',
  // recreational
  pension: 'Пансионат', resort: 'Курорт', tourism: 'Туризм', spa: 'СПА',
};

function getAllTags(tags: PostSchema['tags']): string[] {
  return [
    ...(tags.historical ?? []),
    ...(tags.nature ?? []),
    ...(tags.entertainment ?? []),
    ...(tags.cultural ?? []),
    ...(tags.recreational ?? []),
  ];
}

function hasCategory(post: PostSchema, key: CategoryKey): boolean {
  return (post.tags[key]?.length ?? 0) > 0;
}

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBackgroundColor = isDark ? '#151718' : '#e5e5e5';
  const cardColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';

  const { isFavorite, toggleFavorite } = useFavorites();
  const { posts, loading } = usePosts();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts;
    return posts.filter(p => hasCategory(p, selectedCategory));
  }, [posts, selectedCategory]);

  const handleCategoryPress = (key: CategoryKey) => {
    setSelectedCategory(prev => (prev === key ? null : key));
  };

  const renderHeader = () => (
    <View style={styles.categoriesContainer}>
      <View style={styles.categoriesRow}>
        {CATEGORIES.slice(0, 3).map(({ key, label }) => {
          const isActive = selectedCategory === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryCard,
                { backgroundColor: isActive ? '#4a7c59' : cardColor, flex: 1 },
              ]}
              onPress={() => handleCategoryPress(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryText, { color: isActive ? '#fff' : textColor }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.categoriesRow}>
        {CATEGORIES.slice(3).map(({ key, label }) => {
          const isActive = selectedCategory === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryCard,
                { backgroundColor: isActive ? '#4a7c59' : cardColor, flex: 1 },
              ]}
              onPress={() => handleCategoryPress(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryText, { color: isActive ? '#fff' : textColor }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: PostSchema }) => {
    const tags = getAllTags(item.tags);
    return (
      <TouchableOpacity
        style={[styles.placeCard, { backgroundColor: cardColor }]}
        onPress={() => router.push(`/place/${item.id}`)}
      >
        <View style={styles.imageContainer}>
          <Image source={item.image_url ?? PLACEHOLDER_IMAGE} style={styles.placeImage} contentFit="cover" />

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
          >
            <IconSymbol
              name={isFavorite(item.id) ? 'heart.fill' : 'heart'}
              size={24}
              color={isFavorite(item.id) ? '#ff4444' : '#fff'}
            />
          </TouchableOpacity>

          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{TAG_LABELS[tag] ?? tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.placeContent}>
          <Text style={[styles.placeTitle, { color: textColor }]}>{item.title}</Text>
          <Text style={[styles.placeDescription, { color: secondaryTextColor }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBackgroundColor }]}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" />
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
              {selectedCategory ? 'Нет мест в этой категории' : 'Мест пока нет'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  listContent: { paddingVertical: 15 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  categoriesContainer: { paddingHorizontal: 15, marginBottom: 20, gap: 10 },
  categoriesRow: { flexDirection: 'row', gap: 10 },
  categoryCard: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    minHeight: 80,
  },
  categoryText: { fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  placeCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: { height: 180, width: '100%', position: 'relative' },
  placeImage: { width: '100%', height: '100%' },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 8 },
  tagBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  placeContent: { padding: 15 },
  placeTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  placeDescription: { fontSize: 14, lineHeight: 20 },
});
