import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { usePosts } from '@/context/posts';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBackgroundColor = isDark ? '#151718' : '#e5e5e5';
  const cardColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';
  const router = useRouter();

  const { posts } = usePosts();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = () => {};

  const searchResults = posts.filter(post => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return post.title.toLowerCase().includes(query) || post.description.toLowerCase().includes(query);
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeBackgroundColor }]}>
      <View style={styles.container}>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: cardColor }]}>
          <IconSymbol name="magnifyingglass" size={20} color={secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Куда отправимся?"
            placeholderTextColor={secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: secondaryTextColor, fontSize: 24, lineHeight: 24 }}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        <View style={styles.historySection}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsList}>
            <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 15 }]}>
              {searchQuery.trim().length > 0
                ? `Результаты поиска (${searchResults.length})`
                : 'Все места'}
            </Text>
            {searchResults.length > 0 ? (
              searchResults.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.resultCard, { backgroundColor: cardColor }]}
                  onPress={() => router.push(`/place/${item.id}`)}
                >
                  <Image source={item.image_url ?? PLACEHOLDER_IMAGE} style={styles.resultImage} contentFit="cover" />
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.resultDesc, { color: secondaryTextColor }]} numberOfLines={2}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: secondaryTextColor, marginTop: 10 }}>Ничего не найдено</Text>
            )}
          </ScrollView>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filtersSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filtersList: {
    gap: 10,
    paddingBottom: 5,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  historySection: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyText: {
    fontSize: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  resultImage: {
    width: 90,
    height: 90,
  },
  resultInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultDesc: {
    fontSize: 13,
  },
});
