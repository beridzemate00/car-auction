// client/src/context/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  import type { User } from "../types";
  
  interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
  }
  
  const AuthContext = createContext<AuthState | undefined>(undefined);
  
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
  
    useEffect(() => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");
  
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    }, []);
  
    const setAuth = (newToken: string, newUser: User) => {
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
    };
  
    const logout = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    };
  
    return (
      <AuthContext.Provider value={{ user, token, setAuth, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
      throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
  }
  