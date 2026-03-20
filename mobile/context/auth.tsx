import React, { createContext, useContext, useState, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, getMe, setTokens, clearTokens, UserSchema, TokenPair } from '@/services/api';

interface AuthContextType {
  user: UserSchema | null;
  tokens: TokenPair | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, avatarUrl?: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: UserSchema) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [tokens, setTokensState] = useState<TokenPair | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const tokenPair = await apiLogin(email, password);
      setTokens(tokenPair.access_token, tokenPair.refresh_token);
      setTokensState(tokenPair);
      const me = await getMe();
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, avatarUrl?: string) => {
    setIsLoading(true);
    try {
      const tokenPair = await apiRegister(email, password, firstName, lastName, avatarUrl);
      setTokens(tokenPair.access_token, tokenPair.refresh_token);
      setTokensState(tokenPair);
      const me = await getMe();
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const me = await getMe();
    setUser(me);
  };

  const signOut = () => {
    clearTokens();
    setTokensState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, tokens, isLoading, signIn, signUp, signOut, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
