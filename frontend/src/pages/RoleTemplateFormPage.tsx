import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { roleTemplateService, RoleTemplate, CreateRoleTemplateRequest, UpdateRoleTemplateRequest } from '../services/roleTemplateService';
import Notification from '../components/Notification';

const RoleTemplateFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [template, setTemplate] = useState<RoleTemplate>({
    id: 0,
    name: '',
    description: '',
    category: 'custom',
    isSystem: false,
    priority: 0,
    active: true,
    activo: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roleTemplateService.getRoleTemplate(parseInt(id!));
      setTemplate(data);
    } catch (error) {
      console.error('Error al cargar plantilla:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos de la plantilla'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit && id) {
      loadTemplate();
    }
  }, [id, isEdit, loadTemplate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              name === 'priority' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!template.name.trim()) {
      setNotification({
        type: 'error',
        message: 'El nombre de la plantilla es requerido'
      });
      return;
    }

    if (!template.description.trim()) {
      setNotification({
        type: 'error',
        message: 'La descripción de la plantilla es requerida'
      });
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        const updateData: UpdateRoleTemplateRequest = {
          id: template.id!,
          name: template.name || '',
          description: template.description || '',
          category: template.category || 'custom',
          isSystem: template.isSystem || false,
          priority: template.priority || 0,
          active: template.active || false,
          activo: template.activo || false
        };
        await roleTemplateService.updateRoleTemplate(updateData);
        setNotification({
          type: 'success',
          message: 'Plantilla actualizada correctamente'
        });
      } else {
        const createData: CreateRoleTemplateRequest = {
          name: template.name || '',
          description: template.description || '',
          category: template.category || 'custom',
          isSystem: template.isSystem || false,
          priority: template.priority || 0,
          active: template.active || false
        };
        await roleTemplateService.createRoleTemplate(createData);
        setNotification({
          type: 'success',
          message: 'Plantilla creada correctamente'
        });
      }

      // Redirigir después de un breve delay para mostrar la notificación
      setTimeout(() => {
        navigate('/roletemplates');
      }, 1500);

    } catch (error) {
      console.error('Error al guardar plantilla:', error);
      setNotification({
        type: 'error',
        message: isEdit ? 'Error al actualizar la plantilla' : 'Error al crear la plantilla'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/roletemplates');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            title="Volver"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEdit ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica la información de la plantilla' : 'Crea una nueva plantilla de rol'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de la Plantilla *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={template.name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Ingresa el nombre de la plantilla"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={template.description}
              onChange={handleInputChange}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Describe el propósito y uso de la plantilla"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría *
            </label>
            <select
              id="category"
              name="category"
              value={template.category}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              required
            >
              <option value="custom">Personalizada</option>
              <option value="business">Negocio</option>
              <option value="system">Sistema</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridad
            </label>
            <input
              type="number"
              id="priority"
              name="priority"
              value={template.priority || 0}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="0"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Las plantillas con mayor prioridad aparecen primero
            </p>
          </div>

          {/* System Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Plantilla
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isSystem"
                  checked={template.isSystem || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {template.isSystem ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-1" />
                      Plantilla del Sistema
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 text-gray-500 mr-1" />
                      Plantilla Personalizada
                    </>
                  )}
                </span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Las plantillas del sistema no pueden ser eliminadas
            </p>
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado de la Plantilla
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={template.active || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {template.active ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      Activa
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                      Inactiva
                    </>
                  )}
                </span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Las plantillas inactivas no estarán disponibles para crear roles
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEdit ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {isEdit ? 'Actualizar Plantilla' : 'Crear Plantilla'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default RoleTemplateFormPage;
