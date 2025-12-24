const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

// Helper functions
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getCurrentCenterId = () => {
  return localStorage.getItem('currentCenterId');
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.status}`);
  }
  
  return response.json();
};

// Helper para agregar centerId a los parámetros
export const addCenterIdToParams = (params: URLSearchParams): URLSearchParams => {
  const centerId = getCurrentCenterId();
  if (centerId) {
    params.append('centerId', centerId);
  }
  return params;
};

// Helper para crear URLs con centerId
export const createUrlWithCenterId = (baseEndpoint: string, params?: Record<string, any>, centerIdOverride?: number | string | null): string => {
  // Si se pasa un centerId explícito, usarlo; sino, leer del localStorage
  const centerId = centerIdOverride !== undefined ? (centerIdOverride?.toString() || null) : getCurrentCenterId();
  console.log('=== CREATE URL WITH CENTER ID DEBUG ===');
  console.log('Base endpoint:', baseEndpoint);
  console.log('CenterId obtenido:', centerId);
  console.log('CenterId tipo:', typeof centerId);
  console.log('CenterId override:', centerIdOverride);
  
  const urlParams = new URLSearchParams();
  
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        urlParams.append(key, params[key]);
      }
    });
  }
  
  if (centerId) {
    urlParams.append('centerId', centerId);
    console.log('CenterId agregado a parámetros');
  } else {
    console.log('CenterId es null/undefined - no agregado');
  }
  
  const queryString = urlParams.toString();
  const finalUrl = queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint;
  console.log('URL final:', finalUrl);
  console.log('=====================================');
  
  return finalUrl;
};
