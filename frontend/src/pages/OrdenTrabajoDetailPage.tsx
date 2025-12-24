import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  ordenTrabajoService, 
  OrdenDeTrabajo, 
  getEstadoOTColor, 
  getPrioridadColor, 
  formatFecha, 
  getFormattedOrdenNumber 
} from '../services/ordenTrabajoService';
import Notification from '../components/Notification';

const OrdenTrabajoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orden, setOrden] = useState<OrdenDeTrabajo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type?: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (id) {
      loadOrden();
    }
  }, [id]);

  const loadOrden = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await ordenTrabajoService.getById(parseInt(id));
      setOrden(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la orden de trabajo');
      console.error('Error loading orden:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!orden) return;
    
    if (window.confirm('¿Estás seguro de que deseas eliminar esta orden de trabajo?')) {
      try {
        await ordenTrabajoService.delete(orden.id);
        setNotification({ message: 'Orden de trabajo eliminada correctamente', type: 'success' });
        setTimeout(() => {
          navigate('/ordenes-trabajo');
        }, 1500);
      } catch (err) {
        setNotification({ message: 'Error al eliminar la orden de trabajo', type: 'error' });
        console.error('Error deleting orden:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <p className="text-red-800 dark:text-red-200">{error || 'Orden de trabajo no encontrada'}</p>
        </div>
        <button
          onClick={() => navigate('/ordenes-trabajo')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/ordenes-trabajo')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <ClipboardDocumentListIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getFormattedOrdenNumber(orden)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Detalles de la orden de trabajo
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/ordenes-trabajo/${orden.id}/editar`}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <PencilIcon className="w-5 h-5 mr-2" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Información Principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información Principal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número
            </label>
            <div className="flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span className="font-mono font-medium text-primary-600 dark:text-primary-400">
                {getFormattedOrdenNumber(orden)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sucursal
            </label>
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span>{orden.sucursal?.nombre || 'N/A'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Usuario
            </label>
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span>{orden.usuario?.alias || 'N/A'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoOTColor(orden.estadoDeOT?.nombre || '')}`}>
              {orden.estadoDeOT?.nombre || 'N/A'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridad
            </label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadColor(orden.prioridad?.nombre || '')}`}>
              {orden.prioridad?.nombre || 'N/A'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remito
            </label>
            <div className="flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span>
                {orden.remito ? 
                  `${orden.remito.letra || ''}${orden.remito.secuencia || ''}${orden.remito.numero.toString().padStart(4, '0')}` : 
                  'Sin remito'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cronología</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Ingreso
            </label>
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span>{formatFecha(orden.fechaIngreso)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Recepción
            </label>
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span>{formatFecha(orden.fechaRecepcion)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Terminación
            </label>
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span>{formatFecha(orden.fechaTerminacion)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Salida
            </label>
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span>{formatFecha(orden.fechaSalida)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Entrega
            </label>
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span>{formatFecha(orden.fechaEntrega)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      {orden.observaciones && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Observaciones</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {orden.observaciones}
          </p>
        </div>
      )}

      {/* Detalles */}
      {orden.detalles && orden.detalles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detalles de la Orden</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {orden.detalles.map((detalle, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {detalle.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {detalle.cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${detalle.precio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${detalle.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default OrdenTrabajoDetailPage;
