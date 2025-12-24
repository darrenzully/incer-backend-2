import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource?: string;
  action?: string;
  fallback?: React.ReactElement;
  requireAll?: boolean; // Si true, requiere todos los permisos, si false, requiere al menos uno
  permissions?: Array<{resource: string, action: string}>; // Para múltiples permisos
  appId?: number; // Para verificar acceso a aplicación específica
  centerId?: number; // Para verificar acceso a centro específico
  adminOnly?: boolean; // Si true, solo administradores pueden acceder
}

export default function PermissionGuard({
  children,
  resource,
  action,
  fallback = <div>Acceso denegado</div>,
  requireAll = true,
  permissions,
  appId,
  centerId,
  adminOnly = false
}: PermissionGuardProps): React.ReactElement {
  const { 
    hasPermission, 
    canAccessApp, 
    canAccessCenter, 
    isAdmin, 
    hasAllPermissions, 
    hasAnyPermission,
    loading 
  } = usePermissions();

  // Mostrar loading mientras se cargan los permisos
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  // Verificar si es administrador por rol (fallback)
  const userData = localStorage.getItem('user');
  const isAdminByRole = userData ? JSON.parse(userData).role?.name === 'Administrador' : false;

  // Verificar si es administrador
  if (adminOnly) {
    if (!isAdmin() && !isAdminByRole) {
      return (
        <div className="text-center p-4">
          <div className="text-red-600 mb-2">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600">Acceso denegado. Se requieren permisos de administrador.</p>
        </div>
      );
    }
  }

  // Verificar acceso a aplicación específica
  if (appId && !canAccessApp(appId)) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600">No tienes acceso a esta aplicación.</p>
      </div>
    );
  }

  // Verificar acceso a centro específico
  if (centerId && !canAccessCenter(centerId)) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600">No tienes acceso a este centro de negocio.</p>
      </div>
    );
  }

  // Si es adminOnly, ya se verificó arriba, permitir acceso
  if (adminOnly) {
    return <>{children}</>;
  }

  // Verificar permisos específicos
  let hasRequiredPermissions = false;

  if (permissions && permissions.length > 0) {
    // Verificar múltiples permisos
    hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else if (resource && action) {
    // Verificar permiso único
    hasRequiredPermissions = hasPermission(resource, action);
  } else {
    // Si no hay permisos específicos que verificar, permitir acceso
    hasRequiredPermissions = true;
  }

  if (!hasRequiredPermissions) {
    return fallback || (
      <div className="text-center p-4">
        <div className="text-red-600 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600">
          No tienes permisos para realizar esta acción.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Recurso: {resource} | Acción: {action}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
