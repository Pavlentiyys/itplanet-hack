import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/context/auth';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Ошибка входа', e.message ?? 'Неверный email или пароль');
    }
  };

  const isDark = colorScheme === 'dark';
  const themeColors = Colors[isDark ? 'dark' : 'light'];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>С возвращением</Text>
        <Text style={[styles.subtitle, { color: themeColors.text }]}>Войдите, чтобы продолжить</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon }]}
            placeholder="Email"
            placeholderTextColor={themeColors.icon}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon }]}
            placeholder="Пароль"
            placeholderTextColor={themeColors.icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColors.tint, opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator color={themeColors.background} />
            : <Text style={[styles.buttonText, { color: themeColors.background }]}>Войти</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerLink} onPress={() => router.replace('/register')}>
          <Text style={[styles.registerLinkText, { color: themeColors.icon }]}>
            Нет аккаунта?{' '}
            <Text style={{ color: themeColors.tint }}>Зарегистрироваться</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerLinkText: {
    fontSize: 15,
  },
});
