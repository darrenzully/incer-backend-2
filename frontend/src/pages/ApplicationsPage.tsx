import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useApplications } from '../hooks/useApplications';
import { App } from '../services/applicationService';
import DataTable, { FilterConfig } from '../components/DataTable';
import ViewToggle from '../components/ViewToggle';
import Notification from '../components/Notification';

const ApplicationsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    apps,
    loading,
    error,
    deleteApp,
    clearError
  } = useApplications();

  const handleDelete = async (app: App) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la aplicación "${app.name}"?`)) return;
    
    try {
      const success = await deleteApp(app.id);
      if (success) {
        setNotification({ type: 'success', message: 'Aplicación eliminada exitosamente' });
      } else {
        setNotification({ type: 'error', message: 'Error al eliminar la aplicación' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al eliminar la aplicación' });
    }
  };

  const handleView = (app: App) => {
    window.location.href = `/applications/${app.id}`;
  };

  const handleEdit = (app: App) => {
    window.location.href = `/applications/edit/${app.id}`;
  };

  const handleNew = () => {
    window.location.href = '/applications/new';
  };

  // Configuración de filtros avanzados
  const filterConfig: FilterConfig[] = [
    {
      key: 'type',
      label: 'Tipo de Aplicación',
      type: 'select',
      options: [
        { value: 'web', label: 'Web' },
        { value: 'mobile', label: 'Móvil' },
        { value: 'desktop', label: 'Escritorio' },
        { value: 'api', label: 'API' }
      ]
    },
    {
      key: 'platform',
      label: 'Plataforma',
      type: 'text',
      placeholder: 'Filtrar por plataforma...'
    },
    {
      key: 'active',
      label: 'Estado',
      type: 'boolean'
    },
    {
      key: 'version',
      label: 'Versión',
      type: 'text',
      placeholder: 'Filtrar por versión...'
    }
  ];

  const getAppIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'web':
        return <GlobeAltIcon className="h-6 w-6" />;
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-6 w-6" />;
      case 'desktop':
        return <ComputerDesktopIcon className="h-6 w-6" />;
      default:
        return <CogIcon className="h-6 w-6" />;
    }
  };

  const getPlatformBadge = (platform?: string) => {
    if (!platform) return null;
    
    const colors = {
      'ios': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'android': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'web': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'windows': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'macos': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'linux': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };

    const colorClass = colors[platform.toLowerCase() as keyof typeof colors] || colors.web;

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {platform.toUpperCase()}
      </span>
    );
  };

  const columns = [
    {
      key: 'activo',
      label: 'Activo',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value: string, row: App) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 mr-3">
            <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              {getAppIcon(row.type)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'platform',
      label: 'Plataforma',
      sortable: true,
      render: (value: string) => value ? getPlatformBadge(value) : '-',
    },
    {
      key: 'version',
      label: 'Versión',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {value}
        </span>
      ),
    },
  ];

  const renderAppCard = (app: App) => (
    <motion.div
      key={app.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              {getAppIcon(app.type)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
              {app.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {app.code}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                app.active && app.activo
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {app.active && app.activo ? 'Activo' : 'Inactivo'}
              </span>
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
                {app.type.toUpperCase()}
              </span>
              {app.platform && getPlatformBadge(app.platform)}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(app)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleEdit(app)}
            className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
            title="Editar"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(app)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Versión {app.version}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          ID: {app.id}
        </div>
      </div>
    </motion.div>
  );

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Aplicaciones</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona las aplicaciones del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-400">⚠</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error al cargar aplicaciones
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'table' ? (
        <DataTable
          data={apps}
          columns={columns}
          title="Lista de Aplicaciones"
          onAdd={handleNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar aplicaciones por nombre, código o tipo..."
          itemsPerPage={10}
          actions={[
            {
              label: 'Ver',
              icon: EyeIcon,
              onClick: handleView,
              className: 'text-gray-400 hover:text-blue-500'
            },
            {
              label: 'Editar',
              icon: PencilIcon,
              onClick: handleEdit,
              className: 'text-gray-400 hover:text-yellow-500'
            },
            {
              label: 'Eliminar',
              icon: TrashIcon,
              onClick: handleDelete,
              className: 'text-gray-400 hover:text-red-500'
            }
          ]}
          filters={filterConfig}
          enableAdvancedFilters={true}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apps.map(renderAppCard)}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
