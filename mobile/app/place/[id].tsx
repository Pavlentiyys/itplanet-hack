import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Platform, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFavorites } from '@/context/favorites';
import { getPost, getPostReviews, createReview, PostSchema, ReviewSchema } from '@/services/api';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop';

const TABS = [
  { id: 'desc', label: 'Описание' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'rate', label: 'Оценить' },
];

export default function PlaceScreen() {
  const { id } = useLocalSearchParams();
  const postId = Number(id);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themeBackgroundColor = isDark ? '#151718' : '#e5e5e5';
  const cardColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';

  const { isFavorite, toggleFavorite } = useFavorites();

  const [post, setPost] = useState<PostSchema | null>(null);
  const [reviews, setReviews] = useState<ReviewSchema[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('desc');
  const [ratingInput, setRatingInput] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;
    Promise.all([getPost(postId), getPostReviews(postId)])
      .then(([p, r]) => {
        setPost(p);
        setReviews(r.reviews);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmitReview = async () => {
    if (!reviewTitle || ratingInput === 0) {
      Alert.alert('Заполните заголовок и оценку');
      return;
    }
    setSubmitting(true);
    try {
      const newReview = await createReview(postId, reviewTitle, reviewBody, ratingInput);
      setReviews(prev => [newReview, ...prev]);
      setReviewTitle('');
      setReviewBody('');
      setRatingInput(0);
      setActiveTab('reviews');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={{ color: star <= rating ? '#FFD700' : '#ccc', fontSize: 16 }}>★</Text>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'desc':
        return (
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={[styles.boldText, { color: textColor }]}>{post?.title}</Text>
            <Text style={[styles.paragraph, { color: secondaryTextColor }]}>{post?.description}</Text>
          </View>
        );
      case 'reviews':
        return (
          <View style={styles.reviewsList}>
            {reviews.length === 0 && (
              <Text style={[styles.emptyText, { color: secondaryTextColor }]}>Отзывов пока нет</Text>
            )}
            {reviews.map((review) => (
              <View key={review.id} style={[styles.card, { backgroundColor: cardColor, marginBottom: 12 }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewUser, { color: textColor }]}>
                    {review.author.first_name ?? ''} {review.author.last_name ?? ''}
                  </Text>
                  {review.author.role >= 1 && <Text style={{ color: '#aaa', marginLeft: 5 }}>✓</Text>}
                </View>
                {review.title ? <Text style={[styles.reviewTitle, { color: textColor }]}>{review.title}</Text> : null}
                {review.description ? (
                  <Text style={[styles.paragraph, { color: secondaryTextColor, marginTop: 4 }]}>{review.description}</Text>
                ) : null}
                {review.rating > 0 && <View style={{ marginTop: 8 }}>{renderStars(review.rating)}</View>}
              </View>
            ))}
          </View>
        );
      case 'rate':
        return (
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: isDark ? '#444' : '#e0e0e0' }]}
              placeholder="Озаглавьте свой отзыв..."
              placeholderTextColor={secondaryTextColor}
              value={reviewTitle}
              onChangeText={setReviewTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea, { color: textColor, borderColor: isDark ? '#444' : '#e0e0e0' }]}
              placeholder="По желанию, распишите свой отзыв..."
              placeholderTextColor={secondaryTextColor}
              multiline
              value={reviewBody}
              onChangeText={setReviewBody}
            />
            <View style={styles.ratingSelectContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRatingInput(star)}>
                  <Text style={{ color: star <= ratingInput ? '#FFD700' : '#ccc', fontSize: 24 }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: cardColor, borderColor: isDark ? '#444' : '#e0e0e0', borderWidth: 1, opacity: submitting ? 0.7 : 1 }]}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator />
                : <Text style={[styles.submitButtonText, { color: textColor }]}>Отправить отзыв</Text>
              }
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeBackgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBackgroundColor }]}>
      <View style={styles.grabberContainer}>
        <View style={[styles.grabber, { backgroundColor: isDark ? '#555' : '#ccc' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.galleryContainer}>
          <Image source={post?.image_url ?? PLACEHOLDER_IMAGE} style={styles.mainImage} contentFit="cover" />

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{'<'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleFavorite(postId)}
          >
            <IconSymbol
              name={isFavorite(postId) ? 'heart.fill' : 'heart'}
              size={24}
              color={isFavorite(postId) ? '#ff4444' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.titleContainer, { backgroundColor: cardColor }]}>
          <Text style={[styles.title, { color: textColor }]}>{post?.title}</Text>
        </View>

        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, { backgroundColor: isActive ? (isDark ? '#444' : '#666') : cardColor }]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabText, { color: isActive ? '#fff' : textColor, fontWeight: isActive ? 'bold' : 'normal' }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.contentContainer}>{renderContent()}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  grabberContainer: { alignItems: 'center', paddingVertical: 10 },
  grabber: { width: 40, height: 5, borderRadius: 3 },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 30 },
  galleryContainer: { width: '100%', height: 220, borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 0 },
  mainImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 15, left: 15, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  heartButton: { position: 'absolute', top: 15, right: 15 },
  titleContainer: { paddingVertical: 15, paddingHorizontal: 15, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 15, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  tabsWrapper: { marginBottom: 15 },
  tabsContainer: { gap: 10 },
  tabButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  tabText: { fontSize: 15 },
  contentContainer: { flex: 1 },
  card: { padding: 15, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  boldText: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  paragraph: { fontSize: 15, lineHeight: 22 },
  reviewsList: { flex: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewUser: { fontWeight: 'bold', fontSize: 15 },
  reviewTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  emptyText: { textAlign: 'center', marginTop: 30, fontSize: 15 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 10, fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top' },
  ratingSelectContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 15, marginTop: 5 },
  submitButton: { paddingVertical: 14, borderRadius: 25, alignItems: 'center' },
  submitButtonText: { fontWeight: 'bold', fontSize: 16 },
});
