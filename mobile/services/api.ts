export const API_BASE_URL = 'http://192.168.8.31:8002';

// ---------------------------------------------------------------------------
// Token store (in-memory; set on login, cleared on logout)
// ---------------------------------------------------------------------------
let _accessToken: string | null = null;

export function setTokens(access: string, _refresh: string) {
  _accessToken = access;
}

export function clearTokens() {
  _accessToken = null;
}

export function getAccessToken() {
  return _accessToken;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function authFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TokenPair = {
  access_token: string;
  refresh_token: string;
};

export type UserRole = 0 | 1 | 2 | 3;

export type UserSchema = {
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  avatar_url: string | null;
};

export type BasicUserSchema = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
};

export type Tags = {
  historical?: ('castle' | 'monument' | 'palace' | 'fortress')[];
  nature?: ('mountains' | 'lake' | 'forest' | 'volcano' | 'geyser' | 'park' | 'reserve')[];
  entertainment?: ('restaurant' | 'cafe' | 'theater')[];
  cultural?: ('sight' | 'museum' | 'art' | 'architecture')[];
  recreational?: ('pension' | 'resort' | 'tourism' | 'spa')[];
};

export type PostSchema = {
  id: number;
  title: string;
  description: string;
  author: BasicUserSchema;
  tags: Tags;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
};

export type ReviewSchema = {
  id: number;
  title: string;
  description: string;
  rating: number;
  author: BasicUserSchema;
  post_id: number;
};

export type FavoritePostResponse = {
  is_favorited: boolean;
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function login(email: string, password: string): Promise<TokenPair> {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? 'Неверный email или пароль');
  }
  return res.json();
}

export async function register(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  avatarUrl?: string,
): Promise<TokenPair> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, avatar_url: avatarUrl }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? 'Ошибка регистрации');
  }
  return res.json();
}

export async function updateMe(
  firstName: string | null,
  lastName: string | null,
  avatarUrl: string | null,
): Promise<UserSchema> {
  return authFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ first_name: firstName, last_name: lastName, avatar_url: avatarUrl }),
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export async function getMe(): Promise<UserSchema> {
  return authFetch('/users/me');
}

export async function getMyReviews(): Promise<{ reviews: ReviewSchema[] }> {
  return authFetch('/users/me/reviews');
}

export async function getMyPosts(): Promise<{ posts: PostSchema[] }> {
  return authFetch('/users/me/posts');
}

export async function getMyFavoritePosts(): Promise<{ posts: PostSchema[] }> {
  return authFetch('/users/me/posts/favorite');
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------
export async function getPosts(): Promise<{ posts: PostSchema[] }> {
  return authFetch('/posts');
}

export async function createPost(
  title: string,
  description: string,
  tags: Tags,
  latitude?: number | null,
  longitude?: number | null,
  image_url?: string | null,
): Promise<PostSchema> {
  return authFetch('/posts', {
    method: 'POST',
    body: JSON.stringify({ title, description, tags, latitude, longitude, image_url }),
  });
}

export async function uploadImage(uri: string): Promise<string> {
  const filename = uri.split('/').pop() ?? 'image.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', { uri, name: filename, type: mimeType } as any);

  const headers: Record<string, string> = {};
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

  const res = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? 'Upload failed');
  }
  const data = await res.json();
  return `${API_BASE_URL}${data.url}`;
}

export async function getPost(id: number): Promise<PostSchema> {
  return authFetch(`/posts/${id}`);
}

export async function getPostReviews(id: number): Promise<{ reviews: ReviewSchema[] }> {
  return authFetch(`/posts/${id}/reviews`);
}

export async function toggleFavoritePost(id: number): Promise<FavoritePostResponse> {
  return authFetch('/posts/favorite', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export async function createReview(
  postId: number,
  title: string,
  description: string,
  rating: number,
): Promise<ReviewSchema> {
  return authFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify({ post_id: postId, title, description, rating }),
  });
}
