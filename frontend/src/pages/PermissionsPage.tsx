import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/useSecurity';
import DataTable from '../components/DataTable';
import Notification from '../components/Notification';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import ViewToggle from '../components/ViewToggle';

const PermissionsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { 
    permissions, 
    loading, 
    error, 
    deletePermission,
    clearError
  } = usePermissions();

  const handleDelete = async (permission: any) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el permiso "${permission.name}"?`)) return;
    try {
      const success = await deletePermission(permission.id);
      if (success) {
        setNotification({ type: 'success', message: 'Permission eliminado exitosamente' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al eliminar permiso' });
    }
  };

  const handleEdit = (permission: any) => {
    navigate(`/permissions/edit/${permission.id}`);
  };

  const handleView = (permission: any) => {
    navigate(`/permissions/${permission.id}`);
  };

  const handleNew = () => {
    navigate('/permissions/new');
  };

  const columns = [
    {
      key: 'activo',
      label: 'Activo',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value !== false
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {value !== false ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
          <DocumentTextIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
          {value}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Permissions</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona los permisos del sistema</p>
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
              <ShieldCheckIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error al cargar permisos
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
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

      {viewMode === 'table' ? (
        <DataTable
          data={permissions}
          columns={columns}
          title="Lista de Permissions"
          onAdd={handleNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar permisos..."
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
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {permissions.map((permission, index) => (
            <div
              key={permission.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                          <ShieldCheckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {permission.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    permission.activo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {permission.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(permission)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(permission)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(permission)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionsPage; 