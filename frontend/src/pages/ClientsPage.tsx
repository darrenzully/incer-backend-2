import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon, EyeIcon, PencilIcon, TrashIcon, PhoneIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/DataTable';
import { clienteService, Cliente } from '../services/clienteService';
import ViewToggle from '../components/ViewToggle';
// import { usePermissions } from '../hooks/usePermissions'; // Temporalmente deshabilitado

const ClientsPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const navigate = useNavigate();
  
  // Sistema de permisos - temporalmente deshabilitado
  // const { hasPermission, canAccessCenter } = usePermissions();

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/clientes/nuevo');
  };

  const handleEdit = (cliente: Cliente) => {
    navigate(`/clientes/${cliente.id}/editar`);
  };

  const handleDelete = async (cliente: Cliente) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el cliente "${cliente.nombre}"?`)) {
      try {
        await clienteService.deleteCliente(cliente.id);
        await loadClientes();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    }
  };

  const handleView = (cliente: Cliente) => {
    navigate(`/clientes/${cliente.id}`);
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
      key: 'numero',
      label: 'Nro',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          #{value}
        </div>
      ),
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'tipoDeCliente',
      label: 'Tipo',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || 'Sin tipo'}
        </div>
      ),
    },
    {
      key: 'tipoDeServicio',
      label: 'Servicio',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || 'Sin servicio'}
        </div>
      ),
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || 'Sin teléfono'}
        </div>
      ),
    },
    {
      key: 'vendedor',
      label: 'Vendedor',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.alias || 'Sin asignar'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todos los clientes del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
          {/* {hasPermission('clients', 'create') && ( */}
            <button
              onClick={() => navigate('/clientes/admin')}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              <UserGroupIcon className="w-5 h-4 mr-2" />
              Administración
            </button>
          {/* )} */}
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={clientes}
          columns={columns}
          title={`Lista de Clientes (${clientes.length})`}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por nombre, tipo, servicio, teléfono o vendedor..."
          itemsPerPage={10}
          enableAdvancedFilters={false}
          actions={[
            {
              label: 'Ver',
              icon: EyeIcon,
              onClick: handleView,
              className: 'text-gray-400 hover:text-blue-500',
              // hidden: !hasPermission('clients', 'read')
            },
            {
              label: 'Editar',
              icon: PencilIcon,
              onClick: handleEdit,
              className: 'text-gray-400 hover:text-yellow-500',
              // hidden: !hasPermission('clients', 'update')
            },
            {
              label: 'Eliminar',
              icon: TrashIcon,
              onClick: handleDelete,
              className: 'text-gray-400 hover:text-red-500',
              // hidden: !hasPermission('clients', 'delete')
            }
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clientes.map((cliente, index) => (
            <div
              key={cliente.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {cliente.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      #{cliente.numero}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cliente.activo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {cliente.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {cliente.tipoDeCliente && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Tipo:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {cliente.tipoDeCliente.nombre}
                      </div>
                    </div>
                  )}

                  {cliente.tipoDeServicio && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Servicio:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {cliente.tipoDeServicio.nombre}
                      </div>
                    </div>
                  )}

                  {cliente.telefono && (
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {cliente.telefono}
                      </span>
                    </div>
                  )}

                  {cliente.vendedor && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Vendedor:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {cliente.vendedor.alias}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(cliente)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(cliente)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cliente)}
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

export default ClientsPage; 