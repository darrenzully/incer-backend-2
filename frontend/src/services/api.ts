const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

// Función genérica para hacer requests autenticados
export async function apiRequest(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const currentCenterId = localStorage.getItem('currentCenterId');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json',
      'X-Center-Id': currentCenterId || '',
      ...options.headers
    }
  });

  // Si es 401, limpiar token y redirigir a login
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accessibleCenters');
    localStorage.removeItem('accessibleApps');
    localStorage.removeItem('currentCenterId');
    window.location.href = '/login';
    throw new Error('Token expirado');
  }

  // Si es 403, manejar error de permisos
  if (response.status === 403) {
    const errorText = await response.text();
    throw new Error(`403: Acceso denegado. ${errorText}`);
  }

  // Si es 204 No Content, retornar null
  if (response.status === 204) {
    return null;
  }

  // Si no es ok, lanzar error
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  // Verificar si hay contenido para parsear
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return null;
}

// Función para hacer requests GET autenticados
export async function apiGet(url: string): Promise<any> {
  return apiRequest(url, { method: 'GET' });
}

// Función para hacer requests POST autenticados
export async function apiPost(url: string, data?: any): Promise<any> {
  return apiRequest(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  });
}

// Función para hacer requests PUT autenticados
export async function apiPut(url: string, data?: any): Promise<any> {
  return apiRequest(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  });
}

// Función para hacer requests DELETE autenticados
export async function apiDelete(url: string): Promise<any> {
  return apiRequest(url, { method: 'DELETE' });
}

export async function getCenters() {
  return apiGet(`${API_URL}/api/centers`);
}

export async function deleteCenter(id: number) {
  return apiDelete(`${API_URL}/api/centers/${id}`);
}

// Función para refrescar token
export async function refreshToken(): Promise<{ token: string }> {
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
  return { token: data.token };
} 