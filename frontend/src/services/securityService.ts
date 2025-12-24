const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

// ===============================
// INTERFACES BÁSICAS DE SEGURIDAD
// ===============================

export interface User {
  id: number;
  nombre?: string;
  apellido?: string;
  nombreCompleto?: string; // Campo calculado para mostrar el nombre formateado
  mail?: string;
  alias?: string;
  foto?: string; // Base64 string para la imagen
  roleId: number;
  role?: Role;
  isActive: boolean;
  activo?: boolean;
  fechaCreacion?: string;
  fechaUpdate?: string;
  usuarioCreacion?: string;
  usuarioUpdate?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  isSystem?: boolean;
  priority?: number;
  permissions?: Permission[];
  activo?: boolean;
  fechaCreacion?: string;
  fechaUpdate?: string;
  usuarioCreacion?: string;
  usuarioUpdate?: string;
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
  appPermissions?: AppPermission[];
  rolePermissions?: RolePermission[];
  activo: boolean;
  fechaCreacion?: string;
  fechaUpdate?: string;
  usuarioCreacion?: string;
  usuarioUpdate?: string;
}

// ===============================
// ADDITIONAL INTERFACES
// ===============================

export interface UserAppAccess {
  id: number;
  userId: number;
  appId: number;
  accessLevel: string;
  grantedBy: number;
  grantedAt: string;
}

export interface UserCenterAppAccess {
  id: number;
  userId: number;
  businessCenterId: number;
  appId: number;
  accessLevel: string;
  isDefault: boolean;
  grantedBy: number;
  grantedAt: string;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  role?: Role;
  permission?: Permission;
}

export interface RoleAppAccess {
  id: number;
  roleId: number;
  appId: number;
  accessLevel: string;
  role?: Role;
}

export interface RoleCenterAccess {
  id: number;
  roleId: number;
  businessCenterId: number;
  accessLevel: string;
  isDefault: boolean;
  role?: Role;
}

export interface AppPermission {
  id: number;
  appId: number;
  permissionId: number;
  app?: App;
  permission?: Permission;
}

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
}

// ===============================
// REQUEST/RESPONSE INTERFACES
// ===============================

export interface CreateUserRequest {
  nombre: string;
  apellido: string;
  mail: string;
  alias: string;
  clave: string;
  roleId: number;
}

export interface UpdateUserRequest {
  id: number;
  nombre?: string;
  apellido?: string;
  mail?: string;
  alias?: string;
  roleId?: number;
  activo?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  isSystem: boolean;
  priority: number;
  permissionIds?: number[];
}

export interface UpdateRoleRequest {
  id: number;
  name?: string;
  description?: string;
  isSystem?: boolean;
  priority?: number;
  permissionIds?: number[];
  activo?: boolean;
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  isSystem: boolean;
}

export interface UpdatePermissionRequest {
  id: number;
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  scope?: string;
  isSystem?: boolean;
  activo?: boolean;
}

// ===============================
// AUTH RESPONSE INTERFACES
// ===============================

export interface AuthResponse {
  token: string;
  user: User;
  accessibleApps: number[];
  accessibleCenters: number[];
  message?: string;
}

export interface AppLoginRequest {
  username: string;
  password: string;
  appId: number;
}

// ===============================
// SECURITY SERVICE CLASS
// ===============================

class SecurityService {
  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json'
    };
  }

  // ===============================
  // AUTENTICACIÓN
  // ===============================

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username: username, Password: password })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Credenciales inválidas');
      }
      
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async loginWithApp(username: string, password: string, appId: number): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_URL}/api/auth/login-with-app`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Username: username, 
          Password: password, 
          AppId: appId 
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.message === 'No tiene permisos para acceder a esta aplicación') {
          throw new Error('No tiene permisos para acceder a esta aplicación');
        }
        throw new Error(errorData.message || 'Credenciales inválidas');
      }
      
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('currentAppId', appId.toString());
      return data;
    } catch (error) {
      console.error('Error en login con aplicación:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentAppId');
  }

  async refreshToken(): Promise<string | null> {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      
      if (!res.ok) return null;
      
      const data = await res.json();
      localStorage.setItem('token', data.token);
      return data.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  // ===============================
  // APP MANAGEMENT
  // ===============================

  getCurrentAppId(): number | null {
    const appId = localStorage.getItem('currentAppId');
    return appId ? parseInt(appId, 10) : null;
  }

  setCurrentAppId(appId: number): void {
    localStorage.setItem('currentAppId', appId.toString());
  }

  // ===============================
  // USER MANAGEMENT
  // ===============================

  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener usuarios');
      const users = await res.json();
      
      // Formatear el nombre completo para cada usuario
      return users.map((user: User) => ({
        ...user,
        nombreCompleto: this.formatUserName(user)
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Función para formatear el nombre completo del usuario
  private formatUserName(user: User): string {
    const nombre = user.nombre?.trim() || '';
    const apellido = user.apellido?.trim() || '';
    
    if (nombre && apellido) {
      return `${apellido}, ${nombre}`;
    } else if (apellido) {
      return apellido;
    } else if (nombre) {
      return nombre;
    } else {
      return user.alias || user.mail || 'Usuario sin nombre';
    }
  }

  async getUser(id: number): Promise<User | null> {
    try {
      // Como el backend no tiene endpoint individual, obtenemos todos y filtramos
      const users = await this.getUsers();
      return users.find(u => u.id === id) || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User | null> {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      if (!res.ok) throw new Error('Error al crear usuario');
      return res.json();
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async updateUser(userData: UpdateUserRequest): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const url = `${API_URL}/api/users/${userData.id}`;
      console.log('Updating user:', url, 'Token present:', !!token);

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!res.ok) {
        let errorMessage = 'Error al actualizar usuario';
        
        // Si es 401, el token puede haber expirado
        if (res.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          // Opcional: limpiar el token y redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          try {
            const errorText = await res.text();
            if (errorText) {
              try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
              } catch {
                // Si no es JSON, usar el texto como mensaje
                errorMessage = errorText || errorMessage;
              }
            }
          } catch {
            // Si no se puede parsear el error, usar el mensaje por defecto
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Si la respuesta es 204 (NoContent), el backend no devuelve cuerpo
      // Obtener el usuario actualizado desde el servidor
      if (res.status === 204) {
        try {
          const updatedUser = await this.getUser(userData.id);
          if (updatedUser) {
            return updatedUser;
          }
        } catch (error) {
          console.warn('No se pudo obtener el usuario actualizado:', error);
        }
        
        // Fallback: devolver los datos que enviamos
        return {
          id: userData.id,
          nombre: userData.nombre,
          apellido: userData.apellido,
          mail: userData.mail,
          alias: userData.alias,
          roleId: userData.roleId || 0,
          activo: true
        } as User;
      }
      
      // Si hay contenido, intentar parsearlo
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await res.text();
        if (text && text.trim()) {
          try {
            return JSON.parse(text);
          } catch (parseError) {
            console.warn('Error parseando respuesta JSON:', parseError);
          }
        }
      }
      
      // Fallback final: obtener el usuario actualizado
      return await this.getUser(userData.id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      return res.ok;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // ===============================
  // ROLE MANAGEMENT
  // ===============================

  async getRoles(): Promise<Role[]> {
    try {
      const res = await fetch(`${API_URL}/api/roles`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener roles');
      return res.json();
    } catch (error) {
      console.error('Error getting roles:', error);
      return [];
    }
  }

  async getRole(id: number): Promise<Role | null> {
    try {
      // Usar el endpoint GET /api/roles/{id} que ahora incluye los permisos
      const res = await fetch(`${API_URL}/api/roles/${id}`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Error al obtener el rol');
      }
      return await res.json();
    } catch (error) {
      console.error('Error getting role:', error);
      return null;
    }
  }

  async createRole(roleData: CreateRoleRequest): Promise<Role | null> {
    try {
      const res = await fetch(`${API_URL}/api/roles`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(roleData)
      });
      if (!res.ok) throw new Error('Error al crear rol');
      return res.json();
    } catch (error) {
      console.error('Error creating role:', error);
      return null;
    }
  }

  async updateRole(roleData: UpdateRoleRequest): Promise<Role | null> {
    try {
      const res = await fetch(`${API_URL}/api/roles/${roleData.id}`, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });
      
      if (!res.ok) {
        let errorMessage = 'Error al actualizar rol';
        try {
          const contentType = res.headers.get('content-type');
          let errorText = '';
          if (contentType && contentType.includes('application/json')) {
            errorText = await res.text();
            if (errorText && errorText.trim()) {
              const error = JSON.parse(errorText);
              errorMessage = error.message || error.error || error.details || errorMessage;
              console.error('Error del backend:', error);
            }
          } else {
            errorText = await res.text();
            if (errorText && errorText.trim()) {
              errorMessage = errorText;
            }
          }
          console.error(`Error ${res.status} al actualizar rol:`, errorMessage);
        } catch (parseError) {
          console.error('Error parseando respuesta de error:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      // Si la respuesta es 204 NoContent, obtener el rol actualizado
      if (res.status === 204) {
        // Obtener el rol actualizado
        return await this.getRole(roleData.id);
      }
      
      // Si hay contenido JSON, parsearlo
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await res.text();
        if (text && text.trim()) {
          return JSON.parse(text);
        }
      }
      
      // Si no hay contenido, obtener el rol actualizado
      return await this.getRole(roleData.id);
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/api/roles/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      return res.ok;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  }

  // ===============================
  // PERMISSION MANAGEMENT
  // ===============================

  async getPermissions(): Promise<Permission[]> {
    try {
      const res = await fetch(`${API_URL}/api/permissions`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener permisos');
      return res.json();
    } catch (error) {
      console.error('Error getting permissions:', error);
      return [];
    }
  }

  async getPermission(id: number): Promise<Permission | null> {
    try {
      // Como el backend no tiene endpoint individual, obtenemos todos y filtramos
      const permissions = await this.getPermissions();
      return permissions.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting permission:', error);
      return null;
    }
  }

  async createPermission(permissionData: CreatePermissionRequest): Promise<Permission | null> {
    try {
      const res = await fetch(`${API_URL}/api/permissions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(permissionData)
      });
      if (!res.ok) throw new Error('Error al crear permiso');
      return res.json();
    } catch (error) {
      console.error('Error creating permission:', error);
      return null;
    }
  }

  async updatePermission(permissionData: UpdatePermissionRequest): Promise<Permission | null> {
    try {
      const res = await fetch(`${API_URL}/api/permissions/${permissionData.id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(permissionData)
      });
      if (!res.ok) throw new Error('Error al actualizar permiso');
      return res.json();
    } catch (error) {
      console.error('Error updating permission:', error);
      return null;
    }
  }

  async deletePermission(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/api/permissions/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      return res.ok;
    } catch (error) {
      console.error('Error deleting permission:', error);
      return false;
    }
  }

  // ===============================
  // MÉTODOS ADICIONALES PARA CENTROS Y CLIENTES
  // ===============================

  async getUsuarioCentros(id: number): Promise<any[]> {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/centers`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener centros del usuario');
      const data = await res.json();
      // Normalizar los datos para que coincidan con el formato esperado
      return (data || []).map((center: any) => ({
        id: center.id,
        nombre: center.name || center.nombre || center.Name || '',
        descripcion: center.description || center.descripcion || center.Description || '',
        activo: center.activo ?? center.active ?? center.Activo ?? true
      }));
    } catch (error) {
      console.error('Error getting usuario centros:', error);
      return [];
    }
  }

  async getUsuarioClientes(id: number): Promise<any[]> {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/clients`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener clientes del usuario');
      const data = await res.json();
      // Normalizar los datos para que coincidan con el formato esperado
      return (data || []).map((cliente: any) => ({
        id: cliente.id,
        nombre: cliente.nombre || cliente.Nombre || cliente.name || '',
        cuit: cliente.cuit || cliente.CUIT || cliente.cuit || '',
        centro: cliente.businessCenter || cliente.centro || cliente.Centro ? {
          id: (cliente.businessCenter || cliente.centro || cliente.Centro).id,
          nombre: (cliente.businessCenter || cliente.centro || cliente.Centro).name || 
                  (cliente.businessCenter || cliente.centro || cliente.Centro).nombre ||
                  (cliente.businessCenter || cliente.centro || cliente.Centro).Name || ''
        } : null,
        activo: cliente.activo ?? cliente.Activo ?? cliente.active ?? true
      }));
    } catch (error) {
      console.error('Error getting usuario clientes:', error);
      return [];
    }
  }

  async assignCenterToUser(userId: number, centerId: number, appId?: number, accessLevel: string = 'full', isDefault: boolean = false): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/centers`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          centerId,
          appId,
          accessLevel,
          isDefault
        })
      });
      
      // Leer el contenido de la respuesta antes de verificar res.ok
      // para evitar errores de "body already read"
      const contentType = res.headers.get('content-type');
      let responseText = '';
      let responseData: any = null;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseText = await res.text();
          if (responseText && responseText.trim()) {
            responseData = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.warn('Error parseando respuesta JSON:', parseError);
        }
      }
      
      if (!res.ok) {
        let errorMessage = 'Error al asignar centro al usuario';
        if (responseData) {
          // Priorizar el mensaje detallado si está disponible
          errorMessage = responseData.details 
            ? `${responseData.message || errorMessage}: ${responseData.details}`
            : responseData.message || responseData.error || errorMessage;
        } else if (responseText) {
          errorMessage = responseText;
        }
        console.error('Error response:', { status: res.status, statusText: res.statusText, data: responseData, text: responseText });
        throw new Error(errorMessage);
      }
      
      // Si la respuesta fue exitosa, devolver los datos parseados o un objeto de éxito
      if (responseData) {
        return responseData;
      }
      
      // Si no hay contenido JSON pero la respuesta fue exitosa, devolver éxito
      return { message: 'Centro asignado correctamente', success: true };
    } catch (error) {
      console.error('Error assigning center to user:', error);
      throw error;
    }
  }

  async getCenterClients(centerId: number): Promise<any[]> {
    try {
      const res = await fetch(`${API_URL}/api/users/centers/${centerId}/clients`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener clientes del centro');
      const data = await res.json();
      return (data || []).map((cliente: any) => ({
        id: cliente.id,
        nombre: cliente.nombre || cliente.Nombre || cliente.name || '',
        cuit: cliente.cuit || cliente.CUIT || '',
        businessCenterId: cliente.businessCenterId || cliente.BusinessCenterId,
        activo: cliente.activo ?? cliente.Activo ?? cliente.active ?? true
      }));
    } catch (error) {
      console.error('Error getting center clients:', error);
      return [];
    }
  }

  async getUserAssignedClients(userId: number): Promise<any[]> {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/assigned-clients`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener clientes asignados del usuario');
      const data = await res.json();
      return (data || []).map((cliente: any) => ({
        id: cliente.id,
        nombre: cliente.nombre || cliente.Nombre || cliente.name || '',
        cuit: cliente.cuit || cliente.CUIT || '',
        businessCenterId: cliente.businessCenterId || cliente.BusinessCenterId,
        activo: cliente.activo ?? cliente.Activo ?? cliente.active ?? true
      }));
    } catch (error) {
      console.error('Error getting user assigned clients:', error);
      return [];
    }
  }

  async assignClientToUser(userId: number, clienteId: number, appId?: number, accessLevel: string = 'full'): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/clients`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clienteId,
          appId,
          accessLevel
        })
      });
      
      const contentType = res.headers.get('content-type');
      let responseText = '';
      let responseData: any = null;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseText = await res.text();
          if (responseText && responseText.trim()) {
            responseData = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.warn('Error parseando respuesta JSON:', parseError);
        }
      }
      
      if (!res.ok) {
        let errorMessage = 'Error al asignar cliente al usuario';
        if (responseData) {
          if (responseData.details) {
            errorMessage = `${responseData.message || errorMessage}: ${responseData.details}`;
          } else {
            errorMessage = responseData.message || responseData.error || errorMessage;
          }
        } else if (responseText) {
          errorMessage = responseText;
        }
        console.error('Error response:', { status: res.status, statusText: res.statusText, data: responseData, text: responseText });
        throw new Error(errorMessage);
      }
      
      if (responseData) {
        return responseData;
      }
      
      return { message: 'Cliente asignado correctamente', success: true };
    } catch (error) {
      console.error('Error assigning client to user:', error);
      throw error;
    }
  }

  async removeClientFromUser(userId: number, clienteId: number, appId?: number): Promise<void> {
    try {
      const url = appId 
        ? `${API_URL}/api/users/${userId}/clients/${clienteId}?appId=${appId}`
        : `${API_URL}/api/users/${userId}/clients/${clienteId}`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al desasignar cliente del usuario');
      }
    } catch (error) {
      console.error('Error removing client from user:', error);
      throw error;
    }
  }

  async removeCenterFromUser(userId: number, centerId: number, appId?: number): Promise<void> {
    try {
      const url = appId 
        ? `${API_URL}/api/users/${userId}/centers/${centerId}?appId=${appId}`
        : `${API_URL}/api/users/${userId}/centers/${centerId}`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al desasignar centro del usuario');
      }
    } catch (error) {
      console.error('Error removing center from user:', error);
      throw error;
    }
  }

  async getUserPermissions(id: number): Promise<Permission[]> {
    try {
      const res = await fetch(`${API_URL}/api/permissions/user/${id}`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener permisos del usuario');
      return res.json();
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  async getMyPermissions(): Promise<Permission[]> {
    try {
      const res = await fetch(`${API_URL}/api/useraccess/my-permissions`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener mis permisos');
      const data = await res.json();
      // Convertir el formato del backend al formato del frontend
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        resource: p.resource,
        action: p.action,
        scope: p.scope,
        isSystem: p.isSystem,
        activo: true,
        fechaCreacion: new Date().toISOString(),
        fechaUpdate: null,
        usuarioCreacion: 'system',
        usuarioUpdate: null
      }));
    } catch (error) {
      console.error('Error getting my permissions:', error);
      return [];
    }
  }

  async getRolePermissions(id: number): Promise<Permission[]> {
    try {
      const res = await fetch(`${API_URL}/api/roles/${id}/permissions`, {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener permisos del rol');
      return res.json();
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return [];
    }
  }
}

export const securityService = new SecurityService();
