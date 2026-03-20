import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPosts, PostSchema } from '@/services/api';
import { useAuth } from '@/context/auth';

interface PostsContextType {
  posts: PostSchema[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostSchema[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { posts } = await getPosts();
      setPosts(posts);
    } catch (e) {
      console.warn('PostsContext load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  return (
    <PostsContext.Provider value={{ posts, loading, refresh: load }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}
