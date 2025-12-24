import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon, EyeIcon, PencilIcon, TrashIcon, BuildingOfficeIcon, UserIcon, ArrowPathIcon, MapPinIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/DataTable';
import { clienteService, Cliente } from '../services/clienteService';
import ViewToggle from '../components/ViewToggle';
import { useCenter } from '../contexts/CenterContext';

const ClientesAdminPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const navigate = useNavigate();
  const { currentCenter } = useCenter();
  
  // Extraer el ID del centro para asegurar que React detecte los cambios
  const centerId = useMemo(() => currentCenter?.id, [currentCenter?.id]);

  const loadClientes = async (centerId: number) => {
    try {
      setLoading(true);
      // Pasar el centerId directamente desde el contexto para evitar problemas de timing con localStorage
      console.log('=== CARGANDO CLIENTES ADMIN ===');
      console.log('Center ID recibido:', centerId);
      const data = await clienteService.getClientesForAdmin(centerId);
      console.log('Clientes recibidos:', data.length);
      console.log('================================');
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar clientes si hay un centro seleccionado
    console.log('=== USEEFFECT CLIENTES ADMIN ===');
    console.log('Current Center:', currentCenter);
    console.log('Center ID:', centerId);
    console.log('=================================');
    
    if (centerId) {
      loadClientes(centerId);
    } else {
      console.log('No hay centro seleccionado, no se cargan clientes');
      setClientes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId]);

  const handleAdd = () => {
    navigate('/clientes/create');
  };

  const handleEdit = (cliente: Cliente) => {
    navigate(`/clientes/edit/${cliente.id}`);
  };

  const handleDelete = async (cliente: Cliente) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el cliente "${cliente.nombre}"?`)) {
      try {
        await clienteService.deleteCliente(cliente.id);
        if (currentCenter?.id) {
          await loadClientes(currentCenter.id);
        }
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    }
  };

  const handleReactivar = async (cliente: Cliente) => {
    if (window.confirm(`¿Estás seguro de que quieres reactivar el cliente "${cliente.nombre}"?`)) {
      try {
        await clienteService.reactivarCliente(cliente.id);
        if (currentCenter?.id) {
          await loadClientes(currentCenter.id);
        }
      } catch (error) {
        console.error('Error al reactivar cliente:', error);
      }
    }
  };

  const handleView = (cliente: Cliente) => {
    navigate(`/clientes/${cliente.id}`);
  };

  const columns = [
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
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
      key: 'cuit',
      label: 'CUIT',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || 'Sin CUIT'}
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
      key: 'centro',
      label: 'Centro',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || 'Sin centro'}
        </div>
      ),
    },
    {
      key: 'vendedor',
      label: 'Vendedor',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value ? (value.alias || value.email || 'Sin nombre') : 'Sin vendedor'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Administración de Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todos los clientes del sistema (activos e inactivos)</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            <UserGroupIcon className="w-5 h-5 mr-2" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={clientes}
          columns={columns}
          title="Lista de Clientes"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por nombre, CUIT, tipo o vendedor..."
          itemsPerPage={10}
          customActions={(item: Cliente) => (
            <>
              {!item.activo && (
                <button
                  onClick={() => handleReactivar(item)}
                  className="p-2 text-gray-400 hover:text-green-500 transition-colors duration-200"
                  title="Reactivar"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clientes.map((cliente, index) => (
            <div
              key={cliente.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-200 ${
                cliente.activo 
                  ? 'border-gray-200 dark:border-gray-700' 
                  : 'border-red-200 dark:border-red-700'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {cliente.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {cliente.cuit || 'Sin CUIT'}
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
                    <div className="flex items-center text-sm">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {cliente.tipoDeCliente.nombre}
                      </span>
                    </div>
                  )}

                  {cliente.tipoDeServicio && (
                    <div className="flex items-center text-sm">
                      <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {cliente.tipoDeServicio.nombre}
                      </span>
                    </div>
                  )}

                  {cliente.vendedor && (
                    <div className="flex items-center text-sm">
                      <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {cliente.vendedor.alias || cliente.vendedor.email || 'Sin nombre'}
                      </span>
                    </div>
                  )}

                  {cliente.centro && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Centro:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {cliente.centro.nombre}
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
                  {cliente.activo ? (
                    <button
                      onClick={() => handleDelete(cliente)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivar(cliente)}
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors duration-200"
                      title="Reactivar"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientesAdminPage;
