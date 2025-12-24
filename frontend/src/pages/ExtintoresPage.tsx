import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { extintorService, Extintor } from '../services/extintorService';
import DataTable, { FilterConfig } from '../components/DataTable';
import Notification from '../components/Notification';
import ViewToggle from '../components/ViewToggle';

const ExtintoresPage: React.FC = () => {
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadExtintores();
  }, []);

  const loadExtintores = async () => {
    try {
      setLoading(true);
      const data = await extintorService.getAll();
      setExtintores(data);
    } catch (error) {
      console.error('Error al cargar extintores:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los extintores'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/extintores/nuevo');
  };

  const handleEdit = (extintor: Extintor) => {
    navigate(`/extintores/${extintor.id}/editar`);
  };

  const handleDelete = async (extintor: Extintor) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este extintor? Esta acción no se puede deshacer.')) {
      try {
        const result = await extintorService.delete(extintor.id);
        // Recargar la lista para mostrar el estado actualizado
        await loadExtintores();
        setNotification({
          type: 'success',
          message: result.message || 'Extintor desactivado correctamente'
        });
      } catch (error) {
        console.error('Error al desactivar extintor:', error);
        setNotification({
          type: 'error',
          message: 'Error al desactivar el extintor'
        });
      }
    }
  };

  const handleView = (extintor: Extintor) => {
    navigate(`/extintores/${extintor.id}`);
  };

  const columns = [
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value?.nombre || 'Sin sucursal'}
        </div>
      ),
    },
    {
      key: 'interno',
      label: 'Interno',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'nroSerie',
      label: 'NroSerie',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'tipoDeCarga',
      label: 'Carga',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || '-'}
        </div>
      ),
    },
    {
      key: 'capacidad',
      label: 'Capacidad',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value ? `${value.valor} ${value.unidad || ''}` : '-'}
        </div>
      ),
    },
    {
      key: 'vencimientoCarga',
      label: 'Venc. Carga',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {new Date(value).toLocaleDateString('es-AR')}
        </div>
      ),
    },
    {
      key: 'vencimientoPH',
      label: 'Venc. PH',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {new Date(value).toLocaleDateString('es-AR')}
        </div>
      ),
    },
    {
      key: 'fechaRecepcion',
      label: 'Fecha de recepcion del servidor',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value ? new Date(value).toLocaleDateString('es-AR') : '-'}
        </div>
      ),
    },
    {
      key: 'orden',
      label: 'Orden',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'año',
      label: 'Año',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'iram',
      label: 'IRAM',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || '-'}
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
      nestedKey: 'cliente.nombre'
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      type: 'select',
      nestedKey: 'sucursal.nombre'
    },
    {
      key: 'reserva',
      label: 'En Reserva',
      type: 'boolean'
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Extintores</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todos los extintores del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
          <button
            onClick={() => navigate('/extintores/admin')}
            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Administración
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={extintores}
          columns={columns}
          title="Lista de Extintores"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por sucursal..."
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
          {extintores.map((extintor, index) => (
            <div
              key={extintor.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {extintor.sucursal?.nombre || 'Sin sucursal'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Interno: {extintor.interno || '-'} | Serie: {extintor.nroSerie || '-'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    extintor.activo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {extintor.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {extintor.tipoDeCarga && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Carga:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {extintor.tipoDeCarga.nombre}
                      </div>
                    </div>
                  )}

                  {extintor.capacidad && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Capacidad:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {extintor.capacidad.valor} {extintor.capacidad.unidad}
                      </div>
                    </div>
                  )}

                  {extintor.vencimientoCarga && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Venc. Carga:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {new Date(extintor.vencimientoCarga).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  )}

                  {extintor.vencimientoPH && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Venc. PH:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {new Date(extintor.vencimientoPH).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  )}

                  {extintor.año && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Año:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {extintor.año}
                      </div>
                    </div>
                  )}

                  {extintor.iram && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">IRAM:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {extintor.iram}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(extintor)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(extintor)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(extintor)}
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

export default ExtintoresPage;
