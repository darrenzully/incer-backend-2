import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { puestoService, Puesto } from '../services/puestoService';
import DataTable, { FilterConfig } from '../components/DataTable';
import Notification from '../components/Notification';
import ViewToggle from '../components/ViewToggle';

const PuestosPage: React.FC = () => {
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPuestos();
  }, []);

  const loadPuestos = async () => {
    try {
      setLoading(true);
      const data = await puestoService.getAll();
      setPuestos(data);
    } catch (error) {
      console.error('Error al cargar puestos:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los puestos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/puestos/nuevo');
  };

  const handleEdit = (puesto: Puesto) => {
    navigate(`/puestos/${puesto.id}/editar`);
  };

  const handleDelete = async (puesto: Puesto) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este puesto? Esta acción no se puede deshacer.')) {
      try {
        const result = await puestoService.delete(puesto.id);
        // Recargar la lista para mostrar el estado actualizado
        await loadPuestos();
        setNotification({
          type: 'success',
          message: result.message || 'Puesto desactivado correctamente'
        });
      } catch (error) {
        console.error('Error al desactivar puesto:', error);
        setNotification({
          type: 'error',
          message: 'Error al desactivar el puesto'
        });
      }
    }
  };

  const handleView = (puesto: Puesto) => {
    navigate(`/puestos/${puesto.id}`);
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
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value || 'Sin nombre'}
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
      key: 'deshabilitado',
      label: 'Deshabilitado',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'extintor',
      label: 'Matafuego',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value ? `${value.codigo || value.nroSerie || 'Sin código'}` : 'Sin extintor'}
        </div>
      ),
    },
    {
      key: 'extintorTipo',
      label: 'Tipo',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.extintor?.tipoDeCarga?.nombre || '-'}
        </div>
      ),
    },
    {
      key: 'extintorCapacidad',
      label: 'Capacidad',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.extintor?.capacidad ? `${value.extintor.capacidad.valor} ${value.extintor.capacidad.unidad || ''}` : '-'}
        </div>
      ),
    },
    {
      key: 'extintorReserva',
      label: 'Reserva',
      sortable: true,
      render: (value: any) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value?.extintor?.reserva
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {value?.extintor?.reserva ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'extintorBaja',
      label: 'Baja',
      sortable: true,
      render: (value: any) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value?.extintor?.baja
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {value?.extintor?.baja ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'extintorVencimientoCarga',
      label: 'Vencimiento carga',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.extintor?.vencimientoCarga ? new Date(value.extintor.vencimientoCarga).toLocaleDateString('es-AR') : '-'}
        </div>
      ),
    },
    {
      key: 'extintorVencimientoPH',
      label: 'Vencimiento PH',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.extintor?.vencimientoPH ? new Date(value.extintor.vencimientoPH).toLocaleDateString('es-AR') : '-'}
        </div>
      ),
    },
    {
      key: 'ultimoRelevamiento',
      label: 'Ult. relevamiento',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.ultimoRelevamiento ? new Date(value.ultimoRelevamiento).toLocaleDateString('es-AR') : '-'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Puestos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todos los puestos del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
          <button
            onClick={() => navigate('/puestos/admin')}
            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Administración
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={puestos}
          columns={columns}
          title="Lista de Puestos"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por nombre..."
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
          {puestos.map((puesto, index) => (
            <div
              key={puesto.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {puesto.nombre || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {puesto.sucursal?.nombre || 'Sin sucursal'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    puesto.deshabilitado
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {puesto.deshabilitado ? 'Deshabilitado' : 'Habilitado'}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {puesto.ubicacion && (
                    <div className="flex items-center text-sm">
                      <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300 truncate">
                        {puesto.ubicacion}
                      </span>
                    </div>
                  )}

                  {puesto.extintor && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Matafuego:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {puesto.extintor.codigo || puesto.extintor.nroSerie || 'Sin código'}
                      </div>
                    </div>
                  )}

                  {puesto.extintor?.tipoDeCarga && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Tipo:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {puesto.extintor.tipoDeCarga.nombre}
                      </div>
                    </div>
                  )}

                  {puesto.extintor?.capacidad && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Capacidad:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {puesto.extintor.capacidad.valor} {puesto.extintor.capacidad.unidad}
                      </div>
                    </div>
                  )}

                  {puesto.extintor?.vencimientoCarga && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Venc. Carga:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {new Date(puesto.extintor.vencimientoCarga).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  )}

                  {puesto.ultimoRelevamiento && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Últ. relevamiento:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {new Date(puesto.ultimoRelevamiento).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(puesto)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(puesto)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(puesto)}
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

export default PuestosPage;
