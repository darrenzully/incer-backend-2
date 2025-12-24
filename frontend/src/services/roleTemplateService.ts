const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

// ===============================
// INTERFACES
// ===============================

export interface RoleTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  isSystem: boolean;
  priority: number;
  active: boolean;
  roleTemplatePermissions?: RoleTemplatePermission[];
  activo: boolean;
  fechaCreacion?: string;
  fechaUpdate?: string;
  usuarioCreacion?: string;
  usuarioUpdate?: string;
}

export interface RoleTemplatePermission {
  id: number;
  roleTemplateId: number;
  permissionId: number;
  roleTemplate?: RoleTemplate;
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

export interface Role {
  id: number;
  name: string;
  description: string;
  isSystem: boolean;
  priority: number;
  activo: boolean;
}

export interface CreateRoleTemplateRequest {
  name: string;
  description?: string;
  category: string;
  isSystem: boolean;
  priority: number;
  active: boolean;
}

export interface UpdateRoleTemplateRequest {
  id: number;
  name?: string;
  description?: string;
  category?: string;
  isSystem?: boolean;
  priority?: number;
  active?: boolean;
  activo?: boolean;
}

export interface CreateRoleFromTemplateRequest {
  name: string;
  description: string;
}

export interface DuplicateTemplateRequest {
  name: string;
  description: string;
}

export interface ApplyTemplateToRoleResponse {
  message: string;
  addedPermissions: number;
}

export interface DetailedRoleTemplate extends RoleTemplate {
  permissions: Permission[];
}

// ===============================
// ROLE TEMPLATE SERVICE
// ===============================

class RoleTemplateService {
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
  // ROLE TEMPLATE CRUD OPERATIONS
  // ===============================

  async getRoleTemplates(): Promise<RoleTemplate[]> {
    return this.request<RoleTemplate[]>('/api/roletemplates');
  }

  async getRoleTemplate(id: number): Promise<RoleTemplate> {
    return this.request<RoleTemplate>(`/api/roletemplates/${id}`);
  }

  async createRoleTemplate(template: CreateRoleTemplateRequest): Promise<RoleTemplate> {
    return this.request<RoleTemplate>('/api/roletemplates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateRoleTemplate(template: UpdateRoleTemplateRequest): Promise<RoleTemplate> {
    return this.request<RoleTemplate>(`/api/roletemplates/${template.id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  async deleteRoleTemplate(id: number): Promise<void> {
    return this.request<void>(`/api/roletemplates/${id}`, {
      method: 'DELETE',
    });
  }

  // ===============================
  // ROLE TEMPLATE PERMISSIONS
  // ===============================

  async getRoleTemplatePermissions(templateId: number): Promise<Permission[]> {
    return this.request<Permission[]>(`/api/roletemplates/${templateId}/permissions`);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.request<Permission[]>('/api/permissions');
  }

  async assignPermissionToTemplate(templateId: number, permissionId: number): Promise<void> {
    return this.request<void>(`/api/roletemplates/${templateId}/permissions`, {
      method: 'POST',
      body: JSON.stringify(permissionId),
    });
  }

  async removePermissionFromTemplate(templateId: number, permissionId: number): Promise<void> {
    return this.request<void>(`/api/roletemplates/${templateId}/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  }

  // ===============================
  // ROLE CREATION FROM TEMPLATE
  // ===============================

  async createRoleFromTemplate(templateId: number, request: CreateRoleFromTemplateRequest): Promise<Role> {
    return this.request<Role>(`/api/roletemplates/${templateId}/create-role`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ===============================
  // NEW ENHANCED METHODS
  // ===============================

  async getRoleTemplatesByCategory(category: string): Promise<RoleTemplate[]> {
    return this.request<RoleTemplate[]>(`/api/roletemplates/by-category/${category}`);
  }

  async getSystemRoleTemplates(): Promise<RoleTemplate[]> {
    return this.request<RoleTemplate[]>('/api/roletemplates/system');
  }

  async getBusinessRoleTemplates(): Promise<RoleTemplate[]> {
    return this.request<RoleTemplate[]>('/api/roletemplates/business');
  }

  async getDetailedRoleTemplate(id: number): Promise<DetailedRoleTemplate> {
    return this.request<DetailedRoleTemplate>(`/api/roletemplates/${id}/detailed`);
  }

  async applyTemplateToRole(templateId: number, roleId: number): Promise<ApplyTemplateToRoleResponse> {
    return this.request<ApplyTemplateToRoleResponse>(`/api/roletemplates/${templateId}/apply-to-role/${roleId}`, {
      method: 'POST',
    });
  }

  async duplicateTemplate(id: number, request: DuplicateTemplateRequest): Promise<RoleTemplate> {
    return this.request<RoleTemplate>(`/api/roletemplates/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  async getActiveRoleTemplates(): Promise<RoleTemplate[]> {
    const templates = await this.getRoleTemplates();
    return templates.filter(template => template.active && template.activo);
  }

  async getCustomRoleTemplates(): Promise<RoleTemplate[]> {
    const templates = await this.getRoleTemplates();
    return templates.filter(template => !template.isSystem);
  }

  // ===============================
  // CATEGORY HELPERS
  // ===============================

  getCategoryDisplayName(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'system': 'Sistema',
      'business': 'Negocio',
      'client': 'Cliente',
      'audit': 'Auditoría'
    };
    return categoryMap[category] || category;
  }

  getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      'system': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'business': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'client': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'audit': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

export const roleTemplateService = new RoleTemplateService();
export default roleTemplateService;
