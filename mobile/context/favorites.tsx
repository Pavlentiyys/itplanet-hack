import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toggleFavoritePost, getMyFavoritePosts, PostSchema } from '@/services/api';

interface FavoritesContextType {
  favoritedIds: Set<number>;
  toggleFavorite: (id: number) => Promise<void>;
  isFavorite: (id: number) => boolean;
  loadFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());

  const loadFavorites = async () => {
    try {
      const { posts } = await getMyFavoritePosts();
      setFavoritedIds(new Set(posts.map((p: PostSchema) => p.id)));
    } catch {
      // Not authenticated yet — ignore
    }
  };

  const toggleFavorite = async (id: number) => {
    try {
      const { is_favorited } = await toggleFavoritePost(id);
      setFavoritedIds(prev => {
        const next = new Set(prev);
        if (is_favorited) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    } catch (e) {
      console.warn('toggleFavorite error', e);
    }
  };

  const isFavorite = (id: number) => favoritedIds.has(id);

  return (
    <FavoritesContext.Provider value={{ favoritedIds, toggleFavorite, isFavorite, loadFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
