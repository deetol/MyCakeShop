"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext =
  createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        // Invalid JSON, clear storage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    // Small delay to ensure state updates are applied before loading = false
    // This prevents race condition where loading=false but token=null
    setTimeout(() => setLoading(false), 0);
  }, []);

  const login = (newUser: User, newToken: string) => {
    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", newToken);
    
    // Update state immediately
    setUser(newUser);
    setToken(newToken);
  };

  const logout = async () => {
  const token = localStorage.getItem("token");

  try {
    await fetch(
      `${API_URL}/logout`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
  }

  localStorage.removeItem("user");
  localStorage.removeItem("token");

  setUser(null);
  setToken(null);

  window.location.href = "/login";
};

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}