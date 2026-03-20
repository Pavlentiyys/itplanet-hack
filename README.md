# IT Planet — Туристическое приложение

Мобильное приложение на **React Native / Expo** с бэкендом на **FastAPI + SQLite**.

---

## Требования

| Инструмент | Версия |
|---|---|
| Python | 3.11+ |
| [uv](https://docs.astral.sh/uv/) | любая |
| Node.js | 18+ |
| npm | 10+ |
| Expo Go (телефон) или iOS Simulator | — |

---

## Структура проекта

```
it-planet/
├── backend/    # FastAPI API
└── mobile/     # Expo React Native
```

---

## Запуск бэкенда

```bash
cd backend

# 1. Создать виртуальное окружение и установить зависимости
uv venv .venv
uv pip install -r requirements.txt

# 2. Создать файл .env
DATABASE_URL=dburl
SECRET_KEY=secretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
EOF

# 3. Запустить сервер
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

Бэкенд будет доступен по адресу: `http://0.0.0.0:8002`

Документация API: `http://localhost:8002/docs`

---

## Настройка IP-адреса для мобильного приложения

Expo работает на реальном устройстве/симуляторе — `localhost` не подходит. Нужен **локальный IP** вашего компьютера.

**Найти IP:**
```bash
# macOS / Linux
ipconfig getifaddr en0

# Windows
ipconfig   # найти IPv4 в секции Wi-Fi
```

**Прописать в `mobile/services/api.ts`:**
```ts
export const API_BASE_URL = 'http://<ВАШ_IP>:8002';
// например: 'http://192.168.1.42:8002'
```

> Телефон и компьютер должны быть в **одной Wi-Fi сети**.

---

## Запуск мобильного приложения

```bash
cd mobile

# 1. Установить зависимости
npm install

# 2. Запустить Expo
npx expo start
```

После запуска:
- Нажмите **`i`** — запустить в iOS Simulator
- Нажмите **`a`** — запустить в Android Emulator
- Отсканируйте QR-код через приложение **Expo Go** на телефоне

---

## Сборка APK (Android)

Используется [EAS Build](https://docs.expo.dev/build/introduction/) — облачная сборка от Expo. Не требует Android SDK локально.

### 1. Установить EAS CLI

```bash
npm install -g eas-cli
```

### 2. Войти в Expo аккаунт

> Если аккаунта нет — зарегистрируйся на [expo.dev](https://expo.dev) (бесплатно).

```bash
eas login
```

### 3. Запустить сборку APK

```bash
cd mobile
eas build -p android --profile preview
```

- Первый раз EAS спросит, создать ли новый проект — выбрать **Yes**
- Сборка займёт ~10–15 минут на серверах Expo
- По завершении в терминале появится **ссылка для скачивания `.apk`**

### Профили сборки

| Профиль | Команда | Результат | Назначение |
|---|---|---|---|
| `preview` | `eas build -p android --profile preview` | `.apk` | Установка напрямую на телефон |
| `production` | `eas build -p android --profile production` | `.aab` | Загрузка в Google Play |

> Прогресс всех сборок можно отслеживать на [expo.dev/builds](https://expo.dev/builds)

---

## Тестовые аккаунты

| Email | Пароль | Роль |
|---|---|---|
| `admin@test.com` | `admin123` | Модератор |
| `test@test.com` | `password123` | Модератор |

---

## Технологии

**Бэкенд**
- FastAPI
- SQLModel + SQLAlchemy (async)
- SQLite / aiosqlite
- JWT-аутентификация (access + refresh токены)
- python-multipart (загрузка файлов)

**Мобильное приложение**
- React Native + Expo Router
- TypeScript
- react-native-maps
- expo-image-picker
- React Context API (Auth, Posts, Favorites)
