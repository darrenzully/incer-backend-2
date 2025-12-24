import { useState, useEffect, useCallback } from 'react';
import { 
  securityService, 
  User, 
  Role, 
  Permission, 
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest
} from '../services/securityService';

// ===============================
// HOOK PRINCIPAL DE SEGURIDAD
// ===============================

export const useSecurity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    setError(error.message || `Error en ${operation}`);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    handleError,
    clearError,
    setLoading
  };
};

// ===============================
// HOOK PARA USUARIOS
// ===============================

export const useUsers = () => {
  const { loading, error, handleError, clearError, setLoading } = useSecurity();
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const data = await securityService.getUsers();
      setUsers(data);
    } catch (error) {
      handleError(error, 'cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError]);

  const createUser = useCallback(async (userData: CreateUserRequest): Promise<User | null> => {
    try {
      setLoading(true);
      clearError();
      const user = await securityService.createUser(userData);
      if (user) {
        await loadUsers(); // Recargar lista
      }
      return user;
    } catch (error) {
      handleError(error, 'crear usuario');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError, loadUsers]);

  const updateUser = useCallback(async (userData: UpdateUserRequest): Promise<User | null> => {
    try {
      setLoading(true);
      clearError();
      const user = await securityService.updateUser(userData);
      if (user) {
        await loadUsers(); // Recargar lista
      }
      return user;
    } catch (error) {
      handleError(error, 'actualizar usuario');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError, loadUsers]);

  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();
      const success = await securityService.deleteUser(id);
      if (success) {
        await loadUsers(); // Recargar lista
      }
      return success;
    } catch (error) {
      handleError(error, 'eliminar usuario');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError, loadUsers]);

  const getUser = useCallback(async (id: number): Promise<User | null> => {
    try {
      setLoading(true);
      clearError();
      return await securityService.getUser(id);
    } catch (error) {
      handleError(error, 'obtener usuario');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    clearError
  };
};

// ===============================
// HOOK PARA ROLES
// ===============================

export const useRoles = () => {
  const { loading, error, handleError, clearError, setLoading } = useSecurity();
  const [roles, setRoles] = useState<Role[]>([]);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const data = await securityService.getRoles();
      setRoles(data);
    } catch (error) {
      handleError(error, 'cargar roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError]);

  const createRole = useCallback(async (roleData: CreateRoleRequest): Promise<Role | null> => {
    try {
      setLoading(true);
      clearError();
      const role = await securityService.createRole(roleData);
      if (role) {
        await loadRoles(); // Recargar lista
      }
      return role;
    } catch (error) {
      handleError(error, 'crear rol');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError, loadRoles]);

  const updateRole = useCallback(async (roleData: UpdateRoleRequest): Promise<Role | null> => {
    try {
      setLoading(true);
      clearError();
      const role = await securityService.updateRole(roleData);
      if (role) {
        await loadRoles(); // Recargar lista
      }
      return role;
    } catch (error) {
      handleError(error, 'actualizar rol');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError, loadRoles]);

  const deleteRole = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();
      const success = await securityService.deleteRole(id);
      if (success) {
        await loadRoles(); // Recargar lista
      }
      return success;
    } catch (error) {
      handleError(error, 'eliminar rol');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError, loadRoles]);

  const getRole = useCallback(async (id: number): Promise<Role | null> => {
    try {
      setLoading(true);
      clearError();
      return await securityService.getRole(id);
    } catch (error) {
      handleError(error, 'obtener rol');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return {
    roles,
    loading,
    error,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    getRole,
    clearError
  };
};

// ===============================
// HOOK PARA PERMISOS
// ===============================

export const usePermissions = () => {
  const { loading, error, handleError, clearError, setLoading } = useSecurity();
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const data = await securityService.getPermissions();
      setPermissions(data);
    } catch (error) {
      handleError(error, 'cargar permisos');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError]);

  const createPermission = useCallback(async (permissionData: CreatePermissionRequest): Promise<Permission | null> => {
    try {
      setLoading(true);
      clearError();
      const permission = await securityService.createPermission(permissionData);
      if (permission) {
        await loadPermissions(); // Recargar lista
      }
      return permission;
    } catch (error) {
      handleError(error, 'crear permiso');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError, loadPermissions]);

  const updatePermission = useCallback(async (permissionData: UpdatePermissionRequest): Promise<Permission | null> => {
    try {
      setLoading(true);
      clearError();
      const permission = await securityService.updatePermission(permissionData);
      if (permission) {
        await loadPermissions(); // Recargar lista
      }
      return permission;
    } catch (error) {
      handleError(error, 'actualizar permiso');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError, loadPermissions]);

  const deletePermission = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();
      const success = await securityService.deletePermission(id);
      if (success) {
        await loadPermissions(); // Recargar lista
      }
      return success;
    } catch (error) {
      handleError(error, 'eliminar permiso');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError, loadPermissions]);

  const getPermission = useCallback(async (id: number): Promise<Permission | null> => {
    try {
      setLoading(true);
      clearError();
      return await securityService.getPermission(id);
    } catch (error) {
      handleError(error, 'obtener permiso');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    error,
    loadPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    getPermission,
    clearError
  };
};
