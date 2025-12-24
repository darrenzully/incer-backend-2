import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { elementoService, Elemento } from '../services/elementoService';
import DataTable, { FilterConfig } from '../components/DataTable';
import Notification from '../components/Notification';
import ViewToggle from '../components/ViewToggle';

const ElementosPage: React.FC = () => {
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadElementos();
  }, []);

  const loadElementos = async () => {
    try {
      setLoading(true);
      const data = await elementoService.getAll();
      setElementos(data);
    } catch (error) {
      console.error('Error al cargar elementos:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar las instalaciones fijas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/elementos/nuevo');
  };

  const handleEdit = (elemento: Elemento) => {
    navigate(`/elementos/${elemento.id}/editar`);
  };

  const handleDelete = async (elemento: Elemento) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta instalación fija? Esta acción no se puede deshacer.')) {
      try {
        const result = await elementoService.delete(elemento.id);
        // Recargar la lista para mostrar el estado actualizado
        await loadElementos();
        setNotification({
          type: 'success',
          message: result.message || 'Instalación fija desactivada correctamente'
        });
      } catch (error) {
        console.error('Error al desactivar elemento:', error);
        setNotification({
          type: 'error',
          message: 'Error al desactivar la instalación fija'
        });
      }
    }
  };

  const handleView = (elemento: Elemento) => {
    navigate(`/elementos/${elemento.id}`);
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
      key: 'id',
      label: 'Id',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || 'Sin sucursal'}
        </div>
      ),
    },
    {
      key: 'tipoDeElemento',
      label: 'Tipo',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || 'Sin tipo'}
        </div>
      ),
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
          {value || 'Sin ubicación'}
        </div>
      ),
    },
    {
      key: 'interno',
      label: 'Interno',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'ultimoRelevamiento',
      label: 'Últ. relevamiento',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value ? new Date(value).toLocaleDateString('es-AR') : '-'}
        </div>
      ),
    },
  ];

  // Configuración de filtros avanzados
  const filterConfig: FilterConfig[] = [
    {
      key: 'cliente',
      label: 'Cliente',
      type: 'select',
      nestedKey: 'sucursal.cliente.nombre'
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      type: 'select',
      nestedKey: 'sucursal.nombre'
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Instalaciones Fijas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todas las instalaciones fijas del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
          <button
            onClick={() => navigate('/elementos/admin')}
            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Administración
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={elementos}
          columns={columns}
          title="Lista de Instalaciones Fijas"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por tipo de elemento..."
          itemsPerPage={10}
          filters={filterConfig}
          enableAdvancedFilters={true}
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
          {elementos.map((elemento, index) => (
            <div
              key={elemento.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      ID: {elemento.id} | Interno: {elemento.interno}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {elemento.sucursal?.nombre || 'Sin sucursal'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    elemento.activo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {elemento.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {elemento.tipoDeElemento && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Tipo:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {elemento.tipoDeElemento.nombre}
                      </div>
                    </div>
                  )}

                  {elemento.ubicacion && (
                    <div className="flex items-center text-sm">
                      <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300 truncate">
                        {elemento.ubicacion}
                      </span>
                    </div>
                  )}

                  {elemento.ultimoRelevamiento && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Últ. relevamiento:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {new Date(elemento.ultimoRelevamiento).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(elemento)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(elemento)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(elemento)}
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

export default ElementosPage;
