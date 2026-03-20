import { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { createPost, uploadImage, Tags } from '@/services/api';
import { usePosts } from '@/context/posts';

type CategoryKey = keyof Tags;

const TAG_GROUPS: { key: CategoryKey; label: string; tags: { value: string; label: string }[] }[] = [
  {
    key: 'historical',
    label: 'Исторические',
    tags: [
      { value: 'castle', label: 'Замок' },
      { value: 'monument', label: 'Монумент' },
      { value: 'palace', label: 'Дворец' },
      { value: 'fortress', label: 'Крепость' },
    ],
  },
  {
    key: 'nature',
    label: 'Природа',
    tags: [
      { value: 'mountains', label: 'Горы' },
      { value: 'lake', label: 'Озеро' },
      { value: 'forest', label: 'Лес' },
      { value: 'volcano', label: 'Вулкан' },
      { value: 'geyser', label: 'Гейзер' },
      { value: 'park', label: 'Парк' },
      { value: 'reserve', label: 'Заповедник' },
    ],
  },
  {
    key: 'entertainment',
    label: 'Развлечения',
    tags: [
      { value: 'restaurant', label: 'Ресторан' },
      { value: 'cafe', label: 'Кафе' },
      { value: 'theater', label: 'Театр' },
    ],
  },
  {
    key: 'cultural',
    label: 'Культура',
    tags: [
      { value: 'sight', label: 'Достопримечательность' },
      { value: 'museum', label: 'Музей' },
      { value: 'art', label: 'Искусство' },
      { value: 'architecture', label: 'Архитектура' },
    ],
  },
  {
    key: 'recreational',
    label: 'Рекреация',
    tags: [
      { value: 'pension', label: 'Пансионат' },
      { value: 'resort', label: 'Курорт' },
      { value: 'tourism', label: 'Туризм' },
      { value: 'spa', label: 'СПА' },
    ],
  },
];

const RUSSIA_REGION = {
  latitude: 61.5,
  longitude: 105.3,
  latitudeDelta: 40,
  longitudeDelta: 60,
};

export default function AddPlaceScreen() {
  const router = useRouter();
  const { refresh } = usePosts();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBackgroundColor = isDark ? '#151718' : '#e5e5e5';
  const cardColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Record<string, Set<string>>>({});
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа к галерее');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    setCoords(e.nativeEvent.coordinate);
  };

  const toggleTag = (category: string, value: string) => {
    setSelectedTags(prev => {
      const catSet = new Set(prev[category] ?? []);
      if (catSet.has(value)) catSet.delete(value);
      else catSet.add(value);
      return { ...prev, [category]: catSet };
    });
  };

  const isTagSelected = (category: string, value: string) =>
    selectedTags[category]?.has(value) ?? false;

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Заполните название и описание');
      return;
    }

    const tags: Tags = {};
    for (const group of TAG_GROUPS) {
      const selected = [...(selectedTags[group.key] ?? [])];
      if (selected.length > 0) (tags as any)[group.key] = selected;
    }

    setSubmitting(true);
    try {
      let image_url: string | null = null;
      if (imageUri) {
        image_url = await uploadImage(imageUri);
      }
      await createPost(
        title.trim(),
        description.trim(),
        tags,
        coords?.latitude ?? null,
        coords?.longitude ?? null,
        image_url,
      );
      await refresh();
      router.back();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: themeBackgroundColor }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: cardColor }]}>

          {/* Image picker */}
          <Text style={[styles.label, { color: textColor }]}>Фото</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                <Text style={{ color: secondaryTextColor, fontSize: 14 }}>Нажмите, чтобы выбрать фото</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri && (
            <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageBtn}>
              <Text style={{ color: '#ff4444', fontSize: 13 }}>Удалить фото</Text>
            </TouchableOpacity>
          )}

          {/* Title */}
          <Text style={[styles.label, { color: textColor, marginTop: 18 }]}>Название места</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: isDark ? '#444' : '#e0e0e0' }]}
            placeholder="Введите название"
            placeholderTextColor={secondaryTextColor}
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text style={[styles.label, { color: textColor, marginTop: 15 }]}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: textColor, borderColor: isDark ? '#444' : '#e0e0e0' }]}
            placeholder="Расскажите об этом месте"
            placeholderTextColor={secondaryTextColor}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          {/* Map picker */}
          <Text style={[styles.label, { color: textColor, marginTop: 18 }]}>
            Расположение{' '}
            <Text style={{ color: secondaryTextColor, fontWeight: 'normal', fontSize: 13 }}>(нажмите на карту)</Text>
          </Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={RUSSIA_REGION}
              onPress={handleMapPress}
              userInterfaceStyle={isDark ? 'dark' : 'light'}
            >
              {coords && (
                <Marker coordinate={coords} />
              )}
            </MapView>
          </View>
          {coords ? (
            <Text style={[styles.coordsText, { color: secondaryTextColor }]}>
              {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              {'  '}
              <Text style={{ color: '#ff4444' }} onPress={() => setCoords(null)}>✕</Text>
            </Text>
          ) : (
            <Text style={[styles.coordsText, { color: secondaryTextColor }]}>Точка не выбрана</Text>
          )}

          {/* Tags */}
          <Text style={[styles.label, { color: textColor, marginTop: 18 }]}>Теги</Text>
          {TAG_GROUPS.map(group => (
            <View key={group.key} style={styles.tagGroup}>
              <Text style={[styles.tagGroupLabel, { color: secondaryTextColor }]}>{group.label}</Text>
              <View style={styles.tagsRow}>
                {group.tags.map(tag => {
                  const active = isTagSelected(group.key, tag.value);
                  return (
                    <TouchableOpacity
                      key={tag.value}
                      style={[
                        styles.tagChip,
                        { backgroundColor: active ? tintColor : (isDark ? '#333' : '#f0f0f0') },
                      ]}
                      onPress={() => toggleTag(group.key, tag.value)}
                    >
                      <Text style={[styles.tagChipText, { color: active ? '#fff' : textColor }]}>
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: tintColor, opacity: submitting ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveButtonText}>Сохранить</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, paddingBottom: 40 },
  card: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  imagePicker: { borderRadius: 12, overflow: 'hidden', marginBottom: 4 },
  previewImage: { width: '100%', height: 180 },
  imagePlaceholder: {
    height: 180,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageBtn: { alignSelf: 'flex-end', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  mapContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  map: { width: '100%', height: '100%' },
  coordsText: { fontSize: 12, marginBottom: 4 },
  tagGroup: { marginTop: 10 },
  tagGroupLabel: { fontSize: 13, marginBottom: 6 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagChipText: { fontSize: 13 },
  saveButton: {
    marginTop: 25,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
