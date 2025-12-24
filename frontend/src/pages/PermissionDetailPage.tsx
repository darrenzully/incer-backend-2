import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  ShieldCheckIcon,
  ListBulletIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { securityService } from '../services/securityService';
import Notification from '../components/Notification';

interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  isSystem?: boolean;
  activo?: boolean;
}

const PermissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
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
    if (id) {
      loadPermission();
    }
  }, [id, loadPermission]);

  const handleEdit = () => {
    navigate(`/permissions/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/permissions');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="text-center py-12">
        <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Permiso no encontrado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          El permiso que buscas no existe o ha sido eliminado.
        </p>
        <div className="mt-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a Permisos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            title="Volver"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {permission.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Detalles del permiso del sistema
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Editar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información General
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Permiso
                </label>
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {permission.name}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-gray-900 dark:text-white">
                    {permission.description}
                  </p>
                </div>
              </div>

              {/* Resource */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recurso
                </label>
                <div className="flex items-center space-x-3">
                  <ListBulletIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-mono">
                    {permission.resource}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Acción
                </label>
                <div className="flex items-center space-x-3">
                  <ListBulletIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-mono">
                    {permission.action}
                  </span>
                </div>
              </div>

              {/* Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alcance
                </label>
                <div className="flex items-center space-x-3">
                  <ListBulletIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-mono">
                    {permission.scope}
                  </span>
                </div>
              </div>

              {/* ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID del Permiso
                </label>
                <div className="flex items-center space-x-3">
                  <ListBulletIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-mono">
                    {permission.id}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Estado
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-3">
                {permission.activo ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {permission.activo ? 'Activo' : 'Inactivo'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {permission.activo ? 'Permiso operativo' : 'Permiso inactivo'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Type Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Tipo
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-3">
                {permission.isSystem ? (
                  <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-gray-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {permission.isSystem ? 'Sistema' : 'Personalizado'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {permission.isSystem ? 'Permiso del sistema' : 'Permiso personalizado'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Acciones Rápidas
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={handleEdit}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar Permiso
              </button>
              <button
                onClick={handleBack}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Volver a Lista
              </button>
            </div>
          </motion.div>
        </div>
      </div>

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

export default PermissionDetailPage;