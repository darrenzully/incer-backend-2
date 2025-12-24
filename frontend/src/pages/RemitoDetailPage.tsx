import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  XCircleIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import {
  getRemitoById,
  Remito,
  getFormattedRemitoNumber,
  EstadoRemito
} from '../services/remitoService';
import Notification from '../components/Notification';

const RemitoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [remito, setRemito] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadRemito(parseInt(id));
    }
  }, [id]);

  const loadRemito = async (remitoId: number) => {
    try {
      setLoading(true);
      const data = await getRemitoById(remitoId);
      setRemito(data);
    } catch (error) {
      console.error('Error al cargar remito:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar el remito'
      });
    } finally {
      setLoading(false);
    }
  };



  const handleBack = () => {
    navigate('/remitos');
  };

  const getEstadoColorLocal = (estado: EstadoRemito) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!remito) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Remito no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          El remito que buscas no existe o ha sido eliminado.
        </p>
        <div className="mt-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver a Remitos
          </button>
        </div>
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
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Remito {getFormattedRemitoNumber(remito)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {remito.descripcion || 'Sin descripción'} - {remito.chofer?.alias || 'N/A'}
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información General
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Número</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {getFormattedRemitoNumber(remito)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(remito.fecha).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {remito.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColorLocal(remito.estadoRemito)}`}>
                    {remito.estadoRemito}
                  </span>
                </div>
              </div>

              {remito.observaciones && (
                <div className="flex items-start">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Observaciones</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {remito.observaciones}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Personal y Ubicación
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Chofer</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {remito.chofer?.alias || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sucursal</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {remito.sucursal?.nombre || 'N/A'}
                  </p>
                </div>
              </div>

              {remito.presupuesto && (
                <div className="flex items-center">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Presupuesto</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {remito.presupuesto.numero}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detalles Adicionales
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Creado</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(remito.fechaCreacion).toLocaleDateString('es-ES')} por {remito.usuarioCreacion}
                  </p>
                </div>
              </div>

              {remito.fechaUpdate && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Última actualización</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(remito.fechaUpdate).toLocaleDateString('es-ES')} por {remito.usuarioUpdate}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  remito.activo 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {remito.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemitoDetailPage;
