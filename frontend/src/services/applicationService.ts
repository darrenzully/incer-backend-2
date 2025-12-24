const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

// ===============================
// INTERFACES
// ===============================

export interface App {
  id: number;
  name: string;
  code: string;
  type: string;
  platform?: string;
  active: boolean;
  version: string;
  userAppAccesses?: UserAppAccess[];
  appPermissions?: AppPermission[];
  activo: boolean;
  fechaCreacion?: string;
  fechaUpdate?: string;
  usuarioCreacion?: string;
  usuarioUpdate?: string;
}

export interface UserAppAccess {
  id: number;
  userId: number;
  appId: number;
  accessLevel: string;
  grantedBy: number;
  grantedAt: string;
}

export interface AppPermission {
  id: number;
  appId: number;
  permissionId: number;
  app?: App;
  permission?: Permission;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  module: string;
  isSystem: boolean;
  activo: boolean;
}

export interface CreateAppRequest {
  name: string;
  code: string;
  type: string;
  platform?: string;
  active: boolean;
  version: string;
}

export interface UpdateAppRequest {
  id: number;
  name?: string;
  code?: string;
  type?: string;
  platform?: string;
  active?: boolean;
  version?: string;
  activo?: boolean;
}

// ===============================
// APPLICATION SERVICE
// ===============================

class ApplicationService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error in request to ${endpoint}:`, error);
      throw error;
    }
  }

  // ===============================
  // APP CRUD OPERATIONS
  // ===============================

  async getApps(): Promise<App[]> {
    return this.request<App[]>('/api/applications');
  }

  async getApp(id: number): Promise<App> {
    return this.request<App>(`/api/applications/${id}`);
  }

  async createApp(app: CreateAppRequest): Promise<App> {
    return this.request<App>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(app),
    });
  }

  async updateApp(app: UpdateAppRequest): Promise<App> {
    return this.request<App>(`/api/applications/${app.id}`, {
      method: 'PUT',
      body: JSON.stringify(app),
    });
  }

  async deleteApp(id: number): Promise<void> {
    return this.request<void>(`/api/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // ===============================
  // APP PERMISSIONS
  // ===============================

  async getAppPermissions(appId: number): Promise<Permission[]> {
    return this.request<Permission[]>(`/api/applications/${appId}/permissions`);
  }

  async assignPermissionToApp(appId: number, permissionId: number): Promise<void> {
    return this.request<void>(`/api/applications/${appId}/permissions`, {
      method: 'POST',
      body: JSON.stringify(permissionId),
    });
  }

  async removePermissionFromApp(appId: number, permissionId: number): Promise<void> {
    return this.request<void>(`/api/applications/${appId}/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  async getActiveApps(): Promise<App[]> {
    const apps = await this.getApps();
    return apps.filter(app => app.active && app.activo);
  }

  async getAppsByType(type: string): Promise<App[]> {
    const apps = await this.getApps();
    return apps.filter(app => app.type === type);
  }

  async getAppsByPlatform(platform: string): Promise<App[]> {
    const apps = await this.getApps();
    return apps.filter(app => app.platform === platform);
  }
}

export const applicationService = new ApplicationService();
export default applicationService;
