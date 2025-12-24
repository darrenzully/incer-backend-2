import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon
} from '@heroicons/react/24/outline';
import { ordenTrabajoService, OrdenDeTrabajo, getEstadoOTColor, getPrioridadColor, formatFecha, getFormattedOrdenNumber } from '../services/ordenTrabajoService';
import DataTable, { FilterConfig } from '../components/DataTable';
import ViewToggle from '../components/ViewToggle';
import Notification from '../components/Notification';

const OrdenesTrabajoPage: React.FC = () => {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<OrdenDeTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadOrdenes();
  }, []);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const data = await ordenTrabajoService.getAll();
      setOrdenes(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar las órdenes de trabajo'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/ordenes-trabajo/nuevo');
  };

  const handleEdit = (orden: OrdenDeTrabajo) => {
    navigate(`/ordenes-trabajo/${orden.id}/editar`);
  };

  const handleDelete = async (orden: OrdenDeTrabajo) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta orden de trabajo? Esta acción no se puede deshacer.')) {
      try {
        await ordenTrabajoService.delete(orden.id);
        await loadOrdenes();
        setNotification({
          type: 'success',
          message: 'Orden de trabajo desactivada correctamente'
        });
      } catch (error) {
        console.error('Error al desactivar orden:', error);
        setNotification({
          type: 'error',
          message: 'Error al desactivar la orden de trabajo'
        });
      }
    }
  };

  const handleView = (orden: OrdenDeTrabajo) => {
    navigate(`/ordenes-trabajo/${orden.id}`);
  };

  const columns = [
    {
      key: 'numero',
      label: 'Número',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <span className="font-mono font-medium text-primary-600 dark:text-primary-400">
          {getFormattedOrdenNumber(row)}
        </span>
      )
    },
    {
      key: 'usuario',
      label: 'Usuario',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.usuario?.alias || 'N/A'}
        </div>
      )
    },
    {
      key: 'cliente',
      label: 'Cliente',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.sucursal?.cliente?.nombre || 'Sin cliente'}
        </div>
      )
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.sucursal?.nombre || 'Sin sucursal'}
        </div>
      )
    },
    {
      key: 'estadoDeOT',
      label: 'Estado',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          row.estadoDeOT ? getEstadoOTColor(row.estadoDeOT.nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {row.estadoDeOT?.nombre || 'N/A'}
        </span>
      )
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          row.prioridad ? getPrioridadColor(row.prioridad.nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {row.prioridad?.nombre || 'N/A'}
        </span>
      )
    },
    {
      key: 'observaciones',
      label: 'Observaciones',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
          {row.observaciones || '-'}
        </div>
      )
    },
    {
      key: 'fechaIngreso',
      label: 'Ingreso',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {formatFecha(row.fechaIngreso)}
        </div>
      )
    },
    {
      key: 'fechaTerminacion',
      label: 'Terminación',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {formatFecha(row.fechaTerminacion)}
        </div>
      )
    },
    {
      key: 'fechaSalida',
      label: 'Salida',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {formatFecha(row.fechaSalida)}
        </div>
      )
    },
    {
      key: 'fechaEntrega',
      label: 'Entrega',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {formatFecha(row.fechaEntrega)}
        </div>
      )
    },
    {
      key: 'fechaRecepcion',
      label: 'Fecha de recepción del servidor',
      sortable: true,
      render: (value: any, row: OrdenDeTrabajo) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {formatFecha(row.fechaRecepcion)}
        </div>
      )
    }
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
      key: 'fechaIngreso',
      label: 'Fecha Ingreso',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Órdenes de Trabajo</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todas las órdenes de trabajo del sistema</p>
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
          data={ordenes}
          columns={columns}
          title="Lista de Órdenes de Trabajo"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por número de orden de trabajo..."
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
          {ordenes.map((orden, index) => (
            <motion.div
              key={orden.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {getFormattedOrdenNumber(orden)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {orden.sucursal?.nombre || 'Sin sucursal'}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      orden.estadoDeOT ? getEstadoOTColor(orden.estadoDeOT.nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {orden.estadoDeOT?.nombre || 'N/A'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      orden.prioridad ? getPrioridadColor(orden.prioridad.nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {orden.prioridad?.nombre || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {orden.usuario && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Usuario:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {orden.usuario.alias}
                      </div>
                    </div>
                  )}

                  {orden.fechaIngreso && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Fecha Ingreso:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {formatFecha(orden.fechaIngreso)}
                      </div>
                    </div>
                  )}

                  {orden.fechaTerminacion && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Fecha Terminación:</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {formatFecha(orden.fechaTerminacion)}
                      </div>
                    </div>
                  )}

                  {orden.observaciones && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Observaciones:</div>
                      <div className="text-gray-600 dark:text-gray-300 line-clamp-2">
                        {orden.observaciones}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(orden)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(orden)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(orden)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
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

export default OrdenesTrabajoPage;
