import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMyReviews, ReviewSchema } from '@/services/api';
import { usePosts } from '@/context/posts';

export default function MyReviewsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBackgroundColor = isDark ? '#151718' : '#e5e5e5';
  const cardColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';

  const { posts } = usePosts();
  const [reviews, setReviews] = useState<ReviewSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReviews()
      .then(({ reviews }) => setReviews(reviews))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating: number) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={{ color: star <= rating ? '#FFD700' : '#ccc', fontSize: 14 }}>★</Text>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: ReviewSchema }) => (
    <TouchableOpacity
      style={[styles.reviewCard, { backgroundColor: cardColor }]}
      onPress={() => router.push(`/place/${item.post_id}`)}
    >
      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          {item.title ? <Text style={[styles.reviewTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text> : null}
          {renderStars(item.rating)}
        </View>
        {item.description ? (
          <Text style={[styles.reviewBody, { color: secondaryTextColor }]} numberOfLines={3}>{item.description}</Text>
        ) : null}
        <Text style={[styles.placeLink, { color: secondaryTextColor }]}>
          {posts.find(p => p.id === item.post_id)?.title ?? `Место #${item.post_id}`}
        </Text>
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
        data={reviews}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>Вы еще не оставили ни одного отзыва.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 15 },
  reviewCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    padding: 15,
  },
  reviewContent: {},
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewTitle: { fontWeight: '600', fontSize: 15, flex: 1, marginRight: 10 },
  reviewBody: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  placeLink: { fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
});
