import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { securityService, User } from '../services/securityService';

// ===============================
// TIPOS DE CONTEXTO
// ===============================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===============================
// PROVIDER COMPONENT
// ===============================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ===============================
  // FUNCIONES DE AUTENTICACIÓN
  // ===============================

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await securityService.login(username, password);
      setUser(response.user);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    securityService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;

  // ===============================
  // VALOR DEL CONTEXTO
  // ===============================

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ===============================
// HOOK PERSONALIZADO
// ===============================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}