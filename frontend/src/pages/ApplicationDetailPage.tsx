import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  ComputerDesktopIcon,
  ListBulletIcon,
  CheckCircleIcon,
  XCircleIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { applicationService, App } from '../services/applicationService';
import Notification from '../components/Notification';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const loadApp = useCallback(async () => {
    try {
      setLoading(true);
      const data = await applicationService.getApp(parseInt(id!));
      setApp(data);
    } catch (error) {
      console.error('Error al cargar aplicación:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos de la aplicación'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadApp();
    }
  }, [id, loadApp]);

  const handleEdit = () => {
    navigate(`/applications/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/applications');
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'web':
        return <GlobeAltIcon className="h-5 w-5 text-blue-500" />;
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-5 w-5 text-green-500" />;
      case 'desktop':
        return <ComputerDesktopIcon className="h-5 w-5 text-purple-500" />;
      case 'api':
        return <ComputerDesktopIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'web': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'mobile': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'desktop': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'api': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };

    const colorClass = colors[type.toLowerCase() as keyof typeof colors] || colors.web;

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Aplicación no encontrada
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          La aplicación que buscas no existe o ha sido eliminada.
        </p>
        <div className="mt-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a Aplicaciones
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
              {app.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Detalles de la aplicación del sistema
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
                  Nombre de la Aplicación
                </label>
                <div className="flex items-center space-x-3">
                  <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {app.name}
                  </span>
                </div>
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código de la Aplicación
                </label>
                <div className="flex items-center space-x-3">
                  <ListBulletIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-mono">
                    {app.code}
                  </span>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Aplicación
                </label>
                <div className="flex items-center space-x-3">
                  {getTypeIcon(app.type)}
                  {getTypeBadge(app.type)}
                </div>
              </div>

              {/* Platform */}
              {app.platform && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plataforma
                  </label>
                  <div className="flex items-center space-x-3">
                    <ListBulletIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {app.platform}
                    </span>
                  </div>
                </div>
              )}

              {/* Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Versión
                </label>
                <div className="flex items-center space-x-3">
                  <ListBulletIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-mono">
                    {app.version}
                  </span>
                </div>
              </div>

              {/* ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID de la Aplicación
                </label>
                <div className="flex items-center space-x-3">
                  <ListBulletIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-mono">
                    {app.id}
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
                {app.active ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {app.active ? 'Activa' : 'Inactiva'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {app.active ? 'Aplicación operativa' : 'Aplicación inactiva'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
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
                Editar Aplicación
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

export default ApplicationDetailPage;
