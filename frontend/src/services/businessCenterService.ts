const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const currentCenterId = localStorage.getItem('currentCenterId');
  return {
    'Authorization': `Bearer ${token || ''}`,
    'Content-Type': 'application/json',
    'X-Center-Id': currentCenterId || ''
  };
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
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

export interface BusinessCenter {
  id: number;
  name: string;
  description?: string;
  activo: boolean;
}

export const businessCenterService = {
  async getAccessibleCenters(): Promise<BusinessCenter[]> {
    return apiRequest('/api/businesscenters/accessible');
  },

  async getAll(): Promise<BusinessCenter[]> {
    return apiRequest('/api/businesscenters');
  },

  async getById(id: number): Promise<BusinessCenter> {
    return apiRequest(`/api/businesscenters/${id}`);
  }
};