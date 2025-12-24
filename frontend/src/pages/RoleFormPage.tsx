import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useRoles } from '../hooks/useSecurity';
import { securityService } from '../services/securityService';
import Notification from '../components/Notification';

interface Role {
  id?: number;
  name: string;
  description: string;
  isSystem?: boolean;
  priority?: number;
  activo?: boolean;
}

const RoleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [role, setRole] = useState<Role>({
    name: '',
    description: '',
    isSystem: false,
    priority: 0,
    activo: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const { roles } = useRoles();

  const loadRole = useCallback(async () => {
    try {
      setLoading(true);
      const data = await securityService.getRole(parseInt(id!));
      setRole(data);
    } catch (error) {
      console.error('Error al cargar rol:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del rol'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit && id) {
      loadRole();
    }
  }, [id, isEdit, loadRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setRole(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              name === 'priority' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role.name.trim()) {
      setNotification({
        type: 'error',
        message: 'El nombre del rol es requerido'
      });
      return;
    }

    if (!role.description.trim()) {
      setNotification({
        type: 'error',
        message: 'La descripción del rol es requerida'
      });
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        await securityService.updateRole({
          id: role.id!,
          name: role.name || '',
          description: role.description || '',
          isSystem: role.isSystem || false,
          priority: role.priority || 0
        });
        setNotification({
          type: 'success',
          message: 'Rol actualizado correctamente'
        });
      } else {
        await securityService.createRole({
          name: role.name || '',
          description: role.description || '',
          isSystem: role.isSystem || false,
          priority: role.priority || 0
        });
        setNotification({
          type: 'success',
          message: 'Rol creado correctamente'
        });
      }

      // Redirigir después de un breve delay para mostrar la notificación
      setTimeout(() => {
        navigate('/roles');
      }, 1500);

    } catch (error) {
      console.error('Error al guardar rol:', error);
      setNotification({
        type: 'error',
        message: isEdit ? 'Error al actualizar el rol' : 'Error al crear el rol'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
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
              {isEdit ? 'Editar Rol' : 'Nuevo Rol'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica la información del rol' : 'Crea un nuevo rol del sistema'}
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
              Nombre del Rol *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserGroupIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={role.name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Ingresa el nombre del rol"
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
              value={role.description}
              onChange={handleInputChange}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Describe las responsabilidades y permisos del rol"
              required
            />
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
              value={role.priority || 0}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="0"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Los roles con mayor prioridad tienen precedencia
            </p>
          </div>

          {/* System Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Rol
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isSystem"
                  checked={role.isSystem || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {role.isSystem ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-1" />
                      Rol del Sistema
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 text-gray-500 mr-1" />
                      Rol Personalizado
                    </>
                  )}
                </span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Los roles del sistema no pueden ser eliminados
            </p>
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado del Rol
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={role.activo || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {role.activo ? (
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
              Los roles inactivos no estarán disponibles para asignación
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
                  {isEdit ? 'Actualizar Rol' : 'Crear Rol'}
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

export default RoleFormPage;