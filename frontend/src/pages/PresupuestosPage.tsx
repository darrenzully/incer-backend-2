import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import {
  getPresupuestos,
  deletePresupuesto,
  Presupuesto,
  EstadoPresupuesto,
  getEstadoPresupuestoLabel,
  getEstadoPresupuestoColor
} from '../services/presupuestoService';
import Notification from '../components/Notification';
import ViewToggle from '../components/ViewToggle';
import DataTable, { FilterConfig } from '../components/DataTable';

const PresupuestosPage: React.FC = () => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPresupuestos();
  }, []);

  const loadPresupuestos = async () => {
    try {
      setLoading(true);
      const data = await getPresupuestos();
      setPresupuestos(data);
    } catch (error) {
      console.error('Error loading presupuestos:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los presupuestos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/presupuestos/nuevo');
  };

  const handleEdit = (presupuesto: Presupuesto) => {
    navigate(`/presupuestos/${presupuesto.id}/editar`);
  };

  const handleView = (presupuesto: Presupuesto) => {
    navigate(`/presupuestos/${presupuesto.id}`);
  };

  const handleDelete = async (presupuesto: Presupuesto) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el presupuesto ${presupuesto.numero}?`)) {
      try {
        await deletePresupuesto(presupuesto.id);
        setNotification({
          type: 'success',
          message: 'Presupuesto eliminado correctamente'
        });
        loadPresupuestos();
      } catch (error) {
        console.error('Error deleting presupuesto:', error);
        setNotification({
          type: 'error',
          message: 'Error al eliminar el presupuesto'
        });
      }
    }
  };

  const columns = [
    {
      key: 'numero',
      label: 'Número',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
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
      key: 'descripcion',
      label: 'Descripción',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
          {value}
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (value: EstadoPresupuesto) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoPresupuestoColor(value)}`}>
          {getEstadoPresupuestoLabel(value)}
        </span>
      ),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      sortable: true,
      render: (value: any, row: Presupuesto) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.sucursal?.cliente?.nombre || 'N/A'}
        </div>
      ),
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || 'N/A'}
        </div>
      ),
    },
    {
      key: 'usuario',
      label: 'Usuario',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.username || 'N/A'}
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
    },
    {
      key: 'fecha',
      label: 'Fecha',
      type: 'daterange'
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
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Presupuestos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todos los presupuestos del sistema</p>
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
          data={presupuestos}
          columns={columns}
          title="Lista de Presupuestos"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por número, descripción o sucursal..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presupuestos.map((presupuesto) => (
            <div key={presupuesto.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {presupuesto.numero}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(presupuesto.fecha).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoPresupuestoColor(presupuesto.estado)}`}>
                      {getEstadoPresupuestoLabel(presupuesto.estado)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {presupuesto.descripcion}
                    </span>
                  </div>

                  {presupuesto.sucursal && (
                    <div className="flex items-center text-sm">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {presupuesto.sucursal.nombre}
                      </span>
                    </div>
                  )}

                  {presupuesto.usuario && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Usuario: {presupuesto.usuario.username}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(presupuesto)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(presupuesto)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(presupuesto)}
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

export default PresupuestosPage;
