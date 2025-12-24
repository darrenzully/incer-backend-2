import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useRoles } from '../hooks/useSecurity';
import { securityService } from '../services/securityService';
import Notification from '../components/Notification';

interface User {
  id?: number;
  nombre?: string;
  apellido?: string;
  mail?: string;
  alias?: string;
  clave?: string;
  rolId?: number;
  activo?: boolean;
  role?: { id: number; name: string };
}

const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [user, setUser] = useState<User>({
    nombre: '',
    apellido: '',
    mail: '',
    alias: '',
    clave: '',
    rolId: 0,
    activo: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const { roles } = useRoles();

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const data = await securityService.getUser(parseInt(id!));
      setUser(data);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del usuario'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit && id) {
      loadUser();
    }
  }, [id, isEdit, loadUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'rolId' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user.nombre?.trim()) {
      setNotification({
        type: 'error',
        message: 'El nombre del usuario es requerido'
      });
      return;
    }

    if (!user.mail?.trim()) {
      setNotification({
        type: 'error',
        message: 'El email del usuario es requerido'
      });
      return;
    }

    if (!user.alias?.trim()) {
      setNotification({
        type: 'error',
        message: 'El alias del usuario es requerido'
      });
      return;
    }

    try {
      setSaving(true);
      
      if (isEdit) {
        await securityService.updateUser({
          id: user.id!,
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          alias: user.alias || '',
          mail: user.mail || '',
          roleId: user.rolId || 0
        });
        setNotification({
          type: 'success',
          message: 'Usuario actualizado correctamente'
        });
      } else {
        await securityService.createUser({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          alias: user.alias || '',
          mail: user.mail || '',
          clave: user.clave || '',
          roleId: user.rolId || 0
        });
        setNotification({
          type: 'success',
          message: 'Usuario creado correctamente'
        });
      }
      
      // Redirigir después de un breve delay para mostrar la notificación
      setTimeout(() => {
        navigate('/users');
      }, 1500);
      
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setNotification({
        type: 'error',
        message: isEdit ? 'Error al actualizar el usuario' : 'Error al crear el usuario'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
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
              {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica la información del usuario' : 'Crea un nuevo usuario del sistema'}
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
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Usuario *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={user.nombre || ''}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Ingresa el nombre del usuario"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={user.apellido || ''}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Ingresa el apellido del usuario"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="mail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="mail"
              name="mail"
              value={user.mail || ''}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          {/* Alias */}
          <div>
            <label htmlFor="alias" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alias *
            </label>
            <input
              type="text"
              id="alias"
              name="alias"
              value={user.alias || ''}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Ingresa el alias del usuario"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="clave" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña {!isEdit && '*'}
            </label>
            <input
              type="password"
              id="clave"
              name="clave"
              value={user.clave || ''}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder={isEdit ? "Dejar vacío para mantener la actual" : "Ingresa la contraseña"}
              required={!isEdit}
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="rolId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rol *
            </label>
            <select
              id="rolId"
              name="rolId"
              value={user.rolId || 0}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              required
            >
              <option value={0}>Selecciona un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado del Usuario
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={user.activo || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {user.activo ? (
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
              Los usuarios inactivos no podrán acceder al sistema
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
                  {isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
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

export default UserFormPage;