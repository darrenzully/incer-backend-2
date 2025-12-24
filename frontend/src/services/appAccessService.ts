const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

export interface App {
  id: number;
  name: string;
  code: string;
  type: string;
  platform?: string;
  version: string;
  active: boolean;
}

export interface UserAppAccess {
  id: number;
  userId: number;
  appId: number;
  appName: string;
  appCode: string;
  appType: string;
  accessLevel: string;
  grantedAt: string;
  expiresAt?: string;
  active: boolean;
}

export interface RoleAppAccess {
  id: number;
  roleId: number;
  appId: number;
  appName: string;
  appCode: string;
  appType: string;
  accessLevel: string;
  grantedAt: string;
  expiresAt?: string;
  active: boolean;
}

export interface CreateUserAppAccessRequest {
  userId: number;
  appId: number;
  accessLevel: string;
  expiresAt?: string;
}

export interface CreateRoleAppAccessRequest {
  roleId: number;
  appId: number;
  accessLevel: string;
  expiresAt?: string;
}

export interface BulkAssignAppsToRoleRequest {
  roleId: number;
  appIds: number[];
  accessLevel: string;
  expiresAt?: string;
}

class AppAccessService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Aplicaciones disponibles
  async getAvailableApps(): Promise<App[]> {
    try {
      const res = await fetch(`${API_URL}/api/userappaccess/available-apps`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener aplicaciones');
      return await res.json();
    } catch (error) {
      console.error('Error getting available apps:', error);
      return [];
    }
  }

  // Accesos de usuario a aplicaciones
  async getUserAppAccesses(userId: number): Promise<UserAppAccess[]> {
    try {
      const res = await fetch(`${API_URL}/api/userappaccess/user/${userId}`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener accesos del usuario');
      return await res.json();
    } catch (error) {
      console.error('Error getting user app accesses:', error);
      return [];
    }
  }

  async getAppUserAccesses(appId: number): Promise<UserAppAccess[]> {
    try {
      const res = await fetch(`${API_URL}/api/userappaccess/app/${appId}`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener usuarios de la aplicación');
      return await res.json();
    } catch (error) {
      console.error('Error getting app user accesses:', error);
      return [];
    }
  }

  async createUserAppAccess(request: CreateUserAppAccessRequest): Promise<UserAppAccess> {
    try {
      const res = await fetch(`${API_URL}/api/userappaccess`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 409) {
          throw new Error('409: El usuario ya tiene acceso a esta aplicación');
        } else if (res.status === 404) {
          throw new Error('404: Usuario o aplicación no encontrado');
        } else {
          throw new Error(`Error al crear acceso de usuario: ${res.status} - ${errorText}`);
        }
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error creating user app access:', error);
      throw error;
    }
  }

  async updateUserAppAccess(id: number, request: Partial<CreateUserAppAccessRequest>): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/api/userappaccess/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });
      if (!res.ok) throw new Error('Error al actualizar acceso de usuario');
    } catch (error) {
      console.error('Error updating user app access:', error);
      throw error;
    }
  }

  async deleteUserAppAccess(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/api/userappaccess/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al eliminar acceso de usuario');
    } catch (error) {
      console.error('Error deleting user app access:', error);
      throw error;
    }
  }

  // Accesos de rol a aplicaciones
  async getRoleAppAccesses(roleId: number): Promise<RoleAppAccess[]> {
    try {
      const res = await fetch(`${API_URL}/api/roleappaccess/role/${roleId}`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener accesos del rol');
      return await res.json();
    } catch (error) {
      console.error('Error getting role app accesses:', error);
      return [];
    }
  }

  async getAppRoleAccesses(appId: number): Promise<RoleAppAccess[]> {
    try {
      const res = await fetch(`${API_URL}/api/roleappaccess/app/${appId}`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener roles de la aplicación');
      return await res.json();
    } catch (error) {
      console.error('Error getting app role accesses:', error);
      return [];
    }
  }

  async createRoleAppAccess(request: CreateRoleAppAccessRequest): Promise<RoleAppAccess> {
    try {
      const res = await fetch(`${API_URL}/api/roleappaccess`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 409) {
          throw new Error('409: El rol ya tiene acceso a esta aplicación');
        } else if (res.status === 404) {
          throw new Error('404: Rol o aplicación no encontrado');
        } else {
          throw new Error(`Error al crear acceso de rol: ${res.status} - ${errorText}`);
        }
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error creating role app access:', error);
      throw error;
    }
  }

  async updateRoleAppAccess(id: number, request: Partial<CreateRoleAppAccessRequest>): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/api/roleappaccess/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });
      if (!res.ok) throw new Error('Error al actualizar acceso de rol');
    } catch (error) {
      console.error('Error updating role app access:', error);
      throw error;
    }
  }

  async deleteRoleAppAccess(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/api/roleappaccess/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al eliminar acceso de rol');
    } catch (error) {
      console.error('Error deleting role app access:', error);
      throw error;
    }
  }

  async bulkAssignAppsToRole(request: BulkAssignAppsToRoleRequest): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/api/roleappaccess/bulk-assign`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });
      if (!res.ok) throw new Error('Error al asignar aplicaciones al rol');
    } catch (error) {
      console.error('Error bulk assigning apps to role:', error);
      throw error;
    }
  }

  // Mis aplicaciones accesibles
  async getMyApps(): Promise<App[]> {
    try {
      const res = await fetch(`${API_URL}/api/useraccess/my-apps`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener mis aplicaciones');
      return await res.json();
    } catch (error) {
      console.error('Error getting my apps:', error);
      return [];
    }
  }
}

export default new AppAccessService();
