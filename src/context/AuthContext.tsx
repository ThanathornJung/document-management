'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email?: string;
  tel?: string;
  profilePicture?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (userData: User, rememberMe: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    try {
      let storedUser = localStorage.getItem('user');
      

      if (!storedUser) {
        storedUser = sessionStorage.getItem('user');
        
      }

      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        if (parsedUser.id) {
          parsedUser.id = Number(parsedUser.id);
        }
        setUser(parsedUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  const login = (userData: User, rememberMe: boolean) => {
    setIsLoggedIn(true);
    setUser(userData);
    const userString = JSON.stringify({ id: userData.id, username: userData.username });
    if (rememberMe) {
      localStorage.setItem('user', userString);
      sessionStorage.removeItem('user'); // Clear session storage if rememberMe is true
    } else {
      sessionStorage.setItem('user', userString);
      localStorage.removeItem('user'); // Clear local storage if rememberMe is false
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  if (!isAuthReady) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
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
