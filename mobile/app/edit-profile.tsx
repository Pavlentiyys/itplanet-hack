import { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { updateMe, uploadImage } from '@/services/api';
import { IconSymbol } from '@/components/ui/icon-symbol';

const AVATAR_PLACEHOLDER = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBackgroundColor = isDark ? '#151718' : '#e5e5e5';
  const cardColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentAvatar = avatarUri ?? user?.avatar_url ?? AVATAR_PLACEHOLDER;

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа к галерее');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatar_url = user?.avatar_url ?? null;
      if (avatarUri) {
        avatar_url = await uploadImage(avatarUri);
      }
      const updated = await updateMe(
        firstName.trim() || null,
        lastName.trim() || null,
        avatar_url,
      );
      setUser(updated);
      router.back();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: themeBackgroundColor }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Avatar */}
        <View style={[styles.avatarSection, { backgroundColor: cardColor }]}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar} disabled={saving}>
            <Image source={currentAvatar} style={styles.avatar} contentFit="cover" />
            <View style={[styles.editAvatarButton, { backgroundColor: tintColor }]}>
              <IconSymbol name="pencil" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickAvatar} disabled={saving}>
            <Text style={[styles.changePhotoText, { color: tintColor }]}>Сменить фото</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: cardColor }]}>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Имя</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: isDark ? '#444' : '#e0e0e0' }]}
              placeholder="Введите имя"
              placeholderTextColor={secondaryTextColor}
              value={firstName}
              onChangeText={setFirstName}
              editable={!saving}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Фамилия</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: isDark ? '#444' : '#e0e0e0' }]}
              placeholder="Введите фамилию"
              placeholderTextColor={secondaryTextColor}
              value={lastName}
              onChangeText={setLastName}
              editable={!saving}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Email</Text>
            <TextInput
              style={[styles.input, { color: secondaryTextColor, borderColor: isDark ? '#444' : '#e0e0e0' }]}
              value={user?.email ?? ''}
              editable={false}
            />
            <Text style={[styles.hint, { color: secondaryTextColor }]}>Email изменить нельзя</Text>
          </View>

        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: tintColor, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveButtonText}>Сохранить изменения</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, paddingBottom: 40 },
  avatarSection: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: { fontWeight: '600', fontSize: 14 },
  formCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
  },
  hint: { fontSize: 12, marginTop: 4 },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
