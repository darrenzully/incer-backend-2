import { useState, useEffect, useCallback } from 'react';
import { applicationService, App, CreateAppRequest, UpdateAppRequest, Permission } from '../services/applicationService';

export const useApplications = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getApps();
      setApps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar aplicaciones');
      console.error('Error loading apps:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createApp = useCallback(async (appData: CreateAppRequest): Promise<App | null> => {
    try {
      setError(null);
      const newApp = await applicationService.createApp(appData);
      setApps(prev => [...prev, newApp]);
      return newApp;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear aplicación');
      console.error('Error creating app:', err);
      return null;
    }
  }, []);

  const updateApp = useCallback(async (appData: UpdateAppRequest): Promise<App | null> => {
    try {
      setError(null);
      const updatedApp = await applicationService.updateApp(appData);
      setApps(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
      return updatedApp;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar aplicación');
      console.error('Error updating app:', err);
      return null;
    }
  }, []);

  const deleteApp = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await applicationService.deleteApp(id);
      setApps(prev => prev.filter(app => app.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar aplicación');
      console.error('Error deleting app:', err);
      return false;
    }
  }, []);

  const getAppPermissions = useCallback(async (appId: number): Promise<Permission[]> => {
    try {
      setError(null);
      return await applicationService.getAppPermissions(appId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar permisos de la aplicación');
      console.error('Error loading app permissions:', err);
      return [];
    }
  }, []);

  const assignPermissionToApp = useCallback(async (appId: number, permissionId: number): Promise<boolean> => {
    try {
      setError(null);
      await applicationService.assignPermissionToApp(appId, permissionId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar permiso');
      console.error('Error assigning permission:', err);
      return false;
    }
  }, []);

  const removePermissionFromApp = useCallback(async (appId: number, permissionId: number): Promise<boolean> => {
    try {
      setError(null);
      await applicationService.removePermissionFromApp(appId, permissionId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover permiso');
      console.error('Error removing permission:', err);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  return {
    apps,
    loading,
    error,
    createApp,
    updateApp,
    deleteApp,
    getAppPermissions,
    assignPermissionToApp,
    removePermissionFromApp,
    clearError,
    refresh: loadApps
  };
};
