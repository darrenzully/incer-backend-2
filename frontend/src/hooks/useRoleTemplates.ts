import { useState, useEffect, useCallback } from 'react';
import { 
  RoleTemplate, 
  CreateRoleTemplateRequest, 
  UpdateRoleTemplateRequest,
  CreateRoleFromTemplateRequest,
  DuplicateTemplateRequest,
  ApplyTemplateToRoleResponse,
  DetailedRoleTemplate
} from '../services/roleTemplateService';
import { roleTemplateService } from '../services/roleTemplateService';

export const useRoleTemplates = () => {
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleTemplateService.getRoleTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantillas');
      console.error('Error loading role templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplatesByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleTemplateService.getRoleTemplatesByCategory(category);
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantillas por categoría');
      console.error('Error loading role templates by category:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSystemTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleTemplateService.getSystemRoleTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantillas del sistema');
      console.error('Error loading system templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBusinessTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleTemplateService.getBusinessRoleTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantillas de negocio');
      console.error('Error loading business templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (template: CreateRoleTemplateRequest): Promise<RoleTemplate> => {
    try {
      setError(null);
      const newTemplate = await roleTemplateService.createRoleTemplate(template);
      await loadTemplates(); // Reload to get updated list
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear plantilla';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadTemplates]);

  const updateTemplate = useCallback(async (template: UpdateRoleTemplateRequest): Promise<RoleTemplate> => {
    try {
      setError(null);
      const updatedTemplate = await roleTemplateService.updateRoleTemplate(template);
      await loadTemplates(); // Reload to get updated list
      return updatedTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar plantilla';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadTemplates]);

  const deleteTemplate = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await roleTemplateService.deleteRoleTemplate(id);
      await loadTemplates(); // Reload to get updated list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar plantilla';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadTemplates]);

  const duplicateTemplate = useCallback(async (id: number, request: DuplicateTemplateRequest): Promise<RoleTemplate> => {
    try {
      setError(null);
      const newTemplate = await roleTemplateService.duplicateTemplate(id, request);
      await loadTemplates(); // Reload to get updated list
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al duplicar plantilla';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadTemplates]);

  const createRoleFromTemplate = useCallback(async (templateId: number, request: CreateRoleFromTemplateRequest) => {
    try {
      setError(null);
      return await roleTemplateService.createRoleFromTemplate(templateId, request);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear rol desde plantilla';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const applyTemplateToRole = useCallback(async (templateId: number, roleId: number): Promise<ApplyTemplateToRoleResponse> => {
    try {
      setError(null);
      return await roleTemplateService.applyTemplateToRole(templateId, roleId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aplicar plantilla a rol';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getDetailedTemplate = useCallback(async (id: number): Promise<DetailedRoleTemplate> => {
    try {
      setError(null);
      return await roleTemplateService.getDetailedRoleTemplate(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener detalles de plantilla';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    error,
    loadTemplates,
    loadTemplatesByCategory,
    loadSystemTemplates,
    loadBusinessTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createRoleFromTemplate,
    applyTemplateToRole,
    getDetailedTemplate,
    clearError: () => setError(null)
  };
};