import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { securityService, Permission as ApiPermission } from '../services/securityService';
import { useAuth } from './AuthContext';
import { useCenter } from './CenterContext';

export type PermissionKey = { resource: string; action: string };

interface PermissionsContextType {
  loading: boolean;
  permissions: ApiPermission[];
  can: (resource: string, action: string) => boolean;
  hasAny: (checks: PermissionKey[]) => boolean;
  refresh: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const normalize = (s: string) => (s || '').trim().toLowerCase();

// Alias de acciones para compatibilidad (porque en API a veces se usa "read" y en seed hay "list"/"view_all"/etc.)
const actionAliases = (action: string): string[] => {
  const a = normalize(action);
  if (a === '*') return ['*'];
  if (a === 'read') return ['read', 'list', 'view', 'view_all', 'export'];
  if (a === 'list') return ['list', 'view_all', 'read'];
  if (a === 'view') return ['view', 'view_all', 'read'];
  return [a];
};

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { currentCenter } = useCenter();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);

  const refresh = async () => {
    if (!isAuthenticated) {
      setPermissions([]);
      return;
    }
    setLoading(true);
    try {
      // Backend ya devuelve los permisos del usuario actual.
      // Si más adelante querés, podemos pasar appId por query.
      const data = await securityService.getMyPermissions();
      setPermissions(data || []);
    } finally {
      setLoading(false);
    }
  };

  // Recargar al autenticar y al cambiar el centro (por si la UI depende de scope center)
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentCenter?.id]);

  const can = useMemo(() => {
    const perms = (permissions || []).map(p => ({
      resource: normalize(p.resource),
      action: normalize(p.action),
    }));
    const set = new Set(perms.map(p => `${p.resource}:${p.action}`));

    return (resource: string, action: string) => {
      const r = normalize(resource);
      const aliases = actionAliases(action);

      // Admin global
      if (set.has('*:*')) return true;

      // Wildcard por recurso
      for (const a of aliases) {
        if (set.has(`${r}:*`)) return true;
        if (set.has(`*:${a}`)) return true;
      }

      // Match exacto o alias
      for (const a of aliases) {
        if (set.has(`${r}:${a}`)) return true;
      }
      return false;
    };
  }, [permissions]);

  const hasAny = (checks: PermissionKey[]) => checks.some(c => can(c.resource, c.action));

  const value: PermissionsContextType = {
    loading,
    permissions,
    can,
    hasAny,
    refresh,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissionsContext(): PermissionsContextType {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissionsContext debe ser usado dentro de PermissionsProvider');
  return ctx;
}


