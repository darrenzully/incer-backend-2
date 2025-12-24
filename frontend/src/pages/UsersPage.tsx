import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../hooks/useSecurity';
import DataTable, { FilterConfig } from '../components/DataTable';
import { UserIcon, EnvelopeIcon, ShieldCheckIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ViewToggle from '../components/ViewToggle';
import Notification from '../components/Notification';

const UsersPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { 
    users, 
    loading, 
    error, 
    deleteUser,
    clearError
  } = useUsers();

  // Debug: Información de conexión
  console.log('🔍 Debug UsersPage:');
  console.log('- API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5124');
  console.log('- Usuarios cargados:', users.length);
  console.log('- Loading:', loading);
  console.log('- Error:', error);
  console.log('- Usuarios data:', users);

  const handleDelete = async (user: any) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el usuario "${user.alias}"?`)) return;
    try {
      const success = await deleteUser(user.id);
      if (success) {
        setNotification({ type: 'success', message: 'Usuario eliminado exitosamente' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al eliminar usuario' });
    }
  };

  const handleEdit = (user: any) => {
    navigate(`/users/edit/${user.id}`);
  };

  const handleView = (user: any) => {
    navigate(`/users/${user.id}`);
  };

  const handleNew = () => {
    navigate('/users/new');
  };

  // Configuración de filtros avanzados
  const filterConfig: FilterConfig[] = [
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Filtrar por email...'
    },
    {
      key: 'firstName',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Filtrar por nombre...'
    },
    {
      key: 'lastName',
      label: 'Apellido',
      type: 'text',
      placeholder: 'Filtrar por apellido...'
    },
    {
      key: 'isActive',
      label: 'Estado',
      type: 'boolean'
    }
  ];

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
      key: 'foto',
      label: 'Foto',
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      ),
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.nombre || row.alias || 'Sin nombre'}
        </div>
      ),
    },
    {
      key: 'mail',
      label: 'Mail',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
          <EnvelopeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
          {value}
        </div>
      ),
    },
    {
      key: 'alias',
      label: 'Usuario',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
          <ShieldCheckIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
          {row.role ? row.role.name : 'Sin rol'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona los usuarios del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
        </div>
      </div>

      {/* Debug Panel - Temporal para probar conexión */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
          🔍 Debug - Información de Conexión
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">API URL:</span>
            <p className="text-blue-600 dark:text-blue-400">
              {process.env.REACT_APP_API_URL || 'http://localhost:5124'}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Estado:</span>
            <p className={`font-semibold ${loading ? 'text-yellow-600 dark:text-yellow-400' : error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {loading ? 'Cargando...' : error ? 'Error' : 'Conectado'}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Usuarios:</span>
            <p className="text-blue-600 dark:text-blue-400">
              {users.length} cargados
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Error:</span>
            <p className="text-blue-600 dark:text-blue-400">
              {error || 'Ninguno'}
            </p>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <p className="text-red-700 dark:text-red-300 text-sm">
              <strong>Detalles del error:</strong> {error}
            </p>
          </div>
        )}
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
              <UserIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error al cargar usuarios
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
          data={users}
          columns={columns}
          title="Lista de Usuarios"
          onAdd={handleNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar usuarios..."
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
          {users.map((user, index) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {user.nombre || user.alias || 'Sin nombre'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.mail || 'Sin email'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.activo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Usuario:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {user.alias || 'Sin usuario'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Rol:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {user.role ? user.role.name : 'Sin rol'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(user)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
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

export default UsersPage; 