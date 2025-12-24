import { useState, useEffect, useCallback } from 'react';
import { securityService } from '../services/securityService';

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Center {
  id: number;
  name: string;
  description: string;
}

export interface App {
  id: number;
  name: string;
  code: string;
  type: string;
}

interface UserPermissions {
  permissions: Permission[];
  accessibleCenters: Center[];
  accessibleApps: App[];
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [accessibleCenters, setAccessibleCenters] = useState<Center[]>([]);
  const [accessibleApps, setAccessibleApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Usuario no autenticado');
      }

      const user = JSON.parse(userData);
      
      // Obtener permisos del usuario usando el endpoint correcto
      const userPermissions = await securityService.getMyPermissions();
      
      // Obtener centros accesibles del localStorage (se guarda en el login)
      const accessibleCentersData = localStorage.getItem('accessibleCenters');
      const accessibleCenters = accessibleCentersData ? JSON.parse(accessibleCentersData) : [];
      
      // Obtener aplicaciones accesibles del localStorage (se guarda en el login)
      const accessibleAppsData = localStorage.getItem('accessibleApps');
      const accessibleApps = accessibleAppsData ? JSON.parse(accessibleAppsData) : [];
      
      setPermissions(userPermissions || []);
      setAccessibleCenters(accessibleCenters || []);
      setAccessibleApps(accessibleApps || []);
    } catch (err) {
      console.error('Error cargando permisos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    return permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }, [permissions]);

  // Función para verificar si el usuario tiene acceso a una aplicación
  const canAccessApp = useCallback((appId: number): boolean => {
    return accessibleApps.some(app => app.id === appId);
  }, [accessibleApps]);

  // Función para verificar si el usuario tiene acceso a un centro
  const canAccessCenter = useCallback((centerId: number): boolean => {
    return accessibleCenters.some(center => center.id === centerId);
  }, [accessibleCenters]);

  // Función para verificar si el usuario es administrador
  const isAdmin = useCallback((): boolean => {
    return hasPermission('*', '*');
  }, [hasPermission]);

  // Función para verificar múltiples permisos (todos deben cumplirse)
  const hasAllPermissions = useCallback((permissionChecks: Array<{resource: string, action: string}>): boolean => {
    return permissionChecks.every(check => hasPermission(check.resource, check.action));
  }, [hasPermission]);

  // Función para verificar múltiples permisos (al menos uno debe cumplirse)
  const hasAnyPermission = useCallback((permissionChecks: Array<{resource: string, action: string}>): boolean => {
    return permissionChecks.some(check => hasPermission(check.resource, check.action));
  }, [hasPermission]);

  return {
    permissions,
    accessibleCenters,
    accessibleApps,
    loading,
    error,
    hasPermission,
    canAccessApp,
    canAccessCenter,
    isAdmin,
    hasAllPermissions,
    hasAnyPermission,
    refreshPermissions: loadPermissions
  };
}