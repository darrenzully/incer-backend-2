import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { securityService } from '../services/securityService';
import Notification from '../components/Notification';

interface Permission {
  id?: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  isSystem?: boolean;
  activo?: boolean;
}

const PermissionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [permission, setPermission] = useState<Permission>({
    name: '',
    description: '',
    resource: '',
    action: '',
    scope: '',
    isSystem: false,
    activo: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const loadPermission = useCallback(async () => {
    try {
      setLoading(true);
      const data = await securityService.getPermission(parseInt(id!));
      setPermission(data);
    } catch (error) {
      console.error('Error al cargar permiso:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del permiso'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit && id) {
      loadPermission();
    }
  }, [id, isEdit, loadPermission]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setPermission(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!permission.name.trim()) {
      setNotification({
        type: 'error',
        message: 'El nombre del permiso es requerido'
      });
      return;
    }

    if (!permission.description.trim()) {
      setNotification({
        type: 'error',
        message: 'La descripción del permiso es requerida'
      });
      return;
    }

    if (!permission.resource.trim()) {
      setNotification({
        type: 'error',
        message: 'El recurso del permiso es requerido'
      });
      return;
    }

    if (!permission.action.trim()) {
      setNotification({
        type: 'error',
        message: 'La acción del permiso es requerida'
      });
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        await securityService.updatePermission({
          id: permission.id!,
          name: permission.name || '',
          description: permission.description || '',
          resource: permission.resource || '',
          action: permission.action || '',
          scope: permission.scope || '',
          isSystem: permission.isSystem || false
        });
        setNotification({
          type: 'success',
          message: 'Permiso actualizado correctamente'
        });
      } else {
        await securityService.createPermission({
          name: permission.name || '',
          description: permission.description || '',
          resource: permission.resource || '',
          action: permission.action || '',
          scope: permission.scope || '',
          isSystem: permission.isSystem || false
        });
        setNotification({
          type: 'success',
          message: 'Permiso creado correctamente'
        });
      }

      // Redirigir después de un breve delay para mostrar la notificación
      setTimeout(() => {
        navigate('/permissions');
      }, 1500);

    } catch (error) {
      console.error('Error al guardar permiso:', error);
      setNotification({
        type: 'error',
        message: isEdit ? 'Error al actualizar el permiso' : 'Error al crear el permiso'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/permissions');
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
              {isEdit ? 'Editar Permiso' : 'Nuevo Permiso'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica la información del permiso' : 'Crea un nuevo permiso del sistema'}
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
              Nombre del Permiso *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={permission.name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Ingresa el nombre del permiso"
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
              value={permission.description}
              onChange={handleInputChange}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Describe el propósito y alcance del permiso"
              required
            />
          </div>

          {/* Resource */}
          <div>
            <label htmlFor="resource" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recurso *
            </label>
            <input
              type="text"
              id="resource"
              name="resource"
              value={permission.resource}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Ej: users, roles, permissions"
              required
            />
          </div>

          {/* Action */}
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Acción *
            </label>
            <select
              id="action"
              name="action"
              value={permission.action}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              required
            >
              <option value="">Selecciona una acción</option>
              <option value="create">Crear</option>
              <option value="read">Leer</option>
              <option value="update">Actualizar</option>
              <option value="delete">Eliminar</option>
              <option value="manage">Gestionar</option>
            </select>
          </div>

          {/* Scope */}
          <div>
            <label htmlFor="scope" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alcance
            </label>
            <select
              id="scope"
              name="scope"
              value={permission.scope}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="global">Global</option>
              <option value="center">Centro</option>
              <option value="user">Usuario</option>
            </select>
          </div>

          {/* System Permission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Permiso
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isSystem"
                  checked={permission.isSystem || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {permission.isSystem ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-1" />
                      Permiso del Sistema
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 text-gray-500 mr-1" />
                      Permiso Personalizado
                    </>
                  )}
                </span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Los permisos del sistema no pueden ser eliminados
            </p>
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado del Permiso
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={permission.activo || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {permission.activo ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      Activo
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                      Inactivo
                    </>
                  )}
                </span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Los permisos inactivos no estarán disponibles para asignación
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
                  {isEdit ? 'Actualizar Permiso' : 'Crear Permiso'}
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

export default PermissionFormPage;