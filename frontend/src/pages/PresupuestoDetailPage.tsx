import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import {
  getPresupuestoById,
  downloadFile,
  Presupuesto,
  EstadoPresupuesto,
  getEstadoPresupuestoLabel,
  getEstadoPresupuestoColor
} from '../services/presupuestoService';
import Notification from '../components/Notification';

const PresupuestoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadPresupuesto(parseInt(id));
    }
  }, [id]);

  const loadPresupuesto = async (presupuestoId: number) => {
    try {
      setLoading(true);
      const data = await getPresupuestoById(presupuestoId);
      setPresupuesto(data);
    } catch (error) {
      console.error('Error al cargar presupuesto:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar el presupuesto'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (presupuesto) {
      navigate(`/presupuestos/${presupuesto.id}/editar`);
    }
  };

  const handleBack = () => {
    navigate('/presupuestos');
  };

  const handleDownloadFile = async (archivoId: number, nombreArchivo: string) => {
    try {
      await downloadFile(archivoId);
      setNotification({
        type: 'success',
        message: `Archivo "${nombreArchivo}" descargado correctamente`
      });
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      setNotification({
        type: 'error',
        message: 'Error al descargar el archivo'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Presupuesto no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          El presupuesto que buscas no existe o ha sido eliminado.
        </p>
        <div className="mt-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver a Presupuestos
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
              Presupuesto: {presupuesto.numero}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {presupuesto.descripcion}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Editar
          </button>
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
                  <p className="text-sm text-gray-900 dark:text-gray-100">{presupuesto.numero}</p>
                </div>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(presupuesto.fecha).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoPresupuestoColor(presupuesto.estado)}`}>
                  {getEstadoPresupuestoLabel(presupuesto.estado)}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Descripción</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{presupuesto.descripcion}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Archivos Adjuntos
            </h2>
            
            {presupuesto.archivos && presupuesto.archivos.length > 0 ? (
              <div className="space-y-2">
                {presupuesto.archivos.map((archivo) => (
                  <div key={archivo.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center flex-1">
                      <DocumentTextIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-900 dark:text-gray-100 block">{archivo.nombre}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(archivo.fecha).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadFile(archivo.id, archivo.nombre || 'archivo')}
                      className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                      title="Descargar archivo"
                    >
                      <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Sin archivos adjuntos</h3>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  Este presupuesto no tiene archivos adjuntos.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detalles Adicionales
            </h2>
            
            <div className="space-y-4">
              {presupuesto.sucursal && (
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sucursal</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{presupuesto.sucursal.nombre}</p>
                  </div>
                </div>
              )}

              {presupuesto.usuario && (
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuario</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{presupuesto.usuario.username}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Creado</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(presupuesto.fechaCreacion).toLocaleDateString('es-ES')} por {presupuesto.usuarioCreacion}
                </p>
              </div>

              {presupuesto.fechaUpdate && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Última actualización</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(presupuesto.fechaUpdate).toLocaleDateString('es-ES')} por {presupuesto.usuarioUpdate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {presupuesto.presupuestosRemitos && presupuesto.presupuestosRemitos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Remitos Relacionados ({presupuesto.presupuestosRemitos.length})
              </h2>
              <div className="space-y-2">
                {presupuesto.presupuestosRemitos.map((presupuestoRemito) => (
                  <div key={presupuestoRemito.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {presupuestoRemito.descripcion}
                    </p>
                    {presupuestoRemito.remito && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Remito #{presupuestoRemito.remito.numero}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresupuestoDetailPage;
