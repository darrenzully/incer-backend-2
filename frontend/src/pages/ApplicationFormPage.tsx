import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ComputerDesktopIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { applicationService, App, CreateAppRequest, UpdateAppRequest } from '../services/applicationService';
import Notification from '../components/Notification';

const ApplicationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [app, setApp] = useState<App>({
    id: 0,
    name: '',
    code: '',
    type: 'web',
    platform: '',
    active: true,
    version: '1.0.0',
    activo: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
    if (isEdit && id) {
      loadApp();
    }
  }, [id, isEdit, loadApp]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setApp(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!app.name.trim()) {
      setNotification({
        type: 'error',
        message: 'El nombre de la aplicación es requerido'
      });
      return;
    }

    if (!app.code.trim()) {
      setNotification({
        type: 'error',
        message: 'El código de la aplicación es requerido'
      });
      return;
    }

    if (!app.version.trim()) {
      setNotification({
        type: 'error',
        message: 'La versión de la aplicación es requerida'
      });
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        const updateData: UpdateAppRequest = {
          id: app.id!,
          name: app.name || '',
          code: app.code || '',
          type: app.type || 'web',
          platform: app.platform || '',
          active: app.active || false,
          version: app.version || '1.0.0',
          activo: app.activo || false
        };
        await applicationService.updateApp(updateData);
        setNotification({
          type: 'success',
          message: 'Aplicación actualizada correctamente'
        });
      } else {
        const createData: CreateAppRequest = {
          name: app.name || '',
          code: app.code || '',
          type: app.type || 'web',
          platform: app.platform || '',
          active: app.active || false,
          version: app.version || '1.0.0'
        };
        await applicationService.createApp(createData);
        setNotification({
          type: 'success',
          message: 'Aplicación creada correctamente'
        });
      }

      // Redirigir después de un breve delay para mostrar la notificación
      setTimeout(() => {
        navigate('/applications');
      }, 1500);

    } catch (error) {
      console.error('Error al guardar aplicación:', error);
      setNotification({
        type: 'error',
        message: isEdit ? 'Error al actualizar la aplicación' : 'Error al crear la aplicación'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/applications');
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
              {isEdit ? 'Editar Aplicación' : 'Nueva Aplicación'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica la información de la aplicación' : 'Crea una nueva aplicación del sistema'}
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
              Nombre de la Aplicación *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={app.name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Ingresa el nombre de la aplicación"
                required
              />
            </div>
          </div>

          {/* Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de la Aplicación *
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={app.code}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Ej: INCER_WEB, INCER_MOBILE"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Aplicación *
            </label>
            <select
              id="type"
              name="type"
              value={app.type}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              required
            >
              <option value="web">Web</option>
              <option value="mobile">Móvil</option>
              <option value="desktop">Escritorio</option>
              <option value="api">API</option>
            </select>
          </div>

          {/* Platform */}
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plataforma
            </label>
            <input
              type="text"
              id="platform"
              name="platform"
              value={app.platform || ''}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Ej: React, Angular, iOS, Android"
            />
          </div>

          {/* Version */}
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Versión *
            </label>
            <input
              type="text"
              id="version"
              name="version"
              value={app.version}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Ej: 1.0.0, 2.1.3"
              required
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado de la Aplicación
            </label>
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={app.active || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {app.active ? (
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
              Las aplicaciones inactivas no estarán disponibles para acceso
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
                  {isEdit ? 'Actualizar Aplicación' : 'Crear Aplicación'}
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

export default ApplicationFormPage;
