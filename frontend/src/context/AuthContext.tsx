import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../api/types';

// ---------------------------------------------------------------------------
// Demo user for offline / demo mode (no backend required)
// ---------------------------------------------------------------------------

const DEMO_USER: User = {
  id: 1,
  username: 'demo',
  email: 'demo@guttenberg.io',
  first_name: 'Alex',
  last_name: 'Rivera',
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Restore demo session from localStorage
    return localStorage.getItem('access_token') ? DEMO_USER : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In demo mode, resolve immediately
    const token = localStorage.getItem('access_token');
    if (token) {
      setUser(DEMO_USER);
    }
    setIsLoading(false);
  }, []);

  const login = async (_username: string, _password: string) => {
    // Demo login — always succeeds
    localStorage.setItem('access_token', 'demo-token');
    localStorage.setItem('refresh_token', 'demo-token');
    setUser(DEMO_USER);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
