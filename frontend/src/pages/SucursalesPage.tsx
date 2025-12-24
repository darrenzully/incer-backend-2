import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuildingStorefrontIcon, EyeIcon, PencilIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/DataTable';
import { sucursalService, Sucursal } from '../services/sucursalService';
import ViewToggle from '../components/ViewToggle';

const SucursalesPage: React.FC = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      setLoading(true);
      const data = await sucursalService.getAll();
      setSucursales(data);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/sucursales/create');
  };

  const handleEdit = (sucursal: Sucursal) => {
    navigate(`/sucursales/edit/${sucursal.id}`);
  };

  const handleDelete = async (sucursal: Sucursal) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la sucursal "${sucursal.nombre}"?`)) {
      try {
        await sucursalService.delete(sucursal.id);
        await loadSucursales();
      } catch (error) {
        console.error('Error al eliminar sucursal:', error);
      }
    }
  };

  const handleView = (sucursal: Sucursal) => {
    navigate(`/sucursales/${sucursal.id}`);
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
      key: 'cliente',
      label: 'Cliente',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value?.nombre || 'Sin cliente'}
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
      key: 'direccion',
      label: 'Dirección',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
          {value || 'Sin dirección'}
        </div>
      ),
    },
    {
      key: 'localidad',
      label: 'Localidad',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value ? (
            <>
              {value.nombre}
              {value.provincia && `, ${value.provincia.nombre}`}
            </>
          ) : (
            'Sin ubicación'
          )}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sucursales</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todas las sucursales del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
          <button
            onClick={() => navigate('/sucursales/admin')}
            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
            Administración
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={sucursales}
          columns={columns}
          title="Lista de Sucursales"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por nombre, cliente, dirección o localidad..."
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
          {sucursales.map((sucursal, index) => (
            <div
              key={sucursal.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {sucursal.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cliente: {sucursal.cliente?.nombre || 'Sin cliente'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sucursal.activo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {sucursal.activo ? 'Activa' : 'Inactiva'}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {sucursal.direccion && (
                    <div className="flex items-center text-sm">
                      <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300 truncate">
                        {sucursal.direccion}
                      </span>
                    </div>
                  )}

                  {sucursal.localidad && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Ubicación:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {sucursal.localidad.nombre}
                        {sucursal.localidad.provincia && `, ${sucursal.localidad.provincia.nombre}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(sucursal)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(sucursal)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sucursal)}
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

export default SucursalesPage; 