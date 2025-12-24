const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

export interface UserProfile {
  id: number;
  nombre?: string;
  apellido?: string;
  alias?: string;
  mail?: string;
  foto?: string;
  roleId: number;
  role?: {
    id: number;
    name: string;
    description: string;
  };
  isActive: boolean;
  activo?: boolean;
  fechaCreacion?: string;
  fechaUpdate?: string;
  usuarioCreacion?: string;
  usuarioUpdate?: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
  accessibleApps: number[];
  accessibleCenters: number[];
}

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasAccessToCenter: (centerId: number) => boolean;
  hasGlobalAccess: () => boolean;
}

// Función para hacer login
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Username: username,
      Password: password
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Credenciales inválidas');
    }
    throw new Error(`Error de autenticación: ${response.status}`);
  }

  const data = await response.json();
  
  // Guardar token en localStorage
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('accessibleCenters', JSON.stringify(data.accessibleCenters || []));
  localStorage.setItem('accessibleApps', JSON.stringify(data.accessibleApps || []));
  
  return data;
}

// Función para hacer logout
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('accessibleCenters');
  localStorage.removeItem('accessibleApps');
}

// Función para refrescar token
export async function refreshToken(): Promise<string> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token para refrescar');
  }

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('No se pudo refrescar el token');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.token;
}

// Función para obtener perfil del usuario
export async function getProfile(): Promise<UserProfile> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token disponible');
  }

  const response = await fetch(`${API_URL}/api/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error('Token expirado');
    }
    throw new Error('Error al obtener perfil');
  }

  const data = await response.json();
  
  // Actualizar datos en localStorage
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('accessibleCenters', JSON.stringify(data.accessibleCenters || []));
  localStorage.setItem('accessibleApps', JSON.stringify(data.accessibleApps || []));
  
  return data.user;
}

// Función para verificar si el usuario tiene acceso a un centro específico
export function hasAccessToCenter(centerId: number): boolean {
  const accessibleCenters = JSON.parse(localStorage.getItem('accessibleCenters') || '[]');
  return accessibleCenters.includes(centerId);
}

// Función para verificar si el usuario tiene acceso global
export function hasGlobalAccess(): boolean {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role?.name === 'Admin' || user.role?.name === 'Administrador';
}

// Función para obtener centros accesibles
export function getAccessibleCenters(): number[] {
  return JSON.parse(localStorage.getItem('accessibleCenters') || '[]');
}

// Función para obtener aplicaciones accesibles
export function getAccessibleApps(): number[] {
  return JSON.parse(localStorage.getItem('accessibleApps') || '[]');
}

// Función para obtener usuario actual
export function getCurrentUser(): UserProfile | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Función para verificar si está autenticado
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
}

// Función para obtener token
export function getToken(): string | null {
  return localStorage.getItem('token');
}

// Función para hacer requests autenticados
export async function authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) {
    throw new Error('No hay token disponible');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (response.status === 401) {
    logout();
    throw new Error('Token expirado');
  }

  return response;
}
