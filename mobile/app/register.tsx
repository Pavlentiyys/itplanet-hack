import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/auth';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { uploadImage } from '@/services/api';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { signUp, isLoading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';
  const themeColors = Colors[isDark ? 'dark' : 'light'];
  const secondaryTextColor = isDark ? '#aaa' : '#666';

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

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Заполните email и пароль');
      return;
    }
    if (!avatarUri) {
      Alert.alert('Выберите фото профиля');
      return;
    }
    try {
      setUploading(true);
      const avatarUrl = await uploadImage(avatarUri);
      setUploading(false);
      await signUp(email, password, firstName || undefined, lastName || undefined, avatarUrl);
      router.replace('/');
    } catch (e: any) {
      setUploading(false);
      Alert.alert('Ошибка регистрации', e.message ?? 'Попробуйте снова');
    }
  };

  const busy = isLoading || uploading;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: themeColors.text }]}>Регистрация</Text>
        <Text style={[styles.subtitle, { color: themeColors.text }]}>Создайте новый аккаунт</Text>

        {/* Avatar picker */}
        <TouchableOpacity style={styles.avatarPicker} onPress={pickAvatar} disabled={busy}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#333' : '#e8e8e8' }]}>
              <Text style={{ fontSize: 36 }}>👤</Text>
              <Text style={[styles.avatarHint, { color: secondaryTextColor }]}>Фото профиля *</Text>
            </View>
          )}
          <View style={[styles.avatarEditBadge, { backgroundColor: themeColors.tint }]}>
            <Text style={{ color: '#fff', fontSize: 14 }}>✎</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon }]}
            placeholder="Имя"
            placeholderTextColor={themeColors.icon}
            value={firstName}
            onChangeText={setFirstName}
            editable={!busy}
          />
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon }]}
            placeholder="Фамилия"
            placeholderTextColor={themeColors.icon}
            value={lastName}
            onChangeText={setLastName}
            editable={!busy}
          />
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon }]}
            placeholder="Email"
            placeholderTextColor={themeColors.icon}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!busy}
          />
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon }]}
            placeholder="Пароль"
            placeholderTextColor={themeColors.icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!busy}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColors.tint, opacity: busy ? 0.7 : 1 }]}
          onPress={handleRegister}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator color={themeColors.background} />
            : <Text style={[styles.buttonText, { color: themeColors.background }]}>Создать аккаунт</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/login')}>
          <Text style={[styles.loginLinkText, { color: themeColors.icon }]}>
            Уже есть аккаунт?{' '}
            <Text style={{ color: themeColors.tint }}>Войти</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 30, opacity: 0.8 },
  avatarPicker: {
    alignSelf: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  avatarHint: { fontSize: 11, textAlign: 'center' },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  inputContainer: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  loginLink: { alignItems: 'center', marginTop: 5 },
  loginLinkText: { fontSize: 15 },
});
