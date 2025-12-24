import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import {
  getRemitos,
  deleteRemito,
  Remito,
  getFormattedRemitoNumber,
  EstadoRemito
} from '../services/remitoService';
import DataTable, { FilterConfig } from '../components/DataTable';
import Notification from '../components/Notification';
import ViewToggle from '../components/ViewToggle';

const RemitosPage: React.FC = () => {
  const navigate = useNavigate();
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadRemitos();
  }, []);

  const loadRemitos = async () => {
    try {
      setLoading(true);
      const data = await getRemitos();
      setRemitos(data);
    } catch (error) {
      console.error('Error al cargar remitos:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los remitos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (remito: Remito) => {
    navigate(`/remitos/${remito.id}`);
  };

  const handleEdit = (remito: Remito) => {
    navigate(`/remitos/${remito.id}/editar`);
  };

  const handleDelete = async (remito: Remito) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el remito "${getFormattedRemitoNumber(remito)}"?`)) {
      try {
        await deleteRemito(remito.id);
        await loadRemitos();
        setNotification({
          type: 'success',
          message: 'Remito eliminado correctamente'
        });
      } catch (error) {
        console.error('Error al eliminar remito:', error);
        setNotification({
          type: 'error',
          message: 'Error al eliminar el remito'
        });
      }
    }
  };

  const getEstadoColor = (estado: EstadoRemito) => {
    switch (estado) {
      case EstadoRemito.Pendiente:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case EstadoRemito.EnProceso:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case EstadoRemito.Completado:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case EstadoRemito.Cancelado:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const columns = [
    {
      key: 'numero',
      label: 'Número',
      sortable: true,
      render: (value: any, row: Remito) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {getFormattedRemitoNumber(row)}
        </div>
      ),
    },
    {
      key: 'fecha',
      label: 'Fecha',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {new Date(value).toLocaleDateString('es-ES')}
        </div>
      ),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      sortable: true,
      render: (value: any, row: Remito) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.sucursal?.cliente?.nombre || 'N/A'}
        </div>
      ),
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      render: (value: any, row: Remito) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.sucursal?.nombre || 'N/A'}
        </div>
      ),
    },
    {
      key: 'chofer',
      label: 'Chofer',
      sortable: true,
      render: (value: any, row: Remito) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.chofer?.alias || 'N/A'}
        </div>
      ),
    },
    {
      key: 'estadoRemito',
      label: 'Estado',
      sortable: true,
      render: (value: EstadoRemito) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'fechaRecepcion',
      label: 'Fecha de Recepción del Servidor',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value ? new Date(value).toLocaleDateString('es-ES') : '-'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Remitos</h1>
          <p className="text-gray-600 dark:text-gray-400">Consulta los remitos de entrega (solo lectura)</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={remitos}
          columns={columns}
          title="Lista de Remitos"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por número de remito..."
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
          {remitos.map((remito) => (
            <div
              key={remito.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {getFormattedRemitoNumber(remito)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      #{remito.id}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(remito.estadoRemito)}`}>
                    {remito.estadoRemito}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {remito.descripcion && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {remito.descripcion}
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {new Date(remito.fecha).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {remito.chofer?.alias || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {remito.sucursal?.nombre || 'N/A'}
                    </span>
                  </div>

                  {remito.sucursal?.cliente?.nombre && (
                    <div className="flex items-center text-sm">
                      <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300 truncate">
                        Cliente: {remito.sucursal.cliente.nombre}
                      </span>
                    </div>
                  )}

                  {remito.fechaRecepcion && (
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Recepción: {new Date(remito.fechaRecepcion).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(remito)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(remito)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(remito)}
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

export default RemitosPage;
